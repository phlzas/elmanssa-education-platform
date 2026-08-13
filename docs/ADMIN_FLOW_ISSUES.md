# Admin Flow — Known Issues & Risks

> Companion to `VIDEO_PIPELINE_ISSUES.md`, `TEACHER_FLOW_ISSUES.md`, `STUDENT_FLOW_ISSUES.md`,
> `PAYMENTS_ISSUES.md`, `AUTH_FLOW_ISSUES.md`. This file catalogs **problems** found while tracing
> the admin flow end to end:
> `App.tsx` route guard → `AdminDashboard.tsx` (8 tabs) → `api/admin.api.ts` + `api/accounting.api.ts`
> → `AdminController` (`/api/v1/admin/*`) → `AuthService`/`PaymobService`/`OrderService` cross-paths.
>
> Each entry: **Severity** (Critical / High / Medium / Low), location, impact, suggested fix.
> Status is tracked inline; mark `[x]` when fixed.
>
> Key files: `components/AdminDashboard.tsx` (709), `api/admin.api.ts` (279), `api/accounting.api.ts`
> (266), `components/AccountingTab.tsx` (629), backend `Controllers/AdminController.cs` (675),
> `ApplicationDbContext/AppDbContext.cs`, `Services/AuthService.cs`, `Services/PaymobService.cs`,
> `Services/OrderService.cs`, `Controllers/TeacherController.cs`.

---

## Frontend admin UI

### Routing & role gate (`App.tsx`)
- `/admin` → `AdminDashboard` (lazy-loaded, App.tsx:75, 88, 238); path mapping at `:26`.
- Role guard at `App.tsx:137-164`: `admin-dashboard` requires `role === 'admin'` (`:159`);
  wrong-role users are forced to their own dashboard (`:155-158`). Guard is purely client-side
  (role read from `localStorage.elmanssa_auth_user`).
- **There is no per-role rendering inside AdminDashboard** — it is admin-only by the route guard;
  all 8 tabs render for any user who reaches it.

### AdminDashboard.tsx structure (709 lines)
- `useAuth` user/logout (`:154`), tab state (`:155`), confirm + modal state (`:162-163`).
- Stats load on mount (`:179-185` → `getAdminStats`); per-tab load (`:187-204`); client-side search
  (`:213-218`); create/edit/delete handlers (`:220-303`).
- Tab list (`:305-314`): overview, students, teachers, courses, enrollments, orders, streams,
  accounting.
- `canCreate/canEdit/canSearch` per tab (`:316-318`) — accounting has no search/create via the
  generic path (uses `AccountingTab`).
- Modals: confirm (`:575-592`), user create/edit (`:595-628`), course create/edit (`:631-682`),
  enroll (`:685-704` — dropdown lists drafts with "منشور/مسودة", `:696`).

### api/admin.api.ts (279 lines) — every function → endpoint
| Function | Endpoint | Line |
|---|---|---|
| `getAdminStats` | GET `/admin/stats` | 5 |
| `getStudents` | GET `/admin/students?page&perPage=20&search` | 8-17 |
| `deleteStudent` | DELETE `/admin/students/{id}` | 18-24 |
| `updateStudent` | PUT `/admin/students/{id}` | 25-60 |
| `getTeachers` | GET `/admin/teachers` | 63-72 |
| `deleteTeacher` | DELETE `/admin/teachers/{id}` | 73-79 |
| `updateTeacher` | PUT `/admin/teachers/{id}` | 80-115 |
| `getAdminCourses` | GET `/admin/courses` | 118-127 |
| `deleteCourse` | DELETE `/admin/courses/{id}` | 128-134 |
| `createAdminCourse` | POST `/admin/courses` | 135-154 |
| `updateAdminCourse` | PUT `/admin/courses/{id}` | 155-161 |
| `publishAdminCourse` | PATCH `/admin/courses/{id}/publish` | 162-173 |
| `getEnrollments` | GET `/admin/enrollments` | 176-185 |
| `enrollStudent` | POST `/admin/enrollments` | 186-195 |
| `deleteEnrollment` | DELETE `/admin/enrollments/{id}` | 196-202 |
| `getAdminOrders` | GET `/admin/orders` | 205-214 |
| `deleteOrder` | DELETE `/admin/orders/{id}` | 215-221 |
| `getAdminStreams` | GET `/admin/streams` | 224-233 |
| `deleteStream` | DELETE `/admin/streams/{id}` | 234-240 |
| `createUser` | POST `/admin/users` | 243-267 |
| `toggleUserActive` | PATCH `/admin/users/{id}/toggle-active` | 268-274 |
| `getSubjectsList` | GET `/admin/subjects-list` | 277 |
| `getStudentsList` | GET `/admin/students-list` | 278 |
| `getTeachersList` | GET `/admin/teachers-list` | 279 |

No localStorage usage in `admin.api.ts` (only `accounting.api.ts` uses it).

### api/accounting.api.ts (266 lines) — localStorage-first hybrid sync
- Keys: `elmanassa_transactions` (admin), `elmanassa_teacher_transactions` (teacher) — `:36-37`.
- `getTransactions` (`:51-84`): GET `/admin/accounting/transactions`; syncs unsynced local rows
  fire-and-forget; **contains the R1 data-loss bug** (`:68-73`).
- `createTransaction` (`:86-104`): POST `/admin/accounting/transactions`; on failure falls back to
  localStorage.
- `updateTransaction` (`:106-122`): PUT `/admin/accounting/transactions/{id}`; localStorage fallback.
- `deleteTransaction` (`:124-130`): DELETE + always remove local row.
- Teacher variants (`:134-220`): `getTeacherTransactions` (`:134-171`, R1 bug at `:153-158`),
  `createTeacherTransaction` (`:173-193`), `updateTeacherTransaction` (`:195-213`, DELETE+POST hack —
  R11), `deleteTeacherTransaction` (`:215-220`).
- `detectCurrency`/`formatCurrency`/`computeStats`/`exportToCSV` (`:224-266`; `activeCourses` hardcoded
  to 0 in `computeStats` at `:245` — R20).

### AccountingTab.tsx (629 lines) — shared admin/teacher UI
- `mode` prop (`:310-316`), `isTeacher` (`:330`); load branches to
  `getTeacherTransactions`/`getTransactions` (`:332-343`).
- TxModal amount field caps `min=0` (`:187`) — client-side only (see R9).
- Stats split by currency (`:412-416`); table columns omit the teacher dimension (`:539-541` — R14).

### Teacher-side rendering (for the "per-role" question)
- Teacher accounting = `TeacherDashboard.tsx:545` → `AccountingTab mode="teacher"` (nav "المحاسبة"
  in `TeacherSidebar.tsx:12-33`).
- Teachers **never** call `/admin/*` from the frontend — all admin endpoints are admin-only in
  practice; the `[Authorize(Roles="admin,teacher")]` annotations are misleading (R2).

---

## Backend AdminController.cs (route `api/v1/admin`, class `[Authorize(Roles="admin")]` at 11-13)

| Route | Method | Auth attrs | Action | Line |
|---|---|---|---|---|
| `/students` | GET | class + `admin,teacher` | list (paged, search) | 27-37 |
| `/students/{id}` | DELETE | class | DeleteStudent | 39-47 |
| `/teachers` | GET | class + `admin,teacher` | list | 51-61 |
| `/teachers/{id}` | DELETE | class | DeleteTeacher | 63-71 |
| `/courses` | GET | class + `admin,teacher` | list all subjects (incl. drafts) | 75-90 |
| `/courses/{id}` | DELETE | class | DeleteCourse | 92-100 |
| `/orders` | GET | class | list | 104-118 |
| `/orders/{id}` | DELETE | class | DeleteOrder | 120-128 |
| `/streams` | GET | class | list | 132-144 |
| `/streams/{id}` | DELETE | class | DeleteStream | 146-154 |
| `/stats` | GET | class + `admin,teacher` | revenue = sum(FinalPrice) of completed orders | 158-172 |
| `/users` | POST | class | CreateUser | 179-209 |
| `/users/{id}/toggle-active` | PATCH | class | toggle active (blocks self-disable `:219`) | 214-226 |
| `/migrate-enrollments` | POST | class | legacy Course→Subject by title match | 231-259 |
| `/students/{id}` | PUT | class | UpdateStudent | 263-279 |
| `/teachers/{id}` | PUT | class | UpdateTeacher | 283-299 |
| `/enrollments` | GET | class | list (join User+Subject) | 303-330 |
| `/enrollments` | POST | class | EnrollStudent — **no published check** (R5), `StudentsCount++` :348 | 332-352 |
| `/enrollments/{id}` | DELETE | class | delete enrollment, `StudentsCount--` :360-361 | 354-366 |
| `/courses` | POST | class | CreateCourse — teacherId fallback to admin :375-379 (R17) | 370-402 |
| `/courses/{id}` | PUT | class | UpdateCourse | 404-425 |
| `/courses/{id}/publish` | PATCH | class | PublishCourse — arbitrary status (R16) | 427-436 |
| `/subjects-list` | GET | class | ids+names+titles | 440-448 |
| `/students-list` | GET | class | active students only | 452-461 |
| `/teachers-list` | GET | class | all teachers | 465-474 |
| `/accounting/backfill` | POST | class | BackfillAccounting — `pay_{order.Id}` :493 | 482-542 |
| `/accounting/transactions` | GET | class | all rows, unbounded (R20) | 544-557 |
| `/accounting/transactions` | POST | class | CreateAccountingTransaction — client Id :567 (R10) | 559-585 |
| `/accounting/transactions/{id}` | PUT | class | update (guards `Amount > 0` :596) | 587-606 |
| `/accounting/transactions/{id}` | DELETE | class | delete | 608-616 |

---

## Accounting data-flow

1. **Webhook auto-entry** (`PaymobService.cs:379, 391`): on payment success creates
   `AccountingTransaction` with `Id = "pay_{order.Id}"`, `TeacherId = subject.TeacherId`.
2. **Backfill** (`AdminController.cs:482-542`): idempotent scan — skips orders that already have a
   `pay_*` entry (`:494-495`), defaults payment method to "كاش" when no `PaymentTransaction` exists
   (`:503-509`), amount basis `FinalPrice > 0 ? FinalPrice : TotalAmount` (`:527`).
3. **Admin/teacher CRUD**: admin create forces `TeacherId = null` (`:579`); teacher create forces
   `TeacherId = claim` (`TeacherController.cs:280`) but accepts client `Id`; teacher update =
   DELETE+POST (`accounting.api.ts:195-213`).
4. **Frontend hybrid**: writes go to server, fall back to localStorage on failure; reads merge
   unsynced local + server rows, sync fire-and-forget (R1 data-loss bug).
5. **Revenue stat** (`AdminController.cs:167-169`): sums `FinalPrice` of `PaymentStatus == "completed"`
   orders — inflated by PAYMENTS_ISSUES R1/R2/R3, and on a different amount basis than backfill (R20).

---

## Numbered bugs & risks

### R1. (High) Accounting sync deletes ALL unsynced localStorage rows if ANY succeeded
- **Severity:** High
- **Location:** `api/accounting.api.ts:68-73` (admin), `:153-158` (teacher)
- **Problem:** `syncedIds = new Set(unsynced.map(t => t.id))` uses every unsynced id, then
  `saveLocal(key, localData.filter(t => !syncedIds.has(t.id)))` removes them all. The set is built
  from `unsynced`, **not** from `results.filter(Boolean)` that actually succeeded. If 3 items are
  unsynced and only 2 POSTs succeed, all 3 vanish from localStorage — the failed one is lost forever.
- **Impact:** Silent, permanent loss of accounting records on any partial sync failure. No retry, no warning.
- **Fix:** Track success per-item (`const okIds = new Set(unsynced.filter((_, i) => results[i]).map(t => t.id))`)
  and surface sync errors in the UI.

### R2. (Medium) Misleading/additive `[Authorize(Roles="admin,teacher")]` on admin methods
- **Severity:** Medium
- **Location:** `AdminController.cs:13` (class `[Authorize(Roles="admin")]`) + method-level
  `:28, :52, :76, :159` (`[Authorize(Roles="admin,teacher")]`)
- **Problem:** Stacked `[Authorize]` attributes **AND** their role requirements: `admin AND (admin OR
  teacher)` = `admin`. Teachers are always rejected (403) on GET `/students`, `/teachers`, `/courses`,
  `/stats` even though the annotations advertise `admin,teacher`.
- **Impact:** The annotations lie about intent; any future teacher-facing feature wired to `/admin`
  will silently 403. Latent today (teacher frontend never calls `/admin`).
- **Fix:** Remove the redundant method-level attributes, or add a real teacher-scoped controller with
  proper data scoping.

### R3. (High) Admin-created users are half-baked: no legacy Student/Teacher row, no verification code, no verification email
- **Severity:** High
- **Location:** `AdminController.cs:179-209` vs `AuthService.cs:47-77, 113-141, 166-176`
- **Problem:** `CreateUser` writes only the `Users` row with default `IsEmailVerified = false` and no
  `EmailVerificationCode`/expiry, and never creates `Student`/`Teacher` legacy rows (AuthService does
  both). Login then blocks the user (`Role != "admin" && !IsEmailVerified`, AuthService.cs:167) and
  regenerates a code + fires an email on **login attempt** (`:169-175` — note `SendPasswordResetAsync`
  is called at `:174`, a copy-paste smell).
- **Impact:** Admin-created students/teachers cannot log in until they request a resend; legacy rows
  never exist; the "create user" action is effectively unusable end-to-end.
- **Fix:** Set `IsEmailVerified = true` for admin-created users, **or** generate
  `EmailVerificationCode` + send the verification email from `CreateUser`, and create the legacy
  `Student`/`Teacher` rows to match `AuthService`.

### R4. (Medium) `CreateUser` can mint new admin accounts (and no UI confirmation)
- **Severity:** Medium
- **Location:** `AdminController.cs:179-180` + `AdminCreateUserDTO.cs:21-24`
  (`^(student|teacher|admin)$`); frontend `admin.api.ts:253` whitelist includes `'admin'`
- **Problem:** The endpoint accepts `role=admin` with no extra authorization or audit. Any compromised
  admin JWT can silently add another admin.
- **Impact:** Privilege-escalation surface; admin-account proliferation with no audit trail.
- **Fix:** Restrict role to `student|teacher` for this endpoint (admins seeded via config), or require
  a second factor/audit log.

### R5. (Medium) `POST /enrollments` has no published-status check
- **Severity:** Medium
- **Location:** `AdminController.cs:332-352` (only student-role + subject-existence checks at `:335-338`)
- **Problem:** Draft/archived subjects are enrollable by the admin UI (the enroll dropdown even lists
  drafts, AdminDashboard.tsx:696).
- **Impact:** Students enrolled in unpublished content; `StudentsCount` and access-gating semantics
  diverge from the public catalog.
- **Fix:** Require `subject.Status == "published"` (or an explicit admin override flag).

### R6. (Medium) `StudentsCount` drift — only 2 of 4 enrollment paths increment it
- **Severity:** Medium
- **Location:** increments: `AdminController.cs:348`, `StudentController.cs:133`; **missing** in
  `OrderService.cs:98-107` (order auto-enroll) and `PaymobService.cs:303-315` (webhook auto-enroll);
  decrement only in `AdminController.cs:360-361`
- **Problem:** Paid purchases create Enrollments without touching `Subject.StudentsCount`. The admin
  courses tab displays this count (AdminDashboard.tsx:498) and it drives ordering/popularity
  (SubjectsController.cs:121).
- **Impact:** Course student counts systematically understated; delete-enrollment decrements can move
  the number further from truth (it never went up).
- **Fix:** Increment in `OrderService.CreateOrderAsync` and the PaymobService webhook (or recompute
  `StudentsCount` from `Enrollments.Count` in a migration/backfill).

### R7. (Medium) No unique index on `Enrollments (UserId, SubjectId)`
- **Severity:** Medium
- **Location:** `AppDbContext.cs:151-166` (`HasIndex(e => e.UserId)` only, non-unique);
  `Migrations/20260329170927_InitPostgres.cs:758-774`
- **Problem:** All duplicate-enrollment guards are app-level `AnyAsync` checks
  (AdminController.cs:340, OrderService.cs:44-50, StudentController.cs:119-123,
  PaymobService.cs:304-307) → TOCTOU race under concurrent requests; the DB stores duplicates.
- **Impact:** Duplicate enrollments, wrong counts, inconsistent "already enrolled" UX.
- **Fix:** `HasIndex(e => new { e.UserId, e.SubjectId }).IsUnique()` (+ migration); handle
  `DbUpdateException` as a friendly 409.

### R8. (Medium) Delete endpoints produce opaque 500s on FK-restrict violations
- **Severity:** Medium
- **Location:** `AdminController.cs:39-47` (DeleteStudent), `:63-71` (DeleteTeacher), `:92-100`
  (DeleteCourse), `:120-128` (DeleteOrder); FKs: Enrollment.UserId Restrict (AppDbContext.cs:151-155),
  Order.SubjectId Restrict (`:203-207`), Subject.TeacherId Cascade (`:128`), Order.UserId Cascade (`:197`)
- **Problem:** Deleting a student with enrollments → `DbUpdateException` → 500. Deleting a teacher
  whose subjects have orders → cascade hits Restrict → 500. Deleting a subject with orders → 500.
  None of the four handlers catch FK errors.
- **Impact:** Generic failure, no guidance on what blocks the delete, confusing diagnostics.
- **Fix:** Catch `DbUpdateException`, inspect FK constraints, return 409 with an Arabic message.

### R9. (Medium) Accounting transactions: no amount/currency/type validation
- **Severity:** Medium
- **Location:** `AdminController.cs:559-585` (create checks only StudentName/Type non-empty `:562-563`;
  `TeacherId = null` hardcoded `:579`), `:587-606` (update guards only `Amount > 0` `:596`); DTO
  `AccountingTransactionDTO.cs:660-674` (Amount decimal, no `[Range]`, no whitelist for
  Currency/Type); model `AccountingTransaction.cs:25-35`
- **Problem:** Negative amounts, zero amounts, `Currency="USD"`, `Type="junk"` all persist via POST.
  The UI caps `min=0` (AccountingTab.tsx:187) but the API has no server-side check. `TeacherId` from
  the DTO is silently ignored (admin can't attribute an entry to a teacher).
- **Impact:** Corrupt financial records (negative revenue, unknown currencies break the SAR/EGP split
  in AccountingTab.tsx:412-416).
- **Fix:** `[Range(0.01, ...)]` on Amount; whitelist Currency ∈ {SAR, EGP}, Type ∈ {income, expense}.

### R10. (Medium) Client-supplied `Id` accepted as accounting PK
- **Severity:** Medium
- **Location:** `AdminController.cs:567` (`Id = model.Id ?? generated`); `TeacherController.cs:280`
  (same); model PK `AccountingTransaction.cs:9-11`
- **Problem:** The client decides the primary key. A crafted `Id` equal to an existing row (e.g.
  `pay_{orderId}`) on POST → `Add` throws `DbUpdateException` → 500; after a delete, a crafted re-POST
  can resurrect an entry with a chosen id. Combined with R1/R11, ids are the only integrity anchor of
  the audit trail.
- **Impact:** Audit-tampering surface (delete + re-create with same id and different data); 500s on
  collision; unpredictable keys.
- **Fix:** Always generate the id server-side (`tx_...`) and ignore the client id; add a real teacher
  PUT endpoint instead of DELETE+POST (R11).

### R11. (High) Teachers can delete/rewrite auto-created payment audit records
- **Severity:** High
- **Location:** auto-created `pay_{order.Id}` rows: `PaymobService.cs:379, 391` (Id, TeacherId =
  subject.TeacherId) and `AdminController.cs:493, 535` (BackfillAccounting); teacher list/delete
  scoped only by `TeacherId` at `TeacherController.cs:259-267, 300-310`; rewrite path
  `accounting.api.ts:195-213` (DELETE+POST)
- **Problem:** Because webhook/backfill entries carry `TeacherId`, they appear in the teacher's
  accounting list, and the teacher can DELETE them (any entry with matching TeacherId) or mutate the
  amount via the DELETE+POST update hack.
- **Impact:** A teacher can silently erase or alter the financial audit record of a real completed
  payment; admin views (all rows, AdminController.cs:544-557) and reconciliation lose ground truth.
- **Fix:** Mark webhook/backfill entries immutable (system flag); exclude `pay_*` ids from
  teacher-scoped list/delete (or require admin); add a proper teacher PUT that preserves
  `CreatedAt`/immutability.

### R12. (Low-Med) BackfillAccounting payment-method defaulting and re-creation
- **Severity:** Low-Medium
- **Location:** `AdminController.cs:482-542` (defaults method to "كاش" when no PaymentTransaction
  exists `:503-509`; amount basis `FinalPrice > 0 ? FinalPrice : TotalAmount` `:527`; TeacherId =
  subject.TeacherId `:535`)
- **Problem:** Orders created before PaymentTransactions existed get labeled "كاش" even if paid
  online; if a teacher deletes a pay_ entry, a later backfill re-creates it (idempotency by id works,
  but the interim window + teacher rewrite loop makes the audit state flapping).
- **Impact:** Mislabeled payment methods in accounting; R11 loops create an inconsistent audit trail.
- **Fix:** Preserve `Order.PaymentMethod` as fallback before defaulting to "كاش"; prevent teacher
  deletion instead (R11).

### R13. (Low, feature gap) No coupon management in the admin flow
- **Severity:** Low
- **Location:** coupons exist at `AppDbContext.cs:215`, `Models/Coupon.cs`,
  `OrderService.cs:64-74, 200-245`, `api/orders.api.ts:41-82`; **absent** from AdminController.cs,
  AdminDashboard.tsx, admin.api.ts
- **Problem:** Coupons are applied at checkout but there is no admin UI/endpoint to create, edit,
  disable, or audit them. Validation lacks per-user limits (OrderService.cs:66-73 — no max-uses, no
  per-user cap).
- **Impact:** Coupons unmanageable in production; no way to retire a leaked code except DB edits.
- **Fix:** Add coupon CRUD to AdminController + AdminDashboard with usage caps.

### R14. (Low) Admin accounting UI hides the teacher dimension
- **Severity:** Low
- **Location:** backend returns `teacherName` (`AdminController.cs:549-554`) but table columns omit it
  (`AccountingTab.tsx:539-541`); admin create hardcodes `TeacherId = null` (`AdminController.cs:579`)
- **Problem:** The admin sees a flat transaction list with no teacher attribution and cannot create a
  transaction for a teacher.
- **Impact:** Admin can't reconcile which teacher earned what from `pay_` entries.
- **Fix:** Show a teacher column; allow admin to set TeacherId on create (or at least display it).

### R15. (Medium) Admin PUT endpoints can create duplicate emails (unique-index 500)
- **Severity:** Medium
- **Location:** `UpdateStudent` (`AdminController.cs:263-279`), `UpdateTeacher` (`:283-299`) — email
  assigned with no uniqueness check; `User.Email` unique index `AppDbContext.cs:74`
- **Problem:** Changing a user's email to one already used by another user throws `DbUpdateException` → 500.
- **Impact:** Opaque failures; no friendly duplicate-email message.
- **Fix:** Check `_context.Users.Any(u => u.Email == model.Email && u.Id != id)` and return 400.

### R16. (Low-Med) `PATCH /courses/{id}/publish` accepts arbitrary status strings
- **Severity:** Low-Medium
- **Location:** `AdminController.cs:427-436`; `PublishDTO.cs:655-658` (default "published", no whitelist)
- **Problem:** Same defect as teacher-side BE3: any string becomes `subject.Status`. The frontend
  whitelists (admin.api.ts:168-171) but direct API callers don't.
- **Impact:** Invalid statuses make catalog queries (`Status == "published"`) silently miss subjects.
- **Fix:** Validate status against `draft|published|archived|pending` server-side.

### R17. (Low) `POST /courses` doesn't validate the teacher role
- **Severity:** Low
- **Location:** `AdminController.cs:370-402` (only GUID fallback at `:375-379`); frontend validates GUID
  shape only (`admin.api.ts:137-139`)
- **Problem:** Any valid GUID (a student, another admin, a nonexistent id) can be set as `TeacherId`;
  FK rejects nonexistent ids with 500, but assigning a student as a subject's teacher succeeds.
- **Impact:** Subjects attributed to non-teachers; instructor profile pages show non-teacher content.
- **Fix:** Verify `_context.Users.AnyAsync(u => u.Id == teacherId && u.Role == "teacher")`.

### R18. (Low) `updateAdminCourse` skips sanitization (create path is sanitized)
- **Severity:** Low
- **Location:** `admin.api.ts:135-154` (sanitized create) vs `:155-161` (raw PUT);
  `AdminController.cs:404-425` stores fields verbatim
- **Problem:** The edit flow forwards the raw form object (arbitrary `status`, un-validated `price`,
  HTML-ish strings), bypassing the client-side whitelist used on create.
- **Impact:** Inconsistent validation; long/HTML inputs can enter the catalog.
- **Fix:** Sanitize/validate in `updateAdminCourse` exactly like `createAdminCourse`, and validate on
  the server.

### R19. (Low) No cache invalidation after admin mutations
- **Severity:** Low
- **Location:** `api/client.ts:21-25` (public GET cache TTLs) + `invalidateCache` (`:35-40`) — **never
  called** from `admin.api.ts`
- **Problem:** Admin publish/delete/edit mutations change the public catalog but the cached
  `/subjects` (2 min) and `/subjects/popular` (5 min) lists keep serving stale data.
- **Impact:** Students see deleted/unpublished courses for up to 5 minutes after an admin action.
- **Fix:** Call `invalidateCache('/subjects')` after course/order/stream mutations (same gap as
  teacher F10).

### R20. (Low) Minor: no pagination on accounting list; stats drift; toast/double-submit
- **Severity:** Low
- **Location:** `AdminController.cs:544-557` returns ALL AccountingTransactions (unbounded);
  `AccountingTab.tsx:409` uses `computeStats` whose `activeCourses` is hardcoded 0
  (`accounting.api.ts:245`); `AdminDashboard.tsx:252-289` double-submit window (disabled flag only at
  `:625`); revenue in `AdminController.cs:167-169` vs BackfillAccounting `:527` use different amount
  bases (FinalPrice vs TotalAmount)
- **Problem:** Large transaction tables load entirely; dashboard stats claim "0 active courses"
  forever; double-click on save can double-create users/courses/enrollments; revenue figures in the
  overview and the accounting backfill can disagree.
- **Impact:** Performance and consistency noise across the admin UI.
- **Fix:** Add skip/take to GET `/accounting/transactions`; compute real `activeCourses` or drop the
  field; synchronous save lock; align the revenue basis.

---

## Security/consistency summary (direct answers)

- **Coupons in admin flow:** none (R13).
- **Course/subject CRUD in admin:** yes — full CRUD + publish on Subjects
  (AdminController.cs:92-100, 370-436).
- **Accounting amount/currency validation:** none server-side (R9); negative amounts allowed via POST.
- **Unique index on Enrollments(UserId, SubjectId):** NO (R7).
- **`pay_{order.Id}` collision:** deterministic ids from two producers (webhook + backfill) that
  self-guard via existence checks (PaymobService.cs:348-350, AdminController.cs:494-495) — safe
  against double-insert, but vulnerable to R10/R11 (client-supplied id + teacher deletion).
- **Role additive behavior:** confirmed — class-level `admin` + method-level `admin,teacher` ⇒
  teachers are always locked out despite the annotation (R2).

---

## Status

| ID | Issue | Severity | Status |
|----|-------|----------|--------|
| R1 | Accounting sync deletes ALL unsynced rows on partial success | High | ☐ |
| R2 | Additive `[Authorize]` roles lock teachers out (misleading) | Medium | ☐ |
| R3 | Admin-created users: no legacy row / verification code / email | High | ☐ |
| R4 | CreateUser can mint new admin accounts | Medium | ☐ |
| R5 | POST /enrollments lacks published-status check | Medium | ☐ |
| R6 | StudentsCount drift (2 of 4 enrollment paths increment) | Medium | ☐ |
| R7 | No unique index on Enrollments(UserId, SubjectId) | Medium | ☐ |
| R8 | Delete endpoints → opaque 500s on FK-restrict | Medium | ☐ |
| R9 | Accounting: no amount/currency/type validation | Medium | ☐ |
| R10 | Client-supplied accounting PK accepted | Medium | ☐ |
| R11 | Teachers can delete/rewrite auto-created payment audit records | High | ☐ |
| R12 | Backfill payment-method defaulting + re-creation loop | Low-Med | ☐ |
| R13 | No coupon management anywhere in admin flow | Low | ☐ |
| R14 | Admin accounting UI hides teacher attribution | Low | ☐ |
| R15 | PUT endpoints can create duplicate emails (500) | Medium | ☐ |
| R16 | Publish endpoint accepts arbitrary status strings | Low-Med | ☐ |
| R17 | POST /courses doesn't validate teacher role | Low | ☐ |
| R18 | updateAdminCourse skips sanitization | Low | ☐ |
| R19 | No cache invalidation after admin mutations | Low | ☐ |
| R20 | No accounting pagination; stats drift; double-submit | Low | ☐ |
