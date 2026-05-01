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
        key: 'accounting', label: 'الحسابات',
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 10h20" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    },
    {
        key: 'profile', label: 'الملف الشخصي',
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    },
];

const TeacherSidebar: React.FC<TeacherSidebarProps> = ({ activeNav, onNavChange, onNavigate }) => {
    const { user, logout } = useAuth();

    return (
        <aside className="w-64 shrink-0 bg-[#0f172a] border-l border-white/[0.06] flex flex-col h-full">
            {/* Logo */}
            <button
                onClick={() => onNavigate('home')}
                className="p-5 flex items-center gap-2.5 cursor-pointer bg-transparent border-none border-b border-white/[0.06] w-full hover:bg-white/[0.02] transition-colors duration-200"
            >
                <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-[#f59e0b] to-[#d97706] flex items-center justify-center shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M6 12v5c3 3 9 3 12 0v-5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                <span className="text-base font-extrabold text-slate-100 font-cairo">لوحة المدرس</span>
            </button>

            {/* Teacher info */}
            <div className="p-4 border-b border-white/[0.06] text-center">
                <div className="w-14 h-14 rounded-2xl mx-auto mb-2.5 bg-gradient-to-br from-[#f59e0b] to-[#d97706] flex items-center justify-center shadow-lg shadow-amber-500/25">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                <div className="text-sm font-bold text-slate-100 font-cairo">{user?.name || 'المدرس'}</div>
                <div className="text-xs text-slate-500 mt-0.5 font-cairo">{user?.email || ''}</div>
                <div className="mt-2 inline-flex items-center gap-1 bg-amber-500/10 rounded-full px-2.5 py-1 text-[11px] text-amber-400 font-semibold font-cairo">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    مدرس معتمد
                </div>
            </div>

            {/* Nav */}
            <nav className="p-2.5 flex-1 flex flex-col gap-0.5">
                {navItems.map(item => {
                    const isActive = activeNav === item.key;
                    return (
                        <button
                            key={item.key}
                            onClick={() => onNavChange(item.key)}
                            className={[
                                'w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer border-none text-right font-cairo',
                                isActive
                                    ? 'bg-amber-500/[0.12] text-amber-400 border-r-2 border-amber-400'
                                    : 'bg-transparent text-slate-400 hover:bg-white/[0.04] hover:text-slate-200',
                            ].join(' ')}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="p-2.5 border-t border-white/[0.06]">
                <button
                    onClick={() => { logout(); onNavigate('home'); }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-red-500/[0.07] hover:bg-red-500/[0.14] text-red-400 text-sm font-semibold transition-colors duration-200 cursor-pointer border-none font-cairo"
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
