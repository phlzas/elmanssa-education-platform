import React, { useState, useEffect } from 'react';
import { Page } from '../App';
import { Subject, Level, Lecture, TeacherNavItem } from './teacher/types';
import {
    fetchTeacherSubjects, fetchTeacherStats, fetchTeacherStudents, pingTeacherAuth,
    createTeacherSubject, updateTeacherSubject, deleteTeacherSubject,
    publishTeacherSubject, createCourseWithCurriculum
} from '../services/api';
import TeacherSidebar from './teacher/TeacherSidebar';
import TeacherStats from './teacher/TeacherStats';
import TeacherSubjectsGrid from './teacher/TeacherSubjectsGrid';
import TeacherStudents from './teacher/TeacherStudents';
import TeacherAnalytics from './teacher/TeacherAnalytics';
import TeacherProfile from './teacher/TeacherProfile';
import SubjectModal from './teacher/SubjectModal';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface TeacherDashboardProps {
    onNavigate: (page: Page, payload?: { tab?: string }) => void;
    initialTab?: string;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onNavigate, initialTab }) => {
    const { user } = useAuth();
    const { showToast } = useToast();

    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [activeNav, setActiveNav] = useState<TeacherNavItem>((initialTab as TeacherNavItem) || 'subjects');
    const [mobileSidebar, setMobileSidebar] = useState(false);

    // Modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createStep, setCreateStep] = useState(1);
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // API data
    const [apiStats, setApiStats] = useState<any>(null);
    const [apiStudents, setApiStudents] = useState<any[]>([]);
    const [apiActivities, setApiActivities] = useState<any[]>([]);
    const [studentsLoading, setStudentsLoading] = useState(false);

    // Form state
    const [newSubjectName, setNewSubjectName] = useState('');
    const [newSubjectDesc, setNewSubjectDesc] = useState('');
    const [newSubjectIcon, setNewSubjectIcon] = useState('📚');
    const [newSubjectPrice, setNewSubjectPrice] = useState(0);
    const [newSubjectLevel, setNewSubjectLevel] = useState('مبتدئ');
    const [newSubjectCategory, setNewSubjectCategory] = useState('عام');
    const [newSubjectImageUrl, setNewSubjectImageUrl] = useState('');
    const [newLevels, setNewLevels] = useState<Level[]>([{ id: 'new-l1', name: 'المستوى 1', lectures: [] }]);

    // ── Load subjects + stats ──────────────────────────────────────────────
    useEffect(() => {
        const loadData = async () => {
            setIsLoadingData(true);
            try {
                const ok = await pingTeacherAuth();
                if (!ok) { onNavigate('login'); return; }

                const [subjectsData, statsData] = await Promise.all([
                    fetchTeacherSubjects(),
                    fetchTeacherStats(),
                ]);

                if (Array.isArray(subjectsData)) {
                    setSubjects(subjectsData.map((s: any) => ({
                        id: s.id?.toString() || `subj-${Date.now()}`,
                        name: s.title || s.name || '',
                        description: s.description || '',
                        icon: s.icon || '📚',
                        category: s.category || 'عام',
                        price: s.price || 0,
                        level: s.level || 'مبتدئ',
                        levels: (s.levels || []).map((l: any) => ({
                            id: l.id?.toString() || `lev-${Date.now()}`,
                            name: l.title || l.name || '',
                            lectures: (l.lectures || []).map((lec: any) => ({
                                id: lec.id?.toString() || `lec-${Date.now()}`,
                                title: lec.title || '',
                                duration: lec.duration || '00:00',
                                videoUrl: lec.videoUrl || '',
                            })),
                        })),
                        students: s.studentsCount || 0,
                        status: s.status === 'published' || s.status === 'Published' ? 'published' : 'draft',
                        createdAt: s.createdAt ? new Date(s.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                    })));
                }

                if (statsData) {
                    setApiStats(statsData);
                    if (Array.isArray(statsData.recentActivities)) {
                        setApiActivities(statsData.recentActivities.map((a: any) => ({
                            text: a.description || a.text || '',
                            time: a.time || a.createdAt || '',
                        })));
                    }
                }
            } catch (err) {
                console.error('Error loading teacher data', err);
            }
            setIsLoadingData(false);
        };

        loadData();
    }, []);

    // ── Load students on tab switch ────────────────────────────────────────
    useEffect(() => {
        if (activeNav !== 'students') return;
        setStudentsLoading(true);
        fetchTeacherStudents()
            .then((data: any) => {
                if (Array.isArray(data)) {
                    setApiStudents(data.map((st: any) => ({ name: st.name || 'طالب', email: st.email || '', avatar: '', id: st.id })));
                }
            })
            .catch(() => {})
            .finally(() => setStudentsLoading(false));
    }, [activeNav]);

    // ── Computed stats ─────────────────────────────────────────────────────
    const totalStudents = apiStats?.totalStudents ?? subjects.reduce((a, s) => a + s.students, 0);
    const totalLectures = apiStats?.totalLectures ?? subjects.reduce((a, s) => a + s.levels.reduce((b, l) => b + l.lectures.length, 0), 0);
    const publishedCount = apiStats?.publishedCount ?? subjects.filter(s => s.status === 'published').length;
    const totalSubjects = apiStats?.totalSubjects ?? subjects.length;

    // ── Form helpers ───────────────────────────────────────────────────────
    const resetForm = () => {
        setNewSubjectName(''); setNewSubjectDesc(''); setNewSubjectIcon('📚');
        setNewSubjectPrice(0); setNewSubjectLevel('مبتدئ'); setNewSubjectCategory('عام');
        setNewSubjectImageUrl('');
        setNewLevels([{ id: 'new-l1', name: 'المستوى 1', lectures: [] }]);
        setCreateStep(1); setEditingSubject(null);
    };

    const openCreateModal = () => { resetForm(); setShowCreateModal(true); };
    const openEditModal = (subject: Subject) => {
        setEditingSubject(subject);
        setNewSubjectName(subject.name); setNewSubjectDesc(subject.description);
        setNewSubjectIcon(subject.icon); setNewSubjectLevel('مبتدئ');
        setNewSubjectCategory(subject.category || 'عام'); setNewSubjectImageUrl('');
        setNewLevels(JSON.parse(JSON.stringify(subject.levels)));
        setCreateStep(1); setShowCreateModal(true);
    };

    const addLevel = () => setNewLevels([...newLevels, { id: `new-l${newLevels.length + 1}-${Date.now()}`, name: `المستوى ${newLevels.length + 1}`, lectures: [] }]);
    const removeLevel = (id: string) => { if (newLevels.length > 1) setNewLevels(newLevels.filter(l => l.id !== id)); };
    const updateLevelName = (id: string, name: string) => setNewLevels(newLevels.map(l => l.id === id ? { ...l, name } : l));
    const addLecture = (levelId: string) => setNewLevels(newLevels.map(l => l.id === levelId ? { ...l, lectures: [...l.lectures, { id: `lec-${Date.now()}-${Math.random().toString(36).substr(2,5)}`, title: '', duration: '00:00', videoUrl: '' }] } : l));
    const removeLecture = (levelId: string, lecId: string) => setNewLevels(newLevels.map(l => l.id === levelId ? { ...l, lectures: l.lectures.filter(lec => lec.id !== lecId) } : l));
    const updateLecture = (levelId: string, lecId: string, field: keyof Lecture, value: string) =>
        setNewLevels(newLevels.map(l => l.id === levelId ? { ...l, lectures: l.lectures.map(lec => lec.id === lecId ? { ...lec, [field]: value } : lec) } : l));

    // ── Save subject ───────────────────────────────────────────────────────
    const saveSubject = async () => {
        if (!user) { showToast('يجب تسجيل الدخول أولاً', 'error'); onNavigate('login'); return; }

        setIsSaving(true);
        try {
            if (editingSubject) {
                await updateTeacherSubject(editingSubject.id, { title: newSubjectName, description: newSubjectDesc });
                setSubjects(subjects.map(s => s.id === editingSubject.id ? { ...s, name: newSubjectName, description: newSubjectDesc, icon: newSubjectIcon, levels: newLevels } : s));
                showToast('تم تحديث المادة بنجاح', 'success');
            } else {
                const totalDuration = newLevels.reduce((total, level) => total + level.lectures.reduce((sum, lec) => {
                    const parts = lec.duration.trim().split(':').map(p => parseInt(p) || 0);
                    return sum + (parts.length === 3 ? parts[0] * 60 + parts[1] : parts.length === 2 ? parts[0] : 0);
                }, 0), 0);

                const sections = newLevels
                    .filter(l => l.name.trim())
                    .map((level, i) => ({
                        title: level.name,
                        sortOrder: i,
                        lectures: level.lectures.filter(lec => lec.title.trim()).map((lec, j) => ({
                            title: lec.title, duration: lec.duration || undefined,
                            videoUrl: lec.videoUrl || undefined, sortOrder: j, isPreview: j === 0,
                        })),
                    }));

                const created = await createCourseWithCurriculum({
                    title: newSubjectName, description: newSubjectDesc || undefined,
                    category: newSubjectCategory || 'عام', duration: Math.max(1, totalDuration),
                    level: newSubjectLevel !== 'جميع المستويات' ? newSubjectLevel : undefined,
                    language: 'العربية', price: newSubjectPrice,
                    imageUrl: newSubjectImageUrl || undefined, sections,
                });

                if (!created) throw new Error('لم يتم استلام رد من الخادم');
                const rd = created.data || created;
                if (!rd.id) throw new Error('الرد من الخادم لا يحتوي على معرف المادة');

                setSubjects([...subjects, {
                    id: rd.id.toString(), name: rd.title || newSubjectName,
                    description: rd.description || '', icon: newSubjectIcon,
                    levels: (rd.levels || []).map((s: any) => ({
                        id: s.id?.toString() || `lev-${Date.now()}`, name: s.title || s.name || '',
                        lectures: (s.lectures || []).map((l: any) => ({ id: l.id?.toString() || `lec-${Date.now()}`, title: l.title, duration: l.duration || '00:00', videoUrl: l.videoUrl || '' })),
                    })),
                    students: rd.studentsCount || 0,
                    status: rd.status === 'published' ? 'published' : 'draft',
                    createdAt: rd.createdAt ? new Date(rd.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                }]);
                showToast('تم إنشاء المادة بنجاح', 'success');
            }
            setTimeout(() => { setShowCreateModal(false); resetForm(); setIsSaving(false); }, 800);
        } catch (err: any) {
            const msg = err.status === 401 ? 'انتهت صلاحية الجلسة'
                : err.status === 403 ? 'غير مصرح'
                : err.response?.error?.message || err.message || 'حدث خطأ أثناء حفظ المادة';
            showToast(msg, 'error');
            setIsSaving(false);
        }
    };

    const deleteSubject = async (id: string) => {
        try { await deleteTeacherSubject(parseInt(id)); showToast('تم حذف المادة', 'success'); }
        catch { showToast('حدث خطأ أثناء الحذف', 'error'); }
        setSubjects(subjects.filter(s => s.id !== id));
    };

    const togglePublish = async (id: string) => {
        const subject = subjects.find(s => s.id === id);
        if (!subject) return;
        const newStatus = subject.status === 'published' ? 'draft' : 'published';
        try { await publishTeacherSubject(id, newStatus); showToast(newStatus === 'published' ? 'تم نشر المادة' : 'تم إيقاف النشر', 'success'); }
        catch { showToast('حدث خطأ', 'error'); }
        setSubjects(subjects.map(s => s.id === id ? { ...s, status: newStatus as 'published' | 'draft' } : s));
    };

    // ── Loading screen ─────────────────────────────────────────────────────
    if (isLoadingData) {
        return (
            <div dir="rtl" style={{ display: 'flex', minHeight: '100vh', background: '#0a1628', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cairo', sans-serif" }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '3px solid rgba(245,158,11,0.15)', borderTopColor: '#f59e0b', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
                    <div style={{ color: '#e2e8f0', fontSize: '15px', fontWeight: 600 }}>جاري تحميل البيانات...</div>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div dir="rtl" style={{ display: 'flex', minHeight: '100vh', background: '#0a1628', fontFamily: "'Cairo', sans-serif" }}>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
                @media (min-width: 769px) { .t-sidebar { display: flex !important; } .t-menu-btn { display: none !important; } }
                @media (max-width: 768px) { .t-sidebar { display: none !important; } .teacher-stats { grid-template-columns: repeat(2,1fr) !important; } }
            `}</style>

            {/* Desktop sidebar */}
            <div className="t-sidebar" style={{ display: 'none' }}>
                <TeacherSidebar activeNav={activeNav} onNavChange={setActiveNav} onNavigate={onNavigate} />
            </div>

            {/* Mobile sidebar overlay */}
            {mobileSidebar && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }} onClick={() => setMobileSidebar(false)} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <TeacherSidebar activeNav={activeNav} onNavChange={(nav) => { setActiveNav(nav); setMobileSidebar(false); }} onNavigate={onNavigate} />
                    </div>
                </div>
            )}

            {/* Main */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                {/* Top bar */}
                <header style={{
                    background: '#0f172a', borderBottom: '1px solid rgba(255,255,255,0.06)',
                    padding: '14px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    position: 'sticky', top: 0, zIndex: 40,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <button className="t-menu-btn" onClick={() => setMobileSidebar(true)} style={{
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '8px', padding: '8px', color: '#94a3b8', cursor: 'pointer',
                            display: 'none', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round"/>
                                <line x1="3" y1="12" x2="21" y2="12" strokeLinecap="round"/>
                                <line x1="3" y1="18" x2="21" y2="18" strokeLinecap="round"/>
                            </svg>
                        </button>
                        <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#f1f5f9', margin: 0 }}>
                            مرحباً، أ. {user?.name || 'المدرس'}
                        </h1>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button onClick={() => onNavigate('home')} style={{
                            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '9px', padding: '9px 14px', color: '#94a3b8', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px',
                            fontFamily: "'Cairo', sans-serif", transition: 'all 0.15s',
                        }}
                            onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#f1f5f9'; }}
                            onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#94a3b8'; }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round"/>
                                <polyline points="9,22 9,12 15,12 15,22" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            الموقع الرئيسي
                        </button>
                        <button onClick={openCreateModal} style={{
                            background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none',
                            borderRadius: '9px', padding: '9px 18px', color: '#fff',
                            fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '6px',
                            fontFamily: "'Cairo', sans-serif", boxShadow: '0 4px 14px rgba(245,158,11,0.28)',
                            transition: 'opacity 0.15s',
                        }}
                            onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
                            onMouseOut={e => e.currentTarget.style.opacity = '1'}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            مادة جديدة
                        </button>
                    </div>
                </header>

                {/* Page content */}
                <main style={{ flex: 1, overflowY: 'auto', padding: '22px' }}>
                    {(activeNav === 'dashboard' || activeNav === 'subjects') && (
                        <>
                            <TeacherStats totalSubjects={totalSubjects} totalStudents={totalStudents} totalLectures={totalLectures} publishedCount={publishedCount} />
                            <TeacherSubjectsGrid subjects={subjects} onEdit={openEditModal} onTogglePublish={togglePublish} onDelete={deleteSubject} onCreateNew={openCreateModal} />
                        </>
                    )}
                    {activeNav === 'students' && <TeacherStudents students={apiStudents} loading={studentsLoading} />}
                    {activeNav === 'analytics' && (
                        <TeacherAnalytics subjects={subjects} totalSubjects={totalSubjects} totalStudents={totalStudents} totalLectures={totalLectures} publishedCount={publishedCount} activities={apiActivities} />
                    )}
                    {activeNav === 'profile' && <TeacherProfile />}
                </main>
            </div>

            {/* Modal */}
            <SubjectModal
                show={showCreateModal}
                onClose={() => { setShowCreateModal(false); resetForm(); }}
                editingSubject={editingSubject}
                createStep={createStep} setCreateStep={setCreateStep}
                newSubjectName={newSubjectName} setNewSubjectName={setNewSubjectName}
                newSubjectDesc={newSubjectDesc} setNewSubjectDesc={setNewSubjectDesc}
                newSubjectIcon={newSubjectIcon} setNewSubjectIcon={setNewSubjectIcon}
                newSubjectPrice={newSubjectPrice} setNewSubjectPrice={setNewSubjectPrice}
                newSubjectLevel={newSubjectLevel} setNewSubjectLevel={setNewSubjectLevel}
                newSubjectCategory={newSubjectCategory} setNewSubjectCategory={setNewSubjectCategory}
                newSubjectImageUrl={newSubjectImageUrl} setNewSubjectImageUrl={setNewSubjectImageUrl}
                newLevels={newLevels}
                addLevel={addLevel} removeLevel={removeLevel} updateLevelName={updateLevelName}
                addLecture={addLecture} removeLecture={removeLecture} updateLecture={updateLecture}
                onSave={saveSubject} isSaving={isSaving}
            />
        </div>
    );
};

export default TeacherDashboard;
