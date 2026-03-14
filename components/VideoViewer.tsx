import React, { useState, useRef, useEffect } from 'react';
import { Page } from '../App';
import { fetchCourseById, fetchStudentEnrollments, fetchSubjectById } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const TOKEN_KEY = 'elmanssa_auth_token';

interface VideoViewerProps {
    onNavigate: (page: Page, payload?: { courseId?: number | string }) => void;
    courseId?: number | string | null;
    lectureData?: {
        subjectName: string;
        lectureName: string;
        lectureIndex: number;
        subjectIndex: number;
    };
}

// Same data structure as dashboard for consistency
interface Lecture {
    id: string;
    title: string;
    duration: string;
    videoUrl?: string;
    completed: boolean;
}

interface Subject {
    id: string;
    name: string;
    instructor: string;
    instructorAvatar: string;
    avatarBg: string;
    lectureCount: string;
    icon: string;
    lectures: Lecture[];
}

const getGoogleDriveEmbedUrl = (url: string) => {
    if (!url) return '';

    // If it's already a DrivePlyr link, return it
    if (url.includes('sh20raj.github.io/DrivePlyr')) return url;

    // Regex to extract Google Drive ID
    const driveRegex = /(?:https?:\/\/)?(?:drive\.google\.com\/(?:file\/l\/|file\/d\/|open\?id=)|(?:docs\.google\.com\/(?:file\/d\/|open\?id=)))([a-zA-Z0-9_-]+)/;
    const match = url.match(driveRegex);

    if (match && match[1]) {
        return `https://sh20raj.github.io/DrivePlyr/plyr.html?id=${match[1]}`;
    }

    // Fallback for YouTube or other embeddable links
    if (url.includes('youtube.com/watch?v=')) {
        const id = url.split('v=')[1]?.split('&')[0];
        return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1]?.split('?')[0];
        return `https://www.youtube.com/embed/${id}`;
    }

    return url;
};

// Initial state until data is loaded
const defaultSubject: Subject = {
    id: 'loading',
    name: 'جاري التحميل...',
    instructor: '',
    instructorAvatar: '⏳',
    avatarBg: '#ccc',
    lectureCount: '0',
    icon: '⏳',
    lectures: []
};


const VideoViewer: React.FC<VideoViewerProps> = ({ onNavigate, lectureData, courseId }) => {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});
    const [currentLecture, setCurrentLecture] = useState<Lecture | null>(null);
    const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(80);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [notes, setNotes] = useState('');
    const [showNotes, setShowNotes] = useState(false);
    const progressInterval = useRef<NodeJS.Timeout | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const { user } = useAuth();

    useEffect(() => {
        const loadCourseData = async () => {
            if (!courseId) {
                setIsLoading(false);
                return;
            }

            const token = localStorage.getItem(TOKEN_KEY);

            setIsLoading(true);
            try {
                // Enrollment check for students
                if (user?.role === 'student') {
                    if (!token) {
                        onNavigate('course-detail', { courseId: typeof courseId === 'number' ? courseId : undefined });
                        return;
                    }

                    const enrollments = await fetchStudentEnrollments(token);
                    const idToMatch = String(courseId);

                    const isEnrolled = enrollments.some((e: any) =>
                        (String(e.courseId) === idToMatch) ||
                        (String(e.subjectId) === idToMatch) ||
                        (String(e.id) === idToMatch)
                    );

                    if (!isEnrolled) {
                        onNavigate('course-detail', { courseId: typeof courseId === 'number' ? courseId : undefined });
                        return;
                    }
                }

                // Call the appropriate API based on ID type
                let data;
                if (typeof courseId === 'string' && courseId.includes('-')) {
                    // It's a Subject (Guid)
                    data = await fetchSubjectById(courseId as string, token || '');
                } else {
                    // It's a Course (number)
                    data = await fetchCourseById(Number(courseId));
                }
                if (data && data.curriculum) {
                    // Map API curriculum to subjects structure
                    const mappedSubjects: Subject[] = data.curriculum.map((section: any, idx: number) => ({
                        id: `section-${idx}`,
                        name: section.section || section.title,
                        instructor: data.instructor || 'المعلم',
                        instructorAvatar: '👨‍🏫',
                        avatarBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        lectureCount: `${section.lectures?.length || 0} محاضرات`,
                        icon: '📚',
                        lectures: (section.lectures || []).map((lec: any, lIdx: number) => ({
                            id: String(lec.id ?? `lec-${idx}-${lIdx}`),
                            title: typeof lec === 'string' ? lec : lec.title,
                            duration: lec.duration || '10:00',
                            videoUrl: lec.videoUrl || '',
                            completed: false
                        }))
                    }));
                    setSubjects(mappedSubjects);

                    if (mappedSubjects.length > 0 && mappedSubjects[0].lectures.length > 0) {
                        setCurrentSubject(mappedSubjects[0]);
                        setCurrentLecture(mappedSubjects[0].lectures[0]);
                    }
                }
            } catch (error) {
                console.error('Error fetching course curriculum', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadCourseData();
    }, [courseId]);

    useEffect(() => {
        if (lectureData && subjects.length > 0) {
            const subject = subjects[lectureData.subjectIndex];
            if (subject) {
                const lecture = subject.lectures[lectureData.lectureIndex];
                if (lecture) {
                    setCurrentLecture(lecture);
                    setCurrentSubject(subject);
                    setExpandedSubjects({ [subject.id]: true });
                }
            }
        }
    }, [lectureData, subjects]);

    // Simulate video progress
    useEffect(() => {
        if (isPlaying) {
            progressInterval.current = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        setIsPlaying(false);
                        return 100;
                    }
                    return prev + 0.1;
                });
            }, 100);
        } else {
            if (progressInterval.current) clearInterval(progressInterval.current);
        }
        return () => { if (progressInterval.current) clearInterval(progressInterval.current); };
    }, [isPlaying]);

    const toggleSubject = (id: string) => {
        setExpandedSubjects(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const selectLecture = (lecture: Lecture, subject: Subject) => {
        setCurrentLecture(lecture);
        setCurrentSubject(subject);
        setProgress(0);
        setIsPlaying(false);
    };

    // Find next/previous lecture — ONLY within the current subject
    const findAdjacentLecture = (direction: 'next' | 'prev') => {
        if (!currentSubject || !currentLecture) return null;
        const subject = currentSubject;
        for (let lci = 0; lci < subject.lectures.length; lci++) {
            if (subject.lectures[lci].id === currentLecture.id) {
                if (direction === 'next') {
                    if (lci + 1 < subject.lectures.length) {
                        return { lecture: subject.lectures[lci + 1], subject };
                    }
                } else {
                    if (lci - 1 >= 0) {
                        return { lecture: subject.lectures[lci - 1], subject };
                    }
                }
            }
        }
        return null;
    };

    if (isLoading) {
        return (
            <div dir="rtl" style={{
                display: 'flex', minHeight: '100vh', background: '#0a1628',
                fontFamily: "'Cairo', sans-serif", alignItems: 'center', justifyContent: 'center',
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px', animation: 'spin 1s linear infinite' }}>⏳</div>
                    <div style={{ color: '#e2e8f0', fontSize: '18px', fontWeight: 700 }}>جاري تحميل المحاضرة...</div>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!currentLecture || !currentSubject) {
        return <div className="p-10 text-white">لم يتم العثور على المحاضرة</div>;
    }

    return (
        <div className="video-viewer-page" dir="rtl" style={{
            minHeight: '100vh',
            background: '#0a1628',
            color: '#e2e8f0',
            fontFamily: "'Cairo', sans-serif",
        }}>
            {/* Top Bar */}
            <div style={{
                background: 'linear-gradient(90deg, #0d1f3c 0%, #132742 100%)',
                borderBottom: '1px solid rgba(56, 189, 248, 0.1)',
                padding: '12px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                zIndex: 100,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button
                        onClick={() => onNavigate('dashboard')}
                        style={{
                            background: 'rgba(56, 189, 248, 0.1)',
                            border: '1px solid rgba(56, 189, 248, 0.2)',
                            borderRadius: '10px',
                            padding: '8px 16px',
                            color: '#38bdf8',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '14px',
                            fontWeight: 600,
                            transition: 'all 0.3s',
                            fontFamily: "'Cairo', sans-serif",
                        }}
                        onMouseOver={e => { e.currentTarget.style.background = 'rgba(56, 189, 248, 0.2)'; }}
                        onMouseOut={e => { e.currentTarget.style.background = 'rgba(56, 189, 248, 0.1)'; }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        العودة للوحة التحكم
                    </button>
                    <div style={{ height: '24px', width: '1px', background: 'rgba(255,255,255,0.1)' }} />
                    <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#e2e8f0', margin: 0 }}>
                        {currentSubject.name} — {currentLecture.title}
                    </h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                        onClick={() => setShowNotes(!showNotes)}
                        style={{
                            background: showNotes ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            fontSize: '13px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontFamily: "'Cairo', sans-serif",
                        }}
                    >
                        📝 ملاحظاتي
                    </button>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        style={{
                            background: 'transparent',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            fontSize: '13px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontFamily: "'Cairo', sans-serif",
                        }}
                    >
                        📋 المحتوى
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', height: 'calc(100vh - 57px)' }}>
                {/* Main Video Area */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {/* Video Player */}
                    <div style={{
                        flex: 1,
                        background: '#000',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '400px',
                    }}>
                        {/* Video Player */}
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                        }}>
                            {currentLecture.videoUrl ? (
                                <iframe
                                    src={getGoogleDriveEmbedUrl(currentLecture.videoUrl)}
                                    style={{ width: '100%', height: '100%', border: 'none' }}
                                    allowFullScreen
                                    title={currentLecture.title}
                                />
                            ) : (
                                <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: 'radial-gradient(ellipse at center, #1a2a4a 0%, #0a1628 100%)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '20px',
                                }}>
                                    {!isPlaying && (
                                        <div style={{
                                            width: '80px',
                                            height: '80px',
                                            borderRadius: '50%',
                                            background: 'rgba(56, 189, 248, 0.15)',
                                            border: '2px solid rgba(56, 189, 248, 0.3)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s',
                                            backdropFilter: 'blur(10px)',
                                        }}
                                            onClick={() => setIsPlaying(true)}
                                            onMouseOver={e => { e.currentTarget.style.background = 'rgba(56, 189, 248, 0.3)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                                            onMouseOut={e => { e.currentTarget.style.background = 'rgba(56, 189, 248, 0.15)'; e.currentTarget.style.transform = 'scale(1)'; }}
                                        >
                                            <svg width="32" height="32" viewBox="0 0 24 24" fill="#38bdf8">
                                                <path d="M8 5v14l11-7z" />
                                            </svg>
                                        </div>
                                    )}
                                    {isPlaying && (
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{
                                                width: '120px',
                                                height: '120px',
                                                borderRadius: '50%',
                                                border: '3px solid rgba(56, 189, 248, 0.3)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                animation: 'pulse 2s ease-in-out infinite',
                                                margin: '0 auto 16px',
                                            }}>
                                                <span style={{ fontSize: '48px' }}>🎬</span>
                                            </div>
                                            <p style={{ color: '#94a3b8', fontSize: '14px' }}>جاري تشغيل المحاضرة...</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Controls Overlay */}
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                            padding: '40px 20px 16px',
                        }}>
                            {/* Progress Bar */}
                            <div
                                style={{
                                    width: '100%',
                                    height: '4px',
                                    background: 'rgba(255,255,255,0.15)',
                                    borderRadius: '2px',
                                    cursor: 'pointer',
                                    marginBottom: '12px',
                                    position: 'relative',
                                }}
                                onClick={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const newProg = ((e.clientX - rect.left) / rect.width) * 100;
                                    setProgress(newProg);
                                }}
                            >
                                <div style={{
                                    width: `${progress}%`,
                                    height: '100%',
                                    background: 'linear-gradient(90deg, #38bdf8, #06b6d4)',
                                    borderRadius: '2px',
                                    transition: 'width 0.1s linear',
                                    position: 'relative',
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        left: '-6px',
                                        top: '-4px',
                                        width: '12px',
                                        height: '12px',
                                        borderRadius: '50%',
                                        background: '#38bdf8',
                                        boxShadow: '0 0 8px rgba(56, 189, 248, 0.5)',
                                    }} />
                                </div>
                            </div>

                            {/* Controls row */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    {/* Prev */}
                                    <button
                                        onClick={() => { const prev = findAdjacentLecture('prev'); if (prev) selectLecture(prev.lecture, prev.subject); }}
                                        style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
                                    </button>
                                    {/* Play/Pause */}
                                    <button
                                        onClick={() => setIsPlaying(!isPlaying)}
                                        style={{
                                            background: 'rgba(56, 189, 248, 0.15)',
                                            border: '1px solid rgba(56, 189, 248, 0.3)',
                                            borderRadius: '50%',
                                            width: '40px',
                                            height: '40px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#38bdf8',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {isPlaying ? (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
                                        ) : (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                                        )}
                                    </button>
                                    {/* Next */}
                                    <button
                                        onClick={() => { const next = findAdjacentLecture('next'); if (next) selectLecture(next.lecture, next.subject); }}
                                        style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
                                    </button>
                                    {/* Volume */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="#94a3b8"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" /></svg>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={volume}
                                            onChange={(e) => setVolume(Number(e.target.value))}
                                            style={{ width: '70px', accentColor: '#38bdf8' }}
                                        />
                                    </div>
                                    {/* Time */}
                                    <span style={{ color: '#94a3b8', fontSize: '13px', fontVariantNumeric: 'tabular-nums' }}>
                                        {currentLecture.duration} / {Math.floor(progress * 0.01 * parseInt(currentLecture.duration)).toString().padStart(2, '0')}:{Math.floor((progress * 0.6) % 60).toString().padStart(2, '0')}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    {/* Speed */}
                                    <div style={{ position: 'relative' }}>
                                        <button
                                            onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                                            style={{
                                                background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '6px',
                                                padding: '4px 10px',
                                                color: '#94a3b8',
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                                fontFamily: "'Cairo', sans-serif",
                                            }}
                                        >
                                            {playbackSpeed}x
                                        </button>
                                        {showSpeedMenu && (
                                            <div style={{
                                                position: 'absolute',
                                                bottom: '40px',
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                background: '#1e293b',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '8px',
                                                padding: '4px',
                                                zIndex: 10,
                                            }}>
                                                {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
                                                    <button
                                                        key={speed}
                                                        onClick={() => { setPlaybackSpeed(speed); setShowSpeedMenu(false); }}
                                                        style={{
                                                            display: 'block',
                                                            width: '100%',
                                                            padding: '6px 16px',
                                                            background: playbackSpeed === speed ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                                                            border: 'none',
                                                            color: playbackSpeed === speed ? '#38bdf8' : '#94a3b8',
                                                            cursor: 'pointer',
                                                            fontSize: '13px',
                                                            borderRadius: '4px',
                                                            fontFamily: "'Cairo', sans-serif",
                                                        }}
                                                    >
                                                        {speed}x
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {/* Fullscreen */}
                                    <button
                                        onClick={() => setIsFullscreen(!isFullscreen)}
                                        style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Below video info */}
                    <div style={{
                        padding: '20px 24px',
                        background: '#0d1f3c',
                        borderTop: '1px solid rgba(255,255,255,0.05)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px' }}>
                            <div>
                                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#e2e8f0', margin: '0 0 6px 0' }}>
                                    {currentLecture.title}
                                </h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: '#64748b' }}>
                                    <span>{currentSubject.name}</span>
                                    <span>•</span>
                                    <span>{currentSubject.instructor}</span>
                                    <span>•</span>
                                    <span>⏱️ {currentLecture.duration}</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={() => {
                                        const prev = findAdjacentLecture('prev');
                                        if (prev) selectLecture(prev.lecture, prev.subject);
                                    }}
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '10px',
                                        padding: '10px 20px',
                                        color: '#94a3b8',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        fontFamily: "'Cairo', sans-serif",
                                    }}
                                >
                                    المحاضرة السابقة
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => {
                                        const next = findAdjacentLecture('next');
                                        if (next) selectLecture(next.lecture, next.subject);
                                    }}
                                    style={{
                                        background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
                                        border: 'none',
                                        borderRadius: '10px',
                                        padding: '10px 20px',
                                        color: '#fff',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        fontFamily: "'Cairo', sans-serif",
                                    }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    المحاضرة التالية
                                </button>
                            </div>
                        </div>

                        {/* Notes section */}
                        {showNotes && (
                            <div style={{
                                marginTop: '16px',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '12px',
                                padding: '16px',
                            }}>
                                <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#94a3b8', margin: '0 0 10px 0' }}>📝 ملاحظاتي على هذه المحاضرة</h4>
                                <textarea
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    placeholder="اكتب ملاحظاتك هنا..."
                                    style={{
                                        width: '100%',
                                        minHeight: '80px',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        padding: '12px',
                                        color: '#e2e8f0',
                                        fontSize: '14px',
                                        fontFamily: "'Cairo', sans-serif",
                                        resize: 'vertical',
                                        outline: 'none',
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar - Current Subject Content Only */}
                {sidebarOpen && (
                    <div style={{
                        width: '360px',
                        background: '#0d1f3c',
                        borderRight: '1px solid rgba(255,255,255,0.06)',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                    }}>
                        {/* Subject Header (fixed, not a list) */}
                        <div style={{
                            padding: '16px 20px',
                            borderBottom: '1px solid rgba(255,255,255,0.06)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                        }}>
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '10px',
                                background: currentSubject.avatarBg,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '18px',
                            }}>
                                {currentSubject.icon}
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#e2e8f0', margin: 0 }}>{currentSubject.name}</h3>
                                <div style={{ fontSize: '11px', color: '#64748b' }}>{currentSubject.instructor} • {currentSubject.lectureCount}</div>
                            </div>
                        </div>

                        {/* Lectures list */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
                            <div style={{ animation: 'fadeIn 0.2s ease' }}>
                                {currentSubject.lectures.map((lecture) => {
                                    const isActive = currentLecture.id === lecture.id;
                                    return (
                                        <button
                                            key={lecture.id}
                                            onClick={() => selectLecture(lecture, currentSubject)}
                                            style={{
                                                width: '100%',
                                                background: isActive ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                                                border: isActive ? '1px solid rgba(56, 189, 248, 0.2)' : '1px solid transparent',
                                                borderRadius: '8px',
                                                padding: '12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                cursor: 'pointer',
                                                transition: 'all 0.15s',
                                                marginBottom: '4px',
                                                fontFamily: "'Cairo', sans-serif",
                                            }}
                                            onMouseOver={e => {
                                                if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                            }}
                                            onMouseOut={e => {
                                                if (!isActive) e.currentTarget.style.background = 'transparent';
                                            }}
                                        >
                                            {/* Status indicator */}
                                            {lecture.completed ? (
                                                <div style={{
                                                    width: '24px', height: '24px', borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, #10b981, #059669)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    flexShrink: 0,
                                                }}>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                                                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </div>
                                            ) : isActive ? (
                                                <div style={{
                                                    width: '24px', height: '24px', borderRadius: '50%',
                                                    background: 'rgba(56, 189, 248, 0.2)',
                                                    border: '2px solid #38bdf8',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    flexShrink: 0,
                                                    boxShadow: '0 0 8px rgba(56, 189, 248, 0.3)',
                                                }}>
                                                    <div style={{
                                                        width: '8px', height: '8px', borderRadius: '50%',
                                                        background: '#38bdf8',
                                                        animation: 'pulse 1.5s ease-in-out infinite',
                                                    }} />
                                                </div>
                                            ) : (
                                                <div style={{
                                                    width: '24px', height: '24px', borderRadius: '50%',
                                                    border: '2px solid #334155',
                                                    flexShrink: 0,
                                                }} />
                                            )}

                                            {/* Lecture title */}
                                            <div style={{ flex: 1, textAlign: 'right' }}>
                                                <div style={{
                                                    fontSize: '14px',
                                                    color: isActive ? '#38bdf8' : lecture.completed ? '#64748b' : '#cbd5e1',
                                                    fontWeight: isActive ? 700 : 500,
                                                    textDecoration: lecture.completed ? 'line-through' : 'none',
                                                }}>
                                                    {lecture.title}
                                                </div>
                                            </div>

                                            {/* Duration */}
                                            <span style={{ fontSize: '12px', color: isActive ? '#38bdf8' : '#475569', flexShrink: 0, fontWeight: 500 }}>{lecture.duration}</span>

                                            {/* Play icon */}
                                            {isActive ? (
                                                <div style={{
                                                    width: '24px', height: '24px',
                                                    borderRadius: '6px',
                                                    background: 'rgba(56, 189, 248, 0.2)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    flexShrink: 0,
                                                }}>
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#38bdf8"><path d="M8 5v14l11-7z" /></svg>
                                                </div>
                                            ) : (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="#475569" style={{ flexShrink: 0 }}>
                                                    <path d="M8 5v14l11-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoViewer;
