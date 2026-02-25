
import React, { useState } from 'react';
import { Page } from '../App';
import { Subject, Level, Lecture, TeacherNavItem } from './teacher/types';
import { initialSubjects, mockStudents, mockActivities } from './teacher/mockData';
import TeacherSidebar from './teacher/TeacherSidebar';
import SubjectModal from './teacher/SubjectModal';
import { useAuth } from '../contexts/AuthContext';

interface TeacherDashboardProps {
    onNavigate: (page: Page) => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onNavigate }) => {
    const { user } = useAuth();
    const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
    const [activeNav, setActiveNav] = useState<TeacherNavItem>('dashboard');
    const [mobileSidebar, setMobileSidebar] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createStep, setCreateStep] = useState(1);
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

    // New subject form state
    const [newSubjectName, setNewSubjectName] = useState('');
    const [newSubjectDesc, setNewSubjectDesc] = useState('');
    const [newSubjectIcon, setNewSubjectIcon] = useState('📚');
    const [newLevels, setNewLevels] = useState<Level[]>([
        { id: 'new-l1', name: 'المستوى 1', lectures: [] }
    ]);

    // Computed stats
    const totalStudents = subjects.reduce((a, s) => a + s.students, 0);
    const totalLectures = subjects.reduce((a, s) => a + s.levels.reduce((b, l) => b + l.lectures.length, 0), 0);
    const publishedCount = subjects.filter(s => s.status === 'published').length;

    const resetForm = () => {
        setNewSubjectName('');
        setNewSubjectDesc('');
        setNewSubjectIcon('📚');
        setNewLevels([{ id: 'new-l1', name: 'المستوى 1', lectures: [] }]);
        setCreateStep(1);
        setEditingSubject(null);
    };

    const openCreateModal = () => { resetForm(); setShowCreateModal(true); };
    const openEditModal = (subject: Subject) => {
        setEditingSubject(subject);
        setNewSubjectName(subject.name);
        setNewSubjectDesc(subject.description);
        setNewSubjectIcon(subject.icon);
        setNewLevels(JSON.parse(JSON.stringify(subject.levels)));
        setCreateStep(1);
        setShowCreateModal(true);
    };

    const addLevel = () => {
        const newId = `new-l${newLevels.length + 1}-${Date.now()}`;
        setNewLevels([...newLevels, { id: newId, name: `المستوى ${newLevels.length + 1}`, lectures: [] }]);
    };
    const removeLevel = (levelId: string) => { if (newLevels.length > 1) setNewLevels(newLevels.filter(l => l.id !== levelId)); };
    const updateLevelName = (levelId: string, name: string) => { setNewLevels(newLevels.map(l => l.id === levelId ? { ...l, name } : l)); };
    const addLecture = (levelId: string) => {
        setNewLevels(newLevels.map(l => {
            if (l.id === levelId) {
                const newLec: Lecture = { id: `lec-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, title: '', duration: '00:00', videoUrl: '' };
                return { ...l, lectures: [...l.lectures, newLec] };
            }
            return l;
        }));
    };
    const removeLecture = (levelId: string, lecId: string) => {
        setNewLevels(newLevels.map(l => l.id === levelId ? { ...l, lectures: l.lectures.filter(lec => lec.id !== lecId) } : l));
    };
    const updateLecture = (levelId: string, lecId: string, field: keyof Lecture, value: string) => {
        setNewLevels(newLevels.map(l => {
            if (l.id === levelId) {
                return { ...l, lectures: l.lectures.map(lec => lec.id === lecId ? { ...lec, [field]: value } : lec) };
            }
            return l;
        }));
    };
    const saveSubject = () => {
        if (editingSubject) {
            setSubjects(subjects.map(s =>
                s.id === editingSubject.id
                    ? { ...s, name: newSubjectName, description: newSubjectDesc, icon: newSubjectIcon, levels: newLevels }
                    : s
            ));
        } else {
            const newSubject: Subject = {
                id: `subj-${Date.now()}`, name: newSubjectName, description: newSubjectDesc, icon: newSubjectIcon,
                levels: newLevels, students: 0, status: 'draft', createdAt: new Date().toISOString().split('T')[0],
            };
            setSubjects([...subjects, newSubject]);
        }
        setShowCreateModal(false);
        resetForm();
    };
    const deleteSubject = (id: string) => { setSubjects(subjects.filter(s => s.id !== id)); };
    const togglePublish = (id: string) => {
        setSubjects(subjects.map(s => s.id === id ? { ...s, status: s.status === 'published' ? 'draft' : 'published' } : s));
    };

    const teacherName = user?.name || 'المدرس';

    return (
        <div dir="rtl" style={{
            display: 'flex', minHeight: '100vh', background: '#0a1628',
            fontFamily: "'Cairo', sans-serif", position: 'relative',
        }}>
            {/* Desktop Sidebar */}
            <div className="teacher-sidebar" style={{ display: 'none' }}>
                <TeacherSidebar activeNav={activeNav} onNavChange={setActiveNav} onNavigate={onNavigate} />
            </div>
            <style>{`
        @media (min-width: 769px) {
          .teacher-sidebar { display: flex !important; }
          .teacher-mobile-btn { display: none !important; }
        }
        @media (max-width: 768px) {
          .teacher-sidebar { display: none !important; }
          .teacher-mobile-btn { display: flex !important; }
          .teacher-stats { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

            {/* Mobile sidebar overlay */}
            {mobileSidebar && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
                        onClick={() => setMobileSidebar(false)} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <TeacherSidebar activeNav={activeNav} onNavChange={setActiveNav} onNavigate={onNavigate} />
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                {/* Top Header */}
                <div style={{
                    background: 'linear-gradient(90deg, #0d1f3c 0%, #132742 100%)',
                    borderBottom: '1px solid rgba(245, 158, 11, 0.08)',
                    padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    position: 'sticky', top: 0, zIndex: 40,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button className="teacher-mobile-btn" onClick={() => setMobileSidebar(true)} style={{
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px', padding: '8px', color: '#94a3b8', cursor: 'pointer',
                            alignItems: 'center', justifyContent: 'center', display: 'none',
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                            </svg>
                        </button>
                        <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#e2e8f0', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            مرحبا، أ. {teacherName} <span style={{ fontSize: '22px' }}>👋</span>
                        </h1>
                    </div>
                    <button onClick={openCreateModal} style={{
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        border: 'none', borderRadius: '12px', padding: '10px 20px',
                        color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px',
                        fontFamily: "'Cairo', sans-serif",
                        boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)', transition: 'all 0.3s',
                    }}
                        onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.4)'; }}
                        onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(245, 158, 11, 0.3)'; }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        إنشاء مادة جديدة
                    </button>
                </div>

                {/* Page Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>

                    {/* DASHBOARD / SUBJECTS */}
                    {(activeNav === 'dashboard' || activeNav === 'subjects') && (<>
                        {/* Stats */}
                        <div className="teacher-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                            {[
                                { label: 'عدد المواد', value: subjects.length.toString(), icon: '📚', color: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.2)', valueColor: '#f59e0b' },
                                { label: 'إجمالي الطلاب', value: totalStudents.toString(), icon: '👥', color: 'rgba(14, 165, 233, 0.15)', borderColor: 'rgba(14, 165, 233, 0.2)', valueColor: '#38bdf8' },
                                { label: 'المحاضرات', value: totalLectures.toString(), icon: '🎬', color: 'rgba(168, 85, 247, 0.15)', borderColor: 'rgba(168, 85, 247, 0.2)', valueColor: '#a855f7' },
                                { label: 'منشورة', value: publishedCount.toString(), icon: '✅', color: 'rgba(34, 197, 94, 0.15)', borderColor: 'rgba(34, 197, 94, 0.2)', valueColor: '#22c55e' },
                            ].map((s, i) => (
                                <div key={i} style={{ background: s.color, border: `1px solid ${s.borderColor}`, borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', transition: 'transform 0.2s' }}
                                    onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <div style={{ fontSize: '28px' }}>{s.icon}</div>
                                    <div>
                                        <div style={{ fontSize: '24px', fontWeight: 800, color: s.valueColor }}>{s.value}</div>
                                        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>{s.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Subjects Grid */}
                        <div style={{ background: 'linear-gradient(135deg, rgba(13, 31, 60, 0.8), rgba(10, 22, 40, 0.9))', border: '1px solid rgba(245, 158, 11, 0.08)', borderRadius: '20px', overflow: 'hidden' }}>
                            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontSize: '20px' }}>📚</span>
                                    <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#e2e8f0', margin: 0 }}>موادي التعليمية</h2>
                                </div>
                                <span style={{ fontSize: '13px', color: '#64748b' }}>{subjects.length} مادة</span>
                            </div>
                            <div style={{ padding: '16px' }}>
                                {subjects.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                                        <div style={{ fontSize: '60px', marginBottom: '16px' }}>📭</div>
                                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#e2e8f0', margin: '0 0 8px' }}>لا توجد مواد بعد</h3>
                                        <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 20px' }}>ابدأ بإنشاء مادتك الأولى وأضف المستويات والمحاضرات</p>
                                        <button onClick={openCreateModal} style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', borderRadius: '12px', padding: '12px 24px', color: '#fff', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Cairo', sans-serif" }}>
                                            + إنشاء مادة جديدة
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                                        {subjects.map(subject => {
                                            const lecCount = subject.levels.reduce((a, l) => a + l.lectures.length, 0);
                                            return (
                                                <div key={subject.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px', transition: 'all 0.3s', cursor: 'default', animation: 'fadeIn 0.3s ease' }}
                                                    onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.2)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                                                    onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>{subject.icon}</div>
                                                            <div>
                                                                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#e2e8f0', margin: 0 }}>{subject.name}</h3>
                                                                <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>{subject.description}</p>
                                                            </div>
                                                        </div>
                                                        <div style={{
                                                            padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 700,
                                                            background: subject.status === 'published' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                                            color: subject.status === 'published' ? '#22c55e' : '#f59e0b',
                                                        }}>
                                                            {subject.status === 'published' ? '✅ منشورة' : '📝 مسودة'}
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
                                                        <div style={{ textAlign: 'center', flex: 1 }}><div style={{ fontSize: '18px', fontWeight: 800, color: '#f59e0b' }}>{subject.levels.length}</div><div style={{ fontSize: '11px', color: '#64748b' }}>مستوى</div></div>
                                                        <div style={{ width: '1px', background: 'rgba(255,255,255,0.06)' }} />
                                                        <div style={{ textAlign: 'center', flex: 1 }}><div style={{ fontSize: '18px', fontWeight: 800, color: '#38bdf8' }}>{lecCount}</div><div style={{ fontSize: '11px', color: '#64748b' }}>محاضرة</div></div>
                                                        <div style={{ width: '1px', background: 'rgba(255,255,255,0.06)' }} />
                                                        <div style={{ textAlign: 'center', flex: 1 }}><div style={{ fontSize: '18px', fontWeight: 800, color: '#a855f7' }}>{subject.students}</div><div style={{ fontSize: '11px', color: '#64748b' }}>طالب</div></div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button onClick={() => openEditModal(subject)} style={{ flex: 1, padding: '10px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', color: '#f59e0b', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Cairo', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                                            ✏️ تعديل
                                                        </button>
                                                        <button onClick={() => togglePublish(subject.id)} style={{
                                                            flex: 1, padding: '10px', borderRadius: '10px',
                                                            background: subject.status === 'published' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(34, 197, 94, 0.1)',
                                                            border: `1px solid ${subject.status === 'published' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)'}`,
                                                            color: subject.status === 'published' ? '#f87171' : '#22c55e',
                                                            fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Cairo', sans-serif",
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                                        }}>
                                                            {subject.status === 'published' ? '⏸️ إيقاف' : '🚀 نشر'}
                                                        </button>
                                                        <button onClick={() => deleteSubject(subject.id)} style={{ padding: '10px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)', color: '#f87171', cursor: 'pointer', flexShrink: 0 }}>
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <button onClick={openCreateModal} style={{ background: 'rgba(255,255,255,0.02)', border: '2px dashed rgba(245, 158, 11, 0.15)', borderRadius: '16px', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', cursor: 'pointer', transition: 'all 0.3s', fontFamily: "'Cairo', sans-serif", color: '#64748b' }}
                                            onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.4)'; e.currentTarget.style.background = 'rgba(245, 158, 11, 0.03)'; }}
                                            onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.15)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                                        >
                                            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                            </div>
                                            <span style={{ fontSize: '14px', fontWeight: 600 }}>إضافة مادة جديدة</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>)}

                    {/* STUDENTS */}
                    {activeNav === 'students' && (
                        <div style={{ animation: 'fadeIn 0.3s ease' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#e2e8f0', margin: 0 }}>👥 طلابي</h2>
                                <span style={{ fontSize: '13px', color: '#64748b', background: 'rgba(255,255,255,0.05)', padding: '6px 14px', borderRadius: '10px' }}>{totalStudents} طالب</span>
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <input placeholder="🔍 ابحث عن طالب..." style={{ width: '100%', maxWidth: '400px', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#e2e8f0', fontSize: '14px', fontFamily: "'Cairo', sans-serif", outline: 'none' }} />
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr', padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', gap: '12px' }}>
                                    {['الطالب', 'المادة', 'المستوى', 'التقدم', 'الحالة'].map(h => (
                                        <span key={h} style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>{h}</span>
                                    ))}
                                </div>
                                {mockStudents.map((st, idx) => (
                                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr', padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center', gap: '12px', transition: 'background 0.15s' }}
                                        onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>{st.avatar}</div>
                                            <div><div style={{ fontSize: '14px', fontWeight: 600, color: '#e2e8f0' }}>{st.name}</div><div style={{ fontSize: '11px', color: '#475569' }}>{st.email}</div></div>
                                        </div>
                                        <span style={{ fontSize: '13px', color: '#94a3b8' }}>{st.subject}</span>
                                        <span style={{ fontSize: '13px', color: '#94a3b8' }}>{st.level}</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <div style={{ flex: 1, height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${st.progress}%`, borderRadius: '3px', background: st.progress >= 80 ? '#22c55e' : st.progress >= 40 ? '#f59e0b' : '#38bdf8' }} />
                                            </div>
                                            <span style={{ fontSize: '11px', color: '#64748b', minWidth: '30px' }}>{st.progress}%</span>
                                        </div>
                                        <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '8px', background: st.status === 'مكتمل' ? 'rgba(34,197,94,0.1)' : st.status === 'جديد' ? 'rgba(56,189,248,0.1)' : 'rgba(245,158,11,0.1)', color: st.status === 'مكتمل' ? '#22c55e' : st.status === 'جديد' ? '#38bdf8' : '#f59e0b', display: 'inline-block' }}>{st.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ANALYTICS */}
                    {activeNav === 'analytics' && (
                        <div style={{ animation: 'fadeIn 0.3s ease' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#e2e8f0', margin: '0 0 20px' }}>📈 الإحصائيات</h2>
                            <div className="teacher-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                                {[
                                    { label: 'معدل الإكمال', value: '72%', icon: '🎯', bg: 'rgba(34,197,94,0.12)', bc: 'rgba(34,197,94,0.2)', vc: '#22c55e' },
                                    { label: 'ساعات المشاهدة', value: '1,240', icon: '⏱️', bg: 'rgba(14,165,233,0.12)', bc: 'rgba(14,165,233,0.2)', vc: '#38bdf8' },
                                    { label: 'متوسط التقييم', value: '4.8', icon: '⭐', bg: 'rgba(245,158,11,0.12)', bc: 'rgba(245,158,11,0.2)', vc: '#f59e0b' },
                                    { label: 'الإيرادات (ر.س)', value: '12,450', icon: '💰', bg: 'rgba(168,85,247,0.12)', bc: 'rgba(168,85,247,0.2)', vc: '#a855f7' },
                                ].map((s, i) => (
                                    <div key={i} style={{ background: s.bg, border: `1px solid ${s.bc}`, borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{ fontSize: '28px' }}>{s.icon}</div>
                                        <div><div style={{ fontSize: '24px', fontWeight: 800, color: s.vc }}>{s.value}</div><div style={{ fontSize: '12px', color: '#64748b' }}>{s.label}</div></div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' }}>
                                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#e2e8f0', margin: '0 0 16px' }}>📊 أداء المواد</h3>
                                    {subjects.map(sub => {
                                        const lecs = sub.levels.reduce((a, l) => a + l.lectures.length, 0);
                                        const pct = Math.min(100, Math.round((sub.students / (totalStudents || 1)) * 100));
                                        return (
                                            <div key={sub.id} style={{ marginBottom: '14px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#cbd5e1' }}>{sub.icon} {sub.name}</span>
                                                    <span style={{ fontSize: '12px', color: '#64748b' }}>{sub.students} طالب • {lecs} محاضرة</span>
                                                </div>
                                                <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                                                    <div style={{ height: '100%', width: `${pct}%`, borderRadius: '4px', background: 'linear-gradient(90deg, #f59e0b, #d97706)' }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' }}>
                                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#e2e8f0', margin: '0 0 16px' }}>📅 النشاط الشهري</h3>
                                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '160px', paddingBottom: '24px' }}>
                                        {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 68].map((v, i) => (
                                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                                <div style={{ width: '100%', height: `${v}%`, borderRadius: '6px', background: i === 11 ? 'linear-gradient(180deg, #f59e0b, #d97706)' : 'rgba(245,158,11,0.15)' }} />
                                                <span style={{ fontSize: '9px', color: '#475569' }}>{['ين', 'فب', 'مر', 'أب', 'مي', 'يو', 'يل', 'أغ', 'سب', 'أك', 'نو', 'دس'][i]}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ gridColumn: '1 / -1', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' }}>
                                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#e2e8f0', margin: '0 0 16px' }}>🕐 آخر الأنشطة</h3>
                                    {mockActivities.map((a, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                                            <span style={{ fontSize: '18px' }}>{a.icon}</span>
                                            <span style={{ flex: 1, fontSize: '13px', color: '#cbd5e1' }}>{a.text}</span>
                                            <span style={{ fontSize: '11px', color: '#475569', flexShrink: 0 }}>{a.time}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PROFILE */}
                    {activeNav === 'profile' && (
                        <div style={{ animation: 'fadeIn 0.3s ease', maxWidth: '700px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#e2e8f0', margin: '0 0 20px' }}>👤 الملف الشخصي</h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
                                <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', boxShadow: '0 4px 20px rgba(245,158,11,0.3)' }}>👨‍🏫</div>
                                <div>
                                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#e2e8f0' }}>{teacherName}</div>
                                    <div style={{ fontSize: '13px', color: '#64748b' }}>مدرس معتمد • انضم يناير 2026</div>
                                    <button style={{ marginTop: '8px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px', padding: '6px 14px', color: '#f59e0b', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Cairo', sans-serif" }}>تغيير الصورة</button>
                                </div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {[
                                    { label: 'الاسم الكامل', value: user?.name || 'المدرس', type: 'text' },
                                    { label: 'البريد الإلكتروني', value: user?.email || '', type: 'email' },
                                    { label: 'رقم الهاتف', value: '+966 50 123 4567', type: 'tel' },
                                    { label: 'التخصص', value: 'كيمياء وفيزياء', type: 'text' },
                                ].map((f, i) => (
                                    <div key={i}>
                                        <label style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8', marginBottom: '6px', display: 'block' }}>{f.label}</label>
                                        <input defaultValue={f.value} type={f.type} style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#e2e8f0', fontSize: '14px', fontFamily: "'Cairo', sans-serif", outline: 'none' }} />
                                    </div>
                                ))}
                                <div>
                                    <label style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8', marginBottom: '6px', display: 'block' }}>نبذة عنك</label>
                                    <textarea defaultValue="مدرس كيمياء وفيزياء بخبرة 10 سنوات. شغوف بتبسيط المفاهيم العلمية." rows={3} style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#e2e8f0', fontSize: '14px', fontFamily: "'Cairo', sans-serif", outline: 'none', resize: 'vertical' as const }} />
                                </div>
                                <button style={{ alignSelf: 'flex-start', background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', borderRadius: '12px', padding: '12px 28px', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Cairo', sans-serif", boxShadow: '0 4px 15px rgba(245,158,11,0.3)' }}>💾 حفظ التغييرات</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Create/Edit Modal */}
            <SubjectModal
                show={showCreateModal}
                onClose={() => { setShowCreateModal(false); resetForm(); }}
                editingSubject={editingSubject}
                createStep={createStep}
                setCreateStep={setCreateStep}
                newSubjectName={newSubjectName}
                setNewSubjectName={setNewSubjectName}
                newSubjectDesc={newSubjectDesc}
                setNewSubjectDesc={setNewSubjectDesc}
                newSubjectIcon={newSubjectIcon}
                setNewSubjectIcon={setNewSubjectIcon}
                newLevels={newLevels}
                addLevel={addLevel}
                removeLevel={removeLevel}
                updateLevelName={updateLevelName}
                addLecture={addLecture}
                removeLecture={removeLecture}
                updateLecture={updateLecture}
                onSave={saveSubject}
            />
        </div>
    );
};

export default TeacherDashboard;
