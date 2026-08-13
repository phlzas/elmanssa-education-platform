# Video Pipeline — Known Issues & Risks

> Companion to `STREAMING_IMPLEMENTATION_GUIDE.md`, `COMPRESSION_SYSTEM_*.md` and
> `SECURITY_HARDENING_ANALYSIS.md`. This file catalogs **problems** found while
> tracing the video pipeline end to end (frontend player stack → `api/media.api.ts`
> → `MediaController` → `MediaService`/`HlsService`/`SignedUrlService` →
> `BotDetectionMiddleware`).
>
> Each entry: **Severity** (High / Medium / Low), location, impact, suggested fix.
> Status is tracked inline; mark `[x]` when fixed.

---

## Bugs & inconsistencies

### B1. Upload-size error message contradicts the actual limit
- **Severity:** Low
- **Location:** `elmanassa_backend/elmanassa/Controllers/MediaController.cs:158-161`
- **Problem:** `_maxFileSize` is `5L * 1024 * 1024 * 1024` (5 GB) but the rejection
  message reads `"حجم الملف يتجاوز الحد المسموح (500MB)"` — stale text from the
  pre-5GB bump (see commit `70a56a4` "5 GB = 5,368,709,120 bytes").
- **Impact:** Confusing UX: teachers uploading a 1 GB file are told the limit is 500 MB.
- **Fix:** Either interpolate the real limit (`_maxFileSize / 1MB`) into the message or
  remove the hardcoded `(500MB)`.

### B2. `MediaGallery.VideoPlayer` reads the JWT directly from `localStorage`
- **Severity:** Low
- **Location:** `components/MediaGallery.tsx:155`
- **Problem:** The HLS `xhrSetup` uses `localStorage.getItem("token") || sessionStorage.getItem("token")`
  instead of the shared `getToken()` util (`utils/token.ts`). Every other consumer uses `getToken()`.
- **Impact:** If the token storage strategy ever changes (e.g. httpOnly cookies, a single
  storage key), MediaGallery silently breaks while the rest of the app keeps working.
- **Fix:** `import { getToken } from '../utils/token';` and use it in `xhrSetup`.

### B3. Dead helper methods in `MediaController`
- **Severity:** Low
- **Location:** `MediaController.cs:495-521` (`HandleRangeRequest`) and `:523-538` (`HandleCompressedDocument`)
- **Problem:** Both are never called — `StreamVideo` inlines its own range handling and
  `ViewDocument`/`DownloadFile` inline their own gzip decompression. The helpers duplicate
  that logic (and `HandleRangeRequest` hardcodes `video/mp4`).
- **Impact:** Dead code, drift risk: fixing the inline logic won't fix the helpers and vice versa.
- **Fix:** Delete both helpers.

### B4. HLS `-c copy` fallback misses browser-incompatible codecs
- **Severity:** Medium
- **Location:** `elmanassa_backend/elmanassa/Services/HlsService.cs:93-110`
- **Problem:** The fast path uses `-c copy` (no re-encode). The re-encode fallback only fires
  when **ffmpeg errors** with `codec not currently supported` / `Invalid data` / `moov atom not found`.
  If `-c copy` succeeds but the source codec is unsupported in browsers (e.g. H.265), the HLS
  playlist is produced anyway; playback then fails client-side and `SecureVideoPlayer` silently
  falls back to the direct stream — which also cannot play H.265 in most browsers. The lecture
  is effectively unplayable with no signal to the teacher.
- **Impact:** Silent playback failures for H.265/other exotic sources.
- **Fix:** Probe the copied stream's codec (`ffprobe`) after a successful `-c copy` and re-encode
  if it's not `h264`/`aac`, or always re-encode to H.264 for HLS output.

### B5. Fire-and-forget background transcodes have no recovery path
- **Severity:** Medium
- **Location:** `MediaService.cs:302-337` (`_ = Task.Run(...)`)
- **Problem:** HLS transcoding is launched with `Task.Run` and never awaited or tracked:
  - no queue, no job record, no retry;
  - an app-pool recycle / process kill on the host (runasp.net) destroys in-flight jobs;
  - on failure only a log line is written — `HlsReady` stays `false` forever and no endpoint
    re-triggers transcoding;
  - the `CancellationToken` is not passed from the controller (`default` is used).
- **Impact:** Videos uploaded during a host restart or codec edge case are permanently stuck
  in "direct stream only" mode with no UI indication or retry.
- **Fix:** Introduce a small `HlsJob` table (or reuse `MediaFile.HlsReady` + a `HlsError` column),
  a startup sweep that re-queues incomplete jobs, and an admin/teacher "re-transcode" action.

### B6. Three parallel frontend HLS player implementations
- **Severity:** Medium (maintainability)
- **Location:** `components/SecureVideoPlayer.tsx`, `components/MediaGallery.tsx:125-178` (`VideoPlayer`),
  `components/videoViewerUtils.tsx` (Plyr pair)
- **Problem:** Signed-token fetch, playlist probe, hls.js init, and fallback logic are written
  twice (SecureVideoPlayer vs MediaGallery.VideoPlayer) with subtle divergence:
  - SecureVideoPlayer: probes the playlist first, sets `backBufferLength: 30`, `lowLatencyMode: false`,
    redirects fullscreen to the container, syncs progress to the server.
  - MediaGallery.VideoPlayer: no probe, no `backBufferLength`, raw localStorage token (see B2),
    no progress sync.
  - Plyr pair (`PlyrYouTube`/`PlyrVideo`) is a third, completely separate playback stack.
- **Impact:** Bug fixes must be applied in two places; behavior drifts.
- **Fix:** Extract a shared `useSecureHls(mediaFileId)` hook used by both players.

---

## Security tradeoffs (by design, but worth documenting)

### S1. Raw JWT in query strings (`?token=`)
- **Severity:** Low-Medium (accepted tradeoff)
- **Location:** `api/media.api.ts:37-67` (`getStreamUrl`/`getViewUrl`/`getDownloadUrl`),
  `Program.cs` `OnMessageReceived`
- **Problem:** The full JWT is appended to stream/view/download URLs because `<video src>` and
  document links cannot set an `Authorization` header. Query strings are logged by proxies,
  access logs, and browser history, and can leak via Referer if the page navigates elsewhere.
- **Mitigations in place:** `OnMessageReceived` only accepts the query token for `/api/v1/media`
  paths; tokens are short-lived (2h access tokens).
- **Consideration:** None of these URLs are currently sent to third parties, so exposure is limited.

### S2. `/hls/` endpoints skip the Origin/Referer check in bot detection
- **Severity:** Low-Medium
- **Location:** `Middleware/BotDetectionMiddleware.cs:57-59`
- **Problem:** The middleware exempts all `/hls/` paths from the Origin/Referer requirement
  ("HLS key requests come from the player"). Playlist, segment, and key endpoints are therefore
  protected only by UA filtering + the 5-minute signed token bound to file+user.
- **Impact:** A client with a spoofed UA and a captured (short-lived) signed token can fetch
  segments directly.
- **Mitigation:** The signed token is the real gate; it expires in 300s and is bound to the user
  and file. Risk is low but the exemption is broader than needed (only the `key` request truly
  cannot carry Origin in all players).
- **Consideration:** Re-enable the Origin check for playlist+segment requests and exempt only the
  key endpoint if player incompatibilities are confirmed.

### S3. YouTube/Drive lecture URLs bypass the entire security stack
- **Severity:** Medium
- **Location:** `components/VideoViewer.tsx:111-119` (`PlyrYouTube` / `DriveVideo` paths)
- **Problem:** Any lecture whose `videoUrl` points at YouTube or Google Drive renders via public
  iframe/player with no watermark, no bot detection, no signed tokens, and no enrollment gate
  on the media itself (the page is guarded, the media is not). A student can trivially extract
  the raw URL and share it.
- **Impact:** Leaked course content for teachers who paste YouTube/Drive links instead of uploading.
- **Fix (product decision):** Either accept it (those sources are public by nature) or migrate
  teachers to uploaded media as the only path.

---

## Observations / tech debt

### O1. `FilePath` is correctly never exposed in DTOs
- `MediaService.MapToDto` (`MediaService.cs:610-627`) intentionally omits `FilePath`; streaming
  uses `GetMediaFileInternalAsync`. Keep this invariant — do not add `FilePath` to `MediaFileDto`.

### O2. Playlist rewriting is done with naive string ops
- `MediaController.GetHlsPlaylist` (`MediaController.cs:96-100`) rewrites `seg` → API route and
  appends `?token=` via `string.Replace` + a single regex for `seg\d+\.ts`. Fragile if ffmpeg
  ever emits a different naming scheme or variant playlists (master + media playlists) are added.
- **Fix:** Use a real HLS playlist parser or generate the playlist server-side from known segment names.

### O3. HLS file layout coupling
- `GetHlsPlaylist`/`GetHlsSegment` derive paths as `Path.GetDirectoryName(file.FilePath)/../hls/{id}/...`.
  Works today because videos live under `uploads/videos/...` and HLS under `uploads/hls/{id}`.
  A future storage layout change breaks this silently (404s). Consider storing the playlist path
  on the `MediaFile` row instead of re-deriving it.

### O4. Upload size constants duplicated
- 5 GB appears in `MediaController._maxFileSize` (`:18`), `MediaService.MaxTempFileSize` (`:41`),
  `RequestSizeLimit`/`RequestFormLimits` attributes (`:146-147`), and the frontend. Consider a
  single shared constant / config value.

---

## Status

| ID | Issue | Severity | Status |
|----|-------|----------|--------|
| B1 | Upload-limit message says 500MB, limit is 5GB | Low | ☐ |
| B2 | MediaGallery reads token from localStorage directly | Low | ☐ |
| B3 | Dead `HandleRangeRequest`/`HandleCompressedDocument` helpers | Low | ☐ |
| B4 | HLS `-c copy` misses browser-incompatible codecs | Medium | ☐ |
| B5 | Fire-and-forget transcodes, no queue/retry/recovery | Medium | ☐ |
| B6 | Three parallel player implementations drift apart | Medium | ☐ |
| S1 | Raw JWT in query strings (accepted tradeoff) | Low-Med | ☐ |
| S2 | `/hls/` exempt from Origin/Referer check | Low-Med | ☐ |
| S3 | YouTube/Drive URLs bypass security stack | Medium | ☐ |
| O2 | Playlist rewriting via naive string ops | Low | ☐ |
| O3 | HLS path re-derived from media path (coupling) | Low | ☐ |
| O4 | Upload-size constants duplicated | Low | ☐ |
