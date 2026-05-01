import React, { useState, useEffect, useRef, useCallback } from "react";
import Hls from "hls.js";
import {
  getMediaByLecture,
  getStreamUrl,
  getSignedStreamToken,
  getHlsUrl,
  getViewUrl,
  getDownloadUrl,
  formatFileSize,
  formatDuration,
  type MediaFile,
} from "../api/media.api";

const FONT = "'Cairo', sans-serif";

// ── Icons ─────────────────────────────────────────────────────────────────────

const IconPDF = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 2v6h6M9 13h6M9 17h4" strokeLinecap="round" />
  </svg>
);

const IconDoc = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 2v6h6M9 12h6M9 16h6M9 8h1" strokeLinecap="round" />
  </svg>
);

const IconVideo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M8 21h8M12 17v4" strokeLinecap="round" />
  </svg>
);

const IconDownload = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconEye = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconPlay = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M5 3l14 9-14 9V3z" />
  </svg>
);

const IconPause = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <rect x="6" y="4" width="4" height="16" rx="1" />
    <rect x="14" y="4" width="4" height="16" rx="1" />
  </svg>
);

const IconVolume = ({ muted }: { muted: boolean }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    {muted ? (
      <>
        <path d="M11 5L6 9H2v6h4l5 4V5z" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="23" y1="9" x2="17" y2="15" strokeLinecap="round" />
        <line x1="17" y1="9" x2="23" y2="15" strokeLinecap="round" />
      </>
    ) : (
      <>
        <path d="M11 5L6 9H2v6h4l5 4V5z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15.54 8.46a5 5 0 010 7.07M19.07 4.93a10 10 0 010 14.14" strokeLinecap="round" />
      </>
    )}
  </svg>
);

const IconFullscreen = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M8 3H5a2 2 0 00-2 2v3M21 8V5a2 2 0 00-2-2h-3M3 16v3a2 2 0 002 2h3M16 21h3a2 2 0 002-2v-3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconClose = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
    <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
  </svg>
);

const IconImage = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function getDocIcon(fileName: string) {
  const ext = fileName.replace(".gz", "").split(".").pop()?.toLowerCase();
  if (ext === "pdf") return { icon: <IconPDF />, color: "#ef4444", label: "PDF" };
  if (ext === "doc" || ext === "docx") return { icon: <IconDoc />, color: "#3b82f6", label: "Word" };
  if (ext === "xls" || ext === "xlsx") return { icon: <IconDoc />, color: "#22c55e", label: "Excel" };
  if (ext === "ppt" || ext === "pptx") return { icon: <IconDoc />, color: "#f97316", label: "PPT" };
  return { icon: <IconDoc />, color: "#94a3b8", label: "ملف" };
}

function isImageFile(fileName: string): boolean {
  const ext = fileName.replace(".gz", "").split(".").pop()?.toLowerCase();
  return ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext ?? "");
}

// ── Video Player ──────────────────────────────────────────────────────────────

interface VideoPlayerProps {
  file: MediaFile;
  fillContainer?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ file, fillContainer = false }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const streamUrl = getStreamUrl(file.id);
  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const initPlayer = async () => {
      try {
        const signedToken = await getSignedStreamToken(file.id);
        const hlsUrl = getHlsUrl(file.id, signedToken);

        if (Hls.isSupported()) {
          const hls = new Hls({
            xhrSetup: (xhr) => {
              const jwt = localStorage.getItem("token") || sessionStorage.getItem("token") || "";
              if (jwt) xhr.setRequestHeader("Authorization", `Bearer ${jwt}`);
            },
          });
          hls.loadSource(hlsUrl);
          hls.attachMedia(video);
          hlsRef.current = hls;
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = hlsUrl;
        } else {
          video.src = streamUrl;
        }
      } catch {
        video.src = streamUrl;
      }
    };

    initPlayer();

    return () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [file.id, streamUrl]);

  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  }, [playing]);

  useEffect(() => () => clearTimeout(hideTimer.current), []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
  };

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    setCurrentTime(v.currentTime);
    if (v.buffered.length > 0) setBuffered(v.buffered.end(v.buffered.length - 1));
  };

  const handleLoadedMetadata = () => {
    const v = videoRef.current;
    if (v) setDuration(v.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const t = parseFloat(e.target.value);
    v.currentTime = t;
    setCurrentTime(t);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const val = parseFloat(e.target.value);
    v.volume = val;
    setVolume(val);
    setMuted(val === 0);
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const changeSpeed = (s: number) => {
    const v = videoRef.current;
    if (v) v.playbackRate = s;
    setSpeed(s);
    setShowSpeedMenu(false);
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen();
    else document.exitFullscreen();
  };

  const fmtTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPct = duration > 0 ? (buffered / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={`relative bg-black overflow-hidden ${fillContainer ? "w-full h-full rounded-none" : "rounded-xl"}`}
      style={fillContainer ? {} : { aspectRatio: "16/9", width: "100%" }}
      onMouseMove={resetHideTimer}
      onMouseLeave={() => playing && setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-full block cursor-pointer"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setPlaying(false)}
        onClick={togglePlay}
        onContextMenu={e => e.preventDefault()}
        preload="metadata"
        aria-label={`فيديو: ${file.originalFileName}`}
      />

      {/* Controls overlay */}
      <div
        className={`absolute inset-0 flex flex-col justify-end transition-opacity duration-300 ${showControls ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        style={{ background: showControls ? "linear-gradient(transparent 40%, rgba(0,0,0,0.85))" : "transparent" }}
      >
        {/* Center play button */}
        {!playing && (
          <button
            onClick={togglePlay}
            aria-label="تشغيل الفيديو"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/15 border-2 border-white/40 flex items-center justify-center cursor-pointer backdrop-blur-sm transition-colors duration-200 hover:bg-white/25"
          >
            <IconPlay />
          </button>
        )}

        {/* Bottom controls */}
        <div className="px-3 pb-2.5 pt-2 flex flex-col gap-1.5">
          {/* Progress bar */}
          <div className="relative h-1 rounded-sm bg-white/20 cursor-pointer">
            <div className="absolute left-0 top-0 h-full bg-white/30 rounded-sm transition-[width] duration-300" style={{ width: `${bufferedPct}%` }} />
            <div className="absolute left-0 top-0 h-full bg-sky-400 rounded-sm" style={{ width: `${progressPct}%` }} />
            <input
              type="range" min={0} max={duration || 100} step={0.1} value={currentTime}
              onChange={handleSeek}
              aria-label="شريط التقدم"
              className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
            />
          </div>

          {/* Buttons row */}
          <div className="flex items-center gap-2">
            <button onClick={togglePlay} aria-label={playing ? "إيقاف مؤقت" : "تشغيل"} className="text-slate-200 hover:text-white cursor-pointer flex items-center justify-center p-1 rounded transition-colors duration-200">
              {playing ? <IconPause /> : <IconPlay />}
            </button>
            <button onClick={toggleMute} aria-label={muted ? "إلغاء كتم الصوت" : "كتم الصوت"} className="text-slate-200 hover:text-white cursor-pointer flex items-center justify-center p-1 rounded transition-colors duration-200">
              <IconVolume muted={muted} />
            </button>
            <input
              type="range" min={0} max={1} step={0.05} value={muted ? 0 : volume}
              onChange={handleVolume}
              aria-label="مستوى الصوت"
              className="w-16 accent-sky-400 cursor-pointer"
            />
            <span className="text-xs text-slate-200 ml-1" style={{ fontFamily: FONT }}>
              {fmtTime(currentTime)} / {fmtTime(duration)}
            </span>
            <div className="flex-1" />
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(p => !p)}
                aria-label="سرعة التشغيل"
                className="text-slate-200 hover:text-white cursor-pointer text-xs px-2 py-1 rounded transition-colors duration-200"
                style={{ fontFamily: FONT, minWidth: 40 }}
              >
                {speed}x
              </button>
              {showSpeedMenu && (
                <div className="absolute bottom-[calc(100%+6px)] right-0 bg-slate-800 border border-white/10 rounded-lg overflow-hidden z-10">
                  {speeds.map(s => (
                    <button
                      key={s}
                      onClick={() => changeSpeed(s)}
                      className={`block w-full px-4 py-1.5 text-center text-sm cursor-pointer transition-colors duration-200 ${s === speed ? "bg-sky-500/15 text-sky-400" : "text-slate-200 hover:bg-white/10"}`}
                      style={{ fontFamily: FONT }}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={toggleFullscreen} aria-label="ملء الشاشة" className="text-slate-200 hover:text-white cursor-pointer flex items-center justify-center p-1 rounded transition-colors duration-200">
              <IconFullscreen />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Lightbox ──────────────────────────────────────────────────────────────────

interface LightboxProps {
  file: MediaFile;
  viewUrl: string;
  onClose: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ file, viewUrl, onClose }) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`عرض الصورة: ${file.originalFileName.replace(".gz", "")}`}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        aria-label="إغلاق"
        className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white cursor-pointer transition-colors duration-200"
      >
        <IconClose />
      </button>

      {/* Image */}
      <div
        className="max-w-[90vw] max-h-[90vh] flex items-center justify-center"
        onClick={e => e.stopPropagation()}
      >
        <img
          src={viewUrl}
          alt={`صورة: ${file.originalFileName.replace(".gz", "")}`}
          className="max-w-full max-h-[90vh] rounded-xl object-contain shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
        />
      </div>

      {/* Filename caption */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm text-slate-300 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full"
        style={{ fontFamily: FONT }}
      >
        {file.originalFileName.replace(".gz", "")}
      </div>
    </div>
  );
};

// ── Image Card ────────────────────────────────────────────────────────────────

const ImageCard: React.FC<{ file: MediaFile; onLightbox: (file: MediaFile) => void }> = ({ file, onLightbox }) => {
  const viewUrl = getViewUrl(file.id);
  const downloadUrl = getDownloadUrl(file.id);
  const cleanName = file.originalFileName.replace(".gz", "");

  return (
    <div
      className="rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.06] hover:border-sky-500/30 transition-all duration-200 cursor-pointer group"
      onClick={() => onLightbox(file)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-white/[0.04]">
        <img
          src={viewUrl}
          alt={`صورة: ${cleanName}`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white text-xs font-semibold bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full" style={{ fontFamily: FONT }}>
            عرض
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="p-2.5 flex items-center justify-between gap-2">
        <span
          className="text-xs text-slate-300 truncate flex-1"
          style={{ fontFamily: FONT }}
          title={cleanName}
        >
          {cleanName}
        </span>
        <a
          href={downloadUrl}
          download
          aria-label={`تحميل ${cleanName}`}
          onClick={e => e.stopPropagation()}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-sky-400 cursor-pointer transition-colors duration-200 shrink-0"
          style={{ fontFamily: FONT }}
        >
          <IconDownload />
        </a>
      </div>
    </div>
  );
};

// ── Document Row ──────────────────────────────────────────────────────────────

const DocumentRow: React.FC<{ file: MediaFile }> = ({ file }) => {
  const { icon, color, label } = getDocIcon(file.originalFileName);
  const viewUrl = getViewUrl(file.id);
  const downloadUrl = getDownloadUrl(file.id);
  const cleanName = file.originalFileName.replace(".gz", "");

  return (
    <div className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] hover:border-white/10 transition-all duration-200">
      {/* Icon badge */}
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `${color}18`, border: `1px solid ${color}30`, color }}
      >
        {icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-slate-200 truncate" style={{ fontFamily: FONT }}>
          {cleanName}
        </div>
        <div className="flex gap-2 mt-0.5 text-xs text-slate-500" style={{ fontFamily: FONT }}>
          <span className="px-1.5 py-px rounded font-semibold" style={{ background: `${color}20`, color }}>{label}</span>
          <span>{formatFileSize(file.compressedSize)}</span>
          {file.compressionRatio > 0 && (
            <span className="text-green-500">↓ {file.compressionRatio.toFixed(0)}%</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-1.5 shrink-0">
        <a
          href={viewUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`عرض ${cleanName}`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold cursor-pointer hover:bg-sky-500/20 transition-colors duration-200 no-underline"
          style={{ fontFamily: FONT }}
        >
          <IconEye />
          عرض
        </a>
        <a
          href={downloadUrl}
          download
          aria-label={`تحميل ${cleanName}`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/10 text-slate-400 text-xs font-semibold cursor-pointer hover:bg-white/10 transition-colors duration-200 no-underline"
          style={{ fontFamily: FONT }}
        >
          <IconDownload />
          تحميل
        </a>
      </div>
    </div>
  );
};

// ── Video List Item ───────────────────────────────────────────────────────────

const VideoListItem: React.FC<{ file: MediaFile; active: boolean; onClick: () => void }> = ({ file, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 font-sans text-right ${
      active
        ? "bg-sky-500/[0.08] border border-sky-500/20"
        : "bg-transparent border border-transparent hover:bg-white/[0.04]"
    }`}
    style={{ fontFamily: FONT }}
  >
    <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${active ? "bg-sky-500/15 text-sky-400" : "bg-white/[0.05] text-slate-500"}`}>
      <IconVideo />
    </div>
    <div className="flex-1 min-w-0 text-right">
      <div className={`text-sm truncate ${active ? "text-sky-400 font-semibold" : "text-slate-400 font-normal"}`}>
        {file.originalFileName}
      </div>
      <div className="text-xs text-slate-600 mt-px">
        {formatFileSize(file.compressedSize)}
        {file.duration ? ` · ${formatDuration(file.duration)}` : ""}
      </div>
    </div>
    {active && <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />}
  </button>
);

// ── Main MediaGallery ─────────────────────────────────────────────────────────

interface MediaGalleryProps {
  lectureId: string;
  lectureTitle?: string;
  videoOnly?: boolean;
  docsOnly?: boolean;
}

const MediaGallery: React.FC<MediaGalleryProps> = ({ lectureId, lectureTitle, videoOnly = false, docsOnly = false }) => {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<MediaFile | null>(null);
  const [tab, setTab] = useState<"video" | "docs">("video");
  const [lightboxFile, setLightboxFile] = useState<MediaFile | null>(null);

  useEffect(() => {
    if (!lectureId) return;
    setLoading(true);
    setError(null);
    getMediaByLecture(lectureId)
      .then(res => {
        const data = Array.isArray(res) ? res : (res as any).data ?? [];
        setFiles(data);
        const firstVideo = data.find((f: MediaFile) => f.fileType === "video");
        if (firstVideo) setActiveVideo(firstVideo);
      })
      .catch(() => setError("فشل في تحميل الملفات"))
      .finally(() => setLoading(false));
  }, [lectureId]);

  const videos = files.filter(f => f.fileType === "video");
  const docs = files.filter(f => f.fileType === "document");
  const images = docs.filter(f => isImageFile(f.originalFileName));
  const nonImageDocs = docs.filter(f => !isImageFile(f.originalFileName));

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2.5 py-10 text-slate-500" style={{ fontFamily: FONT }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" className="animate-spin" aria-hidden="true">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
        </svg>
        جاري تحميل الملفات...
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6 text-center text-red-400 text-sm" style={{ fontFamily: FONT }} role="alert">
        {error}
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="py-8 text-center text-slate-600" style={{ fontFamily: FONT }}>
        <div className="flex justify-center mb-3 text-slate-700"><IconVideo /></div>
        <div className="text-sm">لا توجد ملفات لهذه المحاضرة</div>
      </div>
    );
  }

  return (
    <div dir="rtl" className={`flex flex-col gap-4 ${videoOnly ? "w-full h-full" : ""}`} style={{ fontFamily: FONT }}>
      {/* Header */}
      {lectureTitle && (
        <div className="text-[15px] font-bold text-slate-200">{lectureTitle}</div>
      )}

      {/* Tabs */}
      {!videoOnly && !docsOnly && videos.length > 0 && docs.length > 0 && (
        <div className="flex gap-1 bg-white/[0.04] rounded-lg p-0.5">
          {(["video", "docs"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-1.5 rounded-md text-sm font-semibold cursor-pointer transition-all duration-200 ${
                tab === t ? "bg-sky-500/15 text-sky-400" : "text-slate-500 hover:text-slate-300"
              }`}
              style={{ fontFamily: FONT }}
            >
              {t === "video" ? `فيديوهات (${videos.length})` : `مستندات (${docs.length})`}
            </button>
          ))}
        </div>
      )}

      {/* Video section */}
      {!docsOnly && (tab === "video" || docs.length === 0 || videoOnly) && videos.length > 0 && (
        <div className={`flex flex-col gap-3 ${videoOnly ? "w-full h-full" : ""}`}>
          {activeVideo && <VideoPlayer file={activeVideo} fillContainer={videoOnly} />}
          {videos.length > 1 && (
            <div className="flex flex-col gap-0.5">
              <div className="text-xs font-semibold text-slate-600 mb-1">جميع الفيديوهات</div>
              {videos.map(v => (
                <VideoListItem key={v.id} file={v} active={activeVideo?.id === v.id} onClick={() => setActiveVideo(v)} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Documents section */}
      {!videoOnly && (docsOnly || tab === "docs" || videos.length === 0) && docs.length > 0 && (
        <div className="flex flex-col gap-4">
          {/* Image grid */}
          {images.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-2">الصور ({images.length})</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {images.map(img => (
                  <ImageCard key={img.id} file={img} onLightbox={setLightboxFile} />
                ))}
              </div>
            </div>
          )}

          {/* Non-image documents */}
          {nonImageDocs.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-2">المستندات ({nonImageDocs.length})</div>
              <div className="flex flex-col gap-2">
                {nonImageDocs.map(d => (
                  <DocumentRow key={d.id} file={d} />
                ))}
              </div>
            </div>
          )}

          {/* Fallback: show all docs if no separation needed */}
          {images.length === 0 && nonImageDocs.length === 0 && docs.map(d => (
            <DocumentRow key={d.id} file={d} />
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxFile && (
        <Lightbox
          file={lightboxFile}
          viewUrl={getViewUrl(lightboxFile.id)}
          onClose={() => setLightboxFile(null)}
        />
      )}
    </div>
  );
};

export default MediaGallery;
