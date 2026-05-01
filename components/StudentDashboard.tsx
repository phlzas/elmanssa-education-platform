import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Page } from '../App';
import { getProgress } from '../api/student.api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

// ── Notification types ───────────────────────────────────────
type NotifType = 'payment' | 'lecture' | 'enrollment';
interface Notification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: number; // timestamp ms
  read: boolean;
}

const NOTIF_KEY = (userId: string) => `notifs_${userId}`;

function loadNotifs(userId: string): Notification[] {
  try { return JSON.parse(localStorage.getItem(NOTIF_KEY(userId)) || '[]'); }
  catch { return []; }
}
function saveNotifs(userId: string, notifs: Notification[]) {
  localStorage.setItem(NOTIF_KEY(userId), JSON.stringify(notifs.slice(0, 50)));
}
function addNotif(userId: string, n: Omit<Notification, 'id' | 'time' | 'read'>): Notification[] {
  const existing = loadNotifs(userId);
  const notif: Notification = { ...n, id: Date.now().toString(), time: Date.now(), read: false };
  const updated = [notif, ...existing];
  saveNotifs(userId, updated);
  return updated;
}
function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'الآن';
  if (m < 60) return `منذ ${m} دقيقة`;
  const h = Math.floor(m / 60);
  if (h < 24) return `منذ ${h} ساعة`;
  return `منذ ${Math.floor(h / 24)} يوم`;
}

const LECTURE_SNAP_KEY = (userId: string) => `lec_snap_${userId}`;

interface Props {
  onNavigate: (page: Page, payload?: { courseId?: number; tab?: string }) => void;
  initialTab?: string;
  refreshKey?: number;
}

type Tab = 'dashboard' | 'courses' | 'profile';

// ── Icons ────────────────────────────────────────────────────
const IconGrid = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
);
const IconBook = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
  </svg>
);
const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconLogout = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
    <polyline points="16,17 21,12 16,7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const IconHome = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
    <polyline points="9,22 9,12 15,12 15,22"/>
  </svg>
);
const IconBell = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 01-3.46 0"/>
  </svg>
);
const IconMenu = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const IconPlay = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5,3 19,12 5,21"/>
  </svg>
);
const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
  </svg>
);
const IconCompass = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88"/>
  </svg>
);

// ── Notification Bell Dropdown ───────────────────────────────
const NotifIcon = ({ type }: { type: NotifType }) => {
  if (type === 'payment') return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  );
  if (type === 'lecture') return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5,3 19,12 5,21"/>
    </svg>
  );
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/>
    </svg>
  );
};

const notifColors: Record<NotifType, string> = {
  payment: 'bg-emerald-500/15 text-emerald-400',
  lecture: 'bg-sky-500/15 text-sky-400',
  enrollment: 'bg-amber-500/15 text-amber-400',
};

const NotifDropdown = ({ notifs, onMarkAll, onClose }: {
  notifs: Notification[];
  onMarkAll: () => void;
  onClose: () => void;
}) => (
  <div className="absolute left-0 top-full mt-2 w-80 bg-[#0d1f3c] border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/40 z-50 overflow-hidden">
    <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
      <span className="text-sm font-extrabold text-slate-200">الإشعارات</span>
      {notifs.some(n => !n.read) && (
        <button onClick={onMarkAll} className="text-xs text-sky-400 hover:text-sky-300 cursor-pointer transition-colors duration-150">
          تحديد الكل كمقروء
        </button>
      )}
    </div>
    <div className="max-h-80 overflow-y-auto">
      {notifs.length === 0 ? (
        <div className="py-10 text-center text-slate-500 text-sm">لا توجد إشعارات</div>
      ) : notifs.map(n => (
        <div key={n.id} className={`flex gap-3 px-4 py-3 border-b border-white/[0.04] transition-colors duration-150 ${n.read ? '' : 'bg-sky-500/[0.04]'}`}>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${notifColors[n.type]}`}>
            <NotifIcon type={n.type} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-200">{n.title}</p>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{n.body}</p>
            <p className="text-[10px] text-slate-600 mt-1">{timeAgo(n.time)}</p>
          </div>
          {!n.read && <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0 mt-2" />}
        </div>
      ))}
    </div>
  </div>
);

// ── Stat Card ────────────────────────────────────────────────
const StatCard = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <div className={`rounded-2xl border p-5 flex flex-col gap-2 hover:-translate-y-0.5 transition-transform duration-200 ${color}`}>
    <span className="text-2xl font-extrabold">{value}</span>
    <span className="text-xs text-slate-400 font-medium">{label}</span>
  </div>
);

// ── Progress Bar ─────────────────────────────────────────────
const ProgressBar = ({ pct }: { pct: number }) => (
  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
    <div
      className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-500"
      style={{ width: `${pct}%` }}
    />
  </div>
);

// ── Skeleton Card ────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="animate-pulse bg-white/[0.05] rounded-2xl h-48" />
);

// ── Subject Card ─────────────────────────────────────────────
const SubjectCard = ({ subject, onNavigate }: { subject: any; onNavigate: Props['onNavigate'] }) => {
  const pct = Math.min(100, Math.round(subject.progress || 0));
  const lastDate = subject.lastAccessed
    ? new Date(subject.lastAccessed).toLocaleDateString('ar-EG')
    : 'لم يبدأ بعد';
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 hover:border-sky-500/30 hover:bg-white/[0.05] transition-all duration-200 cursor-default">
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

// ── Empty State ──────────────────────────────────────────────
const EmptyState = ({ onNavigate }: { onNavigate: Props['onNavigate'] }) => (
  <div data-testid="empty-state" className="flex flex-col items-center justify-center py-20 px-6 text-center">
    <div className="w-24 h-24 rounded-3xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-6 text-sky-400">
      <IconCompass />
    </div>
    <h3 className="text-lg font-bold text-slate-200 mb-2">لا توجد كورسات مسجلة</h3>
    <p className="text-sm text-slate-500 mb-6 max-w-xs">ابدأ رحلتك التعليمية واستكشف مجموعتنا من الدورات التدريبية</p>
    <button
      onClick={() => onNavigate('courses')}
      className="flex items-center gap-2 bg-gradient-to-r from-[#034289] to-[#0566d9] text-white text-sm font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity duration-200 cursor-pointer shadow-lg shadow-sky-500/20"
    >
      تصفح الكورسات
    </button>
  </div>
);

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
    <aside className="w-72 shrink-0 bg-gradient-to-b from-[#0d1f3c] to-[#0a1628] border-l border-sky-500/[0.08] flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-white/[0.06]">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 cursor-pointer bg-transparent border-none w-full"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center shrink-0">
            <IconBook />
          </div>
          <span className="text-base font-extrabold text-slate-200 font-cairo">المنصة التعليمية</span>
        </button>
      </div>
      {/* Avatar */}
      <div className="p-5 border-b border-white/[0.06] text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center text-xl font-extrabold text-white mx-auto mb-2.5 shadow-lg shadow-sky-500/30 ring-2 ring-sky-500/30">
          {studentInitials}
        </div>
        <p className="text-sm font-bold text-slate-200 font-cairo">{studentName}</p>
        <p className="text-xs text-slate-500 mt-0.5">{user?.email || ''}</p>
      </div>
      {/* Nav */}
      <nav className="flex-1 p-3 flex flex-col gap-1">
        {navItems.map(item => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer border-none text-right font-cairo
              ${activeTab === item.key
                ? 'bg-sky-500/15 text-sky-400 border-r-2 border-sky-400'
                : 'bg-transparent text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'}`}
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
          className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/[0.08] hover:bg-red-500/[0.15] text-red-400 text-sm font-semibold transition-colors duration-200 cursor-pointer border-none font-cairo"
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
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>((initialTab as Tab) || 'dashboard');
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ totalCourses: 0, totalLectures: 0, completedLectures: 0, overallProgress: 0 });
  const [subjects, setSubjects] = useState<any[]>([]);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userId = user?.id || 'guest';
  const unreadCount = notifs.filter(n => !n.read).length;

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Load persisted notifications
  useEffect(() => { setNotifs(loadNotifs(userId)); }, [userId]);

  const pushNotif = useCallback((n: Omit<Notification, 'id' | 'time' | 'read'>) => {
    setNotifs(addNotif(userId, n));
  }, [userId]);

  const markAllRead = useCallback(() => {
    const updated = notifs.map(n => ({ ...n, read: true }));
    saveNotifs(userId, updated);
    setNotifs(updated);
  }, [notifs, userId]);

  // Show toast + push notification for payment or enrollment redirects
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    const subjectName = params.get('subject') || 'المادة';
    const amount = params.get('amount');
    if (payment === 'success') {
      showToast('تمت عملية الدفع بنجاح! تم تسجيلك في المادة.', 'success');
      pushNotif({
        type: 'payment',
        title: 'تم الدفع بنجاح',
        body: `تم تسجيلك في ${subjectName}${amount ? ` · المبلغ: ${amount} ج.م` : ''}`,
      });
      window.history.replaceState({}, '', window.location.pathname);
    } else if (payment === 'failed') {
      showToast('فشلت عملية الدفع. يرجى المحاولة مرة أخرى.', 'error');
      pushNotif({ type: 'payment', title: 'فشل الدفع', body: `لم تكتمل عملية الدفع لـ ${subjectName}. يرجى المحاولة مرة أخرى.` });
      window.history.replaceState({}, '', window.location.pathname);
    } else if (payment === 'declined') {
      showToast('تم رفض البطاقة. تأكد من بيانات البطاقة وحاول مرة أخرى.', 'error');
      pushNotif({ type: 'payment', title: 'تم رفض البطاقة', body: 'تأكد من بيانات البطاقة وحاول مرة أخرى.' });
      window.history.replaceState({}, '', window.location.pathname);
    } else if (params.get('enrolled') === 'true') {
      showToast('تم تسجيلك في المادة بنجاح!', 'success');
      pushNotif({ type: 'enrollment', title: 'تم التسجيل', body: `تم تسجيلك في ${subjectName} بنجاح. ابدأ التعلم الآن!` });
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [showToast, pushNotif]);

  useEffect(() => {
    setIsLoading(true);
    getProgress().then((res: any) => {
      const data = res?.data ?? res;
      if (data) {
        setStats({
          totalCourses: data.totalSubjects || data.totalCourses || 0,
          totalLectures: data.totalLectures || 0,
          completedLectures: data.completedLectures || 0,
          overallProgress: data.overallProgress || 0,
        });
        if (Array.isArray(data.subjects)) {
          setSubjects(data.subjects);
          // Detect new lectures per subject vs last snapshot
          const snapRaw = localStorage.getItem(LECTURE_SNAP_KEY(userId));
          const snap: Record<string, number> = snapRaw ? JSON.parse(snapRaw) : {};
          const newSnap: Record<string, number> = {};
          data.subjects.forEach((s: any) => {
            const prev = snap[s.id];
            const curr = s.totalLectures ?? s.lectureCount ?? 0;
            newSnap[s.id] = curr;
            if (prev !== undefined && curr > prev) {
              const added = curr - prev;
              pushNotif({
                type: 'lecture',
                title: 'محاضرات جديدة',
                body: `تمت إضافة ${added} محاضرة${added > 1 ? '' : ''} جديدة إلى "${s.name}"`,
              });
            }
          });
          localStorage.setItem(LECTURE_SNAP_KEY(userId), JSON.stringify(newSnap));
        }
      }
    }).catch(console.error).finally(() => setIsLoading(false));
  }, [refreshKey, userId, pushNotif]);

  const studentName = user?.name || 'طالب';
  const studentInitials = studentName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const filteredSubjects = subjects.filter(s => s.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  const sidebarProps = { activeTab, setTab: setActiveTab, user, studentName, studentInitials, onNavigate, logout };

  return (
    <div dir="rtl" className="flex min-h-screen bg-[#0a1628] font-cairo text-slate-200">
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
        <header className="sticky top-0 z-40 bg-[#0d1f3c]/90 backdrop-blur-sm border-b border-white/[0.06] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileSidebar(true)}
              className="md:hidden bg-white/5 border border-white/10 rounded-lg p-2 text-slate-400 cursor-pointer hover:bg-white/10 transition-colors duration-200"
              aria-label="فتح القائمة"
            >
              <IconMenu />
            </button>
            <h1 className="text-lg font-extrabold text-slate-200">مرحباً، {studentName}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('home')}
              className="hidden sm:flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-slate-400 text-xs hover:bg-white/10 hover:text-slate-200 transition-all duration-200 cursor-pointer"
            >
              <IconHome /> الموقع الرئيسي
            </button>
            <div className="relative hidden sm:flex items-center">
              <input
                type="text"
                placeholder="البحث..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl py-2 pr-4 pl-9 text-slate-200 text-xs w-44 outline-none focus:border-sky-500/30 focus:w-56 transition-all duration-200 placeholder:text-slate-500"
              />
              <span className="absolute left-3 pointer-events-none"><IconSearch /></span>
            </div>
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setNotifOpen(o => !o); if (!notifOpen) markAllRead(); }}
                className="relative bg-white/5 border border-white/10 rounded-xl p-2 text-slate-400 cursor-pointer hover:bg-white/10 transition-colors duration-200"
                aria-label="الإشعارات"
              >
                <IconBell />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 border-2 border-[#0d1f3c] text-[10px] font-bold text-white flex items-center justify-center px-0.5">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <NotifDropdown notifs={notifs} onMarkAll={markAllRead} onClose={() => setNotifOpen(false)} />
              )}
            </div>
          </div>
        </header>

        {/* Page body */}
        <main className="flex-1 overflow-y-auto p-6">

          {/* Dashboard tab */}
          {activeTab === 'dashboard' && (
            <div className="animate-fade-in">
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
                {isLoading ? (
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                  </div>
                ) : subjects.length === 0 ? (
                  <EmptyState onNavigate={onNavigate} />
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
            <div className="animate-fade-in">
              <h2 className="text-lg font-extrabold text-slate-200 mb-5">كورساتي</h2>
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : subjects.length === 0 ? (
                <EmptyState onNavigate={onNavigate} />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {subjects.map(s => <SubjectCard key={s.id} subject={s} onNavigate={onNavigate} />)}
                </div>
              )}
            </div>
          )}

          {/* Profile tab */}
          {activeTab === 'profile' && (
            <div className="animate-fade-in max-w-xl">
              <h2 className="text-lg font-extrabold text-slate-200 mb-5">الملف الشخصي</h2>
              <div className="flex items-center gap-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 mb-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center text-3xl font-extrabold text-white shadow-lg shadow-sky-500/30 ring-2 ring-sky-500/30">
                  {studentInitials}
                </div>
                <div>
                  <p className="text-lg font-extrabold text-slate-200">{studentName}</p>
                  <p className="text-xs text-slate-500 mt-0.5">طالب</p>
                </div>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 flex flex-col gap-4">
                {[
                  { label: 'الاسم الكامل', value: studentName, type: 'text', id: 'profile-name' },
                  { label: 'البريد الإلكتروني', value: user?.email || '', type: 'email', id: 'profile-email' },
                ].map((f) => (
                  <div key={f.id}>
                    <label htmlFor={f.id} className="block text-xs font-bold text-slate-400 mb-1.5">{f.label}</label>
                    <input
                      id={f.id}
                      defaultValue={f.value}
                      type={f.type}
                      className="w-full px-4 py-3 bg-white/5 border border-white/[0.08] rounded-xl text-slate-200 text-sm outline-none focus:border-sky-500/30 transition-colors duration-200 font-cairo"
                    />
                  </div>
                ))}
                <button className="self-start bg-gradient-to-r from-sky-500 to-cyan-400 border-none rounded-xl px-7 py-3 text-white text-sm font-bold cursor-pointer hover:opacity-90 transition-opacity duration-200 shadow-lg shadow-sky-500/30 font-cairo">
                  حفظ التغييرات
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
