
import React, { useState, useRef, useEffect } from 'react';
import { Page } from '../App';

interface VideoViewerProps {
    onNavigate: (page: Page, payload?: { courseId?: number }) => void;
    lectureData?: {
        subjectName: string;
        levelName: string;
        lectureName: string;
        lectureIndex: number;
        subjectIndex: number;
        levelIndex: number;
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

interface Level {
    id: string;
    name: string;
    lectureCount: string;
    lectures: Lecture[];
}

interface Subject {
    id: string;
    name: string;
    instructor: string;
    instructorAvatar: string;
    avatarBg: string;
    levelCount: string;
    icon: string;
    levels: Level[];
}

const courseSubjects: Subject[] = [
    {
        id: 'chem',
        name: 'كيمياء',
        instructor: 'Atef Abdo',
        instructorAvatar: '👨‍🔬',
        avatarBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        levelCount: '2 مستوى',
        icon: '🧪',
        levels: [
            {
                id: 'chem-l1',
                name: 'المستوى 1',
                lectureCount: '6 محاضرات',
                lectures: [
                    { id: 'chem-l1-1', title: 'خطة المنهج', duration: '15:30', completed: true },
                    { id: 'chem-l1-2', title: 'المحاضرة الاولى اساسيات الكيمياء العضوية', duration: '45:20', completed: true },
                    { id: 'chem-l1-3', title: 'المحاضرة الثانية الكيمياء العضوية', duration: '52:10', completed: false },
                    { id: 'chem-l1-4', title: 'حل الواجب الجزء الاول', duration: '30:00', completed: false },
                    { id: 'chem-l1-5', title: 'حل الواجب الجزء الثاني', duration: '28:45', completed: false },
                    { id: 'chem-l1-6', title: 'حل الواجب الجزء الثالث', duration: '35:10', completed: false },
                ],
            },
            {
                id: 'chem-l2',
                name: 'المستوى 2',
                lectureCount: '3 محاضرات',
                lectures: [
                    { id: 'chem-l2-1', title: 'تفاعلات النشادر', duration: '40:00', completed: false },
                    { id: 'chem-l2-2', title: 'تفاعلات النشادر', duration: '38:20', completed: false },
                    { id: 'chem-l2-3', title: 'التفاعلات الذهنى', duration: '42:15', completed: false },
                ],
            },
        ],
    },
    {
        id: 'phys',
        name: 'فيزياء',
        instructor: 'Ahmed Sami',
        instructorAvatar: '👨‍🏫',
        avatarBg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        levelCount: '1 مستوى',
        icon: '⚡',
        levels: [
            {
                id: 'phys-l1',
                name: 'المستوى 1',
                lectureCount: '3 محاضرات',
                lectures: [
                    { id: 'phys-l1-1', title: 'المحاضرة الاولى اساسيات الفيزياء', duration: '50:00', completed: false },
                    { id: 'phys-l1-2', title: 'المحاضرة الاولى قانون اوم الجزء الاول', duration: '55:30', completed: false },
                    { id: 'phys-l1-3', title: 'المحاضرة الثانية قانون اوم الجزء الثانية', duration: '48:20', completed: false },
                ],
            },
        ],
    },
    {
        id: 'eng',
        name: 'English',
        instructor: 'Sarah Wilson',
        instructorAvatar: '👩‍🏫',
        avatarBg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        levelCount: '1 مستوى',
        icon: '📝',
        levels: [
            {
                id: 'eng-l1',
                name: 'المستوى 1',
                lectureCount: '4 محاضرات',
                lectures: [
                    { id: 'eng-l1-1', title: 'Introduction to Grammar', duration: '35:00', completed: false },
                    { id: 'eng-l1-2', title: 'Vocabulary Building', duration: '40:15', completed: false },
                    { id: 'eng-l1-3', title: 'Reading Comprehension', duration: '38:40', completed: false },
                    { id: 'eng-l1-4', title: 'Writing Skills', duration: '42:00', completed: false },
                ],
            },
        ],
    },
];

const VideoViewer: React.FC<VideoViewerProps> = ({ onNavigate, lectureData }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({ 'chem': true });
    const [expandedLevels, setExpandedLevels] = useState<Record<string, boolean>>({ 'chem-l1': true });
    const [currentLecture, setCurrentLecture] = useState<Lecture>(courseSubjects[0].levels[0].lectures[0]);
    const [currentSubject, setCurrentSubject] = useState<Subject>(courseSubjects[0]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(80);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [notes, setNotes] = useState('');
    const [showNotes, setShowNotes] = useState(false);
    const progressInterval = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (lectureData) {
            const subject = courseSubjects[lectureData.subjectIndex];
            if (subject) {
                const level = subject.levels[lectureData.levelIndex];
                if (level) {
                    const lecture = level.lectures[lectureData.lectureIndex];
                    if (lecture) {
                        setCurrentLecture(lecture);
                        setCurrentSubject(subject);
                        setExpandedSubjects({ [subject.id]: true });
                        setExpandedLevels({ [level.id]: true });
                    }
                }
            }
        }
    }, [lectureData]);

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

    const toggleLevel = (id: string) => {
        setExpandedLevels(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // Find which level the current lecture belongs to
    const findCurrentLevelId = (): string => {
        for (const level of currentSubject.levels) {
            for (const lec of level.lectures) {
                if (lec.id === currentLecture.id) return level.id;
            }
        }
        return currentSubject.levels[0]?.id || '';
    };

    const selectLecture = (lecture: Lecture, subject: Subject) => {
        setCurrentLecture(lecture);
        setCurrentSubject(subject);
        setProgress(0);
        setIsPlaying(false);

        // Auto-expand the level that contains this lecture, collapse others
        const newExpandedLevels: Record<string, boolean> = {};
        for (const level of subject.levels) {
            const hasLecture = level.lectures.some(l => l.id === lecture.id);
            newExpandedLevels[level.id] = hasLecture;
        }
        setExpandedLevels(newExpandedLevels);
    };

    // Find next/previous lecture — ONLY within the current subject
    const findAdjacentLecture = (direction: 'next' | 'prev') => {
        const subject = currentSubject;
        for (let li = 0; li < subject.levels.length; li++) {
            for (let lci = 0; lci < subject.levels[li].lectures.length; lci++) {
                if (subject.levels[li].lectures[lci].id === currentLecture.id) {
                    if (direction === 'next') {
                        // Next in same level
                        if (lci + 1 < subject.levels[li].lectures.length) {
                            return { lecture: subject.levels[li].lectures[lci + 1], subject };
                        }
                        // First lecture of next level
                        if (li + 1 < subject.levels.length) {
                            return { lecture: subject.levels[li + 1].lectures[0], subject };
                        }
                    } else {
                        // Prev in same level
                        if (lci - 1 >= 0) {
                            return { lecture: subject.levels[li].lectures[lci - 1], subject };
                        }
                        // Last lecture of previous level
                        if (li - 1 >= 0) {
                            const prevLevel = subject.levels[li - 1];
                            return { lecture: prevLevel.lectures[prevLevel.lectures.length - 1], subject };
                        }
                    }
                }
            }
        }
        return null;
    };

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
                        {/* Video placeholder */}
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
                                <div style={{ fontSize: '11px', color: '#64748b' }}>{currentSubject.instructor} • {currentSubject.levelCount}</div>
                            </div>
                        </div>

                        {/* Levels list (only for current subject) */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
                            {currentSubject.levels.map((level) => {
                                const currentLevelId = findCurrentLevelId();
                                const isActiveLevel = level.id === currentLevelId;
                                return (
                                    <div key={level.id} style={{ marginBottom: '4px' }}>
                                        {/* Level Header */}
                                        <button
                                            onClick={() => toggleLevel(level.id)}
                                            style={{
                                                width: '100%',
                                                background: isActiveLevel ? 'rgba(56, 189, 248, 0.06)' : 'transparent',
                                                border: 'none',
                                                borderRadius: '10px',
                                                padding: '10px 14px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                fontFamily: "'Cairo', sans-serif",
                                            }}
                                            onMouseOver={e => { if (!isActiveLevel) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                                            onMouseOut={e => { if (!isActiveLevel) e.currentTarget.style.background = 'transparent'; }}
                                        >
                                            <svg
                                                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isActiveLevel ? '#38bdf8' : '#64748b'} strokeWidth="2"
                                                style={{
                                                    transform: expandedLevels[level.id] ? 'rotate(90deg)' : 'rotate(0deg)',
                                                    transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <span style={{
                                                fontSize: '12px',
                                                fontWeight: 700,
                                                color: isActiveLevel ? '#38bdf8' : '#94a3b8',
                                                background: isActiveLevel ? 'rgba(56, 189, 248, 0.15)' : 'rgba(56, 189, 248, 0.06)',
                                                padding: '3px 10px',
                                                borderRadius: '6px',
                                                transition: 'all 0.2s',
                                            }}>⚡ {level.name}</span>
                                            <span style={{ fontSize: '11px', color: '#475569', marginRight: 'auto' }}>{level.lectureCount}</span>
                                            {isActiveLevel && (
                                                <div style={{
                                                    width: '6px',
                                                    height: '6px',
                                                    borderRadius: '50%',
                                                    background: '#38bdf8',
                                                    boxShadow: '0 0 6px rgba(56, 189, 248, 0.5)',
                                                    flexShrink: 0,
                                                }} />
                                            )}
                                        </button>

                                        {/* Lectures within level */}
                                        {expandedLevels[level.id] && (
                                            <div style={{ paddingRight: '20px', animation: 'fadeIn 0.2s ease' }}>
                                                {level.lectures.map((lecture) => {
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
                                                                padding: '10px 12px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '10px',
                                                                cursor: 'pointer',
                                                                transition: 'all 0.15s',
                                                                marginBottom: '2px',
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
                                                                    width: '22px', height: '22px', borderRadius: '50%',
                                                                    background: 'linear-gradient(135deg, #10b981, #059669)',
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                    flexShrink: 0,
                                                                }}>
                                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                                                                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                                                                    </svg>
                                                                </div>
                                                            ) : isActive ? (
                                                                <div style={{
                                                                    width: '22px', height: '22px', borderRadius: '50%',
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
                                                                    width: '22px', height: '22px', borderRadius: '50%',
                                                                    border: '2px solid #334155',
                                                                    flexShrink: 0,
                                                                }} />
                                                            )}

                                                            {/* Lecture title */}
                                                            <div style={{ flex: 1, textAlign: 'right' }}>
                                                                <div style={{
                                                                    fontSize: '13px',
                                                                    color: isActive ? '#38bdf8' : lecture.completed ? '#64748b' : '#cbd5e1',
                                                                    fontWeight: isActive ? 700 : 400,
                                                                    textDecoration: lecture.completed ? 'line-through' : 'none',
                                                                }}>
                                                                    {lecture.title}
                                                                </div>
                                                            </div>

                                                            {/* Duration */}
                                                            <span style={{ fontSize: '11px', color: isActive ? '#38bdf8' : '#475569', flexShrink: 0 }}>{lecture.duration}</span>

                                                            {/* Play icon */}
                                                            {isActive ? (
                                                                <div style={{
                                                                    width: '20px', height: '20px',
                                                                    borderRadius: '4px',
                                                                    background: 'rgba(56, 189, 248, 0.2)',
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                    flexShrink: 0,
                                                                }}>
                                                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="#38bdf8"><path d="M8 5v14l11-7z" /></svg>
                                                                </div>
                                                            ) : (
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="#475569" style={{ flexShrink: 0 }}>
                                                                    <path d="M8 5v14l11-7z" />
                                                                </svg>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoViewer;
