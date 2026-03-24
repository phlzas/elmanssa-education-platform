import React from 'react';
import { Page } from '../../App';
import { TeacherNavItem } from './types';
import { useAuth } from '../../contexts/AuthContext';

interface TeacherSidebarProps {
    activeNav: TeacherNavItem;
    onNavChange: (nav: TeacherNavItem) => void;
    onNavigate: (page: Page, payload?: { tab?: string }) => void;
}

const navItems: { key: TeacherNavItem; label: string; icon: React.ReactNode }[] = [
    {
        key: 'subjects', label: 'موادي',
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" strokeLinecap="round" strokeLinejoin="round"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    },
    {
        key: 'students', label: 'طلابي',
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    },
    {
        key: 'analytics', label: 'الإحصائيات',
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" strokeLinecap="round"/><line x1="12" y1="20" x2="12" y2="4" strokeLinecap="round"/><line x1="6" y1="20" x2="6" y2="14" strokeLinecap="round"/></svg>,
    },
    {
        key: 'profile', label: 'الملف الشخصي',
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    },
];

const TeacherSidebar: React.FC<TeacherSidebarProps> = ({ activeNav, onNavChange, onNavigate }) => {
    const { user, logout } = useAuth();

    return (
        <aside style={{
            width: '260px', flexShrink: 0, height: '100%',
            background: '#0f172a',
            borderLeft: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', flexDirection: 'column',
        }}>
            {/* Logo */}
            <button onClick={() => onNavigate('home')} style={{
                padding: '20px 16px', display: 'flex', alignItems: 'center', gap: '10px',
                background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.06)',
                cursor: 'pointer', width: '100%',
            }}>
                <div style={{
                    width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M6 12v5c3 3 9 3 12 0v-5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#f1f5f9', fontFamily: "'Cairo', sans-serif" }}>
                    لوحة المدرس
                </span>
            </button>

            {/* Teacher info */}
            <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                <div style={{
                    width: '56px', height: '56px', borderRadius: '14px', margin: '0 auto 10px',
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 16px rgba(245,158,11,0.25)',
                }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#f1f5f9', fontFamily: "'Cairo', sans-serif" }}>
                    {user?.name || 'المدرس'}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', fontFamily: "'Cairo', sans-serif" }}>
                    {user?.email || ''}
                </div>
                <div style={{
                    marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '5px',
                    background: 'rgba(245,158,11,0.1)', borderRadius: '20px', padding: '3px 10px',
                    fontSize: '11px', color: '#f59e0b', fontWeight: 600, fontFamily: "'Cairo', sans-serif",
                }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    مدرس معتمد
                </div>
            </div>

            {/* Nav */}
            <nav style={{ padding: '10px', flex: 1 }}>
                {navItems.map(item => {
                    const isActive = activeNav === item.key;
                    return (
                        <button
                            key={item.key}
                            onClick={() => onNavChange(item.key)}
                            style={{
                                width: '100%', padding: '11px 14px', borderRadius: '10px',
                                border: 'none', marginBottom: '3px',
                                background: isActive ? 'rgba(245,158,11,0.12)' : 'transparent',
                                color: isActive ? '#f59e0b' : '#94a3b8',
                                fontSize: '14px', fontWeight: isActive ? 700 : 500,
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                                transition: 'all 0.15s', fontFamily: "'Cairo', sans-serif",
                                textAlign: 'right',
                                borderRight: isActive ? '3px solid #f59e0b' : '3px solid transparent',
                            }}
                            onMouseOver={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                            onMouseOut={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            {/* Logout */}
            <div style={{ padding: '10px 10px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button
                    onClick={() => { logout(); onNavigate('home'); }}
                    style={{
                        width: '100%', padding: '11px 14px', borderRadius: '10px', border: 'none',
                        background: 'rgba(239,68,68,0.07)', color: '#f87171',
                        fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '10px',
                        transition: 'background 0.15s', fontFamily: "'Cairo', sans-serif",
                    }}
                    onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.14)'; }}
                    onMouseOut={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.07)'; }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" strokeLinecap="round" strokeLinejoin="round"/>
                        <polyline points="16,17 21,12 16,7" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="21" y1="12" x2="9" y2="12" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    تسجيل الخروج
                </button>
            </div>
        </aside>
    );
};

export default TeacherSidebar;
