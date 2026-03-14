import React, { useState, useEffect } from 'react';
import { Page } from '../App';
import { fetchStudentEnrollments, fetchStudentProgress } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface StudentDashboardProps {
    onNavigate: (page: Page, payload?: { courseId?: number; tab?: string }) => void;
    initialTab?: string;
}

const TOKEN_KEY = 'elmanssa_auth_token';

const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate, initialTab }) => {
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeNav, setActiveNav] = useState<'dashboard' | 'courses' | 'profile'>(
        (initialTab as 'dashboard' | 'courses' | 'profile') || 'dashboard'
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [mobileSidebar, setMobileSidebar] = useState(false);

    const [isLoading, setIsLoading] = useState(true);
    const [apiStats, setApiStats] = useState<any>(null);
    const [apiSubjects, setApiSubjects] = useState<any[]>([]);

    useEffect(() => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) {
            setIsLoading(false);
            return;
        }

        const loadData = async () => {
            setIsLoading(true);
            try {
                const progressData = await fetchStudentProgress(token);
                if (progressData) {
                    setApiStats(progressData);
                    if (progressData.subjects && Array.isArray(progressData.subjects)) {
                        setApiSubjects(progressData.subjects);
                    }
                }
            } catch (err) {
                console.error('Error fetching student progress', err);
            }
            setIsLoading(false);
        };

        loadData();
    }, []);

    const totalLectures = apiStats?.totalLectures || 0;
    const completedLectures = apiStats?.completedLectures || 0;
    const progressPercent = apiStats?.overallProgress ? Math.round(apiStats.overallProgress) : 0;
    const totalCourses = apiStats?.totalCourses || 0;

    const studentName = user?.name || 'D4';
    const studentInitials = studentName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

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
                <button
                    onClick={() => onNavigate('home')}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                >
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
                    <span style={{ fontSize: '16px', fontWeight: 800, color: '#e2e8f0', fontFamily: "'Cairo', sans-serif" }}>المنصة التعليمية</span>
                </button>
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
                    {studentInitials}
                </div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#e2e8f0' }}>{studentName}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{user?.email || ''}</div>
            </div>

            {/* Navigation */}
            <div style={{ padding: '12px', flex: 1 }}>
            {[
                    {
                        key: 'dashboard' as const, label: 'لوحة التحكم', active: activeNav === 'dashboard',
                        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>,
                    },
                    {
                        key: 'courses' as const, label: 'كورساتي', active: activeNav === 'courses',
                        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" strokeLinecap="round" strokeLinejoin="round" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" strokeLinecap="round" strokeLinejoin="round" /></svg>,
                    },
                    {
                        key: 'profile' as const, label: 'الملف الشخصي', active: activeNav === 'profile',
                        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" /></svg>,
                    },
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
                        <span style={{ display: 'flex' }}>{item.icon}</span>
                        {item.label}
                    </button>
                ))}
            </div>

            {/* Logout */}
            <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button
                    onClick={() => {
                        logout();
                        onNavigate('home');
                    }}
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

    if (isLoading) {
        return (
            <div dir="rtl" style={{
                display: 'flex', minHeight: '100vh', background: '#0a1628',
                fontFamily: "'Cairo', sans-serif", alignItems: 'center', justifyContent: 'center',
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '52px', height: '52px', borderRadius: '50%',
                        border: '4px solid rgba(56, 189, 248, 0.15)',
                        borderTopColor: '#38bdf8',
                        animation: 'dashSpin 0.8s linear infinite',
                        margin: '0 auto 20px',
                    }} />
                    <div style={{ color: '#e2e8f0', fontSize: '16px', fontWeight: 600 }}>جاري تحميل البيانات...</div>
                </div>
                <style>{`@keyframes dashSpin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

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
                @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
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
                            مرحبا، {studentName} <span style={{ fontSize: '22px' }}>👋</span>
                        </h1>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {/* Back to site */}
                        <button
                            onClick={() => onNavigate('home')}
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '10px',
                                padding: '8px 14px',
                                color: '#94a3b8',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '13px',
                                fontFamily: "'Cairo', sans-serif",
                                transition: 'all 0.2s',
                            }}
                            onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#e2e8f0'; }}
                            onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#94a3b8'; }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" />
                                <polyline points="9,22 9,12 15,12 15,22" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            الموقع الرئيسي
                        </button>
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
                    {activeNav === 'dashboard' && (
                        <div style={{ animation: 'fadeIn 0.3s ease' }}>
                            {/* Stats Cards */}
                            <div className="stats-grid" style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(4, 1fr)',
                                gap: '16px',
                                marginBottom: '24px',
                            }}>
                                {[
                                    {
                                        label: 'عدد الكورسات',
                                        value: totalCourses.toString(),
                                        icon: '🎓',
                                        color: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05))',
                                        borderColor: 'rgba(245, 158, 11, 0.2)',
                                        valueColor: '#f59e0b',
                                    },
                                    {
                                        label: 'المحاضرات',
                                        value: totalLectures.toString(),
                                        icon: '🎬',
                                        color: 'linear-gradient(135deg, rgba(14, 165, 233, 0.15), rgba(14, 165, 233, 0.05))',
                                        borderColor: 'rgba(14, 165, 233, 0.2)',
                                        valueColor: '#38bdf8',
                                    },
                                    {
                                        label: 'نسبة الإنجاز الإجمالية',
                                        value: `${progressPercent}%`,
                                        icon: '📈',
                                        color: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05))',
                                        borderColor: 'rgba(34, 197, 94, 0.2)',
                                        valueColor: '#22c55e',
                                    },
                                    {
                                        label: 'المحاضرات المكتملة',
                                        value: completedLectures.toString(),
                                        icon: '✅',
                                        color: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(168, 85, 247, 0.05))',
                                        borderColor: 'rgba(168, 85, 247, 0.2)',
                                        valueColor: '#a855f7',
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
                                        <span>{apiSubjects.length} مواد</span>
                                    </div>
                                </div>

                                {/* Subjects List */}
                                {apiSubjects.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                                        <div style={{ fontSize: '60px', marginBottom: '16px' }}>📭</div>
                                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#e2e8f0', margin: '0 0 8px' }}>لا توجد مواد بعد</h3>
                                        <p style={{ fontSize: '14px', color: '#64748b', margin: '0' }}>اشترك في دورات للبدء في التعلم</p>
                                    </div>
                                ) : (
                                    <div style={{ padding: '16px' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                                            {apiSubjects.map((subject: any) => {
                                                const pct = Math.min(100, Math.round(subject.progress || 0));
                                                return (
                                                    <div key={subject.id} style={{
                                                        background: 'rgba(255,255,255,0.03)',
                                                        border: '1px solid rgba(255,255,255,0.06)',
                                                        borderRadius: '16px',
                                                        padding: '20px',
                                                        transition: 'all 0.3s',
                                                    }}
                                                        onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.2)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                                                        onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                                                    >
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                                            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                                                                📚
                                                            </div>
                                                            <div style={{ flex: 1 }}>
                                                                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#e2e8f0', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                                                    {subject.name}
                                                                </h3>
                                                                <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>
                                                                    اخر تفاعل: {subject.lastAccessed ? new Date(subject.lastAccessed).toLocaleDateString('ar-EG') : 'لم يبدأ بعد'}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div style={{ marginBottom: '16px' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                                <span style={{ fontSize: '12px', color: '#64748b' }}>إنجاز</span>
                                                                <span style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8' }}>{pct}%</span>
                                                            </div>
                                                            <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                                                                <div style={{ height: '100%', width: `${pct}%`, borderRadius: '4px', background: 'linear-gradient(90deg, #0ea5e9, #06b6d4)' }} />
                                                            </div>
                                                        </div>

                                                        <button
                                                            onClick={() => onNavigate('video-viewer', { courseId: subject.id })}
                                                            style={{
                                                                width: '100%',
                                                                background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1), rgba(6, 182, 212, 0.1))',
                                                                border: '1px solid rgba(56, 189, 248, 0.2)',
                                                                borderRadius: '10px',
                                                                padding: '10px',
                                                                color: '#38bdf8',
                                                                fontSize: '13px',
                                                                fontWeight: 700,
                                                                cursor: 'pointer',
                                                                fontFamily: "'Cairo', sans-serif",
                                                                transition: 'all 0.2s',
                                                            }}
                                                            onMouseOver={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(6, 182, 212, 0.2))'; }}
                                                            onMouseOut={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(56, 189, 248, 0.1), rgba(6, 182, 212, 0.1))'; }}
                                                        >
                                                            مواصلة التعلم 📺
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeNav === 'courses' && (
                        <div style={{ animation: 'fadeIn 0.3s ease' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#e2e8f0', margin: '0 0 20px' }}>📚 كورساتي</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                                {apiSubjects.map((subject: any) => {
                                    const pct = Math.min(100, Math.round(subject.progress || 0));
                                    return (
                                        <div key={subject.id} style={{
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(255,255,255,0.06)',
                                            borderRadius: '16px',
                                            padding: '20px',
                                            transition: 'all 0.3s',
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                                                    📚
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#e2e8f0', margin: 0 }}>
                                                        {subject.name}
                                                    </h3>
                                                </div>
                                            </div>
                                            <div style={{ marginBottom: '16px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                    <span style={{ fontSize: '12px', color: '#64748b' }}>إنجاز</span>
                                                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8' }}>{pct}%</span>
                                                </div>
                                                <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                                                    <div style={{ height: '100%', width: `${pct}%`, borderRadius: '4px', background: 'linear-gradient(90deg, #0ea5e9, #06b6d4)' }} />
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => onNavigate('video-viewer', { courseId: subject.id })}
                                                style={{
                                                    width: '100%',
                                                    background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1), rgba(6, 182, 212, 0.1))',
                                                    border: '1px solid rgba(56, 189, 248, 0.2)',
                                                    borderRadius: '10px',
                                                    padding: '10px',
                                                    color: '#38bdf8',
                                                    fontSize: '13px',
                                                    fontWeight: 700,
                                                    cursor: 'pointer',
                                                    fontFamily: "'Cairo', sans-serif",
                                                    transition: 'all 0.2s',
                                                }}
                                            >
                                                مواصلة التعلم 📺
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {activeNav === 'profile' && (
                        <div style={{ animation: 'fadeIn 0.3s ease', maxWidth: '700px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#e2e8f0', margin: '0 0 20px' }}>👤 الملف الشخصي</h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
                                <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', boxShadow: '0 4px 20px rgba(14,165,233,0.3)', color: '#fff' }}>
                                    {studentInitials}
                                </div>
                                <div>
                                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#e2e8f0' }}>{studentName}</div>
                                    <div style={{ fontSize: '13px', color: '#64748b' }}>طالب</div>
                                </div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {[
                                    { label: 'الاسم الكامل', value: studentName, type: 'text' },
                                    { label: 'البريد الإلكتروني', value: user?.email || '', type: 'email' },
                                ].map((f, i) => (
                                    <div key={i}>
                                        <label style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8', marginBottom: '6px', display: 'block' }}>{f.label}</label>
                                        <input defaultValue={f.value} type={f.type} style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#e2e8f0', fontSize: '14px', fontFamily: "'Cairo', sans-serif", outline: 'none' }} />
                                    </div>
                                ))}
                                <button style={{ alignSelf: 'flex-start', background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)', border: 'none', borderRadius: '12px', padding: '12px 28px', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Cairo', sans-serif", boxShadow: '0 4px 15px rgba(14,165,233,0.3)' }}>💾 حفظ التغييرات</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
