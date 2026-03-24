import React, { useState, useEffect } from 'react';
import { Page } from '../App';
import { getProgress } from '../api/student.api';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  onNavigate: (page: Page, payload?: { courseId?: number; tab?: string }) => void;
  initialTab?: string;
  refreshKey?: number;
}

type Tab = 'dashboard' | 'courses' | 'profile';



// ── Icons ────────────────────────────────────────────────────
const IconGrid = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
);
const IconBook = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconLogout = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="16,17 21,12 16,7" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="21" y1="12" x2="9" y2="12" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconHome = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="9,22 9,12 15,12 15,22" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconBell = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconMenu = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const IconPlay = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="5,3 19,12 5,21" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
  </svg>
);

// ── Stat Card ────────────────────────────────────────────────
const StatCard = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <div className={`rounded-2xl border p-5 flex flex-col gap-1 transition-transform duration-200 hover:-translate-y-1 ${color}`}>
    <span className="text-2xl font-extrabold">{value}</span>
    <span className="text-xs text-slate-400 font-medium">{label}</span>
  </div>
);

// ── Progress Bar ─────────────────────────────────────────────
const ProgressBar = ({ pct }: { pct: number }) => (
  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
    <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-500" style={{ width: `${pct}%` }} />
  </div>
);

// ── Subject Card ─────────────────────────────────────────────
const SubjectCard = ({ subject, onNavigate }: { subject: any; onNavigate: Props['onNavigate'] }) => {
  const pct = Math.min(100, Math.round(subject.progress || 0));
  const lastDate = subject.lastAccessed
    ? new Date(subject.lastAccessed).toLocaleDateString('ar-EG')
    : 'لم يبدأ بعد';
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 hover:border-sky-500/20 hover:bg-white/[0.05] transition-all duration-300 cursor-default">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center shrink-0">
          <IconBook />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-slate-200 truncate">{subject.name}</h3>
          <p className="text-xs text-slate-500 mt-0.5">آخر تفاعل: {lastDate}</p>
        </div>
      </div>
      <div className="mb-4">
        <div className="flex justify-between mb-1.5">
          <span className="text-xs text-slate-500">إنجاز</span>
          <span className="text-xs font-bold text-sky-400">{pct}%</span>
        </div>
        <ProgressBar pct={pct} />
      </div>
      <button
        onClick={() => onNavigate('video-viewer', { courseId: subject.id })}
        className="w-full flex items-center justify-center gap-2 bg-sky-500/10 border border-sky-500/20 rounded-xl py-2.5 text-sky-400 text-sm font-bold hover:bg-sky-500/20 transition-colors duration-200 cursor-pointer"
      >
        <IconPlay />
        مواصلة التعلم
      </button>
    </div>
  );
};

// ── Sidebar ──────────────────────────────────────────────────
const Sidebar = ({ activeTab, setTab, user, studentName, studentInitials, onNavigate, logout }: {
  activeTab: Tab; setTab: (t: Tab) => void;
  user: any; studentName: string; studentInitials: string;
  onNavigate: Props['onNavigate']; logout: () => void;
}) => {
  const navItems: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'dashboard', label: 'لوحة التحكم', icon: <IconGrid /> },
    { key: 'courses',   label: 'كورساتي',      icon: <IconBook /> },
    { key: 'profile',   label: 'الملف الشخصي', icon: <IconUser /> },
  ];
  return (
    <aside className="w-64 shrink-0 bg-gradient-to-b from-[#0d1f3c] to-[#0a1628] border-l border-sky-500/[0.08] flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-white/[0.06]">
        <button onClick={() => onNavigate('home')} className="flex items-center gap-2.5 cursor-pointer bg-transparent border-none">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center">
            <IconBook />
          </div>
          <span className="text-base font-extrabold text-slate-200" style={{ fontFamily: "'Cairo', sans-serif" }}>المنصة التعليمية</span>
        </button>
      </div>
      {/* Avatar */}
      <div className="p-5 border-b border-white/[0.06] text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center text-xl font-extrabold text-white mx-auto mb-2.5 shadow-lg shadow-sky-500/30">
          {studentInitials}
        </div>
        <p className="text-sm font-bold text-slate-200">{studentName}</p>
        <p className="text-xs text-slate-500 mt-0.5">{user?.email || ''}</p>
      </div>
      {/* Nav */}
      <nav className="flex-1 p-3 flex flex-col gap-1">
        {navItems.map(item => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer border-none text-right
              ${activeTab === item.key
                ? 'bg-sky-500/10 text-sky-400 border-r-[3px] border-sky-400'
                : 'bg-transparent text-slate-400 hover:bg-white/[0.03] hover:text-slate-300'}`}
            style={{ fontFamily: "'Cairo', sans-serif" }}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>
      {/* Logout */}
      <div className="p-3 border-t border-white/[0.06]">
        <button
          onClick={() => { logout(); onNavigate('home'); }}
          className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/[0.08] text-red-400 text-sm font-semibold hover:bg-red-500/[0.15] transition-colors duration-200 cursor-pointer border-none"
          style={{ fontFamily: "'Cairo', sans-serif" }}
        >
          <IconLogout />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
};

// ── Main Component ───────────────────────────────────────────
const StudentDashboard: React.FC<Props> = ({ onNavigate, initialTab, refreshKey = 0 }) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>((initialTab as Tab) || 'dashboard');
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ totalCourses: 0, totalLectures: 0, completedLectures: 0, overallProgress: 0 });
  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => {
    setIsLoading(true);
    getProgress().then((res: any) => {
      // Backend wraps all responses in ApiResponse<T> → { success, data: { ... } }
      const data = res?.data ?? res;
      if (data) {
        setStats({
          totalCourses: data.totalSubjects || data.totalCourses || 0,
          totalLectures: data.totalLectures || 0,
          completedLectures: data.completedLectures || 0,
          overallProgress: data.overallProgress || 0,
        });
        if (Array.isArray(data.subjects)) setSubjects(data.subjects);
      }
    }).catch(console.error).finally(() => setIsLoading(false));
  }, [refreshKey]);

  const studentName = user?.name || 'طالب';
  const studentInitials = studentName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const filteredSubjects = subjects.filter(s => s.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  const sidebarProps = { activeTab, setTab: setActiveTab, user, studentName, studentInitials, onNavigate, logout };

  if (isLoading) {
    return (
      <div dir="rtl" className="flex min-h-screen bg-[#0a1628] items-center justify-center" style={{ fontFamily: "'Cairo', sans-serif" }}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-sky-500/20 border-t-sky-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300 text-sm font-semibold">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="flex min-h-screen bg-[#0a1628]" style={{ fontFamily: "'Cairo', sans-serif" }}>
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar {...sidebarProps} />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileSidebar && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileSidebar(false)} />
          <div className="relative z-10">
            <Sidebar {...sidebarProps} />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-gradient-to-r from-[#0d1f3c] to-[#132742] border-b border-sky-500/[0.08] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileSidebar(true)} className="md:hidden bg-white/5 border border-white/10 rounded-lg p-2 text-slate-400 cursor-pointer hover:bg-white/10 transition-colors">
              <IconMenu />
            </button>
            <h1 className="text-lg font-extrabold text-slate-200">مرحباً، {studentName}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate('home')} className="hidden sm:flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-slate-400 text-xs hover:bg-white/10 hover:text-slate-200 transition-all cursor-pointer">
              <IconHome /> الموقع الرئيسي
            </button>
            <div className="relative hidden sm:flex items-center">
              <input
                type="text" placeholder="البحث..." value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl py-2 pr-4 pl-9 text-slate-200 text-xs w-44 outline-none focus:border-sky-500/30 focus:w-56 transition-all placeholder:text-slate-500"
                style={{ fontFamily: "'Cairo', sans-serif" }}
              />
              <span className="absolute left-3 pointer-events-none"><IconSearch /></span>
            </div>
            <button className="relative bg-white/5 border border-white/10 rounded-xl p-2 text-slate-400 cursor-pointer hover:bg-white/10 transition-colors">
              <IconBell />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 border-2 border-[#0d1f3c]" />
            </button>
          </div>
        </header>

        {/* Page body */}
        <main className="flex-1 overflow-y-auto p-6">

          {/* Dashboard tab */}
          {activeTab === 'dashboard' && (
            <div className="animate-[fadeIn_0.3s_ease]">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatCard label="عدد الكورسات" value={String(stats.totalCourses)} color="bg-amber-500/10 border-amber-500/20 text-amber-400" />
                <StatCard label="المحاضرات" value={String(stats.totalLectures)} color="bg-sky-500/10 border-sky-500/20 text-sky-400" />
                <StatCard label="نسبة الإنجاز" value={`${Math.round(stats.overallProgress)}%`} color="bg-emerald-500/10 border-emerald-500/20 text-emerald-400" />
                <StatCard label="المحاضرات المكتملة" value={String(stats.completedLectures)} color="bg-purple-500/10 border-purple-500/20 text-purple-400" />
              </div>
              <div className="bg-[#0d1f3c]/80 border border-sky-500/[0.08] rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <IconBook />
                    <h2 className="text-base font-extrabold text-slate-200">محتواي التعليمي</h2>
                  </div>
                  <span className="text-xs text-slate-500">{subjects.length} مواد</span>
                </div>
                {subjects.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4"><IconBook /></div>
                    <h3 className="text-base font-bold text-slate-200 mb-1">لا توجد مواد بعد</h3>
                    <p className="text-sm text-slate-500">اشترك في دورات للبدء في التعلم</p>
                  </div>
                ) : (
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredSubjects.map(s => <SubjectCard key={s.id} subject={s} onNavigate={onNavigate} />)}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Courses tab */}
          {activeTab === 'courses' && (
            <div className="animate-[fadeIn_0.3s_ease]">
              <h2 className="text-lg font-extrabold text-slate-200 mb-5">كورساتي</h2>
              {subjects.length === 0 ? (
                <p className="text-slate-500 text-sm">لا توجد كورسات مسجلة بعد.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {subjects.map(s => <SubjectCard key={s.id} subject={s} onNavigate={onNavigate} />)}
                </div>
              )}
            </div>
          )}

          {/* Profile tab */}
          {activeTab === 'profile' && (
            <div className="animate-[fadeIn_0.3s_ease] max-w-xl">
              <h2 className="text-lg font-extrabold text-slate-200 mb-5">الملف الشخصي</h2>
              <div className="flex items-center gap-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 mb-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center text-3xl font-extrabold text-white shadow-lg shadow-sky-500/30">
                  {studentInitials}
                </div>
                <div>
                  <p className="text-lg font-extrabold text-slate-200">{studentName}</p>
                  <p className="text-xs text-slate-500 mt-0.5">طالب</p>
                </div>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 flex flex-col gap-4">
                {[{ label: 'الاسم الكامل', value: studentName, type: 'text' }, { label: 'البريد الإلكتروني', value: user?.email || '', type: 'email' }].map((f, i) => (
                  <div key={i}>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5">{f.label}</label>
                    <input defaultValue={f.value} type={f.type}
                      className="w-full px-4 py-3 bg-white/5 border border-white/[0.08] rounded-xl text-slate-200 text-sm outline-none focus:border-sky-500/30 transition-colors"
                      style={{ fontFamily: "'Cairo', sans-serif" }}
                    />
                  </div>
                ))}
                <button className="self-start bg-gradient-to-r from-sky-500 to-cyan-400 border-none rounded-xl px-7 py-3 text-white text-sm font-bold cursor-pointer hover:opacity-90 transition-opacity shadow-lg shadow-sky-500/30"
                  style={{ fontFamily: "'Cairo', sans-serif" }}>
                  حفظ التغييرات
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default StudentDashboard;
