# Teacher Content-Management Flow — Known Issues & Risks

> Companion to `VIDEO_PIPELINE_ISSUES.md`. This file catalogs **problems** found
> while tracing the teacher content-management flow end to end:
> `TeacherDashboard.tsx` → legacy `services/api.ts` → `TeacherController` →
> `TeacherService` → `Subject`/`Level`/`Lecture` models → media linking.
>
> Each entry: **Severity** (High / Medium / Low), location, impact, suggested fix.
> Status is tracked inline; mark `[x]` when fixed.
>
> Key files (actual sizes): `TeacherDashboard.tsx` (576), `SubjectModal.tsx` (977),
> `saveSubjectUpdated.ts` (286), `TeacherSubjectsGrid.tsx` (193),
> `TeacherLecturesView.tsx` (249), `api/teacher.api.ts` (144),
> `services/api.ts` (684+).

---

## Frontend bugs & risks

### F1. (Headline) Background-upload persistence silently fails for newly created subjects
- **Severity:** High
- **Location:** `components/TeacherDashboard.tsx:210-283` (`handleBackgroundUploadComplete`),
  `components/teacher/SubjectModal.tsx:108-113, 142-145`
- **Problem:** `handleBackgroundUploadComplete` is a `useCallback([subjects, showToast])`
  that reads `subjects.find(subjectId)` from its **closure** (line 250) and early-returns
  silently if the subject isn't found (line 251). SubjectModal's in-flight upload handlers
  captured the `onBackgroundUploadComplete` prop reference at the render when the upload
  **started**. In the create flow, `subjects` is empty/stale at upload start; after save the
  array is recreated, but the running upload still holds the old function bound to the old
  array → `find()` returns `undefined` → **no persistence and no toast at all**.
- **Impact:** The modal explicitly promises "يمكنك الحفظ الآن وسيكتمل الرفع تلقائياً"
  (SubjectModal.tsx:931) — the exact broken case. The local grid patch (step 1) succeeds, so
  the video appears attached in the UI while the server lecture has **no `mediaFileId`**.
  After reload the video is gone. Edit flow "works" but PUTs a pre-save snapshot of `levels`,
  potentially reverting edits made while the upload was in flight.
- **Fix:** Read `subjects` from a ref (or use the functional `setSubjects` form plus a
  ref/effect keyed on the subject id) so background completions always find the just-saved
  subject; or move persistence into the modal's own effect keyed on `savedSubjectId`.

### F2. `savedSubjectId` is never reset
- **Severity:** Medium
- **Location:** `components/TeacherDashboard.tsx:44, 336, 401`; `resetForm` (163-169)
- **Problem:** Set on every successful save, cleared nowhere (`resetForm` and modal close
  don't touch it). A later modal session for subject B reuses the stale id from subject A:
  an upload completing before B is saved calls `onBackgroundUploadComplete(A.id, …)`,
  patching A's levels and firing a misleading "اكتمل رفع … وتم حفظه" toast plus a spurious PUT.
- **Impact:** Wrong-target writes and wrong toasts; mostly benign today (temp ids won't match
  A) but a correctness trap for any future logic that trusts the id.
- **Fix:** Clear `savedSubjectId` in `resetForm` / on modal open for a new session.

### F3. Editing a subject wipes its cover image
- **Severity:** Medium
- **Location:** `components/TeacherDashboard.tsx:179` (`openEditModal` sets
  `setNewSubjectImageUrl('')`), edit-save payload at `:321` (`imageUrl: newSubjectImageUrl || undefined`)
- **Problem:** The edit modal starts with an empty image URL; save sends `undefined`, so the
  backend clears `ImageUrl`.
- **Impact:** Every edit deletes the subject's cover image server-side.
- **Fix:** Initialize the edit form from the loaded subject (`editingSubject.imageUrl`) instead
  of `''`.

### F4. Icon is never persisted (edit ignores it, create hardcodes 📚)
- **Severity:** Medium
- **Location:** edit payload `TeacherDashboard.tsx:315-324` (no `icon`); create hardcodes
  `icon: '📚'` in `services/api.ts:320`; step-1 category-icon selector `SubjectModal.tsx:71-75`
- **Problem:** The edit branch omits `icon` from the PUT body (local patch sets it at :329),
  and the create path hardcodes `'📚'`. The icon picker is cosmetic.
- **Impact:** After any reload every subject shows 📚 regardless of the chosen category icon.
- **Fix:** Include `icon` in both create and update payloads (from form state), or remove the
  icon selector UI entirely.

### F5. `levels`-only PUT can clobber the subject
- **Severity:** Medium
- **Location:** `components/TeacherDashboard.tsx:253-277` (`handleBackgroundUploadComplete`)
- **Problem:** The background-completion persist calls `updateTeacherSubject(subjectId, { levels })`
  — a PUT with only `levels`. If the backend PUT semantics replace fields, title/price/level/
  category sent at save time are wiped by this later partial payload. The comment at :248 says
  "re-fetch the subject's current state then patch it" — no re-fetch happens; it uses the stale
  closure snapshot instead.
- **Impact:** Subject metadata drift / loss on background-upload completion.
- **Fix:** Re-fetch the subject before the partial PUT, or make the backend PUT merge semantics
  explicit (only update non-null DTO fields — verify `UpdateSubjectAsync` does this for all fields).

### F6. Orphaned media files when the teacher cancels
- **Severity:** Medium
- **Location:** `SubjectModal.tsx:87, 131` (`lectureId` is `undefined` on upload), modal close
  `:219-226`
- **Problem:** Uploads are fired with `lectureId = undefined` (unlinked); linking happens only
  at save time. Closing the modal mid-upload (X button just calls `onClose`) abandons the
  upload with no abort and no cleanup path.
- **Impact:** Files accumulate on the server (5 GB each) with no DB row pointing at them.
- **Fix:** Abort in-flight uploads on close, add a confirm-on-cancel when uploads are active,
  and/or a server-side sweep of unlinked MediaFiles older than N hours.

### F7. `saveSubjectUpdated.ts` is dead code and would crash if imported
- **Severity:** Medium (maintainability)
- **Location:** `components/teacher/saveSubjectUpdated.ts`
- **Problem:** `createSaveSubjectFunction` has zero importers. Its header claims "already
  integrated in TeacherDashboard.tsx" (line 264) — false. If wired up it fails to compile: the
  closure references `newSubjectPrice`/`newSubjectLevel`/`newSubjectCategory`/`newSubjectImageUrl`/
  `newSubjectIcon` (95-98, 111, 226) which are **not** parameters of `createSaveSubjectFunction`
  (28-40). It also hardcodes `category: "عام"`, `level: "مبتدئ"`, `price: 0`, `imageUrl: undefined`
  on create (182-187) — silently ignoring the form.
- **Impact:** Maintenance trap; anyone "switching over" to it gets a compile break + data-losing defaults.
- **Fix:** Delete the file.

### F8. Legacy `documentFileId` state pollution
- **Severity:** Low
- **Location:** `SubjectModal.tsx:140` (writes `documentFileId`), read nowhere in the save path
  (`types.ts:28` — "kept for save compatibility" is untrue)
- **Problem:** Every doc completion overwrites the lecture's `documentFileId` with the **last
  completed** doc's id. The save path uses only `documentFileIds` derived from `lec.docs`.
- **Impact:** Confusing but harmless today; a future consumer might read the wrong field.
- **Fix:** Remove the field from `Lecture` and the write in the modal.

### F9. Untitled lectures are dropped silently
- **Severity:** Low
- **Location:** `TeacherDashboard.tsx:296, 301, 347`
- **Problem:** `saveSubject` filters lectures with empty titles; lectures the user created but
  left untitled vanish from the payload with no warning.
- **Impact:** Data loss (lectures disappear after save) without any user feedback.
- **Fix:** Validate at save time and warn, or auto-title from the file name.

### F10. No re-fetch after mutations → stale stats and public cache
- **Severity:** Medium
- **Location:** `TeacherDashboard.tsx:419, 428, 325-334`; `api/client.ts:21-25` (public GET cache)
- **Problem:** delete/publish/edit/background-patch mutate local state only. Stats cards derive
  from the same local state (157-160), so publish counts drift until reload. `invalidateCache`
  is never called after teacher mutations, so public lists (`/subjects`, `/subjects/popular`,
  `/content/stats`) can serve stale data.
- **Impact:** Teachers see stale stats; students may browse stale subject lists.
- **Fix:** Re-fetch stats/subjects after mutations and invalidate the public GET cache.

### F11. `isPreview` is set only on create, and is dropped anyway
- **Severity:** Low
- **Location:** `TeacherDashboard.tsx:357` (create sets `isPreview: j === 0`), edit branch
  301-312 does not; `services/api.ts:324-332` drops it from the payload entirely
- **Problem:** `isPreview` never reaches the backend in either flow.
- **Impact:** Dead flag; misleading future readers.
- **Fix:** Remove `isPreview` from the DTO mapping or implement it consistently.

### F12. Client temp ids are stripped on edit → id drift between UI and server
- **Severity:** Low-Medium
- **Location:** `TeacherDashboard.tsx:26-27` (`maybeGuid`), applied at 298/302
- **Problem:** Non-GUID temp ids (`new-l1`, `lec-<ts>-<rand>`) are dropped, so the server
  likely recreates those levels/lectures on every edit; local state keeps the old ids (333).
- **Impact:** Recreated rows on each save; subsequent edits key off stale ids (compounds F1/F5).
- **Fix:** Track server-assigned ids after save and rewrite local ids, or diff by stable client keys.

### F13. Double-submit window on save
- **Severity:** Low
- **Location:** `SubjectModal.tsx:936` (save disabled on `isSaving` only)
- **Problem:** `setIsSaving(true)` is a React state flush; two clicks in the same frame can
  double-POST (creating two subjects / two PUTs).
- **Impact:** Duplicate subjects on slow networks.
- **Fix:** Guard with a ref set synchronously in the handler.

### F14. Backend status coercion in the UI
- **Severity:** Low
- **Location:** `TeacherDashboard.tsx:119`
- **Problem:** Only `published`/`Published` map to published; `pending`/`archived` become
  `draft` in the UI even though the modern API layer (`api/teacher.api.ts:91`) supports them.
- **Impact:** Misleading status display if those values are ever used.
- **Fix:** Preserve unknown statuses or add them to the UI type union.

### F15. Accounting sync is fire-and-forget with no error surfacing
- **Severity:** Low
- **Location:** `api/accounting.api.ts:146-160`, used by `AccountingTab.tsx:335-359`
- **Problem:** localStorage-first hybrid sync (`getTeacherTransactions` 134-171) fires
  background sync with no error handling; `updateTeacherTransaction` does DELETE+POST because
  there is no teacher PUT endpoint (195-213).
- **Impact:** Silent data loss if the backend sync fails.
- **Fix:** Surface sync errors in the UI; add a teacher transaction PUT endpoint.

---

## Backend issues & risks

### BE1. No published-status guard in the order flow
- **Severity:** Medium
- **Location:** `elmanassa_backend/elmanassa/Services/OrderService.cs:37`
  (`FirstOrDefaultAsync(s => s.Id == parsedSubjectId)` — verified, no status filter)
- **Problem:** `CreateOrderAsync` loads the subject by id with **no published-status check**.
  Draft/unpublished subjects are orderable by GUID.
- **Mitigation (important):** `OrderController.CreateOrder` (OrderController.cs:33-42) is
  **disabled** — it returns 403 "Purchase functionality is disabled. Please use WhatsApp
  inquiry system to contact the teacher." So the service method is not reachable through the
  HTTP order endpoint today. The guard is still missing at the service layer (any future
  re-enablement or webhook path inherits the hole).
- **Fix:** Reject non-`published` subjects in `CreateOrderAsync`, and enforce the same in the
  payment webhook auto-enrollment path.

### BE2. No media ownership validation (upload + linking)
- **Severity:** High
- **Location:** `MediaController.cs:144-151` (upload accepts `subjectId`/`lectureId` query
  params, stored at `MediaService.cs:286-287`); media linking in `TeacherService.cs:211-219`
  (create) and `:420-429` (update) — both query MediaFiles by id only
- **Problem:** A teacher can (a) upload media claiming any subject/lecture id, and (b) attach
  **another teacher's** media GUID to their own lecture. No check that the subject/lecture
  belongs to the uploading teacher.
- **Impact:** Cross-tenant media references; a malicious teacher could re-link a victim's
  media into their own (published) lecture.
- **Fix:** Verify `subject.TeacherId == teacherId` before accepting `subjectId`/`lectureId` on
  upload, and filter the media-linking query to files already owned by the teacher's subjects.

### BE3. Status is a free-form string with no validation
- **Severity:** Medium
- **Location:** `PublishSubjectAsync` (`TeacherService.cs:544-570`) — verified:
  `subject.Status = status` with no whitelist; also `SubjectUpdateDTO.Status`
  (`SubjectDTO.cs:113`) → `UpdateSubjectAsync` line 267 (`if (dto.Status != null) subject.Status = dto.Status;`)
- **Problem:** Two endpoints can set arbitrary status strings (no enum, no transition rules,
  no completeness check, no check for existing enrollments before unpublishing). A teacher can
  set `"archived"`, `"garbage"`, or publish an empty course via PUT bypassing the PATCH endpoint.
- **Impact:** Invalid data in `Status`; catalog queries (`Status == "published"`) silently
  exclude subjects with typos; unpublishing a course with paying students has no guardrail.
- **Fix:** Whitelist `draft|published|free` (backend + DTO validation), enforce transitions
  (e.g. can't unpublish a subject with enrollments without confirmation), and drop `Status`
  from `SubjectUpdateDTO` or validate it there.

### BE4. `Order→Subject` Restrict FK breaks subject deletion
- **Severity:** Medium
- **Location:** `ApplicationDbContext/AppDbContext.cs:203-207` (`DeleteBehavior.Restrict`);
  `TeacherService.DeleteSubjectAsync` (495-542)
- **Problem:** Deleting a subject that has any `Order` row throws an FK constraint exception
  surfaced as a 500 in `DeleteSubject`.
- **Impact:** Teachers can't delete subjects with order history (even "failed" orders block it),
  and get an opaque 500 instead of a clear message.
- **Fix:** Catch the FK violation and return a friendly 409 ("delete orders first" or "soft-delete"),
  or set `DeleteBehavior.SetNull`/soft-delete subjects.

### BE5. Public `GET /api/v1/subjects/{id}` leaks draft subjects
- **Severity:** Medium
- **Location:** `SubjectsController.cs:159-226` (`[AllowAnonymous]`, no status filter)
- **Problem:** Anyone with a subject GUID can view a draft subject's full curriculum, lecture
  titles, and media URLs. Diverges from the teacher-only ownership-scoped view.
- **Impact:** Draft content exposure (by GUID guessability / link sharing).
- **Fix:** Filter `Status == "published"` on the public by-id endpoint (or return 404 for drafts).

### BE6. Lecture `VideoUrl` is stored raw and unvalidated
- **Severity:** Medium
- **Location:** `TeacherService.cs:191, 386` (persist `VideoUrl` verbatim); `LectureCreateDTO.VideoUrl`
  (`SubjectDTO.cs:168`) has no `[Url]`/regex/whitelist
- **Problem:** Any string — including `javascript:`-style or path-traversal strings — is stored.
  Only output-side transform exists (`VideoUrlHelper.EncodeForPlayer`, SubjectDTO.cs:10-61),
  which rewrites Drive/YouTube and passes everything else through as-is.
- **Impact:** Malformed/XSS-ish URLs reach the player; invalid URLs produce broken lectures
  with no write-time feedback.
- **Fix:** Validate/normalize at write time (accept YouTube, Drive, DrivePlyr, or `/api/v1/media/stream/…`
  only; reject everything else), matching what the player can actually render.

### BE7. `GetTeacherId()` throws uncaught → 500
- **Severity:** Low
- **Location:** `TeacherController.cs:27-30`
- **Problem:** `Guid.Parse(... ?? "")` throws if the `NameIdentifier` claim is missing/invalid;
  several actions don't catch it (only `UpdateSubject`/`PublishSubject` wrap in try/catch).
- **Impact:** Opaque 500 instead of 401 on malformed tokens.
- **Fix:** Use `Guid.TryParse` and return 401.

### BE8. `GET /api/v1/teacher` is a stub
- **Severity:** Low
- **Location:** `TeacherController.cs:33-38`
- **Problem:** `GetAllTeachers` returns `Ok()` with an empty body. The frontend uses it only as
  an auth ping (`pingTeacherAuth`), so it works — but the endpoint is misleading.
- **Impact:** Dead/misleading API surface.
- **Fix:** Return the teacher profile or remove the endpoint (and switch the ping to a real check).

### BE9. Admin role does not bypass ownership checks
- **Severity:** Low
- **Location:** `TeacherService.cs:247, 502, 548` (all scope by `s.TeacherId == teacherId`)
- **Problem:** An admin hitting `/teacher/subjects/{id}` is constrained to subjects where
  `TeacherId == admin's own Id`. There is no `IAuthorizationService` resource policy.
- **Impact:** Admins can't manage teachers' content through this controller (may be intended);
  the pattern is worth documenting or replacing with a proper resource policy.
- **Fix (decision):** Add an explicit admin bypass or document the constraint.

### BE10. `CreateAccountingTransaction` accepts a client-supplied id as PK
- **Severity:** Low
- **Location:** `TeacherController.cs:271-299`
- **Problem:** `model.Id` is used as the primary key if provided; `TeacherId` is forced from the
  claim (good), but a crafted id could collide with an existing row (UPDATE-style overwrite).
- **Impact:** Potential overwrite of another transaction's row if ids are predictable.
- **Fix:** Always generate the id server-side.

---

## Duplication & dead code

### D1. `api/teacher.api.ts` — entire modern module is unused
- **Severity:** Medium (maintainability)
- **Location:** `api/teacher.api.ts` (8 exports, **zero importers**)
- **Problem:** The "modern" teacher API layer is dead code. `TeacherDashboard` uses the legacy
  `services/api.ts` exclusively. The two layers diverge in behavior:
  - modern `createSubject` sends field **`name`**; legacy sends **`title`** (services/api.ts:312);
  - modern `updateSubject` **cannot update `levels`** (no curriculum support) — not a drop-in
    replacement for the dashboard's update call;
  - modern layer sanitizes inputs (`sanitizePlainText`, `validateGuid`, status whitelist) that
    the live path lacks — the good behavior is stranded in dead code.
- **Impact:** Maintenance trap; security fixes live in code nobody calls.
- **Fix (decision):** Either wire `TeacherDashboard` to `api/teacher.api.ts` (extend
  `updateSubject` to accept `levels`, align field names) and delete the legacy teacher functions,
  or delete the unused module.

### D2. `saveSubjectUpdated.ts` — entire file unused (see F7)
- **Severity:** Medium (maintainability)
- **Location:** `components/teacher/saveSubjectUpdated.ts` (286 lines, zero importers)

### D3. Dead create path: `createTeacherSubject` / `createTeacherCourse`
- **Severity:** Low
- **Location:** `TeacherDashboard.tsx:6` (imported, never called); `services/api.ts:262-286`
- **Problem:** `createTeacherCourse` POSTs to the **public** `/api/v1/subjects` (bare-draft
  endpoint) — a different endpoint from the live create path `createCourseWithCurriculum`
  (POST `/api/v1/teacher/subjects`). No callers of `createTeacherCourse` exist.
- **Impact:** Three different create functions, two different endpoints (see D4); dead code
  invites wiring the wrong one.

### D4. Duplicate API functions across layers (same endpoints)
- **Severity:** Medium (maintainability)
- **Location:** `services/api.ts` vs `api/teacher.api.ts` (and others)
- **Problem:** Each teacher endpoint has at least two client implementations:
  | Endpoint | Legacy (`services/api.ts`) | Modern (`api/teacher.api.ts`) |
  |---|---|---|
  | GET `/teacher` | `pingTeacherAuth` (:241) | `getTeacherProfile` (:4) |
  | GET `/teacher/subjects` | `fetchTeacherSubjects` (:557) | `getSubjects` (:8) |
  | POST `/teacher/subjects` | `createCourseWithCurriculum` (:287) | `createSubject` (:12) |
  | PUT `/teacher/subjects/:id` | `updateTeacherSubject` (:559) | `updateSubject` (:31) |
  | DELETE `/teacher/subjects/:id` | `deleteTeacherSubject` (:560) | `deleteSubject` (:104) |
  | PATCH `/…/publish` | `publishTeacherSubject` (:541) | `publishSubject` (:114) |
  | GET `/teacher/stats` | `fetchTeacherStats` (:229) | `getTeacherStats` (:130) |
  | GET `/teacher/students` | `fetchTeacherStudents` (:512) | `getTeacherStudents` (:134) |
  - Non-teacher duplicates: `sendContactMessage` (services/api.ts:116 vs api/content.api.ts:41);
    `validateCoupon`/`createOrder` (services/api.ts:167/183 vs api/orders.api.ts `checkCoupon`/`placeOrder`).
- **Fix:** Consolidate on one layer (see D1).

### D5. Duplicate subject-create endpoints on the backend
- **Severity:** Low (by design, but confusing)
- **Location:** `TeacherController.cs:64` (full create-with-curriculum, transactional) vs
  `SubjectsController.cs:293` (bare draft: title/description/icon only, no levels/lectures,
  no transaction)
- **Problem:** Two POST endpoints create subjects with completely different semantics. The
  frontend uses TeacherController for create; SubjectsController.POST is reachable by any
  teacher with the right role but leaves half-built rows.
- **Fix:** Document both, or fold the bare-draft path into the teacher flow.

### D6. Legacy course-section functions are dead
- **Severity:** Low
- **Location:** `services/api.ts:412-510` (`createCourseSection`/`updateCourseSection`/
  `createSectionLecture`/`updateSectionLecture`/`deleteSectionLecture`/`deleteCourseSection`)
- **Problem:** No callers in the teacher flow (legacy `Course` model is admin-only per the
  courses→subjects migration).

### D7. Unused helpers in `api/media.api.ts`
- **Severity:** Low
- **Location:** `api/media.api.ts:32` (`getMediaFile`), `:28` (`getMediaBySubject`), `:201`
  (`uploadFilesParallel`), `:279` (`uploadDocumentsBatch`), `:301` (`getStreamWithProgress`)
- **Problem:** No callers. `getMediaByLecture` (used by MediaGallery.tsx:576) and the
  stream/HLS helpers are live.
- **Fix:** Delete the dead exports.

---

## Frontend ↔ backend contract notes (verified)

- The frontend sends `videoFileId` **and** `mediaFileId` (same value) per lecture
  (TeacherDashboard.tsx:306-307/351-352) plus `documentFileIds` (308-310/353-355); the backend
  flattens `VideoFileId`/`DocumentFileIds` into `MediaFileId` + `MediaFiles` linkage
  (TeacherService.cs:203, 207-209, 388, 420-429). **Consistent** — `VideoFileId` wins when both
  are present (TeacherService.cs:203/388), which matches since they're identical.
- The live publish path uses PATCH `…/publish` (services/api.ts:541-554) — correct endpoint.
  The PUT-status bypass (BE3) is backend-side only; the frontend never sends `status` in PUT.
- Backend `status` values in use: `"draft"` (default), `"published"`, `"free"` (free-enrollment
  gate in StudentController.cs:115). No enum exists anywhere — free-form strings confirmed by
  grep over Models.
- `Subject.Level` is a **free-text string** filtered via `EF.Functions.ILike(s.Level ?? "", level)`
  (SubjectsController.cs:64), not a FK — level filtering is fuzzy by design.

---

## Status

| ID | Issue | Severity | Status |
|----|-------|----------|--------|
| F1 | Background-upload persistence silently fails for new subjects | High | ☐ |
| F2 | `savedSubjectId` never reset (stale-target writes) | Medium | ☐ |
| F3 | Edit wipes `imageUrl` | Medium | ☐ |
| F4 | Icon never persisted (create hardcodes 📚) | Medium | ☐ |
| F5 | `levels`-only PUT may clobber the subject | Medium | ☐ |
| F6 | Orphaned media files on cancel (no abort/cleanup) | Medium | ☐ |
| F7 | `saveSubjectUpdated.ts` dead + would crash on import | Medium | ☐ |
| F8 | Legacy `documentFileId` state pollution | Low | ☐ |
| F9 | Untitled lectures dropped silently | Low | ☐ |
| F10 | No re-fetch after mutations (stale stats + public cache) | Medium | ☐ |
| F11 | `isPreview` dead flag (create-only, then dropped) | Low | ☐ |
| F12 | Client temp-id stripping → UI/server id drift | Low-Med | ☐ |
| F13 | Double-submit window on save | Low | ☐ |
| F14 | Backend status coercion in UI | Low | ☐ |
| F15 | Accounting fire-and-forget sync, no error surfacing | Low | ☐ |
| BE1 | No published-status guard in order service (endpoint disabled today) | Medium | ☐ |
| BE2 | No media ownership validation (upload + linking) | High | ☐ |
| BE3 | Free-form status strings, no transitions/completeness checks | Medium | ☐ |
| BE4 | `Order→Subject` Restrict FK → 500 on subject delete | Medium | ☐ |
| BE5 | Public GET-by-id leaks draft subjects | Medium | ☐ |
| BE6 | Lecture `VideoUrl` stored raw, unvalidated | Medium | ☐ |
| BE7 | `GetTeacherId()` throws uncaught → 500 | Low | ☐ |
| BE8 | `GET /api/v1/teacher` stub endpoint | Low | ☐ |
| BE9 | Admin role doesn't bypass ownership scoping | Low | ☐ |
| BE10 | Accounting transaction accepts client-supplied PK | Low | ☐ |
| D1 | `api/teacher.api.ts` unused (good sanitization stranded in dead code) | Medium | ☐ |
| D2 | `saveSubjectUpdated.ts` unused (see F7) | Medium | ☐ |
| D3 | Dead `createTeacherSubject`/`createTeacherCourse` path | Low | ☐ |
| D4 | Duplicate API functions across layers (8+ endpoints ×2) | Medium | ☐ |
| D5 | Two backend subject-create endpoints with different semantics | Low | ☐ |
| D6 | Legacy course-section functions dead | Low | ☐ |
| D7 | Unused helpers in `api/media.api.ts` | Low | ☐ |
