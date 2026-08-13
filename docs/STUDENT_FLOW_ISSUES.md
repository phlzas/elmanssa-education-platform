# Student Learning Flow — Known Issues & Risks

> Companion to `VIDEO_PIPELINE_ISSUES.md`, `TEACHER_FLOW_ISSUES.md`, `PAYMENTS_ISSUES.md`,
> `AUTH_FLOW_ISSUES.md`. This file catalogs **problems** found while tracing the student
> learning flow end to end:
> `App.tsx` router → `Hero`/`CoursesPage`/`CourseDetailPage` → `CheckoutPage` →
> `VideoViewer`/`SecureVideoPlayer`/`MediaGallery` → `StudentDashboard` (frontend),
> and `StudentController` → `StudentService` → `SubjectsController` → `MediaController`
> → `Enrollment`/`LectureProgress` models (backend).
>
> Each entry: **Severity** (Critical / High / Medium / Low), location, impact, suggested fix.
> Status is tracked inline; mark `[x]` when fixed.
>
> Key files: `App.tsx` (262), `components/VideoViewer.tsx` (~360), `components/StudentDashboard.tsx` (574),
> `components/CheckoutPage.tsx` (~482), `api/client.ts` (147), `api/courses.api.ts` (185),
> `api/student.api.ts` (16), `services/api.ts` (684+), backend `Controllers/StudentController.cs`,
> `Services/StudentService.cs`, `Controllers/SubjectsController.cs`, `Controllers/MediaController.cs`.

---

## Frontend bugs & risks

### F1. (Critical) Teacher/admin role bypasses the enrollment gate on the watch page
- **Severity:** High
- **Location:** `components/VideoViewer.tsx:180-186`; guard list `App.tsx:138`
- **Problem:** The session/enrollment check runs **only** when `user?.role === 'student'`.
  Any authenticated teacher or admin can navigate to `/watch/<any subject id or GUID>` and
  watch every lecture and open/download documents (`MediaGallery` docs at VideoViewer 352-356,
  `getViewUrl`/`getDownloadUrl`). There is no ownership check (teacher's own subjects vs others').
- **Impact:** Teachers/admins can watch any subject's lectures; media endpoints are JWT-protected
  but enrollment/ownership must be enforced server-side on stream/view/download too (see BE2).
- **Fix:** Run the gate for all non-admin roles and verify server-side on `/auth/session/validate`
  and every `/media/*` endpoint that the caller owns/enrolled the subject.

### F2. (High) Numeric-ID subjects are broken in the watch page (no levels, no mediaFileId, no auth header)
- **Severity:** High
- **Location:** `components/VideoViewer.tsx:188-194` → `services/api.ts:64-114` (legacy
  `fetchCourseById`), plus `api/courses.api.ts:116-157` (`mapCourseDetail` maps `levels` but
  **drops `mediaFileId`** at 125-131/137-143)
- **Problem:** The watch page routes numeric ids to the legacy loader which (a) maps **only**
  `curriculumSections` — not `levels` → `curriculum` stays undefined → the player renders the
  "لم يتم العثور على المادة" empty state — and (b) never maps `mediaFileId`, so uploaded videos
  are invisible. The legacy loader also uses raw `fetch` **without Authorization** (services/api.ts:67).
  GUID subjects (via `fetchSubjectById`, services/api.ts:675-739) handle both shapes and keep
  `mediaFileId` — so numeric-id and GUID-id subjects break in different ways.
- **Impact:** Numeric-ID subjects cannot be watched (no media, sometimes no curriculum at all).
- **Fix:** Unify on one loader (the modern `api/courses.api.ts` `fetchCourseById`), include
  `mediaFileId` in the Lecture mapping in both layers, and attach the Authorization header.

### F3. (Medium) VideoViewer progress overlay reads the wrong response shape
- **Severity:** Medium
- **Location:** `components/VideoViewer.tsx:216-226` uses `progressData?.subjects` directly;
  `components/StudentDashboard.tsx:381` unwraps `res?.data ?? res` from the **same** `getProgress()`
  (`api/student.api.ts:7` → `GET /student/progress`)
- **Problem:** `getProgress()` returns the full ApiResponse body (`{ data: {...} }`). StudentDashboard
  unwraps `.data`; VideoViewer does not → `progressData.subjects` is `undefined` → `completedIds`
  never populated → lecture checkmarks never render in the watch page.
- **Impact:** Progress sync display broken in the player (checkmarks/completion state missing).
- **Fix:** `const data = progressData?.data ?? progressData;` before reading `.subjects`.

### F4. (Medium) "مواصلة التعلم" never resumes — watch page always starts at the first lecture
- **Severity:** Medium
- **Location:** `components/StudentDashboard.tsx:197-229` (`SubjectCard` continue button navigates
  with `subject.id` only); `components/VideoViewer.tsx:236-239` (defaults to `mapped[0].lectures[0]`),
  `:218-225` (builds a `progressMap` that is never used to seek)
- **Problem:** The watch page builds per-lecture progress (`progressPct`/`lastAccessed`) but never
  uses it to seek; every re-entry starts at lecture 1.
- **Impact:** Students must manually re-find where they stopped.
- **Fix:** Pass `lectureId`/`resumeTime` through the `navigateTo` payload and seek on load.

### F5. (Medium) Not-enrolled student bounce lands on the homepage Hero instead of course-detail
- **Severity:** Medium
- **Location:** `components/VideoViewer.tsx:183` — `onNavigate('course-detail', { courseId:
  typeof courseId === 'number' ? courseId : undefined })`; `App.tsx:209-214` renders
  `selectedCourseId ? CourseDetailPage : Hero`
- **Problem:** `courseId` comes from the URL via `parsePath` (App.tsx:38-40) and is **always a
  string** → the ternary yields `undefined` → the student lands on the home page Hero, not the
  subject detail page.
- **Impact:** Broken navigation for unenrolled students (also affects any GUID-subject navigation).
- **Fix:** Pass the raw `courseId` string instead of the number-only ternary.

### F6. (Medium) Token storage key mismatch in MediaGallery (cross-ref VIDEO_PIPELINE B2)
- **Severity:** Medium
- **Location:** `components/MediaGallery.tsx:155` reads `localStorage.getItem("token")` vs
  `utils/token.ts:1` key `elmanssa_auth_token`
- **Problem:** The in-dashboard MediaGallery player never sends an Authorization header; HLS
  playback depends on the `?st=` signed token in the m3u8 URL while relative segment requests
  carry neither.
- **Impact:** Document/media playback depends on the signed URL only; already documented as B2 in
  VIDEO_PIPELINE_ISSUES.md — still unfixed.
- **Fix:** Use `getToken()` from `utils/token.ts` (and see BE4 for the HLS param conflict).

### F7. (Medium) Large dead-code block in legacy `services/api.ts` student section
- **Severity:** Medium (maintainability)
- **Location:** `services/api.ts:566-672` (`fetchStudentProgress`, `fetchStudentEnrollments`,
  `fetchStudentCourses`, `fetchStudentCourseDetail`, `fetchStudentLectureDetail`,
  `recordLectureWatch`, `fetchLectureTranscript`, `updateStudentProgress`) — **zero callers**
- **Problem:** The live flow writes progress via `api/student.api.ts` `updateProgress`
  (`POST /student/progress`); `recordLectureWatch` targets a `/student/lectures/{id}/watch`
  endpoint the live flow never uses. `services/auth.service.ts` and `services/payment.service.ts`
  are 0-import files; `simulatePayment` passes `courseId` where `createOrder` expects `subjectId`
  and would crash if ever wired.
- **Fix:** Delete the dead student block and the dead service files.

### F8. (Low) Dead exports in modern API modules
- **Severity:** Low
- **Location:** `api/orders.api.ts:33,37` (`getOrders`/`getOrder`); `api/student.api.ts:3`
  (`getEnrollments`); `api/media.api.ts:28,32,279,301` (`getMediaBySubject`, `getMediaFile`,
  `uploadDocumentsBatch`, `getStreamWithProgress`); `components/videoViewerUtils.tsx:56`
  (`getDriveEmbedUrl`); `constants.ts:15` (`FILTER_PRICES`); `components/CheckoutPage.tsx:2`
  (unused `placeOrder` import); `components/VideoViewer.tsx:30,248-256` (dead `lectureData` prop —
  App.tsx:230 never passes it)
- **Fix:** Delete the dead exports.

### F9. (Low) Duplicated mapping + dual loader stack
- **Severity:** Low (maintainability)
- **Location:** `mapCourseItem`/`mapCourseDetail` duplicated in `api/courses.api.ts:94-157`,
  `components/CoursesPage.tsx:17-37`, `components/PopularCourses.tsx:73-90`, `services/api.ts:37-113`;
  `fetchCourses`/`fetchCourseById`/`validateCoupon`/`createOrder` duplicated between `services/api.ts`
  and `api/*.ts`; `VideoViewer` has its own curriculum re-mapping (196-210)
- **Fix:** Single source of truth for mapping + loading.

### F10. (Medium) In-memory GET cache never invalidated (stale catalog + unbounded growth)
- **Severity:** Medium
- **Location:** `api/client.ts:14-40` (CACHE_TTLS 21-25, prefix matching), `:35-40`
  (`invalidateCache` — **zero callers**)
- **Problem:** `/subjects/popular` (5 min), `/subjects` (2 min), `/content/stats` (5 min) serve
  stale data after teacher edits / price changes / enrollments. Each unique query string is a
  separate Map key that is never evicted → unbounded memory growth.
- **Fix:** Call `invalidateCache` after teacher/subject mutations; add max-size/expiry sweep.

### F11. (Medium) PaymentSuccessPage is a static mock (fabricated receipt)
- **Severity:** Medium
- **Location:** `components/PaymentSuccessPage.tsx:36-43` fabricates order number `ELM-{timestamp}`
  and hardcodes "بطاقة ائتمان"; reachable by any logged-in user at `/payment-success/{id}`
  (App.tsx:138 protects only auth, not payment truth)
- **Problem:** No verification of Paymob status. The real status is only surfaced client-side via
  `?payment=success` on the dashboard (StudentDashboard.tsx:350-376) — craftable by anyone.
- **Fix:** Verify order status server-side (`GET /orders/{id}`) before rendering success; remove
  the fabricated receipt.

### F12. (Medium) Misleading pricing UI
- **Severity:** Medium
- **Location:** `components/CourseDetailPage.tsx:333-338` (fabricated 33% discount — strikethrough =
  `price*1.5` for every course); `components/CourseCard.tsx:117` (hardcoded "199 ج.م" strikethrough
  on free courses); `components/CourseDetailPage.tsx:139` (`(students/10).toFixed(0)` shown as review
  count)
- **Fix:** Show real prices/discounts from the backend, or drop the strikethrough; stop deriving a
  "review count" from students.

### F13. (Low) Teacher checkout blocked client-side only
- **Severity:** Low
- **Location:** `components/CourseDetailPage.tsx:344-347` (static "المدرسون لا يمكنهم شراء الكورسات"),
  `App.tsx:138` (guard does not block `/checkout` for teachers)
- **Problem:** A teacher who bypasses the UI can still hit the checkout endpoint; server must
  enforce the role. Dashboard query-param toasts (StudentDashboard:355-374) trust `?payment=success`
  client-side.
- **Fix:** Enforce teacher-role rejection server-side on payment create.

### F14. (Low) WhatsApp fallback number mismatch + numeric-id inquiry 404
- **Severity:** Low
- **Location:** `constants.ts:18` `WHATSAPP_FALLBACK_NUMBER = '966597750868'` (Saudi) vs EGP-priced
  catalog; `components/CourseDetailPage.tsx:41` calls `getInquiry(course.guidId ?? String(course.id))`
  — numeric ids produce `/subjects/{numeric}/inquiry` which likely 404s (GUID route constraint) →
  fallback fires
- **Fix:** Pass the GUID only; align the fallback number with the target market (see also backend R13/BE13).

### F15. (Low) Lecture notes are not persisted
- **Severity:** Low
- **Location:** `components/VideoViewer.tsx:343-349` — notes textarea is local state only; lost on
  navigation. Progress checkmarks in the watch sidebar also don't update live after `updateProgress`
  (SecureVideoPlayer.tsx:126) — completed status only refreshes on next page load.
- **Fix:** Persist notes (localStorage or API); update local `lecture.completed` after sync.

### F16. (Low) Default lecture duration "10:00" fabricated
- **Severity:** Low
- **Location:** `services/api.ts:697-698, 710` inject `'10:00'` when a lecture has no duration;
  `components/VideoViewer.tsx:322` hides the duration if `=== '10:00'`, but the sidebar
  `LectureItem` (154-156) still shows "10:00" for lectures with no duration
- **Fix:** Omit duration when unknown instead of fabricating a default.

---

## Backend issues & risks

### BE1. (Critical) Unauthenticated enrollment bypass via Paymob webhook GET branch
- **Severity:** Critical
- **Location:** `elmanassa_backend/elmanassa/Controllers/PaymentController.cs:196-281`
  (GET path 218-268; enrollment 234-258; the guard at 203-207 only checks `hmac` is **non-empty**)
- **Problem:** The GET branch of `/api/v1/payment/webhook` never cryptographically verifies the
  HMAC — it only requires the param to be present — yet on `success=true` it marks the transaction
  `success`, the order `completed`, creates the **enrollment**, and books an accounting income
  entry. The `merchant_order_id` (`"ORD-{Guid:N}".Substring(0,20)`) is returned to the student at
  payment-init (`PaymobService.cs:72, 203-204`).
- **Impact:** Any student who initiated payment can call
  `GET /api/v1/payment/webhook?hmac=anything&merchant_order_id=<own ref>&success=true` and self-enroll
  in any paid subject **without paying**; also fabricates teacher income and inflates the admin
  revenue stat. (Full payment-flow analysis in PAYMENTS_ISSUES.md R1.)
- **Fix:** Remove the GET DB-mutation branch entirely (the `/callback` endpoint already handles
  browser redirects with HMAC) OR verify the HMAC over the exact Paymob field set before any DB change.
- **Status:** ✅ Fixed `1b82527` (webhook is now POST-only; GET branch deleted, JSON body required,
  HMAC verified downstream in `ProcessServerCallbackAsync`). Residuals: R2 (amount verification),
  R6 (enrollment idempotency) still open — tracked in PAYMENTS_ISSUES.md.

### BE2. (Critical) No enrollment/ownership check on any media delivery endpoint (IDOR)
- **Severity:** Critical
- **Location:** `Controllers/MediaController.cs:263-443` (`{id}`, `subject/{id}`, `lecture/{id}`,
  `download`, `stream`, `view`), `:65-72` (`token`); `Services/SignedUrlService.cs:41-82`
- **Problem:** All media delivery endpoints are `[Authorize]` only — any authenticated user of any
  role can access **any** file by GUID. The signed token binds only `fileId + userId + expiry`
  — **no enrollment check** anywhere (`GetStreamToken` signs for any fileId). `mediaFileId` values
  leak to students via course payloads (VideoViewer.tsx:207), and draft subjects expose stream URLs
  (BE3).
- **Impact:** A non-enrolled student (or any teacher/admin) can stream/download every paid lecture's
  media and view every document.
- **Fix:** In every delivery + token endpoint, verify
  `Enrollments.AnyAsync(e => e.UserId == userId && e.SubjectId == media.SubjectId)` (and subject
  published); tie token issuance to that check.
- **Status:** ✅ Fixed `318b3d2` (all read endpoints gated: `{id}`/`token`, 3× HLS, subject & lecture
  listings, `download`/`stream`/`view`. Gate = admin bypass, else teacher-of-subject OR enrolled in
  owning subject; subject resolved via `MediaFile.SubjectId` → `Lecture.Level.SubjectId`; unattached
  media denied). Residuals: published-subject gate is BE3/BE7, still open.

### BE3. (High) Draft subjects (full curriculum, media metadata, stream URLs) are public
- **Severity:** High
- **Location:** `Controllers/SubjectsController.cs:159-226` (`GetSubjectById`,
  `[AllowAnonymous]` at 160, **no Status filter**); line 203 emits `/api/v1/media/stream/{MediaFileId}`;
  line 185 defaults leaked status to `"draft"`
- **Impact:** Unpublished courses browsable by GUID; internal `StoredFileName` + stream URLs leak;
  front-end paywall bypass staging ground.
- **Fix:** Add `s.Status == "published"` (and consider enrollment-gated content endpoints for
  logged-in students).

### BE4. (High) HLS signed-token vs JWT query-param conflict breaks HLS streaming
- **Severity:** High
- **Location:** `Program.cs:73-83` (`OnMessageReceived` hijacks `?token=` for all `/api/v1/media/*`
  into JWT validation); `Controllers/MediaController.cs:65-72` (issuer returns an HMAC token, not a
  JWT); `:77-142` (manual HMAC check on the same `token` param)
- **Problem:** The two token systems share the `token` query param. A signed HMAC token fed to JWT
  validation cannot parse (no dots) → 401 before the action; a JWT fed to the manual `ValidateToken`
  fails the HMAC compare → 401 in the action. Additionally the frontend sends `?st=` (`api/media.api.ts:54-56`)
  while the controller reads `[FromQuery] string token` → `token=null` regardless.
- **Impact:** HLS `.m3u8`/`.ts`/`key` endpoints are effectively unusable with the signed-token flow
  (needs runtime confirmation, but code paths are mutually exclusive).
- **Fix:** Use a distinct query param (e.g., `sig`) for the media HMAC token; keep `token` for JWT
  (or drop the JWT query-token feature and rely on the Authorization header); align the frontend param name.

### BE5. (High) Progress tampering: no enrollment guard, no 0-100 clamp, Completed spoofable
- **Severity:** High
- **Location:** `Services/StudentService.cs:110-137` (update), `:78-80` (`completedLectures` counts
  ALL lectures — not scoped to enrolled subjects); `DTOs/OrderDTO.cs:85-92` (`LectureProgressUpdateDTO`
  has no `[Range]`)
- **Problem:** `UpdateProgressAsync` accepts any `LectureId` and any `ProgressPct`; never queries
  `Enrollments`. `completedLectures` is unfiltered, so a student can POST `Completed=true` for
  lectures in non-enrolled subjects and inflate `OverallProgress` (rows become visible if they enroll later).
- **Fix:** Verify enrollment (via Lecture→Level→Subject) before upsert; `Math.Clamp(ProgressPct, 0, 100)`;
  derive `Completed` server-side (e.g., `ProgressPct >= 100`); scope `completedLectures` to enrolled
  subjects; add a unique index `(UserId, LectureId)`.

### BE6. (High) Double-enrollment race (TOCTOU) on all check-then-insert paths
- **Severity:** High
- **Location:** `Controllers/StudentController.cs:119-123`; `Services/PaymobService.cs:42-45, 304-315`;
  `Controllers/PaymentController.cs:241-243`; `Services/OrderService.cs:44-50`;
  `ApplicationDbContext/AppDbContext.cs:166` (only a non-unique index on UserId)
- **Problem:** No DB unique constraint on `(UserId, SubjectId)`; concurrent requests both pass
  `AnyAsync` then both insert.
- **Impact:** Duplicate enrollments, double-charge accounting, StudentsCount drift.
- **Fix:** Unique filtered index `IX_Enrollments_UserId_SubjectId` on `(UserId, SubjectId) WHERE
  SubjectId IS NOT NULL`; catch `DbUpdateException` and return `ALREADY_ENROLLED`.
- **Status:** ✅ Fixed `c9c247b` (unique filtered index `IX_Enrollments_UserId_SubjectId` on
  `(UserId, SubjectId) WHERE "SubjectId" IS NOT NULL` + dedupe SQL in migration; `DbUpdateException`
  → `ALREADY_ENROLLED` in `EnrollFree`, admin enroll, and webhook enrollment insert). Residuals:
  R6 webhook idempotency + pending→terminal transition wrap still open — tracked in PAYMENTS_ISSUES.md.

### BE7. (Medium) Broken "free" guard + no published check in enroll-free
- **Severity:** Medium
- **Location:** `Controllers/StudentController.cs:111-123` (guard at 115:
  `if (subject.Price > 0 && subject.Status != "free") return 403`)
- **Problem:** The guard only blocks when **both** `Price > 0` AND `Status != "free"`. A paid
  subject with `Status = "free"` bypasses payment; a `Price == 0` draft subject enrolls regardless
  of status. `Status == "free"` appears nowhere else in the codebase (grep) — likely never set.
- **Impact:** Free access to priced content; enrollment into unpublished/draft subjects (content then
  reachable via BE2).
- **Fix:** Require `subject.Status == "published"`, then free iff `subject.Price == 0 || subject.Status == "free"`.
- **Status:** ✅ Fixed `679750b` (`enroll-free` now 403s `NOT_PUBLISHED` unless
  `subject.Status == "published"`, then keeps the `NOT_FREE` guard — free iff
  `Price == 0 || Status == "free"`). Residuals: paid-enroll published gate is BE8/R12, still open.

### BE8. (Medium) Paid enrollment paths don't increment StudentsCount; no published gate on payment
- **Severity:** Medium
- **Location:** `Services/PaymobService.cs:304-315`, `Controllers/PaymentController.cs:234-258`
  (no `StudentsCount++`) vs `StudentController.cs:133` / `AdminController.cs:348` (they do);
  `Services/PaymobService.cs:38-45` (subject loaded with no status filter)
- **Impact:** Popularity ranking and public stats undercount paid enrollments; users can pay for
  draft subjects.
- **Fix:** Increment `StudentsCount` in every enrollment path (or derive it with a count query);
  validate `Status == "published"` in `CreatePaymentAsync`.

### BE9. (Medium) Dead legacy Course layer + title-based migration/progress mapping
- **Severity:** Medium
- **Location:** `Program.cs:92-95` (registered, unused); `Services/CourseService.cs`,
  `Repositories/CourseRepository.cs` (no callers); `Repositories/OrderRepository.cs` (unregistered);
  `Services/StudentService.cs:51-70` (title match); `Controllers/AdminController.cs:228-252`
  (migrate-enrollments); `Services/AuthService.cs:245-247`
- **Problem:** No `CourseController` exists; legacy `Course` logic survives only in progress/auth/admin
  paths. `StudentService.GetProgressAsync` maps legacy `CourseId` enrollments to subjects **by exact
  title match** — fragile with duplicate titles.
- **Impact:** Duplicate-title subjects map legacy enrollments to the wrong subject in progress.
- **Fix:** Remove the legacy Course/OrderRepository stack or complete a real ID-based migration.

### BE10. (Medium) Coupon validation gaps
- **Severity:** Medium
- **Location:** `Services/OrderService.cs:200-245`; `Services/PaymobService.cs:56-66`;
  `Models/Coupon.cs:22-23` (`MaxUses`/`CurrentUses` never read)
- **Problem:** `MaxUses`/`CurrentUses` are never enforced; coupons are not subject-bound; validation
  returns discounts for draft subjects; no discount cap (a >100% coupon → negative `totalAmount`).
- **Impact:** Unlimited coupon reuse on any subject; validation works for drafts.
- **Fix:** Enforce MaxUses/CurrentUses atomically at payment; bind coupons to subjects/categories;
  require published subject; clamp `0 < DiscountPct <= 100` (see PAYMENTS_ISSUES.md R9).

### BE11. (Low) Dead/disabled purchase flow
- **Severity:** Low
- **Location:** `Controllers/OrderController.cs:33-42` (403 stub); `Services/OrderService.cs:28-134`
  (no callers; auto-enrollment at 98-107 would enroll on unpaid pending orders if revived; subject
  loaded without published filter at 37)
- **Impact:** Maintenance risk; if someone "fixes" the endpoint, the auto-enroll becomes a payment bypass.
- **Fix:** Delete `OrderService.CreateOrderAsync` + the POST route, or harden before re-enabling.

### BE12. (Low) `GetUserId()` in StudentController throws on missing claim → 500
- **Severity:** Low
- **Location:** `Controllers/StudentController.cs:27-30` (`Guid.Parse(... ?? "")`). MediaController
  (466-472) and PaymentController (36-38) handle the missing claim differently.
- **Fix:** `TryParse` → Unauthorized.

### BE13. (Low) Hardcoded WhatsApp number + no inquiry tracking
- **Severity:** Low
- **Location:** `Controllers/SubjectsController.cs:243-288` (hardcoded `+966597750868` at 257;
  message template 269; `AllowAnonymous`; no status filter; **no DB write**)
- **Impact:** Inquiries always go to one hardcoded number regardless of teacher; no funnel data;
  draft subjects inquirable.
- **Fix:** Use the teacher/subject-configured number; persist inquiry events; filter published.

### BE14. (Low) BotDetection bypass / incomplete coverage
- **Severity:** Low
- **Location:** `Middleware/BotDetectionMiddleware.cs:19-20` (`/view/` not protected; `/hls/` exempt
  from the Origin check); UA blocklist + Origin check are cosmetic
- **Impact:** Not security; documents viewable by scripts with a UA + Origin header.
- **Fix:** Treat as defense-in-depth only; rely on BE2 enforcement.

### BE15. (Low) Enrollment/stat responses lack context
- **Severity:** Low
- **Location:** `Services/StudentService.cs:24-36` (`EnrollmentDTO` has no subject title/status);
  `DTOs/OrderDTO.cs:60-66`
- **Impact:** Frontend must join catalog data; enrolled-but-unpublished subjects invisible in progress counts.
- **Fix:** Include subject title + status.

### BE16. (Low) `StudentsCount` is a manually-maintained denormalized counter
- **Severity:** Low
- **Location:** `Models/Subject.cs:40`; increments only at `StudentController.cs:133` /
  `AdminController.cs:348/361`
- **Impact:** Races (BE6) and missed paths (BE8) drift it.
- **Fix:** Derive from `Enrollments.CountAsync()` or update within the same transaction/unique
  constraint as the enrollment insert.

---

## Frontend ↔ backend contract notes (verified)

- **Enrollment list == progress payload.** `getEnrollments()` (`api/student.api.ts:3`) is never
  called; the dashboard's "كورساتي" list is `getProgress().subjects[]` (StudentDashboard.tsx:381-389).
- **Access model is client-enforced only.** The only enrollment check in the API is
  `/auth/session/validate` (AuthController.cs:109-128) — called by VideoViewer, never enforced
  server-side on the media endpoints (see BE2).
- **Route naming:** the detail page is `/subject/:id`, **not** `/course/:id`; unknown path bases
  fall back to 'home' (App.tsx:41).
- **Legacy vs modern loaders diverge:** VideoViewer uses the legacy `services/api.ts` loaders while
  CourseDetailPage/CheckoutPage/PaymentSuccessPage use the modern `api/courses.api.ts` (see F2/F9).
- `Status` values are free-form strings: `"draft"` (default), `"published"`, `"free"` — no enum
  (see TEACHER_FLOW_ISSUES.md BE3).

---

## Status

| ID | Issue | Severity | Status |
|----|-------|----------|--------|
| F1 | Teacher/admin bypasses enrollment gate on watch page | High | ☐ |
| F2 | Numeric-ID subjects broken in watch page (no levels/mediaFileId/auth) | High | ☐ |
| F3 | VideoViewer progress overlay reads wrong response shape | Medium | ☐ |
| F4 | "مواصلة التعلم" never resumes | Medium | ☐ |
| F5 | Not-enrolled bounce lands on Hero instead of course-detail | Medium | ☐ |
| F6 | MediaGallery token key mismatch (B2 cross-ref) | Medium | ☐ |
| F7 | Dead student block in `services/api.ts` + dead service files | Medium | ☐ |
| F8 | Dead exports across modern API modules | Low | ☐ |
| F9 | Duplicated mapping + dual loader stack | Low | ☐ |
| F10 | GET cache never invalidated (stale + unbounded growth) | Medium | ☐ |
| F11 | PaymentSuccessPage static mock receipt | Medium | ☐ |
| F12 | Misleading pricing UI (fake discount, students/10 reviews) | Medium | ☐ |
| F13 | Teacher checkout blocked client-side only | Low | ☐ |
| F14 | WhatsApp fallback number mismatch / numeric-id inquiry 404 | Low | ☐ |
| F15 | Lecture notes not persisted; checkmarks don't update live | Low | ☐ |
| F16 | Fabricated default duration "10:00" | Low | ☐ |
| BE1 | **Webhook GET enrollment bypass (no HMAC verification)** | **Critical** | ☐ |
| BE2 | **No enrollment/ownership check on media endpoints (IDOR)** | **Critical** | ☐ |
| BE3 | Draft subjects public via GetSubjectById | High | ☐ |
| BE4 | HLS signed-token vs JWT query-param conflict | High | ☐ |
| BE5 | Progress tampering (no enrollment guard, no clamp, spoofable) | High | ☐ |
| BE6 | Double-enrollment race (no unique index) | High | ✅ Fixed `c9c247b` |
| BE7 | Broken "free" guard + no published check in enroll-free | Medium | ✅ Fixed `679750b` |
| BE8 | Paid paths don't increment StudentsCount; draft purchasable | Medium | ☐ |
| BE9 | Dead legacy Course layer + title-based migration | Medium | ☐ |
| BE10 | Coupon validation gaps (MaxUses/binding/cap) | Medium | ☐ |
| BE11 | Dead/disabled purchase flow (auto-enroll if revived) | Low | ☐ |
| BE12 | GetUserId throws → 500 | Low | ☐ |
| BE13 | Hardcoded WhatsApp number + no inquiry tracking | Low | ☐ |
| BE14 | BotDetection bypass / incomplete coverage | Low | ☐ |
| BE15 | Enrollment/stat responses lack subject context | Low | ☐ |
| BE16 | StudentsCount denormalized counter drifts | Low | ☐ |
