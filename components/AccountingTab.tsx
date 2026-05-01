import React, { useState, useEffect, useCallback } from 'react';
import {
    Transaction, TransactionType, ServiceType, PaymentMethod, Currency,
    getTransactions, createTransaction, updateTransaction, deleteTransaction,
    getTeacherTransactions, createTeacherTransaction, updateTeacherTransaction, deleteTeacherTransaction,
    computeStats, detectCurrency, formatCurrency, exportToCSV,
} from '../api/accounting.api';

// ── Shared UI ──────────────────────────────────────────────────

function Btn({ children, onClick, color = '#f59e0b', outline = false, small = false, disabled = false, type = 'button' }: {
    children: React.ReactNode; onClick?: () => void; color?: string;
    outline?: boolean; small?: boolean; disabled?: boolean; type?: 'button' | 'submit';
}) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`font-cairo cursor-pointer transition-colors duration-200 rounded-lg font-semibold ${small ? 'px-2.5 py-1 text-xs' : 'px-4 py-[7px] text-[13px]'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{ background: outline ? `${color}15` : color, border: `1px solid ${color}50`, color: outline ? color : '#fff' }}
        >
            {children}
        </button>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="mb-3.5">
            <label className="font-cairo block text-xs text-slate-400 mb-1.5 font-semibold">{label}</label>
            {children}
        </div>
    );
}

const inputCls = "font-cairo w-full px-3 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-slate-200 text-sm outline-none focus:border-[#034289]/50 transition-colors duration-150 box-border";
const selectCls = `${inputCls} appearance-none cursor-pointer select-dark`;

const SERVICES: ServiceType[] = ['قدرات', 'تحصيلي', 'قدرات + تحصيلي', 'اشتراك شهري', 'أخرى'];
const PAYMENT_METHODS: PaymentMethod[] = ['تحويل بنكي', 'مدى', 'فيزا', 'كاش', 'STC Pay'];

// ── Stat Card ──────────────────────────────────────────────────
function StatCard({ label, value, color, sub, icon }: {
    label: string; value: string; color: string; sub?: string; icon: React.ReactNode;
}) {
    return (
        <div className="bg-white/[0.04] rounded-2xl px-5 py-4 flex items-start gap-3.5" style={{ border: `1px solid ${color}25` }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
                <span style={{ color }}>{icon}</span>
            </div>
            <div className="min-w-0">
                <div className="text-2xl font-extrabold leading-tight" style={{ color }}>{value}</div>
                <div className="text-[12px] text-slate-400 mt-0.5">{label}</div>
                {sub && <div className="text-[11px] text-slate-500 mt-0.5">{sub}</div>}
            </div>
        </div>
    );
}

// ── Currency badge ─────────────────────────────────────────────
function CurrencyBadge({ currency }: { currency: Currency }) {
    const isEGP = currency === 'EGP';
    return (
        <span
            className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border"
            style={{
                background: isEGP ? '#fbbf2420' : '#34d39920',
                color: isEGP ? '#fbbf24' : '#34d399',
                borderColor: isEGP ? '#fbbf2440' : '#34d39940',
            }}
        >
            {isEGP ? 'ج.م' : 'ر.س'}
        </span>
    );
}

// ── Close Icon ────────────────────────────────────────────────
function CloseBtn({ onClick }: { onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="bg-transparent border-none text-slate-500 hover:text-slate-300 cursor-pointer p-1 rounded-lg transition-colors duration-150"
            aria-label="إغلاق"
        >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
        </button>
    );
}

// ── Modal Shell ────────────────────────────────────────────────
function ModalShell({ onClose, children, maxWidth = 'max-w-md', scrollable = false }: {
    onClose: () => void; children: React.ReactNode; maxWidth?: string; scrollable?: boolean;
}) {
    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center" dir="rtl">
            <div className="absolute inset-0 bg-black/65 backdrop-blur-md" onClick={onClose} />
            <div className={`relative z-10 bg-[#0f172a] border border-white/10 rounded-2xl p-6 w-[92%] ${maxWidth}${scrollable ? ' max-h-[90vh] overflow-y-auto' : ''}`}>
                {children}
            </div>
        </div>
    );
}

// ── Transaction Modal ──────────────────────────────────────────
interface TxModalProps {
    initial?: Transaction | null;
    onSave: (data: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
    onClose: () => void;
    saving: boolean;
}

function TxModal({ initial, onSave, onClose, saving }: TxModalProps) {
    const today = new Date().toISOString().slice(0, 10);
    const [form, setForm] = useState({
        studentName: initial?.studentName || '',
        date: initial?.date || today,
        service: (initial?.service || 'قدرات') as ServiceType,
        amount: initial?.amount?.toString() || '',
        currency: (initial?.currency || 'SAR') as Currency,
        type: (initial?.type || 'income') as TransactionType,
        invoiceNumber: initial?.invoiceNumber || '',
        paymentMethod: (initial?.paymentMethod || 'تحويل بنكي') as PaymentMethod,
        contactNumber: initial?.contactNumber || '',
        notes: initial?.notes || '',
    });

    // Auto-detect currency from phone number
    useEffect(() => {
        if (!initial) {
            const detected = detectCurrency(form.contactNumber);
            setForm(f => ({ ...f, currency: detected }));
        }
    }, [form.contactNumber, initial]);

    const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.studentName.trim() || !form.amount || !form.date) return;
        await onSave({
            studentName: form.studentName.trim(),
            date: form.date,
            service: form.service,
            amount: parseFloat(form.amount) || 0,
            currency: form.currency,
            type: form.type,
            invoiceNumber: form.invoiceNumber || undefined,
            paymentMethod: form.paymentMethod || undefined,
            contactNumber: form.contactNumber || undefined,
            notes: form.notes || undefined,
        });
    };

    const isEGP = form.currency === 'EGP';

    return (
        <ModalShell onClose={onClose} maxWidth="max-w-lg" scrollable>
                <div className="flex justify-between items-center mb-5">
                    <h3 className="font-cairo text-slate-100 text-base font-bold m-0">
                        {initial ? 'تعديل المعاملة' : 'إضافة معاملة جديدة'}
                    </h3>
                    <CloseBtn onClick={onClose} />
                </div>
                <form onSubmit={handleSubmit}>
                    <Field label="اسم الطالب / الجهة *">
                        <input className={inputCls} value={form.studentName} onChange={e => set('studentName', e.target.value)} required placeholder="أدخل الاسم" />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="الخدمة *">
                            <select className={selectCls} value={form.service} onChange={e => set('service', e.target.value)}>
                                {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </Field>
                        <Field label="نوع المعاملة *">
                            <select className={selectCls} value={form.type} onChange={e => set('type', e.target.value)}>
                                <option value="income">إيرادات</option>
                                <option value="expense">مصروفات</option>
                            </select>
                        </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label={`المبلغ (${isEGP ? 'ج.م' : 'ر.س'}) *`}>
                            <input className={inputCls} type="number" min="0" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)} required placeholder="0.00" />
                        </Field>
                        <Field label="العملة">
                            <select className={selectCls} value={form.currency} onChange={e => set('currency', e.target.value as Currency)}>
                                <option value="SAR">ريال سعودي (ر.س)</option>
                                <option value="EGP">جنيه مصري (ج.م)</option>
                            </select>
                        </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="تاريخ المعاملة *">
                            <input className={inputCls} type="date" value={form.date} onChange={e => set('date', e.target.value)} required />
                        </Field>
                        <Field label="طريقة الدفع">
                            <select className={selectCls} value={form.paymentMethod} onChange={e => set('paymentMethod', e.target.value)}>
                                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="رقم التواصل">
                            <input className={inputCls} value={form.contactNumber} onChange={e => set('contactNumber', e.target.value)} placeholder="05xxxxxxxx أو 01xxxxxxxx" />
                        </Field>
                        <Field label="رقم الفاتورة">
                            <input className={inputCls} value={form.invoiceNumber} onChange={e => set('invoiceNumber', e.target.value)} placeholder="INV-001" />
                        </Field>
                    </div>
                    <Field label="ملاحظات">
                        <textarea className={`${inputCls} resize-none`} rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="ملاحظات اختيارية..." />
                    </Field>
                    {/* Currency hint */}
                    <div className="mb-4 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[12px] text-slate-400 flex items-center gap-2">
                        <span>العملة:</span>
                        <span className="font-bold" style={{ color: isEGP ? '#fbbf24' : '#34d399' }}>
                            {isEGP ? 'جنيه مصري (ج.م)' : 'ريال سعودي (ر.س)'}
                        </span>
                        {form.contactNumber && (
                            <span className="text-slate-500 text-[11px]">— كُشف تلقائياً من رقم التواصل</span>
                        )}
                    </div>
                    <div className="flex gap-2.5 justify-end">
                        <Btn onClick={onClose} outline color="#64748b">إلغاء</Btn>
                        <Btn color="#034289" disabled={saving} type="submit">{saving ? 'جاري الحفظ...' : 'حفظ المعاملة'}</Btn>
                    </div>
                </form>
            </ModalShell>
    );
}
function InvoiceModal({ tx, onClose }: { tx: Transaction; onClose: () => void }) {
    const handlePrint = () => {
        const el = document.getElementById('invoice-print-area');
        if (!el) return;
        const win = window.open('', '_blank', 'width=600,height=700');
        if (!win) return;
        win.document.write(`<html dir="rtl"><head><meta charset="utf-8"><title>فاتورة</title>
            <style>body{font-family:Cairo,sans-serif;padding:24px;color:#0f172a}
            .row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e2e8f0;font-size:14px}
            .label{color:#64748b}.value{font-weight:600}</style></head>
            <body>${el.innerHTML}</body></html>`);
        win.document.close();
        win.focus();
        win.print();
        win.close();
    };

    const rows: [string, string][] = [
        ['رقم الفاتورة', tx.invoiceNumber || '—'],
        ['الطالب / الجهة', tx.studentName],
        ['الخدمة', tx.service],
        ['المبلغ', formatCurrency(tx.amount, tx.currency)],
        ['النوع', tx.type === 'income' ? 'إيرادات' : 'مصروفات'],
        ['طريقة الدفع', tx.paymentMethod || '—'],
        ['التاريخ', tx.date],
        ['رقم التواصل', tx.contactNumber || '—'],
        ['ملاحظات', tx.notes || '—'],
    ];

    return (
        <ModalShell onClose={onClose} maxWidth="max-w-md" scrollable>
            <div className="flex justify-between items-center mb-5">
                <h3 className="font-cairo text-slate-100 text-base font-bold m-0">تفاصيل الفاتورة</h3>
                <CloseBtn onClick={onClose} />
            </div>
            <div id="invoice-print-area" className="space-y-3 mb-5">
                {rows.map(([k, v]) => (
                    <div key={k} className="row flex justify-between items-center py-2 border-b border-white/[0.05]">
                        <span className="label text-slate-500 text-sm font-cairo">{k}</span>
                        <span className="value text-slate-200 text-sm font-cairo font-medium">{v}</span>
                    </div>
                ))}
            </div>
            <div className="flex gap-2.5 justify-end">
                <Btn onClick={onClose} outline color="#64748b">إغلاق</Btn>
                <Btn onClick={handlePrint} color="#034289">طباعة الفاتورة</Btn>
            </div>
        </ModalShell>
    );
}

// ── Confirm Delete ─────────────────────────────────────────────
function ConfirmModal({ label, onConfirm, onClose }: { label: string; onConfirm: () => void; onClose: () => void }) {
    return (
        <ModalShell onClose={onClose} maxWidth="max-w-sm">
            <div className="flex items-start gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                </div>
                <div>
                    <p className="font-cairo text-slate-200 font-semibold mb-1">حذف المعاملة</p>
                    <p className="font-cairo text-slate-400 text-sm">هل أنت متأكد من حذف معاملة <strong className="text-slate-200">{label}</strong>؟ لا يمكن التراجع.</p>
                </div>
            </div>
            <div className="flex gap-2.5 justify-end">
                <Btn onClick={onClose} outline color="#64748b">إلغاء</Btn>
                <Btn onClick={onConfirm} color="#dc2626">حذف</Btn>
            </div>
        </ModalShell>
    );
}

// ── Main AccountingTab Component ───────────────────────────────
interface AccountingTabProps {
    mode?: 'admin' | 'teacher';
    teacherId?: string;
    showToast: (msg: string, ok?: boolean) => void;
}

const AccountingTab: React.FC<AccountingTabProps> = ({ mode = 'admin', teacherId, showToast }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState<'add' | 'edit' | 'invoice' | 'delete' | null>(null);
    const [selected, setSelected] = useState<Transaction | null>(null);
    const [saving, setSaving] = useState(false);

    // Filters
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
    const [filterService, setFilterService] = useState<'all' | ServiceType>('all');
    const [filterMethod, setFilterMethod] = useState<'all' | PaymentMethod>('all');
    const [filterCurrency, setFilterCurrency] = useState<'all' | Currency>('all');

    const isTeacher = mode === 'teacher';

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = isTeacher && teacherId
                ? await getTeacherTransactions(teacherId)
                : await getTransactions();
            setTransactions(data);
        } catch {
            showToast('فشل تحميل المعاملات', false);
        }
        setLoading(false);
    }, [isTeacher, teacherId, showToast]);

    useEffect(() => { load(); }, [load]);

    const handleSave = async (data: Omit<Transaction, 'id' | 'createdAt'>) => {
        setSaving(true);
        try {
            if (modal === 'edit' && selected) {
                if (isTeacher && teacherId) {
                    await updateTeacherTransaction(selected.id, data, teacherId);
                } else {
                    await updateTransaction(selected.id, data);
                }
                showToast('تم تحديث المعاملة', true);
            } else {
                if (isTeacher && teacherId) {
                    await createTeacherTransaction({ ...data, teacherId }, teacherId);
                } else {
                    await createTransaction(data);
                }
                showToast('تمت إضافة المعاملة', true);
            }
            setModal(null);
            setSelected(null);
            await load();
        } catch {
            showToast('حدث خطأ أثناء الحفظ', false);
        }
        setSaving(false);
    };

    const handleDelete = async () => {
        if (!selected) return;
        try {
            if (isTeacher) {
                await deleteTeacherTransaction(selected.id);
            } else {
                await deleteTransaction(selected.id);
            }
            showToast('تم حذف المعاملة', true);
            setModal(null);
            setSelected(null);
            await load();
        } catch {
            showToast('فشل الحذف', false);
        }
    };

    // Filtered list
    const filtered = transactions.filter(t => {
        if (filterType !== 'all' && t.type !== filterType) return false;
        if (filterService !== 'all' && t.service !== filterService) return false;
        if (filterMethod !== 'all' && t.paymentMethod !== filterMethod) return false;
        if (filterCurrency !== 'all' && t.currency !== filterCurrency) return false;
        if (search.trim()) {
            const q = search.toLowerCase();
            return (
                t.studentName.toLowerCase().includes(q) ||
                (t.invoiceNumber || '').toLowerCase().includes(q) ||
                (t.contactNumber || '').includes(q) ||
                (t.notes || '').toLowerCase().includes(q)
            );
        }
        return true;
    });

    const stats = computeStats(transactions);

    // Split stats by currency for display
    const sarTxs = transactions.filter(t => t.currency === 'SAR');
    const egpTxs = transactions.filter(t => t.currency === 'EGP');
    const sarStats = computeStats(sarTxs);
    const egpStats = computeStats(egpTxs);
    const hasBothCurrencies = sarTxs.length > 0 && egpTxs.length > 0;

    const resetFilters = () => {
        setSearch(''); setFilterType('all'); setFilterService('all');
        setFilterMethod('all'); setFilterCurrency('all');
    };

    const hasFilters = search || filterType !== 'all' || filterService !== 'all' || filterMethod !== 'all' || filterCurrency !== 'all';

    return (
        <div dir="rtl" className="font-cairo">
            {/* Header */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <div>
                    <h2 className="font-cairo text-slate-100 text-lg font-extrabold m-0">
                        {isTeacher ? 'حساباتي' : 'نظام الحسابات'}
                    </h2>
                    <p className="text-slate-500 text-[13px] mt-0.5 m-0">
                        {isTeacher ? 'إدارة إيراداتك ومصروفاتك' : 'إدارة الإيرادات والمصروفات — القدرات والتحصيلي'}
                    </p>
                </div>
                <div className="flex gap-2.5">
                    <Btn onClick={() => exportToCSV(filtered)} outline color="#64748b">
                        <span className="flex items-center gap-1.5">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeLinecap="round" strokeLinejoin="round"/>
                                <polyline points="7,10 12,15 17,10" strokeLinecap="round" strokeLinejoin="round"/>
                                <line x1="12" y1="15" x2="12" y2="3" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            تصدير CSV
                        </span>
                    </Btn>
                    <Btn onClick={() => { setSelected(null); setModal('add'); }} color="#034289">
                        <span className="flex items-center gap-1.5">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                                <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            إضافة معاملة
                        </span>
                    </Btn>
                </div>
            </div>

            {/* Stats */}
            {hasBothCurrencies ? (
                <div className="space-y-3 mb-5">
                    {/* SAR stats */}
                    <div className="px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                        <div className="text-[11px] text-slate-500 mb-2 font-semibold">ريال سعودي (ر.س)</div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <StatCard label="إجمالي الإيرادات" value={formatCurrency(sarStats.totalIncome, 'SAR')} color="#34d399" sub={`↑ ${sarStats.incomeCount} معاملة`} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23,6 13.5,15.5 8.5,10.5 1,18" strokeLinecap="round" strokeLinejoin="round"/><polyline points="17,6 23,6 23,12" strokeLinecap="round" strokeLinejoin="round"/></svg>} />
                            <StatCard label="إجمالي المصروفات" value={formatCurrency(sarStats.totalExpenses, 'SAR')} color="#f87171" sub={`↓ ${sarStats.expenseCount} معاملة`} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23,18 13.5,8.5 8.5,13.5 1,6" strokeLinecap="round" strokeLinejoin="round"/><polyline points="17,18 23,18 23,12" strokeLinecap="round" strokeLinejoin="round"/></svg>} />
                            <StatCard label="صافي الربح" value={formatCurrency(sarStats.netProfit, 'SAR')} color={sarStats.netProfit >= 0 ? '#a78bfa' : '#f87171'} sub="الفرق الصافي" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 8v4l3 3" strokeLinecap="round" strokeLinejoin="round"/></svg>} />
                            <StatCard label="الطلاب المسجلون" value={String(sarStats.totalStudents)} color="#38bdf8" sub="من سجل الإيرادات" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round"/></svg>} />
                        </div>
                    </div>
                    {/* EGP stats */}
                    <div className="px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                        <div className="text-[11px] text-slate-500 mb-2 font-semibold">جنيه مصري (ج.م)</div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <StatCard label="إجمالي الإيرادات" value={formatCurrency(egpStats.totalIncome, 'EGP')} color="#34d399" sub={`↑ ${egpStats.incomeCount} معاملة`} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23,6 13.5,15.5 8.5,10.5 1,18" strokeLinecap="round" strokeLinejoin="round"/><polyline points="17,6 23,6 23,12" strokeLinecap="round" strokeLinejoin="round"/></svg>} />
                            <StatCard label="إجمالي المصروفات" value={formatCurrency(egpStats.totalExpenses, 'EGP')} color="#f87171" sub={`↓ ${egpStats.expenseCount} معاملة`} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23,18 13.5,8.5 8.5,13.5 1,6" strokeLinecap="round" strokeLinejoin="round"/><polyline points="17,18 23,18 23,12" strokeLinecap="round" strokeLinejoin="round"/></svg>} />
                            <StatCard label="صافي الربح" value={formatCurrency(egpStats.netProfit, 'EGP')} color={egpStats.netProfit >= 0 ? '#a78bfa' : '#f87171'} sub="الفرق الصافي" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 8v4l3 3" strokeLinecap="round" strokeLinejoin="round"/></svg>} />
                            <StatCard label="الطلاب المسجلون" value={String(egpStats.totalStudents)} color="#38bdf8" sub="من سجل الإيرادات" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round"/></svg>} />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                    <StatCard label="إجمالي الإيرادات" value={formatCurrency(stats.totalIncome, transactions[0]?.currency || 'SAR')} color="#34d399" sub={`↑ ${stats.incomeCount} معاملة`} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23,6 13.5,15.5 8.5,10.5 1,18" strokeLinecap="round" strokeLinejoin="round"/><polyline points="17,6 23,6 23,12" strokeLinecap="round" strokeLinejoin="round"/></svg>} />
                    <StatCard label="إجمالي المصروفات" value={formatCurrency(stats.totalExpenses, transactions[0]?.currency || 'SAR')} color="#f87171" sub={`↓ ${stats.expenseCount} معاملة`} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23,18 13.5,8.5 8.5,13.5 1,6" strokeLinecap="round" strokeLinejoin="round"/><polyline points="17,18 23,18 23,12" strokeLinecap="round" strokeLinejoin="round"/></svg>} />
                    <StatCard label="صافي الربح" value={formatCurrency(stats.netProfit, transactions[0]?.currency || 'SAR')} color={stats.netProfit >= 0 ? '#a78bfa' : '#f87171'} sub="الفرق الصافي" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 8v4l3 3" strokeLinecap="round" strokeLinejoin="round"/></svg>} />
                    <StatCard label="الطلاب المسجلون" value={String(stats.totalStudents)} color="#38bdf8" sub="من سجل الإيرادات" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round"/></svg>} />
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap gap-2.5 mb-4 items-center">
                <div className="relative flex-1 min-w-[180px]">
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <input
                        className="font-cairo w-full pr-9 pl-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-slate-200 text-sm outline-none focus:border-[#034289]/60 transition-colors duration-150"
                        placeholder="بحث بالاسم أو الفاتورة..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        aria-label="بحث"
                    />
                </div>
                <select className={`${selectCls} w-auto min-w-[110px]`} value={filterType} onChange={e => setFilterType(e.target.value as any)} aria-label="تصفية النوع">
                    <option value="all">كل الأنواع</option>
                    <option value="income">إيرادات</option>
                    <option value="expense">مصروفات</option>
                </select>
                <select className={`${selectCls} w-auto min-w-[130px]`} value={filterService} onChange={e => setFilterService(e.target.value as any)} aria-label="تصفية الخدمة">
                    <option value="all">كل الخدمات</option>
                    {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select className={`${selectCls} w-auto min-w-[110px]`} value={filterCurrency} onChange={e => setFilterCurrency(e.target.value as any)} aria-label="تصفية العملة">
                    <option value="all">كل العملات</option>
                    <option value="SAR">ريال (ر.س)</option>
                    <option value="EGP">جنيه (ج.م)</option>
                </select>
                <select className={`${selectCls} w-auto min-w-[120px]`} value={filterMethod} onChange={e => setFilterMethod(e.target.value as any)} aria-label="تصفية طريقة الدفع">
                    <option value="all">كل الطرق</option>
                    {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                {hasFilters && (
                    <Btn onClick={resetFilters} outline color="#64748b" small>↺ إعادة ضبط</Btn>
                )}
            </div>

            {/* Table */}
            <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                    <span className="font-cairo text-slate-300 text-sm font-semibold">سجل المعاملات</span>
                    <span className="text-slate-500 text-[12px]">{filtered.length} معاملة</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm" role="table">
                        <thead>
                            <tr className="border-b border-white/[0.08]">
                                {['#', 'الاسم', 'التاريخ', 'الخدمة', 'المبلغ', 'النوع', 'الفاتورة', 'الدفع', 'التواصل', 'ملاحظات', 'إجراءات'].map(h => (
                                    <th key={h} className="font-cairo px-3 py-2.5 text-slate-500 font-semibold text-right whitespace-nowrap text-[12px]">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [1,2,3,4,5].map(i => (
                                    <tr key={i} className="border-b border-white/[0.04]">
                                        {Array(11).fill(0).map((_, j) => (
                                            <td key={j} className="px-3 py-3">
                                                <div className="animate-pulse bg-white/[0.05] rounded h-4 w-full" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={11} className="text-center py-12 text-slate-500 font-cairo">
                                        <svg className="w-10 h-10 mx-auto mb-3 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                                            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                        {hasFilters ? 'لا توجد معاملات مطابقة للفلتر' : 'لا توجد معاملات بعد'}
                                    </td>
                                </tr>
                            ) : filtered.map((tx, idx) => (
                                <tr key={tx.id} className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors duration-150">
                                    <td className="px-3 py-2.5 text-slate-500 text-[12px]">{idx + 1}</td>
                                    <td className="px-3 py-2.5 text-slate-200 font-medium whitespace-nowrap">{tx.studentName}</td>
                                    <td className="px-3 py-2.5 text-slate-400 whitespace-nowrap text-[12px]">{tx.date}</td>
                                    <td className="px-3 py-2.5 text-slate-300 whitespace-nowrap text-[12px]">{tx.service}</td>
                                    <td className="px-3 py-2.5 whitespace-nowrap">
                                        <span className="font-bold" style={{ color: tx.type === 'income' ? '#34d399' : '#f87171' }}>
                                            {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, tx.currency)}
                                        </span>
                                        <CurrencyBadge currency={tx.currency} />
                                    </td>
                                    <td className="px-3 py-2.5">
                                        <span
                                            className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border"
                                            style={{
                                                background: tx.type === 'income' ? '#34d39920' : '#f8717120',
                                                color: tx.type === 'income' ? '#34d399' : '#f87171',
                                                borderColor: tx.type === 'income' ? '#34d39940' : '#f8717140',
                                            }}
                                        >
                                            {tx.type === 'income' ? 'إيرادات' : 'مصروفات'}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2.5 text-slate-400 text-[12px]">{tx.invoiceNumber || '—'}</td>
                                    <td className="px-3 py-2.5 text-slate-400 text-[12px] whitespace-nowrap">{tx.paymentMethod || '—'}</td>
                                    <td className="px-3 py-2.5 text-slate-400 text-[12px]" style={{ direction: 'ltr' }}>{tx.contactNumber || '—'}</td>
                                    <td className="px-3 py-2.5 text-slate-500 text-[12px] max-w-[120px] truncate">{tx.notes || '—'}</td>
                                    <td className="px-3 py-2.5">
                                        <div className="flex gap-1.5">
                                            <Btn small onClick={() => { setSelected(tx); setModal('invoice'); }} outline color="#38bdf8">فاتورة</Btn>
                                            <Btn small onClick={() => { setSelected(tx); setModal('edit'); }} outline>تعديل</Btn>
                                            <Btn small onClick={() => { setSelected(tx); setModal('delete'); }} outline color="#f87171">حذف</Btn>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            {(modal === 'add' || modal === 'edit') && (
                <TxModal
                    initial={modal === 'edit' ? selected : null}
                    onSave={handleSave}
                    onClose={() => { setModal(null); setSelected(null); }}
                    saving={saving}
                />
            )}
            {modal === 'invoice' && selected && (
                <InvoiceModal tx={selected} onClose={() => { setModal(null); setSelected(null); }} />
            )}
            {modal === 'delete' && selected && (
                <ConfirmModal
                    label={selected.studentName}
                    onConfirm={handleDelete}
                    onClose={() => { setModal(null); setSelected(null); }}
                />
            )}
        </div>
    );
};

export default AccountingTab;
