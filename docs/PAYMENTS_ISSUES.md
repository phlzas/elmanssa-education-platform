# Payment & Accounting Flow — Known Issues & Risks

> Companion to `VIDEO_PIPELINE_ISSUES.md`, `TEACHER_FLOW_ISSUES.md`, `STUDENT_FLOW_ISSUES.md`,
> `AUTH_FLOW_ISSUES.md`. This file catalogs **problems** found while tracing the payment flow end to end:
> `CheckoutPage`/`CourseDetailPage` → `POST /payment/create` → Paymob intention →
> `GET /payment/callback` (redirect) / webhook (POST + GET) → `PaymobService` → Enrollment +
> accounting auto-entry → `AdminController` revenue stat / `TeacherController` accounting CRUD.
>
> Each entry: **Severity** (Critical / High / Medium / Low), location, impact, suggested fix.
> Status is tracked inline; mark `[x]` when fixed.
>
> Key files: `elmanassa_backend/elmanassa/Services/PaymobService.cs` (HMAC + enrollment + accounting),
> `Controllers/PaymentController.cs` (routes + **unverified GET webhook branch**),
> `Controllers/TeacherController.cs` (accounting CRUD), `Controllers/AdminController.cs` (revenue stat),
> `Controllers/OrderController.cs` (disabled orders), `Controllers/SubjectsController.cs` (inquiry),
> `ApplicationDbContext/AppDbContext.cs`, `appsettings.json`, `api/accounting.api.ts`,
> `components/CheckoutPage.tsx`, `components/PaymentSuccessPage.tsx`, `App.tsx`.

---

## Payment backend — critical

### R1. (Critical) Unauthenticated DB writes via `GET /webhook` (HMAC never verified on GET branch)
- **Severity:** Critical
- **Location:** `Controllers/PaymentController.cs:200-207` (only checks `hmac` is non-empty) and
  `:218-268` (GET branch commits `transaction.Status = "success"`, `order.PaymentStatus = "completed"`,
  creates Enrollment + accounting entry).
- **Problem:** The POST branch HMAC verification (`PaymobService.cs:211-339`) is correct against
  Paymob's documented algorithm (20 ordered fields, `?hmac=` query param, SHA-512 lowercase hex,
  booleans as `true/false`, missing→empty). The parallel GET branch of the same endpoint only checks
  that `hmac` is **non-empty** and never validates the value, yet on `success=true` it marks the
  transaction success, completes the order, **creates the enrollment**, and books an accounting
  income entry. `merchant_order_id` is `"ORD-{Guid:N}".Substring(0,20)` returned to the student at
  payment-init (`PaymobService.cs:72, 203-204`).
- **Impact:** Any authenticated student can self-enroll in **any subject without paying** and fabricate
  income records for the teacher: `GET /api/v1/payment/webhook?merchant_order_id=<own ref>&success=true&hmac=x`.
  No signature needed. Direct money-adjacent integrity loss; also inflates the admin revenue stat
  (`AdminController.cs:167-169`).
- **Fix:** Remove the GET DB-update branch entirely (the POST path is the only Paymob-authorized
  channel), or require a verified HMAC with constant-time compare. Validate `amount_cents` and
  `merchant_order_id` against the persisted transaction.
- **Status:** ✅ Fixed in backend repo commit `1b82527` — webhook is now `[HttpPost("webhook")]`
  only; the GET branch (unverified query-param enrollment + accounting write) was removed. Browser
  redirects still work via the HMAC-verified `/payment/callback`. Residual: amount verification (R2)
  and idempotency (R6) still open.

### R2. (High) No amount verification in webhook success path
- **Severity:** High
- **Location:** `Services/PaymobService.cs:297-321` (success branch); `PaymentController.cs:221-257` (GET branch).
- **Problem:** The order is marked completed and an accounting entry is booked from `order.FinalPrice`
  even if Paymob reports a different `amount_cents` (coupon/mis-pricing drift, partial captures,
  foreign-currency amounts, tampered stored order).
- **Impact:** Accounting income may not equal money actually received.
- **Fix:** In `ProcessServerCallbackAsync`, parse `obj.amount_cents`, convert to decimal, compare with
  `transaction.Amount`; on mismatch mark failed/suspect and do **not** create the accounting entry.

### R3. (High) No refund / void / pending handling (single `success` boolean only)
- **Severity:** High
- **Location:** `Services/PaymobService.cs:297-328`; `Models/Order.cs:38` (`refunded` documented but
  never set); grep confirms no refund code anywhere.
- **Problem:** Refunds (Paymob dashboard) never propagate — orders stay `completed`,
  `PaymentTransactions` stay `success`, and the `income` accounting entry is never reversed.
- **Impact:** Chargeback/refund revenue is permanently overstated.
- **Fix:** Branch on `is_refunded` / `is_voided` / `pending`: set `Order.PaymentStatus = "refunded"`,
  `PaymentTransaction.Status = "refunded"`, and create an offsetting `expense` accounting entry
  (or delete/flag the income row).

### R6. (High) No idempotency / race safety on duplicate or concurrent webhook deliveries
- **Severity:** High
- **Location:** `Services/PaymobService.cs:304-315` (enrollment check-then-add), `:348-350`
  (accounting check-then-add); `PaymentController.cs:241-256`; `ApplicationDbContext/AppDbContext.cs:166`
  — **no unique index on Enrollments (UserId, SubjectId)** (only `HasIndex(e => e.UserId)`).
- **Problem:** Two concurrent/retried webhooks can both pass `AnyAsync` and double-create enrollments;
  the accounting `pay_{orderId}` PK guard is the same check-then-act race. Paymob retries on non-2xx
  (and this handler returns 500/401 for transient errors), so duplicates are realistic. Also
  `:322-328` can **regress** a completed order to `failed` if an out-of-order/late callback arrives.
- **Impact:** Duplicate enrollments, double-charge accounting, StudentsCount drift; completed orders
  can flip to failed.
- **Fix:** DB unique index on `(UserId, SubjectId)`; make the webhook idempotent on
  `MerchantOrderId`/`PaymobTransactionId` (skip if already `success`); wrap status transitions to only
  move `pending → terminal` (never downgrade completed).

### R12. (Medium) No published-status gate on purchasable subjects
- **Severity:** Medium
- **Location:** `Services/PaymobService.cs:38` (existence only); `Services/OrderService.cs:37-42`;
  `Controllers/SubjectsController.cs:249-251` (inquiry, no status check).
- **Problem:** Draft/unpublished subjects are purchasable and queryable; students can pay for content
  that isn't live. (`enroll-free` instead *requires* `Status == "free"` — see STUDENT_FLOW_ISSUES BE7.)
- **Fix:** Add `subject.Status == "published"` checks in `CreatePaymentAsync` and `GetInquiry`.

---

## Accounting integrity

### R4. (High) Teacher accounting tampering: arbitrary amounts, client-supplied PK, destructible audit rows
- **Severity:** High
- **Location:** `Controllers/TeacherController.cs:271-298` (POST: no Amount/Type validation,
  `Id = model.Id ?? …` client-supplied), `:300-310` (DELETE ownership-checked so teachers **can**
  delete auto-created `pay_…` rows), `api/accounting.api.ts:146-160` (fire-and-forget sync) and
  `:195-213` (update = DELETE+POST).
- **Problem:** A teacher can book arbitrary income/expense (negative, zero, huge) in any currency,
  impersonate the auto-payment ledger (`Id = "pay_{order.Id}"`), and erase genuine payment-derived
  income records. Sync is fire-and-forget with no error surfacing.
- **Impact:** Teacher income reports are untrustworthy; audit trail of payment income is destructible.
- **Fix:** Server-side validation (Amount > 0, Type ∈ {income, expense}, Currency ∈ {SAR, EGP});
  reject client-supplied IDs that collide with the reserved `pay_…` prefix; forbid teacher deletion of
  auto entries (or require admin); add a real teacher `PUT`; surface sync errors.

### R11. (Medium) LocalStorage sync data loss on partial success
- **Severity:** Medium
- **Location:** `api/accounting.api.ts:61-73` (admin) and `:146-160` (teacher): `syncedIds = new Set(unsynced.map(t => t.id))`
  and on *any* success all unsynced items (including the ones whose POST **failed**) are removed from localStorage.
- **Impact:** Offline-entered transactions can be permanently lost if even one POST in the batch succeeds.
- **Fix:** Only remove IDs whose POST returned success (per-item `results`), keep the rest.

### R14. (Low) Orphaned "pending" orders and transactions on gateway failure
- **Severity:** Low
- **Location:** `Services/PaymobService.cs:74-109` (rows persisted before the Paymob call),
  `:185-189` (gateway failure throws after persistence).
- **Problem:** Every failed/aborted checkout leaves a permanently `pending` order+transaction; no
  expiry/cleanup, pollutes the admin orders list and any future revenue queries (current stat only
  counts `completed`, so mostly cosmetic).
- **Fix:** Expire stale `pending` orders older than N hours in a maintenance job (and/or create the
  transaction only after a successful intention).

---

## Secrets & configuration

### R5. (High) Live secrets committed in `appsettings.json` (and not gitignored)
- **Severity:** High
- **Location:** `appsettings.json:17-24` (Paymob `SecretKey`, `PublicKey`, `HMAC`, `APIKey`,
  integration IDs), plus DB password `:3`, JWT secret `:11`, admin seed `:6-8`, SMTP `:26-30`,
  Gemini `:37`. The backend dir is currently **untracked** (`git status` → `?? elmanassa_backend/`)
  and `.gitignore` does **not** exclude `appsettings.json`.
- **Problem:** If the backend is ever committed (or the repo shared), the Paymob HMAC secret, secret
  key, DB credentials and JWT signing key are exposed.
- **Impact:** Total payment-signature forgery + DB/JWT compromise. The HMAC secret alone would allow
  forging valid webhooks (making R2/R3 moot).
- **Fix:** Move all secrets to env vars/user-secrets/Key Vault; `gitignore` `appsettings*.json`;
  rotate the leaked test keys before any production use.

### R7. (Medium) Hardcoded production URLs + WhatsApp number
- **Severity:** Medium
- **Location:** `Services/PaymobService.cs:162-163` (`notification_url`/`redirect_url` =
  `https://api.elmanssa.com/...`); `Controllers/SubjectsController.cs:257` (`+966597750868`);
  `constants.ts:18` (duplicate fallback number).
- **Problem:** Callbacks are pinned to production regardless of environment (test payments hit the
  live webhook); the WhatsApp number is the same for every teacher/subject — the inquiry flow
  **never uses the teacher's real number** (`InquiryDTO` exposes `TeacherId`/`TeacherName` but the
  number is constant).
- **Fix:** Read URLs from config; store per-teacher WhatsApp numbers on the `User`/`Subject` and use
  them in `GetInquiry`.

### R13. (Low) Non-constant-time HMAC comparison
- **Severity:** Low
- **Location:** `Services/PaymobService.cs:252`; `Controllers/PaymentController.cs:175`
  (`Equals(…, OrdinalIgnoreCase)`).
- **Impact:** Theoretical timing side-channel against the 32-char HMAC secret.
- **Fix:** `CryptographicOperations.FixedTimeEquals` over the hex-decoded bytes.

---

## Frontend / flow

### R8. (Medium) Dead-end success page: users land on Hero after payment
- **Severity:** Medium
- **Location:** `Controllers/PaymentController.cs:185` redirects to `/payment-success?ref=…`;
  `App.tsx:35-43` (`parsePath` only reads a path segment or `?id=` — `?ref=` yields
  `courseId = null`); `App.tsx:245-250` renders `<Hero/>` when `selectedCourseId` is null;
  `components/PaymentSuccessPage.tsx:36` shows a **fabricated** order number `ELM-{Date.now()}`
  instead of the real merchant ref.
- **Problem:** After a real payment the student sees the homepage (confusing; no confirmation), the
  success page is effectively unreachable, and the displayed "order number" is fake.
- **Fix:** Make `parsePath` read `?ref=` (or map to the order), pass the real `OrderNumber`, and
  verify status server-side (`GET /orders/{id}`) rather than trusting the redirect.

### R9. (Medium) Coupon flow broken end-to-end + no discount cap
- **Severity:** Medium
- **Location:** `components/CheckoutPage.tsx:66-79` checks `data?.isValid` but the backend DTO
  property is `Valid` and `Services/OrderService.cs:210-218` **never sets `Valid`** (defaults false)
  → coupons always show "غير صالح"; `DTOs/OrderDTO.cs:49-58`.
- **Problem:** Discounts unusable from checkout. Separately, `Services/PaymobService.cs:63-69` has no
  cap on `DiscountPct` → a >100% coupon produces a **negative `totalAmount` → negative `amount_cents`**
  sent to Paymob (`:69`), and free/low-price subjects can still be sent to Paymob with amount 0.
- **Fix:** Set `Valid = true` server-side (or fix the client to read `valid`), validate
  `0 < DiscountPct <= 100` and `totalAmount > 0`, and reject free subjects in `CreatePaymentAsync`.

### R10. (Medium) Stale/mixed payment model: Paymob self-serve still live despite "purchase disabled"
- **Severity:** Medium
- **Location:** `Controllers/OrderController.cs:33-42` (POST `/orders` → 403 `PURCHASE_DISABLED`), but
  `Controllers/PaymentController.cs:102-136` (`POST /payment/create`) **is still active**;
  `components/CheckoutPage.tsx:94-122` still calls it from "اشتر الآن" (`CourseDetailPage.tsx:357-362`,
  `CoursesPage.tsx:464`, `PopularCourses.tsx:163`). WhatsApp inquiry coexists
  (`CourseDetailPage.tsx:363-379`).
- **Problem:** Two parallel sales channels with inconsistent accounting: Paymob sales auto-book EGP
  income + enrollment; WhatsApp sales create **no order/enrollment/accounting** — teachers are paid
  out-of-band and must self-report (SAR) with no reconciliation, and students must be enrolled
  manually by an admin.
- **Fix:** Pick one flow. If WhatsApp is the channel, disable `POST /payment/create` and the checkout
  UI; if Paymob stays, remove the disabled-order messaging and reconcile both streams.

### R15. (Low) Dead code and unused config
- **Severity:** Low
- **Location:** `Services/PaymentHtmlPages.cs` (entire file unused); `api/orders.api.ts:5-17,33-46`
  (`placeOrder`, `getOrders`, `getOrder` unused — `CheckoutPage.tsx:2` imports `placeOrder` but never
  calls it); `services/payment.service.ts` (`simulatePayment` unused); `appsettings.json:18`
  `Paymob:APIKey` never read.
- **Impact:** Maintenance/audit confusion; `placeOrder` targets the disabled `/orders` endpoint and
  would 403 if ever wired back in.

---

## Payment lifecycle summary (verified)

1. `POST /payment/create` (PaymentController.cs:102-136) → `PaymobService.CreatePaymentAsync`
   validates subject exists (no status gate — R12), applies coupon, persists `Order` +
   `PaymentTransaction` as `pending` (before the gateway call — R14), calls Paymob intention API,
   returns `OrderNumber` + Paymob `iframes` URL to the client.
2. Paymob redirects the browser to `redirect_url` (`/payment/callback`, PaymentController.cs:174-190)
   which verifies HMAC constant-time and redirects to `/payment-success?ref=…` (frontend can't parse
   `ref` — R8).
3. Paymob server-to-server POST webhook → `PaymobService.ProcessServerCallbackAsync`
   (`:211-339`) — HMAC verified **correctly** (20-field SHA-512). The parallel **GET** branch
   (`PaymentController.cs:218-268`) skips verification entirely (R1).
4. On success: enrollment check-then-add (R6 race), `StudentsCount` **not** incremented here (see
   STUDENT_FLOW_ISSUES BE8), accounting income auto-entry `pay_{orderId}` (check-then-act race, R6).
5. `AdminController.cs:167-169` revenue stat sums `completed` orders → inflated by R1/R2/R3.

---

## Status

| ID | Issue | Severity | Status |
|----|-------|----------|--------|
| R1 | **GET /webhook enrollment bypass (HMAC never verified)** | **Critical** | ✅ Fixed `1b82527` |
| R2 | No amount verification in webhook success path | High | ☐ |
| R3 | No refund/void/pending handling | High | ☐ |
| R4 | Teacher accounting tampering (amounts, PKs, destructible rows) | High | ☐ |
| R5 | Live secrets in not-gitignored appsettings.json | High | ☐ |
| R6 | No webhook idempotency / enrollment unique index (race) | High | ☐ |
| R7 | Hardcoded production URLs + WhatsApp number | Medium | ☐ |
| R8 | Post-payment dead end → Hero + fabricated order number | Medium | ☐ |
| R9 | Coupon flow broken + no discount cap (negative amount) | Medium | ☐ |
| R10 | Two parallel sales channels (Paymob live + WhatsApp) | Medium | ☐ |
| R11 | LocalStorage sync data loss on partial success | Medium | ☐ |
| R12 | No published-status gate on purchasable subjects | Medium | ☐ |
| R13 | Non-constant-time HMAC comparison | Low | ☐ |
| R14 | Orphaned pending orders/transactions on gateway failure | Low | ☐ |
| R15 | Dead code (PaymentHtmlPages, placeOrder, simulatePayment) | Low | ☐ |
