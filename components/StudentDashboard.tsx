
import React, { useState, useEffect } from 'react';
import { Page } from '../App';

interface StudentDashboardProps {
    onNavigate: (page: Page, payload?: { courseId?: number }) => void;
}

interface Lecture {
    id: string;
    title: string;
    duration: string;
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
    {
        id: 'math',
        name: 'رياضة عامة',
        instructor: 'محمد حسن',
        instructorAvatar: '📐',
        avatarBg: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
        levelCount: '1 مستوى',
        icon: '📐',
        levels: [
            {
                id: 'math-l1',
                name: 'المستوى 1',
                lectureCount: '3 محاضرات',
                lectures: [
                    { id: 'math-l1-1', title: 'التفاضل والتكامل', duration: '55:00', completed: false },
                    { id: 'math-l1-2', title: 'المصفوفات والمحددات', duration: '48:00', completed: false },
                    { id: 'math-l1-3', title: 'الجبر الخطي', duration: '52:30', completed: false },
                ],
            },
        ],
    },
    {
        id: 'smath',
        name: 'الرياضة الخاصة',
        instructor: 'د. أحمد',
        instructorAvatar: '🧮',
        avatarBg: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
        levelCount: '1 مستوى',
        icon: '🧮',
        levels: [
            {
                id: 'smath-l1',
                name: 'المستوى 1',
                lectureCount: '2 محاضرات',
                lectures: [
                    { id: 'smath-l1-1', title: 'الاحتمالات والإحصاء', duration: '60:00', completed: false },
                    { id: 'smath-l1-2', title: 'المعادلات التفاضلية', duration: '55:00', completed: false },
                ],
            },
        ],
    },
    {
        id: 'mech',
        name: 'الميكانيكا',
        instructor: 'م. ياسر',
        instructorAvatar: '⚙️',
        avatarBg: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
        levelCount: '1 مستوى',
        icon: '⚙️',
        levels: [
            {
                id: 'mech-l1',
                name: 'المستوى 1',
                lectureCount: '3 محاضرات',
                lectures: [
                    { id: 'mech-l1-1', title: 'الاستاتيكا', duration: '50:00', completed: false },
                    { id: 'mech-l1-2', title: 'الديناميكا', duration: '55:00', completed: false },
                    { id: 'mech-l1-3', title: 'ميكانيكا المواد', duration: '48:00', completed: false },
                ],
            },
        ],
    },
];

const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeNav, setActiveNav] = useState<'dashboard' | 'courses' | 'profile'>('dashboard');
    const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({ 'chem': true });
    const [expandedLevels, setExpandedLevels] = useState<Record<string, boolean>>({ 'chem-l1': true });
    const [searchQuery, setSearchQuery] = useState('');
    const [mobileSidebar, setMobileSidebar] = useState(false);

    // Calculate computed stats
    const totalLectures = courseSubjects.reduce((acc, sub) => acc + sub.levels.reduce((a, l) => a + l.lectures.length, 0), 0);
    const completedLectures = courseSubjects.reduce((acc, sub) => acc + sub.levels.reduce((a, l) => a + l.lectures.filter(lec => lec.completed).length, 0), 0);
    const progressPercent = totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;

    const toggleSubject = (id: string) => {
        setExpandedSubjects(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleLevel = (id: string) => {
        setExpandedLevels(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleLectureClick = (subjectIndex: number, levelIndex: number, lectureIndex: number) => {
        // Navigate to video viewer
        onNavigate('video-viewer' as Page, {
            courseId: subjectIndex * 100 + levelIndex * 10 + lectureIndex,
        });
    };

    // Sidebar component (reused for mobile & desktop)
    const SidebarContent = () => (
        <div style={{
            width: '260px',
            background: 'linear-gradient(180deg, #0d1f3c 0%, #0a1628 100%)',
            borderLeft: '1px solid rgba(56, 189, 248, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            flexShrink: 0,
        }}>
            {/* Logo */}
            <div style={{
                padding: '20px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                    }}>
                        🎓
                    </div>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: '#e2e8f0' }}>المنصة التعليمية</span>
                </div>
            </div>

            {/* User Profile */}
            <div style={{
                padding: '20px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                textAlign: 'center',
            }}>
                <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px',
                    fontWeight: 800,
                    color: '#fff',
                    margin: '0 auto 10px',
                    boxShadow: '0 4px 20px rgba(14, 165, 233, 0.3)',
                }}>
                    D4
                </div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#e2e8f0' }}>D4</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>D4@dream.com</div>
            </div>

            {/* Navigation */}
            <div style={{ padding: '12px', flex: 1 }}>
                {[
                    { key: 'dashboard' as const, label: 'لوحة التحكم', icon: '📊', active: activeNav === 'dashboard' },
                    { key: 'courses' as const, label: 'كورساتي', icon: '📚', active: activeNav === 'courses' },
                    { key: 'profile' as const, label: 'الملف الشخصي', icon: '👤', active: activeNav === 'profile' },
                ].map((item) => (
                    <button
                        key={item.key}
                        onClick={() => setActiveNav(item.key)}
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            border: 'none',
                            background: item.active
                                ? 'linear-gradient(135deg, rgba(14, 165, 233, 0.15), rgba(6, 182, 212, 0.1))'
                                : 'transparent',
                            color: item.active ? '#38bdf8' : '#94a3b8',
                            fontSize: '14px',
                            fontWeight: item.active ? 700 : 500,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '4px',
                            transition: 'all 0.2s',
                            fontFamily: "'Cairo', sans-serif",
                            textAlign: 'right',
                            ...(item.active ? { borderRight: '3px solid #38bdf8' } : {}),
                        }}
                        onMouseOver={e => {
                            if (!item.active) e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                        }}
                        onMouseOut={e => {
                            if (!item.active) e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        <span style={{ fontSize: '18px' }}>{item.icon}</span>
                        {item.label}
                    </button>
                ))}
            </div>

            {/* Logout */}
            <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button
                    onClick={() => onNavigate('home')}
                    style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: 'none',
                        background: 'rgba(239, 68, 68, 0.08)',
                        color: '#f87171',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        transition: 'all 0.2s',
                        fontFamily: "'Cairo', sans-serif",
                    }}
                    onMouseOver={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'; }}
                    onMouseOut={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'; }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" strokeLinecap="round" strokeLinejoin="round" />
                        <polyline points="16,17 21,12 16,7" strokeLinecap="round" strokeLinejoin="round" />
                        <line x1="21" y1="12" x2="9" y2="12" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    تسجيل الخروج
                </button>
            </div>
        </div>
    );

    return (
        <div dir="rtl" style={{
            display: 'flex',
            minHeight: '100vh',
            background: '#0a1628',
            fontFamily: "'Cairo', sans-serif",
            position: 'relative',
        }}>
            {/* Desktop Sidebar */}
            <div className="dashboard-sidebar" style={{ display: 'none' }}>
                <SidebarContent />
            </div>
            <style>{`
                @media (min-width: 769px) {
                    .dashboard-sidebar { display: flex !important; }
                    .mobile-menu-btn { display: none !important; }
                }
                @media (max-width: 768px) {
                    .dashboard-sidebar { display: none !important; }
                    .mobile-menu-btn { display: flex !important; }
                    .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
                }
            `}</style>

            {/* Mobile Sidebar Overlay */}
            {mobileSidebar && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 200,
                    display: 'flex',
                }}>
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(0,0,0,0.5)',
                            backdropFilter: 'blur(4px)',
                        }}
                        onClick={() => setMobileSidebar(false)}
                    />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <SidebarContent />
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                {/* Top Header */}
                <div style={{
                    background: 'linear-gradient(90deg, #0d1f3c 0%, #132742 100%)',
                    borderBottom: '1px solid rgba(56, 189, 248, 0.08)',
                    padding: '16px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'sticky',
                    top: 0,
                    zIndex: 40,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {/* Mobile menu button */}
                        <button
                            className="mobile-menu-btn"
                            onClick={() => setMobileSidebar(true)}
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                padding: '8px',
                                color: '#94a3b8',
                                cursor: 'pointer',
                                alignItems: 'center',
                                justifyContent: 'center',
                                display: 'none',
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                            </svg>
                        </button>
                        <h1 style={{
                            fontSize: '20px',
                            fontWeight: 800,
                            color: '#e2e8f0',
                            margin: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}>
                            مرحبا، D4 <span style={{ fontSize: '22px' }}>👋</span>
                        </h1>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {/* Search */}
                        <div style={{
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                        }}>
                            <input
                                type="text"
                                placeholder="البحث..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '10px',
                                    padding: '8px 16px 8px 36px',
                                    color: '#e2e8f0',
                                    fontSize: '13px',
                                    width: '200px',
                                    outline: 'none',
                                    fontFamily: "'Cairo', sans-serif",
                                    transition: 'all 0.3s',
                                }}
                                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.3)'; e.currentTarget.style.width = '260px'; }}
                                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.width = '200px'; }}
                            />
                            <svg style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                            </svg>
                        </div>

                        {/* Golden Plan Badge */}
                        <div style={{
                            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                            borderRadius: '20px',
                            padding: '6px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '12px',
                            fontWeight: 700,
                            color: '#fff',
                        }}>
                            👑 الباقة الذهبية
                        </div>

                        {/* Notifications */}
                        <button style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '10px',
                            padding: '8px',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            position: 'relative',
                        }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <div style={{
                                position: 'absolute',
                                top: '4px',
                                right: '4px',
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: '#ef4444',
                                border: '2px solid #0d1f3c',
                            }} />
                        </button>
                    </div>
                </div>

                {/* Page Content wrapped in scroll area */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                    {/* Stats Cards */}
                    <div className="stats-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '16px',
                        marginBottom: '24px',
                    }}>
                        {[
                            {
                                label: 'المحاضرات',
                                value: totalLectures.toString(),
                                icon: '🎬',
                                color: 'linear-gradient(135deg, rgba(14, 165, 233, 0.15), rgba(14, 165, 233, 0.05))',
                                borderColor: 'rgba(14, 165, 233, 0.2)',
                                valueColor: '#38bdf8',
                            },
                            {
                                label: 'نسبة الإنجاز',
                                value: `${progressPercent}%`,
                                icon: '📈',
                                color: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05))',
                                borderColor: 'rgba(34, 197, 94, 0.2)',
                                valueColor: '#22c55e',
                            },
                            {
                                label: 'المكتملة',
                                value: completedLectures.toString(),
                                icon: '✅',
                                color: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(168, 85, 247, 0.05))',
                                borderColor: 'rgba(168, 85, 247, 0.2)',
                                valueColor: '#a855f7',
                            },
                            {
                                label: 'الإنجازات',
                                value: '0',
                                icon: '🏆',
                                color: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05))',
                                borderColor: 'rgba(245, 158, 11, 0.2)',
                                valueColor: '#f59e0b',
                            },
                        ].map((stat, idx) => (
                            <div key={idx} style={{
                                background: stat.color,
                                border: `1px solid ${stat.borderColor}`,
                                borderRadius: '16px',
                                padding: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                cursor: 'default',
                            }}
                                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 25px ${stat.borderColor}`; }}
                                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                            >
                                <div style={{ fontSize: '28px' }}>{stat.icon}</div>
                                <div>
                                    <div style={{ fontSize: '24px', fontWeight: 800, color: stat.valueColor }}>{stat.value}</div>
                                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>{stat.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Course Content Section */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(13, 31, 60, 0.8), rgba(10, 22, 40, 0.9))',
                        border: '1px solid rgba(56, 189, 248, 0.08)',
                        borderRadius: '20px',
                        overflow: 'hidden',
                    }}>
                        {/* Section Header */}
                        <div style={{
                            padding: '20px 24px',
                            borderBottom: '1px solid rgba(255,255,255,0.06)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '20px' }}>📚</span>
                                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#e2e8f0', margin: 0 }}>محتواي التعليمي</h2>
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: '#64748b',
                                fontSize: '13px',
                            }}>
                                <span>{courseSubjects.length} مواد</span>
                                <span>•</span>
                                <span>{totalLectures} محاضرة</span>
                            </div>
                        </div>

                        {/* Main Course Title */}
                        <div style={{
                            padding: '16px 24px',
                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                        }}>
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '16px',
                            }}>🎓</div>
                            <div>
                                <div style={{ fontSize: '15px', fontWeight: 700, color: '#e2e8f0' }}>
                                    معادلة كلية الهندسة و الحاسبات بالعربية
                                </div>
                                <div style={{ fontSize: '12px', color: '#64748b' }}>6 مواد</div>
                            </div>
                        </div>

                        {/* Subjects List */}
                        <div style={{ padding: '8px 12px 12px' }}>
                            {courseSubjects.map((subject, subjectIndex) => (
                                <div key={subject.id} style={{
                                    marginBottom: '4px',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                }}>
                                    {/* Subject Header */}
                                    <button
                                        onClick={() => toggleSubject(subject.id)}
                                        style={{
                                            width: '100%',
                                            padding: '14px 16px',
                                            background: expandedSubjects[subject.id]
                                                ? 'rgba(56, 189, 248, 0.04)'
                                                : 'transparent',
                                            border: 'none',
                                            borderRadius: expandedSubjects[subject.id] ? '12px 12px 0 0' : '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            fontFamily: "'Cairo', sans-serif",
                                        }}
                                        onMouseOver={e => {
                                            if (!expandedSubjects[subject.id]) e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                                        }}
                                        onMouseOut={e => {
                                            if (!expandedSubjects[subject.id]) e.currentTarget.style.background = 'transparent';
                                        }}
                                    >
                                        {/* Expand Arrow */}
                                        <svg
                                            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"
                                            style={{
                                                transform: expandedSubjects[subject.id] ? 'rotate(90deg)' : 'rotate(0deg)',
                                                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                flexShrink: 0,
                                            }}
                                        >
                                            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>

                                        {/* Subject Info */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: '14px', fontWeight: 700, color: '#e2e8f0' }}>{subject.name}</div>
                                            <div style={{
                                                background: 'rgba(56, 189, 248, 0.1)',
                                                borderRadius: '8px',
                                                padding: '2px 8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                            }}>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="#38bdf8"><path d="M8 5v14l11-7z" /></svg>
                                                <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 600 }}>{subject.levelCount}</span>
                                            </div>
                                        </div>

                                        {/* Instructor */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>{subject.instructor}</span>
                                            <div style={{
                                                width: '28px',
                                                height: '28px',
                                                borderRadius: '8px',
                                                background: subject.avatarBg,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '14px',
                                            }}>
                                                {subject.instructorAvatar}
                                            </div>
                                        </div>
                                    </button>

                                    {/* Expanded Content */}
                                    {expandedSubjects[subject.id] && (
                                        <div style={{
                                            background: 'rgba(255,255,255,0.015)',
                                            borderRadius: '0 0 12px 12px',
                                            paddingBottom: '8px',
                                            animation: 'fadeIn 0.3s ease',
                                        }}>
                                            {subject.levels.map((level, levelIndex) => (
                                                <div key={level.id} style={{ paddingRight: '28px' }}>
                                                    {/* Level Header */}
                                                    <button
                                                        onClick={() => toggleLevel(level.id)}
                                                        style={{
                                                            width: '100%',
                                                            padding: '10px 16px',
                                                            background: 'transparent',
                                                            border: 'none',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '10px',
                                                            cursor: 'pointer',
                                                            fontFamily: "'Cairo', sans-serif",
                                                        }}
                                                    >
                                                        <svg
                                                            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"
                                                            style={{
                                                                transform: expandedLevels[level.id] ? 'rotate(90deg)' : 'rotate(0deg)',
                                                                transition: 'transform 0.2s',
                                                                flexShrink: 0,
                                                            }}
                                                        >
                                                            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                        <span style={{
                                                            fontSize: '12px',
                                                            fontWeight: 700,
                                                            color: '#38bdf8',
                                                            background: 'rgba(56, 189, 248, 0.1)',
                                                            padding: '3px 10px',
                                                            borderRadius: '6px',
                                                        }}>⚡ {level.name}</span>
                                                        <span style={{ fontSize: '11px', color: '#475569' }}>{level.lectureCount}</span>
                                                    </button>

                                                    {/* Lectures */}
                                                    {expandedLevels[level.id] && (
                                                        <div style={{
                                                            paddingRight: '24px',
                                                            animation: 'fadeIn 0.2s ease',
                                                        }}>
                                                            {level.lectures.map((lecture, lectureIndex) => (
                                                                <button
                                                                    key={lecture.id}
                                                                    onClick={() => handleLectureClick(subjectIndex, levelIndex, lectureIndex)}
                                                                    style={{
                                                                        width: '100%',
                                                                        padding: '10px 16px',
                                                                        background: 'transparent',
                                                                        border: 'none',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '10px',
                                                                        cursor: 'pointer',
                                                                        borderRadius: '8px',
                                                                        transition: 'all 0.15s',
                                                                        fontFamily: "'Cairo', sans-serif",
                                                                        marginBottom: '2px',
                                                                    }}
                                                                    onMouseOver={e => {
                                                                        e.currentTarget.style.background = 'rgba(56, 189, 248, 0.06)';
                                                                    }}
                                                                    onMouseOut={e => {
                                                                        e.currentTarget.style.background = 'transparent';
                                                                    }}
                                                                >
                                                                    {/* Video icon */}
                                                                    <div style={{
                                                                        width: '22px',
                                                                        height: '22px',
                                                                        borderRadius: '6px',
                                                                        background: lecture.completed
                                                                            ? 'linear-gradient(135deg, #10b981, #059669)'
                                                                            : 'rgba(56, 189, 248, 0.1)',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        flexShrink: 0,
                                                                    }}>
                                                                        {lecture.completed ? (
                                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                                                                                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                                                                            </svg>
                                                                        ) : (
                                                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="#38bdf8">
                                                                                <path d="M8 5v14l11-7z" />
                                                                            </svg>
                                                                        )}
                                                                    </div>

                                                                    {/* Lecture title */}
                                                                    <span style={{
                                                                        flex: 1,
                                                                        textAlign: 'right',
                                                                        fontSize: '13px',
                                                                        color: lecture.completed ? '#64748b' : '#cbd5e1',
                                                                        fontWeight: 400,
                                                                        textDecoration: lecture.completed ? 'line-through' : 'none',
                                                                    }}>
                                                                        {lecture.title}
                                                                    </span>

                                                                    {/* Duration */}
                                                                    <span style={{
                                                                        fontSize: '11px',
                                                                        color: '#475569',
                                                                        flexShrink: 0,
                                                                    }}>
                                                                        {lecture.duration}
                                                                    </span>

                                                                    {/* Play indicator */}
                                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#475569" style={{ flexShrink: 0 }}>
                                                                        <path d="M8 5v14l11-7z" />
                                                                    </svg>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
