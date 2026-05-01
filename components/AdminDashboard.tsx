import React, { useState, useEffect, useCallback } from 'react';
import { Page } from '../App';
import { useAuth } from '../contexts/AuthContext';
import SelectField from './SelectField';
import {
    getAdminStats, getStudents, deleteStudent, updateStudent,
    getTeachers, deleteTeacher, updateTeacher,
    getAdminCourses, deleteCourse, createAdminCourse, updateAdminCourse, publishAdminCourse,
    getAdminOrders, deleteOrder, getAdminStreams, deleteStream,
    getEnrollments, enrollStudent, deleteEnrollment,
    createUser, toggleUserActive,
    getSubjectsList, getStudentsList, getTeachersList,
} from '../api/admin.api';
import AccountingTab from './AccountingTab';

type Tab = 'overview' | 'students' | 'teachers' | 'courses' | 'enrollments' | 'orders' | 'streams' | 'accounting';
interface AdminDashboardProps { onNavigate: (page: Page) => void; }

// ── Shared UI ─────────────────────────────────────────────────

function StatCard({ label, value, color, sub }: { label: string; value: number | string; color: string; sub?: string }) {
    return (
        <div className="bg-white/[0.04] rounded-2xl px-6 py-5 flex flex-col gap-1" style={{ border: `1px solid ${color}30` }}>
            <span className="text-3xl font-extrabold" style={{ color }}>{value}</span>
            <span className="text-[13px] text-slate-400">{label}</span>
            {sub && <span className="text-[11px] text-slate-500">{sub}</span>}
        </div>
    );
}

function Btn({ children, onClick, color = '#f59e0b', outline = false, small = false, disabled = false }: {
    children: React.ReactNode; onClick?: () => void; color?: string; outline?: boolean; small?: boolean; disabled?: boolean;
}) {
    const base = `font-cairo cursor-pointer transition-colors duration-200 rounded-lg font-semibold ${small ? 'px-2.5 py-1 text-xs' : 'px-4 py-[7px] text-[13px]'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`;
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={base}
            style={{
                background: outline ? `${color}15` : color,
                border: `1px solid ${color}50`,
                color: outline ? color : '#fff',
            }}
        >
            {children}
        </button>
    );
}

function Table({ headers, children, loading }: { headers: string[]; children: React.ReactNode; loading?: boolean }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
                <thead>
                    <tr className="border-b border-white/[0.08]">
                        {headers.map(h => (
                            <th key={h} className="font-cairo px-3.5 py-2.5 text-slate-500 font-semibold text-right whitespace-nowrap text-[13px]">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <>
                            {[1, 2, 3, 4, 5].map(i => (
                                <tr key={i} className="border-b border-white/[0.04]">
                                    {headers.map((_, j) => (
                                        <td key={j} className="px-3.5 py-3">
                                            <div className="animate-pulse bg-white/[0.05] rounded h-4 w-full" />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </>
                    ) : children}
                </tbody>
            </table>
        </div>
    );
}

function TR({ children }: { children: React.ReactNode }) {
    return (
        <tr className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors duration-150">
            {children}
        </tr>
    );
}

function TD({ children }: { children: React.ReactNode }) {
    return <td className="px-3.5 py-2.5 text-slate-300 align-middle">{children}</td>;
}

function Badge({ text, color }: { text: string; color: string }) {
    return (
        <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border"
            style={{ background: `${color}20`, color, borderColor: `${color}40` }}
        >
            {text}
        </span>
    );
}

function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
    return (
        <input
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="font-cairo px-3.5 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-slate-200 text-sm outline-none focus:border-[#034289]/60 w-56 transition-colors duration-150"
        />
    );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/65 backdrop-blur-md" onClick={onClose} />
            <div className="relative z-10 bg-[#0f172a] border border-white/10 rounded-2xl p-7 w-[90%] max-w-xl max-h-[88vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-5">
                    <h3 className="font-cairo text-slate-100 text-lg font-bold m-0">{title}</h3>
                    <button
                        onClick={onClose}
                        className="bg-transparent border-none text-slate-500 hover:text-slate-300 cursor-pointer transition-colors duration-150 text-xl leading-none"
                        aria-label="إغلاق"
                    >
                        ✕
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor?: string; children: React.ReactNode }) {
    return (
        <div className="mb-3.5">
            <label htmlFor={htmlFor} className="font-cairo block text-xs text-slate-400 mb-1.5 font-semibold">{label}</label>
            {children}
        </div>
    );
}

const inputCls = "font-cairo w-full px-3 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-slate-200 text-sm outline-none focus:border-[#034289]/50 transition-colors duration-150 box-border";

// Select gets appearance-none + custom SVG chevron via inline background-image
const selectCls = `${inputCls} appearance-none cursor-pointer pr-3 pl-8 select-dark`;

// ── Main Component ────────────────────────────────────────────

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
    const { user, logout } = useAuth();
    const [tab, setTab] = useState<Tab>('overview');
    const [stats, setStats] = useState<any>(null);
    const [data, setData] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [confirm, setConfirm] = useState<{ id: string | number; label: string; onConfirm: () => void } | null>(null);
    const [modal, setModal] = useState<'createUser' | 'editUser' | 'createCourse' | 'editCourse' | 'enroll' | null>(null);
    const [editTarget, setEditTarget] = useState<any>(null);
    const [form, setForm] = useState<any>({});
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
    const [teachersList, setTeachersList] = useState<any[]>([]);
    const [studentsList, setStudentsList] = useState<any[]>([]);
    const [subjectsList, setSubjectsList] = useState<any[]>([]);

    const showToast = (msg: string, ok = true) => {
        setToast({ msg, ok });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        getAdminStats().then(r => setStats(r?.data || r)).catch(() => {});
    }, []);

    const loadTab = useCallback(async (t: Tab, p = 1) => {
        setLoading(true);
        try {
            let r: any;
            if (t === 'students') r = await getStudents(p);
            else if (t === 'teachers') r = await getTeachers(p);
            else if (t === 'courses') r = await getAdminCourses(p);
            else if (t === 'orders') r = await getAdminOrders(p);
            else if (t === 'streams') r = await getAdminStreams(p);
            else if (t === 'enrollments') r = await getEnrollments(p);
            if (r) { setData(r.data || []); setTotal(r.total || 0); }
        } catch { }
        setLoading(false);
    }, []);

    useEffect(() => {
        if (tab !== 'overview') { setPage(1); setSearch(''); loadTab(tab, 1); }
    }, [tab, loadTab]);

    const reload = () => loadTab(tab, page);

    // client-side search filter
    const filtered = search.trim()
        ? data.filter(item => {
            const q = search.toLowerCase();
            return Object.values(item).some(v => String(v ?? '').toLowerCase().includes(q));
        })
        : data;

    const openCreate = async () => {
        setForm({});
        setEditTarget(null);
        if (tab === 'students' || tab === 'teachers') {
            setModal('createUser');
        } else if (tab === 'courses') {
            const tl = await getTeachersList().catch(() => ({ data: [] }));
            setTeachersList(tl?.data || []);
            setModal('createCourse');
        } else if (tab === 'enrollments') {
            const [sl, sub] = await Promise.all([
                getStudentsList().catch(() => ({ data: [] })),
                getSubjectsList().catch(() => ({ data: [] })),
            ]);
            setStudentsList(sl?.data || []);
            setSubjectsList(sub?.data || []);
            setModal('enroll');
        }
    };

    const openEdit = async (item: any) => {
        setEditTarget(item);
        setForm({ ...item });
        if (tab === 'students' || tab === 'teachers') {
            setModal('editUser');
        } else if (tab === 'courses') {
            const tl = await getTeachersList().catch(() => ({ data: [] }));
            setTeachersList(tl?.data || []);
            setModal('editCourse');
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (modal === 'createUser') {
                const role = tab === 'teachers' ? 'teacher' : 'student';
                await createUser({ ...form, role });
                showToast('تم إنشاء المستخدم بنجاح');
            } else if (modal === 'editUser') {
                const payload: any = {
                    name: form.name,
                    email: form.email,
                    phoneNumber: form.phoneNumber || null,
                    bio: form.bio || null,
                    isActive: form.isActive,
                };
                if (form.password && form.password.trim() !== '') {
                    payload.password = form.password.trim();
                }
                if (tab === 'students') await updateStudent(editTarget.id, payload);
                else await updateTeacher(editTarget.id, payload);
                showToast('تم التحديث بنجاح');
            } else if (modal === 'createCourse') {
                await createAdminCourse({ ...form, teacherId: form.teacherId || '' });
                showToast('تم إنشاء المادة بنجاح');
            } else if (modal === 'editCourse') {
                await updateAdminCourse(editTarget.id, form);
                showToast('تم تحديث المادة بنجاح');
            } else if (modal === 'enroll') {
                await enrollStudent(form.studentId, form.subjectId);
                showToast('تم التسجيل بنجاح');
            }
            setModal(null);
            reload();
        } catch (e: any) {
            showToast(e?.message || 'حدث خطأ', false);
        }
        setSaving(false);
    };

    const handleDelete = (id: string | number, label: string, onConfirm: () => void) => {
        setConfirm({ id, label, onConfirm });
    };

    const doDelete = async () => {
        if (!confirm) return;
        try {
            await confirm.onConfirm();
            showToast('تم الحذف بنجاح');
            reload();
        } catch { showToast('فشل الحذف', false); }
        setConfirm(null);
    };

    const TABS: { key: Tab; label: string; color: string }[] = [
        { key: 'overview', label: 'نظرة عامة', color: '#f59e0b' },
        { key: 'students', label: 'الطلاب', color: '#38bdf8' },
        { key: 'teachers', label: 'المدرسون', color: '#a855f7' },
        { key: 'courses', label: 'المواد', color: '#22c55e' },
        { key: 'enrollments', label: 'التسجيلات', color: '#fb923c' },
        { key: 'orders', label: 'الطلبات', color: '#fbbf24' },
        { key: 'streams', label: 'البث', color: '#f472b6' },
        { key: 'accounting', label: 'الحسابات', color: '#34d399' },
    ];

    const canCreate = ['students', 'teachers', 'courses', 'enrollments'].includes(tab);
    const canEdit = ['students', 'teachers', 'courses'].includes(tab);
    const canSearch = tab !== 'overview' && tab !== 'accounting';

    return (
        <div dir="rtl" className="min-h-screen bg-[#0a1628] font-cairo text-slate-200">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-[999] px-6 py-2.5 rounded-xl font-semibold text-sm text-white shadow-xl font-cairo ${toast.ok ? 'bg-green-600' : 'bg-red-600'}`}>
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <header className="sticky top-0 z-40 bg-[#0f172a] border-b border-white/[0.06] px-6 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-[#f59e0b] to-[#d97706] flex items-center justify-center flex-shrink-0">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" aria-hidden="true">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="font-cairo text-base font-extrabold text-slate-100 m-0 leading-tight">لوحة تحكم المدير</h1>
                        <span className="text-[11px] text-slate-500">{user?.name}</span>
                    </div>
                </div>
                <div className="flex gap-2.5">
                    <Btn onClick={() => onNavigate('home')} outline color="#64748b">رجوع للموقع</Btn>
                    <Btn onClick={() => { logout(); onNavigate('home'); }} outline color="#f87171">خروج</Btn>
                </div>
            </header>

            {/* Tab Bar */}
            <div className="bg-[#0f172a] border-b border-white/[0.06] px-6 flex gap-0.5 overflow-x-auto">
                {TABS.map(t => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`font-cairo cursor-pointer px-4 py-3 font-semibold text-sm whitespace-nowrap transition-colors duration-150 border-b-2 bg-transparent ${tab === t.key ? 'border-current' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                        style={tab === t.key ? { color: t.color, borderColor: t.color } : {}}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <main className="p-6">
                {/* ── Overview ── */}
                {tab === 'overview' && stats && (
                    <div>
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3.5 mb-7">
                            <StatCard label="الطلاب" value={stats.students ?? '—'} color="#38bdf8" />
                            <StatCard label="المدرسون" value={stats.teachers ?? '—'} color="#a855f7" />
                            <StatCard label="المواد" value={stats.courses ?? '—'} color="#22c55e" />
                            <StatCard label="الطلبات" value={stats.orders ?? '—'} color="#fbbf24" />
                            <StatCard label="البث المباشر" value={stats.streams ?? '—'} color="#f472b6" />
                            <StatCard label="الإيرادات" value={stats.revenue != null ? `${Number(stats.revenue).toLocaleString('ar-EG')} ر.س` : '—'} color="#34d399" sub="من الطلبات المكتملة" />
                        </div>
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-2.5">
                            {TABS.filter(t => t.key !== 'overview').map(t => (
                                <Btn key={t.key} onClick={() => setTab(t.key)} outline color={t.color}>{t.label}</Btn>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Accounting Tab ── */}
                {tab === 'accounting' && (
                    <AccountingTab mode="admin" showToast={showToast} />
                )}

                {/* ── Table Tabs ── */}
                {tab !== 'overview' && tab !== 'accounting' && (
                    <div>
                        {/* Toolbar */}
                        <div className="flex justify-between items-center mb-4 flex-wrap gap-2.5">
                            <div className="flex items-center gap-2.5">
                                {canSearch && (
                                    <SearchBar value={search} onChange={setSearch} placeholder="بحث..." />
                                )}
                                <span className="text-slate-500 text-[13px]">
                                    {search ? `${filtered.length} نتيجة` : `الإجمالي: ${total}`}
                                </span>
                            </div>
                            {canCreate && <Btn onClick={openCreate}>+ إضافة</Btn>}
                        </div>

                        <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl overflow-hidden">
                            {/* Students */}
                            {tab === 'students' && (
                                <Table headers={['الاسم', 'البريد الإلكتروني', 'الهاتف', 'الحالة', 'تاريخ التسجيل', 'إجراءات']} loading={loading}>
                                    {filtered.map(s => (
                                        <TR key={s.id}>
                                            <TD>{s.name}</TD>
                                            <TD><span className="direction-ltr inline-block" style={{ direction: 'ltr' }}>{s.email}</span></TD>
                                            <TD>{s.phoneNumber || '—'}</TD>
                                            <TD><Badge text={s.isActive ? 'نشط' : 'معطل'} color={s.isActive ? '#22c55e' : '#f87171'} /></TD>
                                            <TD>{new Date(s.createdAt).toLocaleDateString('ar-EG')}</TD>
                                            <TD>
                                                <div className="flex gap-1.5 flex-wrap">
                                                    {canEdit && <Btn small onClick={() => openEdit(s)} outline>تعديل</Btn>}
                                                    <Btn small onClick={() => toggleUserActive(s.id).then(reload)} outline color="#fbbf24">{s.isActive ? 'تعطيل' : 'تفعيل'}</Btn>
                                                    <Btn small onClick={() => handleDelete(s.id, s.name, () => deleteStudent(s.id))} outline color="#f87171">حذف</Btn>
                                                </div>
                                            </TD>
                                        </TR>
                                    ))}
                                </Table>
                            )}

                            {/* Teachers */}
                            {tab === 'teachers' && (
                                <Table headers={['الاسم', 'البريد الإلكتروني', 'الهاتف', 'الحالة', 'تاريخ التسجيل', 'إجراءات']} loading={loading}>
                                    {filtered.map(t => (
                                        <TR key={t.id}>
                                            <TD>{t.name}</TD>
                                            <TD><span style={{ direction: 'ltr' }} className="inline-block">{t.email}</span></TD>
                                            <TD>{t.phoneNumber || '—'}</TD>
                                            <TD><Badge text={t.isActive ? 'نشط' : 'معطل'} color={t.isActive ? '#22c55e' : '#f87171'} /></TD>
                                            <TD>{new Date(t.createdAt).toLocaleDateString('ar-EG')}</TD>
                                            <TD>
                                                <div className="flex gap-1.5 flex-wrap">
                                                    {canEdit && <Btn small onClick={() => openEdit(t)} outline>تعديل</Btn>}
                                                    <Btn small onClick={() => toggleUserActive(t.id).then(reload)} outline color="#fbbf24">{t.isActive ? 'تعطيل' : 'تفعيل'}</Btn>
                                                    <Btn small onClick={() => handleDelete(t.id, t.name, () => deleteTeacher(t.id))} outline color="#f87171">حذف</Btn>
                                                </div>
                                            </TD>
                                        </TR>
                                    ))}
                                </Table>
                            )}

                            {/* Courses */}
                            {tab === 'courses' && (
                                <Table headers={['العنوان', 'المدرس', 'التصنيف', 'الحالة', 'الطلاب', 'السعر', 'إجراءات']} loading={loading}>
                                    {filtered.map(c => (
                                        <TR key={c.id}>
                                            <TD>{c.title}</TD>
                                            <TD>{c.teacherName}</TD>
                                            <TD>{c.category || '—'}</TD>
                                            <TD><Badge text={c.status === 'published' ? 'منشور' : 'مسودة'} color={c.status === 'published' ? '#22c55e' : '#f59e0b'} /></TD>
                                            <TD>{c.studentsCount}</TD>
                                            <TD>{c.price ?? 0} ر.س</TD>
                                            <TD>
                                                <div className="flex gap-1.5 flex-wrap">
                                                    {canEdit && <Btn small onClick={() => openEdit(c)} outline>تعديل</Btn>}
                                                    <Btn small onClick={() => publishAdminCourse(c.id, c.status === 'published' ? 'draft' : 'published').then(reload)} outline color="#22c55e">{c.status === 'published' ? 'إيقاف' : 'نشر'}</Btn>
                                                    <Btn small onClick={() => handleDelete(c.id, c.title, () => deleteCourse(c.id))} outline color="#f87171">حذف</Btn>
                                                </div>
                                            </TD>
                                        </TR>
                                    ))}
                                </Table>
                            )}

                            {/* Enrollments */}
                            {tab === 'enrollments' && (
                                <Table headers={['الطالب', 'البريد الإلكتروني', 'المادة', 'تاريخ التسجيل', 'إجراءات']} loading={loading}>
                                    {filtered.map(e => (
                                        <TR key={e.id}>
                                            <TD>{e.studentName}</TD>
                                            <TD><span style={{ direction: 'ltr' }} className="inline-block">{e.studentEmail}</span></TD>
                                            <TD>{e.subjectTitle || '—'}</TD>
                                            <TD>{new Date(e.enrolledAt).toLocaleDateString('ar-EG')}</TD>
                                            <TD><Btn small onClick={() => handleDelete(e.id, `${e.studentName} - ${e.subjectTitle}`, () => deleteEnrollment(e.id))} outline color="#f87171">إلغاء التسجيل</Btn></TD>
                                        </TR>
                                    ))}
                                </Table>
                            )}

                            {/* Orders */}
                            {tab === 'orders' && (
                                <Table headers={['رقم الطلب', 'الطالب', 'طريقة الدفع', 'الحالة', 'المبلغ', 'التاريخ', 'إجراءات']} loading={loading}>
                                    {filtered.map(o => (
                                        <TR key={o.id}>
                                            <TD><span style={{ direction: 'ltr' }} className="inline-block text-[11px] text-slate-400">{o.orderNumber}</span></TD>
                                            <TD>{o.userName}</TD>
                                            <TD>{o.paymentMethod}</TD>
                                            <TD><Badge text={o.paymentStatus === 'completed' ? 'مكتمل' : o.paymentStatus} color={o.paymentStatus === 'completed' ? '#22c55e' : '#f59e0b'} /></TD>
                                            <TD>{o.finalPrice} ر.س</TD>
                                            <TD>{new Date(o.createdAt).toLocaleDateString('ar-EG')}</TD>
                                            <TD><Btn small onClick={() => handleDelete(o.id, o.orderNumber, () => deleteOrder(o.id))} outline color="#f87171">حذف</Btn></TD>
                                        </TR>
                                    ))}
                                </Table>
                            )}

                            {/* Streams */}
                            {tab === 'streams' && (
                                <Table headers={['العنوان', 'المدرس', 'الحالة', 'المشاهدون', 'التاريخ', 'إجراءات']} loading={loading}>
                                    {filtered.map(s => (
                                        <TR key={s.id}>
                                            <TD>{s.title}</TD>
                                            <TD>{s.instructorName}</TD>
                                            <TD><Badge text={s.status} color="#38bdf8" /></TD>
                                            <TD>{s.viewerCount}</TD>
                                            <TD>{new Date(s.createdAt).toLocaleDateString('ar-EG')}</TD>
                                            <TD><Btn small onClick={() => handleDelete(s.id, s.title, () => deleteStream(s.id))} outline color="#f87171">حذف</Btn></TD>
                                        </TR>
                                    ))}
                                </Table>
                            )}
                        </div>

                        {/* Pagination */}
                        {total > 20 && !search && (
                            <div className="flex gap-2 justify-center mt-4 items-center">
                                <Btn small onClick={() => { const p = Math.max(1, page - 1); setPage(p); loadTab(tab, p); }} outline disabled={page === 1}>السابق</Btn>
                                <span className="text-slate-400 text-[13px] px-2">صفحة {page} من {Math.ceil(total / 20)}</span>
                                <Btn small onClick={() => { const p = page + 1; setPage(p); loadTab(tab, p); }} outline disabled={page >= Math.ceil(total / 20)}>التالي</Btn>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* ── Confirm Delete Modal ── */}
            {confirm && (
                <Modal title="تأكيد الحذف" onClose={() => setConfirm(null)}>
                    <div className="flex items-start gap-3 mb-5">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                            <svg className="w-5 h-5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                            </svg>
                        </div>
                        <p className="font-cairo text-slate-400 leading-relaxed">
                            هل أنت متأكد من حذف <strong className="text-slate-100">{confirm.label}</strong>؟ لا يمكن التراجع عن هذا الإجراء.
                        </p>
                    </div>
                    <div className="flex gap-2.5 justify-end">
                        <Btn onClick={() => setConfirm(null)} outline color="#64748b">إلغاء</Btn>
                        <Btn onClick={doDelete} color="#dc2626">حذف نهائياً</Btn>
                    </div>
                </Modal>
            )}

            {/* ── Create / Edit User Modal ── */}
            {(modal === 'createUser' || modal === 'editUser') && (
                <Modal
                    title={modal === 'createUser' ? (tab === 'teachers' ? 'إضافة مدرس جديد' : 'إضافة طالب جديد') : 'تعديل بيانات المستخدم'}
                    onClose={() => setModal(null)}
                >
                    <Field label="الاسم الكامل *" htmlFor="user-name">
                        <input id="user-name" className={inputCls} value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="الاسم الكامل" />
                    </Field>
                    <Field label="البريد الإلكتروني *" htmlFor="user-email">
                        <input id="user-email" className={`${inputCls}`} style={{ direction: 'ltr' }} value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" type="email" autoComplete="off" />
                    </Field>
                    <Field label={modal === 'editUser' ? 'كلمة المرور (اتركها فارغة للإبقاء على الحالية)' : 'كلمة المرور *'} htmlFor="user-password">
                        <input id="user-password" className={`${inputCls}`} style={{ direction: 'ltr' }} type="password" value={form.password || ''} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" autoComplete="new-password" />
                    </Field>
                    <Field label="رقم الهاتف" htmlFor="user-phone">
                        <input id="user-phone" className={inputCls} value={form.phoneNumber || ''} onChange={e => setForm({ ...form, phoneNumber: e.target.value })} placeholder="05xxxxxxxx" />
                    </Field>
                    <Field label="نبذة شخصية" htmlFor="user-bio">
                        <textarea id="user-bio" className={`${inputCls} resize-y min-h-[70px]`} value={form.bio || ''} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="نبذة مختصرة..." />
                    </Field>
                    {modal === 'editUser' && (
                        <Field label="الحالة" htmlFor="user-status">
                            <SelectField id="user-status" value={form.isActive ? 'true' : 'false'} onChange={e => setForm({ ...form, isActive: e.target.value === 'true' })}>
                                <option value="true">نشط</option>
                                <option value="false">معطل</option>
                            </SelectField>
                        </Field>
                    )}
                    <div className="flex gap-2.5 justify-end mt-2">
                        <Btn onClick={() => setModal(null)} outline color="#64748b">إلغاء</Btn>
                        <Btn onClick={handleSave} disabled={saving}>{saving ? 'جاري الحفظ...' : 'حفظ'}</Btn>
                    </div>
                </Modal>
            )}

            {/* ── Create / Edit Course Modal ── */}
            {(modal === 'createCourse' || modal === 'editCourse') && (
                <Modal title={modal === 'createCourse' ? 'إضافة مادة جديدة' : 'تعديل المادة'} onClose={() => setModal(null)}>
                    <Field label="عنوان المادة *" htmlFor="course-title">
                        <input id="course-title" className={inputCls} value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="عنوان المادة" />
                    </Field>
                    <Field label="الوصف" htmlFor="course-desc">
                        <textarea id="course-desc" className={`${inputCls} resize-y min-h-[70px]`} value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="وصف المادة..." />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="التصنيف" htmlFor="course-category">
                            <SelectField id="course-category" value={form.category || 'عام'} onChange={e => setForm({ ...form, category: e.target.value })}>
                                {['عام','رياضيات','علوم','لغة عربية','لغة إنجليزية','فيزياء','كيمياء','أحياء','تاريخ','جغرافيا','برمجة','فنون','تربية دينية'].map(c => <option key={c} value={c}>{c}</option>)}
                            </SelectField>
                        </Field>
                        <Field label="المستوى" htmlFor="course-level">
                            <SelectField id="course-level" value={form.level || 'مبتدئ'} onChange={e => setForm({ ...form, level: e.target.value })}>
                                {['مبتدئ','متوسط','متقدم','خبير','جميع المستويات'].map(l => <option key={l} value={l}>{l}</option>)}
                            </SelectField>
                        </Field>
                        <Field label="السعر (ر.س)" htmlFor="course-price">
                            <input id="course-price" className={inputCls} type="number" min="0" step="0.01" value={form.price ?? 0} onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} />
                        </Field>
                        <Field label="المدة (ساعة)" htmlFor="course-duration">
                            <input id="course-duration" className={inputCls} type="number" min="0" value={form.duration ?? 0} onChange={e => setForm({ ...form, duration: parseInt(e.target.value) || 0 })} />
                        </Field>
                        <Field label="اللغة" htmlFor="course-lang">
                            <SelectField id="course-lang" value={form.language || 'العربية'} onChange={e => setForm({ ...form, language: e.target.value })}>
                                {['العربية','الإنجليزية','الفرنسية'].map(l => <option key={l} value={l}>{l}</option>)}
                            </SelectField>
                        </Field>
                        <Field label="الحالة" htmlFor="course-status">
                            <SelectField id="course-status" value={form.status || 'draft'} onChange={e => setForm({ ...form, status: e.target.value })}>
                                <option value="draft">مسودة</option>
                                <option value="published">منشور</option>
                            </SelectField>
                        </Field>
                    </div>
                    <Field label="المدرس *" htmlFor="course-teacher">
                        <SelectField id="course-teacher" value={form.teacherId || ''} onChange={e => setForm({ ...form, teacherId: e.target.value })}>
                            <option value="">-- اختر مدرساً --</option>
                            {teachersList.map(t => <option key={t.id} value={t.id}>{t.name} ({t.email})</option>)}
                        </SelectField>
                    </Field>
                    <Field label="رابط الصورة" htmlFor="course-image">
                        <input id="course-image" className={inputCls} value={form.imageUrl || ''} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
                    </Field>
                    <div className="flex gap-2.5 justify-end mt-2">
                        <Btn onClick={() => setModal(null)} outline color="#64748b">إلغاء</Btn>
                        <Btn onClick={handleSave} disabled={saving}>{saving ? 'جاري الحفظ...' : 'حفظ'}</Btn>
                    </div>
                </Modal>
            )}

            {/* ── Enroll Modal ── */}
            {modal === 'enroll' && (
                <Modal title="تسجيل طالب في مادة" onClose={() => setModal(null)}>
                    <Field label="الطالب *" htmlFor="enroll-student">
                        <SelectField id="enroll-student" value={form.studentId || ''} onChange={e => setForm({ ...form, studentId: e.target.value })}>
                            <option value="">-- اختر طالباً --</option>
                            {studentsList.map(s => <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)}
                        </SelectField>
                    </Field>
                    <Field label="المادة *" htmlFor="enroll-subject">
                        <SelectField id="enroll-subject" value={form.subjectId || ''} onChange={e => setForm({ ...form, subjectId: e.target.value })}>
                            <option value="">-- اختر مادة --</option>
                            {subjectsList.map(s => <option key={s.id} value={s.id}>{s.title} — {s.status === 'published' ? 'منشور' : 'مسودة'}</option>)}
                        </SelectField>
                    </Field>
                    <div className="flex gap-2.5 justify-end mt-2">
                        <Btn onClick={() => setModal(null)} outline color="#64748b">إلغاء</Btn>
                        <Btn onClick={handleSave} disabled={saving}>{saving ? 'جاري التسجيل...' : 'تسجيل'}</Btn>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default AdminDashboard;
