# Authentication & Session Flow — Known Issues & Risks

> Companion to `VIDEO_PIPELINE_ISSUES.md`, `TEACHER_FLOW_ISSUES.md`, `STUDENT_FLOW_ISSUES.md`,
> `PAYMENTS_ISSUES.md`. This file catalogs **problems** found while tracing the auth flow end to end:
> `AuthContext` (login/register/verify/logout/refresh) → `AuthController` → `AuthService` →
> JWT/refresh-token lifecycle → `Program.cs` auth middleware → session validate / role guard.
>
> Each entry: **Severity** (Critical / High / Medium / Low), location, impact, suggested fix.
> Status is tracked inline; mark `[x]` when fixed.
>
> Key files: `elmanassa_backend/elmanassa/Controllers/AuthController.cs`, `Services/AuthService.cs`,
> `Models/RefreshToken.cs`, `Program.cs` (auth middleware), `appsettings.json`,
> `src/contexts/AuthContext.tsx`, `src/api/client.ts` (single-flight refresh + GET cache),
> `src/utils/token.ts`, `src/pages/LoginPage.tsx`, `src/pages/VerifyEmailPage.tsx`,
> `src/pages/ForgotPasswordPage.tsx`.

---

## Backend — critical

### R1. (Critical) No rate limiting / lockout on any auth endpoint
- **Severity:** Critical
- **Location:** Whole backend (Program.cs has no `AddRateLimiter`).
- **Problem:** No throttling anywhere. All auth endpoints accept unlimited requests.
- **Impact:** Unlimited login brute force, OTP brute force (amplifies R2), email bombing via
  `/forgot-password` + `/send-verification`.
- **Fix:** ASP.NET Core rate limiting per-IP/per-email on `login`, `verify-email`, `reset-password`,
  `send-verification`, `forgot-password`, `check-email`; add account lockout after N failures.

### R2. (Critical) OTP brute-forceable: 6-digit numeric, unlimited attempts, 10-min window, no attempt tracking
- **Severity:** Critical
- **Location:** `AuthService.cs:340-341` (generation), `:282-283` (verify), `:319-320` (reset),
  DTOs `VerifyEmailDTO.cs:11-13`, `ForgotPasswordDTO.cs:18-20`.
- **Problem:** 6-digit numeric codes (1M space) with no attempt cap and a 10-minute window; no
  per-user cooldown; compare not constant-time (see R8).
- **Impact:** Account takeover (email verification) and password reset by brute force (~5k req/min feasible).
- **Fix:** CSPRNG generation, 3-5 attempt cap per code, per-user cooldown, larger codes or short
  expiry, constant-time compare.

### R5. (High) Account-enumeration oracles
- **Severity:** High
- **Location:** `GET /auth/check-email` anonymous `{exists}` (`AuthController.cs:130-144`); login
  returns `RequiresEmailVerification = true` + the email for unverified accounts
  (`AuthService.cs:166-176`) vs 401 for bad credentials; signup duplicate-email message
  (`:30-31, :96-97`); `verify-email` returns success "already verified" for existing users (`:279-280`).
- **Problem:** The API distinguishes existing vs non-existing emails in five separate places.
- **Impact:** User enumeration.
- **Fix:** Remove/guard `check-email`, uniform login response, suppress duplicate-email distinction,
  neutral verify-email responses.

---

## Backend — high

### R3. (High) Media download/stream/view endpoints are `[Authorize]` only, no enrollment/ownership check (IDOR)
- **Severity:** High
- **Location:** `MediaController.cs:304-443` (`DownloadFile`, `StreamVideo`, `ViewDocument`).
- **Problem:** Any authenticated user (even a non-enrolled student) can fetch any media file by GUID;
  `mediaFileId` leaks to students via course payloads (`VideoViewer.tsx:207`).
- **Impact:** Paid lecture media and documents accessible to anyone with an account (and any role).
- **Fix:** Enforce enrollment or teacher/admin ownership on these actions (reuse `IsEnrolled`).
  Cross-ref: STUDENT_FLOW_ISSUES BE2, VIDEO_PIPELINE_ISSUES.

### R4. (High) Refresh tokens stored plaintext + no reuse/theft detection
- **Severity:** High
- **Location:** `AuthService.cs:410-426` (generation), `RefreshToken.cs:12`, `AppDbContext.cs:83`
  (unique index). `ReplacedByToken` is written (`:213`) but **never read**.
- **Problem:** Refresh tokens are stored as the raw base64 value. A DB leak = permanent session theft
  (7 days). Replay of an old (revoked) token is silently rejected with no family revocation.
- **Impact:** Undetectable long-lived session theft after any DB/backup exposure.
- **Fix:** Store SHA-256 hash of the token; on refresh-token reuse, revoke the whole token family
  (`ReplacedByToken` chain) for that user.

### R6. (Medium-High) JWT in URL query strings for media + HLS param-name mismatch
- **Severity:** Medium-High
- **Location:** `media.api.ts:37-40, 59-67, 301-306` (`?token=<2h JWT>`) vs `Program.cs:73-83`
  (`OnMessageReceived` accepts `?token=` only for `/api/v1/media` paths); `media.api.ts:54-56` sends
  `?st=<signed>` but `MediaController.cs:78, 107, 131` reads `[FromQuery] string token` → playlist/
  segment/key validation gets `null` and fails 401 (mitigated only when the `Authorization` header is
  present — yet the signed-token check is unconditional, so HLS requests are effectively broken).
- **Impact:** Access-token leak into history/logs/Referer; HLS playback defect (cross-ref
  VIDEO_PIPELINE_ISSUES S1, STUDENT_FLOW_ISSUES BE4).
- **Fix:** Short-lived signed tokens only in URLs; align the query param name `st` ↔ `token`; never
  place the raw 2h access JWT in URLs.

---

## Backend — medium

### R7. (Medium) Logout revocation fails when access token is expired
- **Severity:** Medium
- **Location:** `AuthContext.tsx:146-158` (raw `POST /auth/logout` with **no Authorization header**,
  `.catch(() => {})`) + `AuthController.cs:87` `[Authorize]` short-circuits a 401 before the fallback
  `RevokeToken` (`:96-100`) runs.
- **Problem:** After a user's access token expires, logout leaves the refresh token valid server-side
  for up to 7 days.
- **Impact:** Theft window for a token the user *thought* they invalidated (e.g., on a shared machine).
- **Fix:** Make logout revocable with just the refresh token (remove `[Authorize]`, validate the
  refresh token in the body).

### R8. (Medium) OTP not from CSPRNG, stored plaintext, non-constant-time compare
- **Severity:** Medium
- **Location:** `AuthService.cs:340-341` (generation), `:282, :319` (compare). `Random.Shared` is a
  thread-safe PRNG, not cryptographically secure; codes and expiry stored directly on `User.cs:39-44`.
- **Problem:** Weakened entropy; a DB/ORM leak exposes live codes in plaintext.
- **Impact:** Amplifies R2; code recovery from DB.
- **Fix:** `RandomNumberGenerator` + hash codes, fixed-time compare.

### R9. (Medium) Known/default secrets + unauthenticated `seed-admin`
- **Severity:** Medium
- **Location:** `appsettings.json:5-16` (JWT secret `your-super-secret-key...`, admin `Admin@1234`,
  DB password, Paymob/Gemini/SMTP keys), `Program.cs:233-257` (`GET /api/v1/seed-admin` anonymous,
  creates admin from config), `:217-230` (`db-check` info leak). Files are untracked in git
  (`git ls-files` empty).
- **Problem:** If deployed with defaults, an attacker can pre-create `admin@elmanassa.com` with the
  known password or forge JWTs with the known secret.
- **Fix:** Env-var/secret-manager injection, remove/authenticate `seed-admin` and `db-check`, rotate
  exposed keys. Cross-ref: PAYMENTS_ISSUES R5.

### R10. (Medium) Wrong email templates
- **Severity:** Medium
- **Location:** `AuthService.cs:174` (login re-sends verification OTP via `SendPasswordResetAsync` —
  "password reset" email), `:308` (forgot-password sends `SendVerificationCodeAsync` — "thank you for
  registering" email), `SmtpEmailSender.cs:54-117, 119-182`.
- **Problem:** Verification and reset emails are swapped in two flows.
- **Impact:** User confusion, degraded verification UX.
- **Fix:** Add a dedicated `SendEmailVerificationAsync` and use it consistently.

### R11. (Medium) Email-verification enforcement gaps + admin-created users lack supporting rows
- **Severity:** Medium
- **Location:** `AdminController.cs:179-209` (CreateUser sets no `EmailVerificationCode`, no
  `Student`/`Teacher` row, `IsEmailVerified = false` for non-admins), `AuthService.cs:167` (admins
  bypass verification).
- **Problem:** Admin-created student/teacher can't verify (no code sent) or login; admin-created
  admins skip verification entirely; dashboards may break on missing `Student`/`Teacher` rows.
- **Fix:** Create Student/Teacher rows + verification code, or require admin-created users to complete
  verification.

### R12. (Medium) Client-side role & tokens in localStorage (XSS exposure)
- **Severity:** Medium
- **Location:** `utils/token.ts:1-2`, `AuthContext.tsx:31, 79-87`; role-based routing trusts stored
  role (`App.tsx:137-164`).
- **Problem:** Any XSS steals access + refresh tokens; editing `elmanssa_auth_user` spoofs the admin
  UI (API still 403s — client-side only).
- **Fix:** httpOnly cookies for the refresh token, short-lived in-memory access token, or at minimum
  a CSP and non-persistent storage review.

### R13. (Medium) Single-session policy revokes every session on each login
- **Severity:** Medium
- **Location:** `AuthService.cs:179-187`.
- **Problem:** Any re-login (or bot retry) kills all other devices with no device fingerprinting;
  breaks the "rotating refresh" value.
- **Fix:** Per-device token families with a `DeviceId`/family id instead of blanket revocation.

---

## Backend / frontend — low

### R14. (Low-Med) Password-reset wizard verifies the code only at the final step
- **Severity:** Low-Medium
- **Location:** `ForgotPasswordPage.tsx:73-78` advances to new-password without a server check.
- **Problem:** UX only (server still validates the code at `reset-password`), leaks no extra risk.
- **Fix:** Verify the code at step 2 before advancing.

### R15. (Low) Login "remember me" checkbox is decorative
- **Severity:** Low
- **Location:** `LoginPage.tsx:185-194` — no persistence logic.

### R16. (Low) `/verify-email` with no email param renders empty-email screen
- **Severity:** Low
- **Location:** `App.tsx:255-256`, `VerifyEmailPage.tsx:118`.

### R17. (Low) `[Authorize(Roles="admin,teacher")]` method-level attrs are additive over class-level `[Authorize(Roles="admin")]` → teachers locked out of `/api/v1/admin/students|teachers|stats|courses`
- **Severity:** Low
- **Location:** `AdminController.cs:13, 27-28, 51-52, 75-76, 158-159`.
- **Problem:** Fail-closed but likely unintended; the admin dashboard's teacher-facing rows/statistics
  endpoints 403 for teachers.
- **Fix:** Decide intent (probably a bug — either drop the class-level role or use `[AllowAnonymous]`
  with per-method roles for the teacher-accessible stats).

### R18. (Low) Expired-session UX redirects to home, not login
- **Severity:** Low
- **Location:** `App.tsx:128-131`, `client.ts:96-100`.

### R19. (Low) `services/auth.service.ts` is dead code that would store a token on signup
- **Severity:** Low
- **Location:** `services/auth.service.ts:10-14, 22-24`; zero importers (grep).
- **Problem:** If ever wired in, it bypasses the verify-first flow and stores a token on signup.
- **Fix:** Delete or wire through `AuthContext`.

### R20. (Info, cross-ref) MediaGallery B2 still live
- **Severity:** Info
- **Location:** `MediaGallery.tsx:155` reads `localStorage.getItem("token")` (wrong key) — the
  Authorization header is never sent.
- **Cross-ref:** Already documented as B2 in VIDEO_PIPELINE_ISSUES.md — still unfixed.

---

## Verified flow facts

- **Session persistence** (`AuthContext.tsx:31, 64-87`): JWT → `localStorage.elmanssa_auth_token`,
  refresh → `localStorage.elmanssa_refresh_token`, user → `localStorage.elmanssa_auth_user`. On reload
  the user is rehydrated from storage — **the token is NOT revalidated until the first API call**.
- **Login** (`:98-112`): raw `fetch` (deliberately bypasses `authedFetch`/refresh). On
  `requiresEmailVerification` in a non-OK body it signals instead of throwing; `LoginPage.tsx:54-59`
  toasts and navigates to `verify-email`. 401 → generic "incorrect email/password".
- **Single-flight refresh (VERIFIED)** (`api/client.ts:43-73`): `refreshPromise` deduplicates
  concurrent 401s; on 401 → `tryRefresh()` once → retry with `_retry = true`; failure →
  `clearAllTokens()` + `auth:expired`. GET cache (`:14-40`) only covers public
  `/subjects/popular`, `/subjects`, `/content/stats`.
- **Token lifecycle**: access JWT HS256 2h (`AuthService.cs:428-455`), claims `jti/NameIdentifier/
  Email/Name/Role`; refresh 512-bit random 7d, stored **plaintext**, rotated on `/refresh` with
  `ReplacedByToken` link; **all** revoked on next login (single-session) and on password reset.
- **JWT middleware** (`Program.cs:34-85`): `OnTokenValidated` (`:61-72`) hits the DB per request to
  reject deleted/inactive users (no email-verification check); `OnMessageReceived` (`:73-83`) accepts
  `?token=` only for `/api/v1/media` paths. **No rate limiting anywhere.**
- **Password hashing**: BCrypt (`AuthService.cs:52, 118, 160, 322`) — good.
- **No `change-password`, `profile`, or `delete-account` endpoints exist** (grep confirmed) — users
  can never rotate a password after signup.

---

## Status

| ID | Issue | Severity | Status |
|----|-------|----------|--------|
| R1 | **No rate limiting / lockout on auth endpoints** | **Critical** | ☐ |
| R2 | **OTP brute-forceable (6-digit, no attempt cap)** | **Critical** | ☐ |
| R3 | Media endpoints: no enrollment/ownership check (IDOR) | High | ☐ |
| R4 | Refresh tokens plaintext + no reuse detection | High | ☐ |
| R5 | Account-enumeration oracles (5 places) | High | ☐ |
| R6 | JWT in URLs + HLS `st`/`token` param mismatch | Med-High | ☐ |
| R7 | Logout revocation fails when access token expired | Medium | ☐ |
| R8 | OTP not CSPRNG, stored plaintext, non-constant-time | Medium | ☐ |
| R9 | Known/default secrets + anonymous seed-admin | Medium | ☐ |
| R10 | Wrong email templates (reset vs verification) | Medium | ☐ |
| R11 | Admin-created users lack rows/verification code | Medium | ☐ |
| R12 | Tokens + role in localStorage (XSS surface) | Medium | ☐ |
| R13 | Single-session blanket revocation per login | Medium | ☐ |
| R14 | Reset wizard validates code only at final step | Low-Med | ☐ |
| R15 | "Remember me" checkbox decorative | Low | ☐ |
| R16 | verify-email without email → empty screen | Low | ☐ |
| R17 | Teacher lockout on admin stats endpoints (additive roles) | Low | ☐ |
| R18 | Expired session redirects home, not login | Low | ☐ |
| R19 | Dead auth.service.ts stores token on signup if wired | Low | ☐ |
| R20 | MediaGallery B2 still live (cross-ref) | Info | ☐ |
