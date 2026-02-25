
import React from 'react';
import { Page } from '../../App';
import { TeacherNavItem } from './types';
import { useAuth } from '../../contexts/AuthContext';

interface TeacherSidebarProps {
    activeNav: TeacherNavItem;
    onNavChange: (nav: TeacherNavItem) => void;
    onNavigate: (page: Page) => void;
}

const TeacherSidebar: React.FC<TeacherSidebarProps> = ({ activeNav, onNavChange, onNavigate }) => {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        onNavigate('home');
    };

    return (
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
            <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
                }}>🎓</div>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#e2e8f0' }}>لوحة المدرس</span>
            </div>

            {/* Teacher Profile */}
            <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                <div style={{
                    width: '60px', height: '60px', borderRadius: '16px',
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '22px', fontWeight: 800, color: '#fff',
                    margin: '0 auto 10px', boxShadow: '0 4px 20px rgba(245, 158, 11, 0.3)',
                }}>👨‍🏫</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#e2e8f0' }}>{user?.name || 'المدرس'}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{user?.email || ''}</div>
                <div style={{
                    marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px',
                    background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', padding: '4px 10px',
                    fontSize: '11px', color: '#f59e0b', fontWeight: 600,
                }}>⭐ مدرس معتمد</div>
            </div>

            {/* Navigation */}
            <div style={{ padding: '12px', flex: 1 }}>
                {([
                    { key: 'subjects' as const, label: 'موادي', icon: '📚' },
                    { key: 'students' as const, label: 'طلابي', icon: '👥' },
                    { key: 'analytics' as const, label: 'الإحصائيات', icon: '📈' },
                    { key: 'profile' as const, label: 'الملف الشخصي', icon: '👤' },
                ]).map((item) => (
                    <button
                        key={item.key}
                        onClick={() => onNavChange(item.key)}
                        style={{
                            width: '100%', padding: '12px 16px', borderRadius: '12px', border: 'none',
                            background: activeNav === item.key ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.1))' : 'transparent',
                            color: activeNav === item.key ? '#f59e0b' : '#94a3b8',
                            fontSize: '14px', fontWeight: activeNav === item.key ? 700 : 500,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px',
                            marginBottom: '4px', transition: 'all 0.2s', fontFamily: "'Cairo', sans-serif",
                            textAlign: 'right',
                            ...(activeNav === item.key ? { borderRight: '3px solid #f59e0b' } : {}),
                        }}
                        onMouseOver={e => { if (activeNav !== item.key) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                        onMouseOut={e => { if (activeNav !== item.key) e.currentTarget.style.background = 'transparent'; }}
                    >
                        <span style={{ fontSize: '18px' }}>{item.icon}</span>
                        {item.label}
                    </button>
                ))}
            </div>

            {/* Logout */}
            <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button onClick={handleLogout} style={{
                    width: '100%', padding: '12px 16px', borderRadius: '12px', border: 'none',
                    background: 'rgba(239, 68, 68, 0.08)', color: '#f87171', fontSize: '14px', fontWeight: 600,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                    transition: 'all 0.2s', fontFamily: "'Cairo', sans-serif",
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
};

export default TeacherSidebar;
