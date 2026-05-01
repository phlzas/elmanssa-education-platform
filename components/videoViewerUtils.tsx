import React, { useEffect, useRef, useState } from 'react';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface Lecture {
    id: string;
    title: string;
    duration: string;
    videoUrl?: string;
    mediaFileId?: string;  // set when uploaded via media system
    completed: boolean;
}

export interface Subject {
    id: string;
    name: string;
    instructor: string;
    avatarBg: string;
    lectureCount: string;
    lectures: Lecture[];
}

// ── URL helpers ───────────────────────────────────────────────────────────────
export const extractDriveId = (url: string): string | null => {
    const patterns = [
        /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]{10,})(?:\/|$)/,
        /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]{10,})/,
        /drive\.google\.com\/uc\?(?:[^&]*&)*id=([a-zA-Z0-9_-]{10,})/,
        // Legacy DrivePlyr URLs: sh20raj.github.io/DrivePlyr/plyr.html?id=FILEID
        /[?&]id=([a-zA-Z0-9_-]{10,})(?:&|$)/,
    ];
    for (const re of patterns) { const m = url.match(re); if (m) return m[1]; }
    if (/^[a-zA-Z0-9_-]{33}$/.test(url.trim())) return url.trim();
    return null;
};

export const extractYouTubeId = (url: string): string | null => {
    const patterns = [
        /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
        /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    ];
    for (const re of patterns) { const m = url.match(re); if (m) return m[1]; }
    return null;
};

export const getVideoType = (url: string): 'youtube' | 'drive' | 'other' => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('drive.google.com') || /^[a-zA-Z0-9_-]{33}$/.test(url.trim())) return 'drive';
    // Legacy DrivePlyr URLs contain a ?id= param with a Drive file ID
    if (url.includes('plyr.html') || (url.includes('?id=') && extractDriveId(url) !== null)) return 'drive';
    return 'other';
};

export const getDriveEmbedUrl = (url: string): string => {
    const fileId = extractDriveId(url);
    // Use Google Drive direct streaming URL — works as <video src> without iframe CSP issues
    return fileId ? `https://drive.google.com/uc?export=download&id=${fileId}` : url;
};

export const getDriveFileId = (url: string): string | null => extractDriveId(url);

// ── Screen protection hook ────────────────────────────────────────────────────
export const useScreenProtection = () => {
    const [isRecording, setIsRecording] = useState(false);
    useEffect(() => {
        const onVisibility = () => setIsRecording(document.visibilityState === 'hidden');
        document.addEventListener('visibilitychange', onVisibility);

        const onKey = (e: KeyboardEvent) => {
            if (
                e.key === 'PrintScreen' || e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && ['i', 'j', 'c', 's'].includes(e.key.toLowerCase())) ||
                (e.ctrlKey && e.key.toLowerCase() === 'u') ||
                (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key))
            ) { e.preventDefault(); e.stopPropagation(); }
        };
        document.addEventListener('keydown', onKey, true);

        const orig = navigator.mediaDevices?.getDisplayMedia?.bind(navigator.mediaDevices);
        if (navigator.mediaDevices && orig) {
            navigator.mediaDevices.getDisplayMedia = async (c?: DisplayMediaStreamOptions) => {
                setIsRecording(true);
                try { return await orig(c); } catch (err) { throw err; }
            };
        }

        let audioCtx: AudioContext | null = null;
        const startAudio = () => {
            if (audioCtx) return;
            try {
                audioCtx = new AudioContext();
                if (audioCtx.state === 'suspended') {
                    audioCtx.resume().catch(() => {});
                }
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.frequency.value = 18500;
                gain.gain.value = 0.0008;
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start();
            } catch (_) { /* non-critical */ }
        };
        document.addEventListener('click', startAudio, { once: true });
        document.addEventListener('keydown', startAudio, { once: true });

        return () => {
            document.removeEventListener('visibilitychange', onVisibility);
            document.removeEventListener('keydown', onKey, true);
            document.removeEventListener('click', startAudio);
            document.removeEventListener('keydown', startAudio);
            if (navigator.mediaDevices && orig) navigator.mediaDevices.getDisplayMedia = orig;
            audioCtx?.close().catch(() => {});
        };
    }, []);
    return isRecording;
};

// ── Watermark ─────────────────────────────────────────────────────────────────
export const Watermark: React.FC<{ label: string; sessionId: string }> = ({ label, sessionId }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(canvas);
        const text = `${label} • ${sessionId}`;
        let rafId: number, lastShift = 0, offsetX = Math.random(), offsetY = Math.random();
        const draw = (ts: number) => {
            if (ts - lastShift > 4000) { offsetX = Math.random(); offsetY = Math.random(); lastShift = ts; }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.globalAlpha = 0.22; ctx.fillStyle = '#fff'; ctx.font = 'bold 14px monospace';
            ctx.rotate(-Math.PI / 7);
            const cols = Math.ceil(canvas.width / 280) + 2, rows = Math.ceil(canvas.height / 90) + 2;
            const sx = -canvas.width * 0.3 + offsetX * 200, sy = -canvas.height * 0.1 + offsetY * 60;
            for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) ctx.fillText(text, sx + c * 280, sy + r * 90);
            ctx.restore();
            rafId = requestAnimationFrame(draw);
        };
        rafId = requestAnimationFrame(draw);
        return () => { cancelAnimationFrame(rafId); ro.disconnect(); };
    }, [label, sessionId]);
    return <canvas ref={canvasRef} aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 20, width: '100%', height: '100%', pointerEvents: 'none' }} />;
};

// ── Recording blocker overlay ─────────────────────────────────────────────────
export const RecordingBlocker: React.FC = () => (
    <div style={{ position: 'absolute', inset: 0, zIndex: 30, background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" strokeLinecap="round" />
        </svg>
        <p style={{ color: '#e2e8f0', fontSize: '15px', fontFamily: "'Cairo', sans-serif", margin: 0 }}>تم إيقاف الفيديو مؤقتاً</p>
        <p style={{ color: '#94a3b8', fontSize: '13px', fontFamily: "'Cairo', sans-serif", margin: 0 }}>عد إلى هذه النافذة لمتابعة المشاهدة</p>
    </div>
);

// ── Shared Plyr config & theme ────────────────────────────────────────────────
const PLYR_CONTROLS = [
    'play-large', 'play', 'progress', 'current-time',
    'mute', 'volume', 'captions', 'settings', 'pip', 'fullscreen',
];

const PLYR_THEME_CSS = `
  :root {
    --plyr-color-main: #38bdf8;
    --plyr-video-background: #0a0f1e;
    --plyr-video-controls-background: linear-gradient(rgba(10,15,30,0), rgba(10,15,30,0.92));
    --plyr-control-radius: 6px;
    --plyr-font-family: 'Cairo', sans-serif;
    --plyr-range-fill-background: #38bdf8;
    --plyr-video-range-thumb-active-shadow-color: rgba(56,189,248,0.4);
    --plyr-badge-background: #1e293b;
    --plyr-menu-background: #0d1424;
    --plyr-menu-color: #cbd5e1;
    --plyr-menu-border-color: rgba(255,255,255,0.08);
    --plyr-tooltip-background: #0d1424;
    --plyr-tooltip-color: #e2e8f0;
  }
  .plyr--video .plyr__control:hover,
  .plyr--video .plyr__control[aria-expanded=true] {
    background: rgba(56,189,248,0.18);
  }
  .plyr__menu__container {
    border: 1px solid rgba(255,255,255,0.08);
  }
  /* Hide YouTube end-screen recommendations, title bar, and share button */
  .plyr__video-wrapper iframe {
    pointer-events: none;
  }
  .plyr--playing .plyr__video-wrapper iframe,
  .plyr--paused .plyr__video-wrapper iframe {
    pointer-events: auto;
  }
  /* Fullscreen: wrapper fills viewport, Plyr fills wrapper */
  #plyr-yt-wrapper:-webkit-full-screen,
  #plyr-video-wrapper:-webkit-full-screen { width: 100vw; height: 100vh; }
  #plyr-yt-wrapper:-moz-full-screen,
  #plyr-video-wrapper:-moz-full-screen { width: 100vw; height: 100vh; }
  #plyr-yt-wrapper:fullscreen,
  #plyr-video-wrapper:fullscreen { width: 100vw; height: 100vh; }
  #plyr-yt-wrapper:fullscreen .plyr,
  #plyr-video-wrapper:fullscreen .plyr { width: 100%; height: 100%; }
`;

// ── Plyr YouTube player ───────────────────────────────────────────────────────
export const PlyrYouTube: React.FC<{ videoId: string }> = ({ videoId }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const plyrRef = useRef<InstanceType<typeof Plyr> | null>(null);
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!containerRef.current) return;
            if (plyrRef.current) { try { plyrRef.current.destroy(); } catch (_) {} plyrRef.current = null; }
            plyrRef.current = new Plyr(containerRef.current, {
                controls: PLYR_CONTROLS,
                youtube: {
                    noCookie: true,
                    rel: 0,
                    showinfo: 0,
                    iv_load_policy: 3,
                    modestbranding: 1,
                    fs: 0,
                    disablekb: 1,
                    cc_load_policy: 0,
                    playsinline: 1,
                },
                disableContextMenu: true,
                fullscreen: { enabled: true, fallback: true, iosNative: false, container: '#plyr-yt-wrapper' },
            });
        }, 0);
        return () => {
            clearTimeout(timer);
            if (plyrRef.current) { try { plyrRef.current.destroy(); } catch (_) {} plyrRef.current = null; }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [videoId]);
    return (
        <div id="plyr-yt-wrapper" style={{ position: 'relative', width: '100%', height: '100%', background: '#000' }} onContextMenu={e => e.preventDefault()}>
            <style>{PLYR_THEME_CSS}</style>
            <div ref={containerRef} data-plyr-provider="youtube" data-plyr-embed-id={videoId} style={{ width: '100%', height: '100%' }} />
            {/* Blocks YouTube end-screen recommendations and clickable title */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: '48px', zIndex: 10, pointerEvents: 'none' }} />
        </div>
    );
};

// ── Plyr HTML5 video player (Drive / direct URL) ──────────────────────────────
export const PlyrVideo: React.FC<{ src: string; onError?: () => void }> = ({ src, onError }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const plyrRef = useRef<InstanceType<typeof Plyr> | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!videoRef.current) return;
            if (plyrRef.current) { try { plyrRef.current.destroy(); } catch (_) {} plyrRef.current = null; }
            plyrRef.current = new Plyr(videoRef.current, {
                controls: PLYR_CONTROLS,
                disableContextMenu: true,
                resetOnEnd: false,
                keyboard: { focused: true, global: false },
                fullscreen: { enabled: true, fallback: true, iosNative: false, container: '#plyr-video-wrapper' },
            });
            if (onError) {
                plyrRef.current.on('error', onError);
            }
        }, 0);
        return () => {
            clearTimeout(timer);
            if (plyrRef.current) { try { plyrRef.current.destroy(); } catch (_) {} plyrRef.current = null; }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [src]);

    return (
        <div id="plyr-video-wrapper" style={{ position: 'relative', width: '100%', height: '100%', background: '#000' }} onContextMenu={e => e.preventDefault()}>
            <style>{PLYR_THEME_CSS}</style>
            <video
                ref={videoRef}
                key={src}
                controlsList="nodownload noremoteplayback"
                disablePictureInPicture
                onContextMenu={e => e.preventDefault()}
                onError={onError}
                style={{ width: '100%', height: '100%' }}
                playsInline
            >
                <source src={src} onError={onError} />
            </video>
        </div>
    );
};
