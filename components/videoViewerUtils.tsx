import React, { useEffect, useRef, useState } from 'react';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Plyr = require('plyr') as typeof import('plyr');
import 'plyr/dist/plyr.css';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface Lecture {
    id: string;
    title: string;
    duration: string;
    videoUrl?: string;
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
    if (url.includes('drive.google.com') || url.includes('sh20raj.github.io/DrivePlyr') || /^[a-zA-Z0-9_-]{33}$/.test(url.trim())) return 'drive';
    return 'other';
};

export const getDriveEmbedUrl = (url: string): string => {
    if (url.includes('sh20raj.github.io/DrivePlyr')) return url;
    const fileId = extractDriveId(url);
    return fileId ? `https://sh20raj.github.io/DrivePlyr/plyr.html?id=${fileId}` : url;
};

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
        try {
            audioCtx = new AudioContext();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.frequency.value = 18500;
            gain.gain.value = 0.0008;
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
        } catch (_) { /* non-critical */ }

        return () => {
            document.removeEventListener('visibilitychange', onVisibility);
            document.removeEventListener('keydown', onKey, true);
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

// ── Plyr YouTube player ───────────────────────────────────────────────────────
export const PlyrYouTube: React.FC<{ videoId: string }> = ({ videoId }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const plyrRef = useRef<InstanceType<typeof Plyr> | null>(null);
    useEffect(() => {
        if (!containerRef.current) return;
        if (plyrRef.current) { try { plyrRef.current.destroy(); } catch (_) {} plyrRef.current = null; }
        plyrRef.current = new Plyr(containerRef.current, {
            youtube: { noCookie: false, rel: 0, showinfo: 0, iv_load_policy: 3, modestbranding: 1 },
            disableContextMenu: true,
        });
        return () => { if (plyrRef.current) { try { plyrRef.current.destroy(); } catch (_) {} plyrRef.current = null; } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [videoId]);
    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', background: '#000' }} onContextMenu={e => e.preventDefault()}>
            <div ref={containerRef} data-plyr-provider="youtube" data-plyr-embed-id={videoId} style={{ width: '100%', height: '100%' }} />
        </div>
    );
};
