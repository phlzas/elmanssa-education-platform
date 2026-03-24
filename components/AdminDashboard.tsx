import React, { useState, useEffect, useCallback } from 'react';
import { Page } from '../App';
import { useAuth } from '../contexts/AuthContext';
import {
    getAdminStats, getStudents, deleteStudent,
    getTeachers, deleteTeacher, getAdminCourses, deleteCourse,
    getAdminOrders, deleteOrder, getAdminStreams, deleteStream,
} from '../api/admin.api';

type Tab = 'overview' | 'students' | 'teachers' | 'courses' | 'orders' | 'streams';

interface AdminDashboardProps {
    onNavigate: (page: Page) => void;
}

// ── small helpers ─────────────────────────────────────────────

function StatCard({ label, value, color }: { label: string; value: number | string; color: string }) {
    return (
        <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${color}30`,
            borderRadius: 16,
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
        }}>
            <span style={{ fontSize: 28, fontWeight: 800, color }}>{value}</span>
            <span style={{ fontSize: 13, color: '#94a3b8' }}>{label}</span>
        </div>
    );
}

function DeleteBtn({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 8,
                padding: '6px 14px',
                color: '#f87171',
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: "'Cairo', sans-serif",
            }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
        >
            حذف
        </button>
    );
}

function ConfirmModal({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            <div style={{
                background: '#0d1f3c', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 16, padding: 32, maxWidth: 380, width: '90%', textAlign: 'center',
                fontFamily: "'Cairo', sans-serif",
            }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
                <p style={{ color: '#e2e8f0', fontSize: 16, marginBottom: 24 }}>{message}</p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                    <button onClick={onCancel} style={{
                        padding: '10px 24px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)',
                        background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: 14,
                        fontFamily: "'Cairo', sans-serif",
                    }}>إلغاء</button>
                    <button onClick={onConfirm} style={{
                        padding: '10px 24px', borderRadius: 10, border: 'none',
                        background: '#ef4444', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700,
                        fontFamily: "'Cairo', sans-serif",
                    }}>تأكيد الحذف</button>
                </div>
            </div>
        </div>
    );
}

// ── table wrapper ─────────────────────────────────────────────

function Table({ headers, children, loading }: { headers: string[]; children: React.ReactNode; loading: boolean }) {
    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, fontFamily: "'Cairo', sans-serif" }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        {headers.map(h => (
                            <th key={h} style={{ padding: '12px 16px', color: '#64748b', fontWeight: 600, textAlign: 'right', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan={headers.length} style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>جاري التحميل...</td></tr>
                    ) : children}
                </tbody>
            </table>
        </div>
    );
}

function TR({ children }: { children: React.ReactNode }) {
    return (
        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
            onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}
            onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
            {children}
        </tr>
    );
}

function TD({ children }: { children: React.ReactNode }) {
    return <td style={{ padding: '12px 16px', color: '#cbd5e1', verticalAlign: 'middle' }}>{children}</td>;
}

function Badge({ text, color }: { text: string; color: string }) {
    return (
        <span style={{
            background: `${color}20`, color, border: `1px solid ${color}40`,
            borderRadius: 6, padding: '2px 10px', fontSize: 12, fontWeight: 600,
        }}>{text}</span>
    );
}

// ── main component ────────────────────────────────────────────

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
    const { user, logout } = useAuth();
    const [tab, setTab] = useState<Tab>('overview');
    const [stats, setStats] = useState<any>(null);
    const [data, setData] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [confirm, setConfirm] = useState<{ id: string | number; label: string } | null>(null);
    const [mobileSidebar, setMobileSidebar] = useState(false);

    // load stats once
    useEffect(() => {
        getAdminStats().then(r => setStats(r.data)).catch(() => {});
    }, []);

    const loadTab = useCallback(async (t: Tab, p = 1) => {
        if (t === 'overview') return;
        setLoading(true);
        try {
            let res: any;
            if (t === 'students') res = await getStudents(p);
            else if (t === 'teachers') res = await getTeachers(p);
            else if (t === 'courses') res = await getAdminCourses(p);
            else if (t === 'orders') res = await getAdminOrders(p);
            else if (t === 'streams') res = await getAdminStreams(p);
            setData(res?.data ?? []);
            setTotal(res?.total ?? 0);
        } catch { setData([]); }
        setLoading(false);
    }, []);

    useEffect(() => {
        setPage(1);
        loadTab(tab, 1);
    }, [tab, loadTab]);

    const handleDelete = async () => {
        if (!confirm) return;
        try {
            if (tab === 'students') await deleteStudent(confirm.id as string);
            else if (tab === 'teachers') await deleteTeacher(confirm.id as string);
            else if (tab === 'courses') await deleteCourse(confirm.id as string);
            else if (tab === 'orders') await deleteOrder(confirm.id as string);
            else if (tab === 'streams') await deleteStream(confirm.id);
            setConfirm(null);
            loadTab(tab, page);
            if (tab !== 'streams') getAdminStats().then(r => setStats(r.data)).catch(() => {});
        } catch { setConfirm(null); }
    };

    const navItems: { key: Tab; label: string; icon: string }[] = [
        { key: 'overview', label: 'نظرة عامة', icon: '📊' },
        { key: 'students', label: 'الطلاب', icon: '🎓' },
        { key: 'teachers', label: 'المدرسون', icon: '👨‍🏫' },
        { key: 'courses', label: 'الكورسات', icon: '📚' },
        { key: 'orders', label: 'الطلبات', icon: '🛒' },
        { key: 'streams', label: 'البث المباشر', icon: '📡' },
    ];

    const SidebarContent = () => (
        <div style={{
            width: 240, background: 'linear-gradient(180deg,#0d1f3c 0%,#0a1628 100%)',
            borderLeft: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', height: '100%', flexShrink: 0,
        }}>
            <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <button onClick={() => onNavigate('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#ef4444,#dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⚙️</div>
                    <span style={{ fontSize: 15, fontWeight: 800, color: '#e2e8f0', fontFamily: "'Cairo', sans-serif" }}>لوحة الإدارة</span>
                </button>
            </div>
            <div style={{ padding: '16px 12px', flex: 1 }}>
                {navItems.map(item => (
                    <button key={item.key} onClick={() => { setTab(item.key); setMobileSidebar(false); }} style={{
                        width: '100%', padding: '11px 14px', borderRadius: 10, border: 'none',
                        background: tab === item.key ? 'rgba(239,68,68,0.12)' : 'transparent',
                        color: tab === item.key ? '#f87171' : '#94a3b8',
                        fontSize: 14, fontWeight: tab === item.key ? 700 : 500,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                        marginBottom: 4, transition: 'all 0.2s', fontFamily: "'Cairo', sans-serif",
                        textAlign: 'right',
                        ...(tab === item.key ? { borderRight: '3px solid #ef4444' } : {}),
                    }}
                        onMouseOver={e => { if (tab !== item.key) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                        onMouseOut={e => { if (tab !== item.key) e.currentTarget.style.background = 'transparent'; }}
                    >
                        <span>{item.icon}</span>{item.label}
                    </button>
                ))}
            </div>
            <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button onClick={() => { logout(); onNavigate('home'); }} style={{
                    width: '100%', padding: '11px 14px', borderRadius: 10, border: 'none',
                    background: 'rgba(239,68,68,0.08)', color: '#f87171', fontSize: 14, fontWeight: 600,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                    fontFamily: "'Cairo', sans-serif", transition: 'all 0.2s',
                }}
                    onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.18)'; }}
                    onMouseOut={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" strokeLinecap="round" /><polyline points="16,17 21,12 16,7" strokeLinecap="round" /><line x1="21" y1="12" x2="9" y2="12" strokeLinecap="round" /></svg>
                    تسجيل الخروج
                </button>
            </div>
        </div>
    );

    const totalPages = Math.ceil(total / 20);

    return (
        <div dir="rtl" style={{ display: 'flex', minHeight: '100vh', background: '#0a1628', fontFamily: "'Cairo', sans-serif" }}>
            <style>{`
                .admin-sidebar { display: flex !important; }
                @media (max-width: 768px) {
                    .admin-sidebar { display: none !important; }
                    .admin-mobile-btn { display: flex !important; }
                }
                @media (min-width: 769px) { .admin-mobile-btn { display: none !important; } }
            `}</style>

            {/* Desktop sidebar */}
            <div className="admin-sidebar" style={{ display: 'none' }}><SidebarContent /></div>

            {/* Mobile sidebar overlay */}
            {mobileSidebar && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setMobileSidebar(false)} />
                    <div style={{ position: 'relative', zIndex: 1 }}><SidebarContent /></div>
                </div>
            )}

            {/* Main */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                {/* Header */}
                <div style={{
                    background: 'linear-gradient(90deg,#0d1f3c,#132742)',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    position: 'sticky', top: 0, zIndex: 40,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button className="admin-mobile-btn" onClick={() => setMobileSidebar(true)} style={{
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 8, padding: 8, color: '#94a3b8', cursor: 'pointer', display: 'none',
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                            </svg>
                        </button>
                        <h1 style={{ fontSize: 18, fontWeight: 800, color: '#e2e8f0', margin: 0 }}>
                            {navItems.find(n => n.key === tab)?.icon} {navItems.find(n => n.key === tab)?.label}
                        </h1>
                    </div>
                    <span style={{ fontSize: 13, color: '#64748b' }}>{user?.name}</span>
                </div>

                {/* Content */}
                <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>

                    {/* Overview */}
                    {tab === 'overview' && (
                        <div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 16, marginBottom: 32 }}>
                                <StatCard label="الطلاب" value={stats?.students ?? '—'} color="#38bdf8" />
                                <StatCard label="المدرسون" value={stats?.teachers ?? '—'} color="#a78bfa" />
                                <StatCard label="الكورسات" value={stats?.courses ?? '—'} color="#34d399" />
                                <StatCard label="الطلبات" value={stats?.orders ?? '—'} color="#fbbf24" />
                                <StatCard label="البث المباشر" value={stats?.streams ?? '—'} color="#f472b6" />
                                <StatCard label="الإيرادات (ج.م)" value={stats?.revenue != null ? Number(stats.revenue).toLocaleString('ar-EG') : '—'} color="#ef4444" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 12 }}>
                                {navItems.filter(n => n.key !== 'overview').map(n => (
                                    <button key={n.key} onClick={() => setTab(n.key)} style={{
                                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: 12, padding: '18px 20px', cursor: 'pointer', textAlign: 'right',
                                        color: '#e2e8f0', fontSize: 15, fontWeight: 700, fontFamily: "'Cairo', sans-serif",
                                        display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.2s',
                                    }}
                                        onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                                        onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                                    >
                                        <span style={{ fontSize: 22 }}>{n.icon}</span>{n.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Students */}
                    {tab === 'students' && (
                        <Table headers={['الاسم', 'البريد الإلكتروني', 'الهاتف', 'الحالة', 'تاريخ التسجيل', '']} loading={loading}>
                            {data.map((s: any) => (
                                <TR key={s.id}>
                                    <TD>{s.name}</TD>
                                    <TD><span style={{ direction: 'ltr', display: 'inline-block' }}>{s.email}</span></TD>
                                    <TD>{s.phoneNumber || '—'}</TD>
                                    <TD><Badge text={s.isActive ? 'نشط' : 'موقوف'} color={s.isActive ? '#34d399' : '#f87171'} /></TD>
                                    <TD>{new Date(s.createdAt).toLocaleDateString('ar-EG')}</TD>
                                    <TD><DeleteBtn onClick={() => setConfirm({ id: s.id, label: `الطالب "${s.name}"` })} /></TD>
                                </TR>
                            ))}
                            {!loading && data.length === 0 && <TR><TD>لا يوجد طلاب</TD></TR>}
                        </Table>
                    )}

                    {/* Teachers */}
                    {tab === 'teachers' && (
                        <Table headers={['الاسم', 'البريد الإلكتروني', 'الهاتف', 'الحالة', 'تاريخ التسجيل', '']} loading={loading}>
                            {data.map((t: any) => (
                                <TR key={t.id}>
                                    <TD>{t.name}</TD>
                                    <TD><span style={{ direction: 'ltr', display: 'inline-block' }}>{t.email}</span></TD>
                                    <TD>{t.phoneNumber || '—'}</TD>
                                    <TD><Badge text={t.isActive ? 'نشط' : 'موقوف'} color={t.isActive ? '#34d399' : '#f87171'} /></TD>
                                    <TD>{new Date(t.createdAt).toLocaleDateString('ar-EG')}</TD>
                                    <TD><DeleteBtn onClick={() => setConfirm({ id: t.id, label: `المدرس "${t.name}"` })} /></TD>
                                </TR>
                            ))}
                            {!loading && data.length === 0 && <TR><TD>لا يوجد مدرسون</TD></TR>}
                        </Table>
                    )}

                    {/* Courses */}
                    {tab === 'courses' && (
                        <Table headers={['اسم الكورس', 'المدرس', 'الحالة', 'الطلاب', 'تاريخ الإنشاء', '']} loading={loading}>
                            {data.map((c: any) => (
                                <TR key={c.id}>
                                    <TD>{c.name}</TD>
                                    <TD>{c.teacherName}</TD>
                                    <TD><Badge text={c.status === 'published' ? 'منشور' : 'مسودة'} color={c.status === 'published' ? '#34d399' : '#fbbf24'} /></TD>
                                    <TD>{c.studentsCount}</TD>
                                    <TD>{new Date(c.createdAt).toLocaleDateString('ar-EG')}</TD>
                                    <TD><DeleteBtn onClick={() => setConfirm({ id: c.id, label: `الكورس "${c.name}"` })} /></TD>
                                </TR>
                            ))}
                            {!loading && data.length === 0 && <TR><TD>لا توجد كورسات</TD></TR>}
                        </Table>
                    )}

                    {/* Orders */}
                    {tab === 'orders' && (
                        <Table headers={['رقم الطلب', 'الطالب', 'طريقة الدفع', 'الحالة', 'المبلغ', 'التاريخ', '']} loading={loading}>
                            {data.map((o: any) => (
                                <TR key={o.id}>
                                    <TD><span style={{ direction: 'ltr', display: 'inline-block', fontSize: 12 }}>{o.orderNumber}</span></TD>
                                    <TD>{o.billingFullName || o.userName}</TD>
                                    <TD>{o.paymentMethod}</TD>
                                    <TD>
                                        <Badge
                                            text={o.paymentStatus === 'completed' ? 'مكتمل' : o.paymentStatus === 'pending' ? 'معلق' : o.paymentStatus === 'failed' ? 'فشل' : o.paymentStatus}
                                            color={o.paymentStatus === 'completed' ? '#34d399' : o.paymentStatus === 'pending' ? '#fbbf24' : '#f87171'}
                                        />
                                    </TD>
                                    <TD>{Number(o.finalPrice || o.totalAmount || 0).toLocaleString('ar-EG')} ج.م</TD>
                                    <TD>{new Date(o.createdAt).toLocaleDateString('ar-EG')}</TD>
                                    <TD><DeleteBtn onClick={() => setConfirm({ id: o.id, label: `الطلب "${o.orderNumber}"` })} /></TD>
                                </TR>
                            ))}
                            {!loading && data.length === 0 && <TR><TD>لا توجد طلبات</TD></TR>}
                        </Table>
                    )}

                    {/* Streams */}
                    {tab === 'streams' && (
                        <Table headers={['العنوان', 'المدرس', 'الحالة', 'المشاهدون', 'التاريخ', '']} loading={loading}>
                            {data.map((s: any) => (
                                <TR key={s.id}>
                                    <TD>{s.title}</TD>
                                    <TD>{s.instructorName}</TD>
                                    <TD>
                                        <Badge
                                            text={s.status === 'live' ? 'مباشر' : s.status === 'scheduled' ? 'مجدول' : 'منتهي'}
                                            color={s.status === 'live' ? '#ef4444' : s.status === 'scheduled' ? '#fbbf24' : '#64748b'}
                                        />
                                    </TD>
                                    <TD>{s.viewerCount}</TD>
                                    <TD>{new Date(s.createdAt).toLocaleDateString('ar-EG')}</TD>
                                    <TD><DeleteBtn onClick={() => setConfirm({ id: s.id, label: `البث "${s.title}"` })} /></TD>
                                </TR>
                            ))}
                            {!loading && data.length === 0 && <TR><TD>لا توجد بثوث مباشرة</TD></TR>}
                        </Table>
                    )}

                    {/* Pagination */}
                    {tab !== 'overview' && totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
                            <button disabled={page === 1} onClick={() => { setPage(p => p - 1); loadTab(tab, page - 1); }} style={{
                                padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
                                background: 'transparent', color: page === 1 ? '#334155' : '#94a3b8', cursor: page === 1 ? 'default' : 'pointer',
                                fontFamily: "'Cairo', sans-serif",
                            }}>السابق</button>
                            <span style={{ padding: '8px 16px', color: '#64748b', fontSize: 14 }}>{page} / {totalPages}</span>
                            <button disabled={page >= totalPages} onClick={() => { setPage(p => p + 1); loadTab(tab, page + 1); }} style={{
                                padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
                                background: 'transparent', color: page >= totalPages ? '#334155' : '#94a3b8', cursor: page >= totalPages ? 'default' : 'pointer',
                                fontFamily: "'Cairo', sans-serif",
                            }}>التالي</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirm delete modal */}
            {confirm && (
                <ConfirmModal
                    message={`هل أنت متأكد من حذف ${confirm.label}؟ لا يمكن التراجع عن هذا الإجراء.`}
                    onConfirm={handleDelete}
                    onCancel={() => setConfirm(null)}
                />
            )}
        </div>
    );
};

export default AdminDashboard;
