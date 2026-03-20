
import React, { useState, useEffect } from 'react';
import { Page } from '../App';
import { Subject, Level, Lecture, TeacherNavItem } from './teacher/types';
import { subjectIcons } from './teacher/mockData';
import {
    fetchTeacherSubjects, fetchTeacherStats, fetchTeacherStudents, pingTeacherAuth,
    createTeacherSubject, updateTeacherSubject, deleteTeacherSubject,
    publishTeacherSubject, createCourseWithCurriculum
} from '../services/api';
import TeacherSidebar from './teacher/TeacherSidebar';
import SubjectModal from './teacher/SubjectModal';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface TeacherDashboardProps {
    onNavigate: (page: Page, payload?: { tab?: string }) => void;
    initialTab?: string;
}

const TOKEN_KEY = 'elmanssa_auth_token';

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onNavigate, initialTab }) => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [activeNav, setActiveNav] = useState<TeacherNavItem>(
        (initialTab as TeacherNavItem) || 'dashboard'
    );
    const [mobileSidebar, setMobileSidebar] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createStep, setCreateStep] = useState(1);
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // API-loaded data
    const [apiStats, setApiStats] = useState<any>(null);
    const [apiStudents, setApiStudents] = useState<any[]>([]);
    const [apiActivities, setApiActivities] = useState<any[]>([]);
    const [studentsLoading, setStudentsLoading] = useState(false);

    // New subject form state
    const [newSubjectName, setNewSubjectName] = useState('');
    const [newSubjectDesc, setNewSubjectDesc] = useState('');
    const [newSubjectIcon, setNewSubjectIcon] = useState('📚');
    const [newSubjectPrice, setNewSubjectPrice] = useState(0);
    const [newSubjectLevel, setNewSubjectLevel] = useState('مبتدئ');
    const [newSubjectImageUrl, setNewSubjectImageUrl] = useState('');
    const [newLevels, setNewLevels] = useState<Level[]>([
        { id: 'new-l1', name: 'المستوى 1', lectures: [] }
    ]);

    // Load subjects + stats from API
    useEffect(() => {
        console.log('[TeacherDashboard] useEffect triggered');
        console.log('[TeacherDashboard] User from context:', user);
        
        const token = localStorage.getItem(TOKEN_KEY);
        console.log('[TeacherDashboard] Token from localStorage:', token ? 'EXISTS' : 'MISSING');
        
        if (!token) { 
            console.warn('[TeacherDashboard] No token found, skipping data load');
            setIsLoadingData(false); 
            return; 
        }

        const loadData = async () => {
            setIsLoadingData(true);
            try {
                const ok = await pingTeacherAuth(token);
                if (!ok) {
                    onNavigate('login');
                    return;
                }
                const [subjectsData, statsData] = await Promise.all([
                    fetchTeacherSubjects(token),
                    fetchTeacherStats(token)
                ]);

                // Map API subjects
                if (subjectsData && Array.isArray(subjectsData)) {
                    const mapped: Subject[] = subjectsData.map((s: any) => ({
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
                        status: (s.status === 'published' || s.status === 'Published') ? 'published' : 'draft',
                        createdAt: s.createdAt ? new Date(s.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                    }));
                    setSubjects(mapped);
                }

                // Map API stats
                if (statsData) {
                    setApiStats(statsData);
                    if (statsData.recentActivities && Array.isArray(statsData.recentActivities)) {
                        setApiActivities(statsData.recentActivities.map((a: any) => ({
                            text: a.description || a.text || '',
                            time: a.time || a.createdAt || '',
                            icon: a.icon || '📌',
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

    // Load students when switching to students tab
    useEffect(() => {
        if (activeNav === 'students') {
            const token = localStorage.getItem(TOKEN_KEY);
            if (!token) return;
            setStudentsLoading(true);
            fetchTeacherStudents(token).then((data: any) => {
                if (Array.isArray(data)) {
                    setApiStudents(data.map((st: any) => ({
                        name: st.name || 'طالب',
                        avatar: st.avatarUrl ? '🧑' : '🧑',
                        email: st.email || '',
                        id: st.id,
                    })));
                }
                setStudentsLoading(false);
            }).catch(() => setStudentsLoading(false));
        }
    }, [activeNav]);

    // Computed stats (from API when available, otherwise computed from subjects)
    const totalStudents = apiStats?.totalStudents ?? subjects.reduce((a, s) => a + s.students, 0);
    const totalLectures = apiStats?.totalLectures ?? subjects.reduce((a, s) => a + s.levels.reduce((b, l) => b + l.lectures.length, 0), 0);
    const publishedCount = apiStats?.publishedCount ?? subjects.filter(s => s.status === 'published').length;
    const totalSubjects = apiStats?.totalSubjects ?? subjects.length;

    const resetForm = () => {
        setNewSubjectName('');
        setNewSubjectDesc('');
        setNewSubjectIcon('📚');
        setNewSubjectPrice(0);
        setNewSubjectLevel('مبتدئ');
        setNewSubjectImageUrl('');
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
        setNewSubjectLevel('مبتدئ'); // Default for editing
        setNewSubjectImageUrl('');
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

    const saveSubject = async () => {
        // First check if user is logged in via AuthContext
        if (!user) {
            showToast('يجب تسجيل الدخول أولاً', 'error');
            console.error('[saveSubject] User not found in AuthContext');
            onNavigate('login');
            return;
        }

        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) {
            showToast('انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى', 'error');
            console.error('[saveSubject] Token not found in localStorage');
            console.log('[saveSubject] User exists in context but token missing');
            console.log('[saveSubject] Available localStorage keys:', Object.keys(localStorage));
            onNavigate('login');
            return;
        }

        console.log('[saveSubject] User and token verified, proceeding with save');
        console.log('[saveSubject] User role:', user.role);
        setIsSaving(true);
        try {
            if (editingSubject) {
                // Update via API (keep existing logic)
                await updateTeacherSubject(token, editingSubject.id, {
                    title: newSubjectName,
                    description: newSubjectDesc,
                });
                setSubjects(subjects.map(s =>
                    s.id === editingSubject.id
                        ? { ...s, name: newSubjectName, description: newSubjectDesc, icon: newSubjectIcon, levels: newLevels }
                        : s
                ));
                showToast('تم تحديث المادة بنجاح', 'success');
                setTimeout(() => {
                    setShowCreateModal(false);
                    resetForm();
                    setIsSaving(false);
                }, 1000);
            } else {
                // Calculate total duration from all lectures
                const totalDuration = newLevels.reduce((total, level) => {
                    return total + level.lectures.reduce((sum, lec) => {
                        const durationStr = lec.duration.trim();
                        if (durationStr.includes(':')) {
                            const parts = durationStr.split(':').map(p => parseInt(p) || 0);
                            if (parts.length === 3) return sum + (parts[0] * 60 + parts[1]);
                            if (parts.length === 2) return sum + parts[0];
                        }
                        const match = durationStr.match(/(\d+)/);
                        return sum + (match ? parseInt(match[1]) : 0);
                    }, 0);
                }, 0);

                // Build sections — preserve all levels, even those without lectures
                // This ensures the teacher's structure is maintained
                const sections = newLevels.map((level, index) => {
                    const filteredLectures = level.lectures
                        .filter(lec => lec.title.trim())
                        .map((lec, lecIndex) => ({
                            title: lec.title,
                            duration: lec.duration || undefined,
                            videoUrl: lec.videoUrl || undefined,
                            sortOrder: lecIndex,
                            isPreview: lecIndex === 0,
                        }));
                    
                    return {
                        title: level.name,
                        sortOrder: index,
                        lectures: filteredLectures,
                    };
                });

                // Only filter out sections that have no name (invalid sections)
                // Keep sections with names even if they have no lectures yet
                const validSections = sections.filter(section => section.title.trim());

                const courseData = {
                    title: newSubjectName,
                    description: newSubjectDesc || undefined,
                    category: 'عام',
                    duration: Math.max(1, totalDuration),
                    level: newSubjectLevel !== 'جميع المستويات' ? newSubjectLevel : undefined,
                    language: 'العربية',
                    price: newSubjectPrice,
                    imageUrl: newSubjectImageUrl || undefined,
                    sections: validSections,
                };

                console.log('[saveSubject] Sending payload:', JSON.stringify(courseData, null, 2));
                console.log('[saveSubject] Total sections:', validSections.length);
                console.log('[saveSubject] Sections with lectures:', validSections.filter(s => s.lectures.length > 0).length);

                const created = await createCourseWithCurriculum(token, courseData);

                console.log('[saveSubject] API response:', JSON.stringify(created, null, 2));

                // Verify response structure before accessing nested properties
                if (!created) {
                    throw new Error('لم يتم استلام رد من الخادم');
                }

                // Handle both response formats: { data: {...} } or direct object
                const responseData = created.data || created;
                
                if (!responseData.id) {
                    console.error('[saveSubject] Response missing ID:', responseData);
                    throw new Error('الرد من الخادم لا يحتوي على معرف المادة');
                }

                const newSubject: Subject = {
                    id: responseData.id?.toString() || `subj-${Date.now()}`,
                    name: responseData.title || responseData.name || newSubjectName,
                    description: responseData.description || '',
                    icon: newSubjectIcon,
                    levels: (responseData.levels || []).map((s: any) => ({
                        id: s.id?.toString() || `lev-${Date.now()}`,
                        name: s.title || s.name || '',
                        lectures: (s.lectures || []).map((l: any) => ({
                            id: l.id?.toString() || `lec-${Date.now()}`,
                            title: l.title,
                            duration: l.duration || '00:00',
                            videoUrl: l.videoUrl || '',
                        })),
                    })),
                    students: responseData.studentsCount || 0,
                    status: responseData.status === 'published' ? 'published' : 'draft',
                    createdAt: responseData.createdAt
                        ? new Date(responseData.createdAt).toISOString().split('T')[0]
                        : new Date().toISOString().split('T')[0],
                };

                setSubjects([...subjects, newSubject]);
                showToast('تم إنشاء المادة بنجاح ✨', 'success');
                setTimeout(() => {
                    setShowCreateModal(false);
                    resetForm();
                    setIsSaving(false);
                }, 1000);
            }
        } catch (err: any) {
            console.error('[saveSubject] Error:', err);
            console.error('[saveSubject] Error stack:', err.stack);
            const errorMessage = err.status === 401 ? 'انتهت صلاحية الجلسة'
                : err.status === 403 ? 'غير مصرح'
                : err.response?.error?.message || err.response?.title || err.message || 'حدث خطأ أثناء حفظ المادة';
            showToast(errorMessage, 'error');
            setIsSaving(false);
            // Modal stays open on error so user can fix issues
        }
    };

    const deleteSubject = async (id: string) => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
            try {
                await deleteTeacherSubject(token, parseInt(id));
                showToast('تم حذف المادة بنجاح', 'success');
            } catch (err) {
                console.error('Error deleting subject', err);
                showToast('حدث خطأ أثناء حذف المادة', 'error');
            }
        }
        setSubjects(subjects.filter(s => s.id !== id));
    };

    const togglePublish = async (id: string) => {
        const subject = subjects.find(s => s.id === id);
        if (!subject) return;
        const newStatus = subject.status === 'published' ? 'draft' : 'published';
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
            try {
                await publishTeacherSubject(token, id, newStatus);
                showToast(newStatus === 'published' ? 'تم نشر المادة بنجاح' : 'تم إيقاف نشر المادة', 'success');
            } catch (err) {
                console.error('Error toggling publish', err);
                showToast('حدث خطأ', 'error');
            }
        }
        setSubjects(subjects.map(s => s.id === id ? { ...s, status: newStatus as 'published' | 'draft' } : s));
    };

    const teacherName = user?.name || 'المدرس';

    // Loading state
    if (isLoadingData) {
        return (
            <div dir="rtl" style={{
                display: 'flex', minHeight: '100vh', background: '#0a1628',
                fontFamily: "'Cairo', sans-serif", alignItems: 'center', justifyContent: 'center',
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '52px', height: '52px', borderRadius: '50%',
                        border: '4px solid rgba(245, 158, 11, 0.15)',
                        borderTopColor: '#f59e0b',
                        animation: 'teacherSpin 0.8s linear infinite',
                        margin: '0 auto 20px',
                    }} />
                    <div style={{ color: '#e2e8f0', fontSize: '16px', fontWeight: 600 }}>جاري تحميل البيانات...</div>
                </div>
                <style>{`@keyframes teacherSpin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {/* Back to site */}
                        <button
                            onClick={() => onNavigate('home')}
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '10px',
                                padding: '10px 14px',
                                color: '#94a3b8',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '13px',
                                fontFamily: "'Cairo', sans-serif",
                                transition: 'all 0.2s',
                            }}
                            onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#e2e8f0'; }}
                            onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#94a3b8'; }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" />
                                <polyline points="9,22 9,12 15,12 15,22" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            الموقع الرئيسي
                        </button>
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
                </div>

                {/* Page Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>

                    {/* DASHBOARD / SUBJECTS */}
                    {(activeNav === 'dashboard' || activeNav === 'subjects') && (<>
                        {/* Stats */}
                        <div className="teacher-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                            {[
                                { label: 'عدد المواد', value: totalSubjects.toString(), icon: '📚', color: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.2)', valueColor: '#f59e0b' },
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

                    {/* STUDENTS — from API */}
                    {activeNav === 'students' && (
                        <div style={{ animation: 'fadeIn 0.3s ease' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#e2e8f0', margin: 0 }}>👥 طلابي</h2>
                                <span style={{ fontSize: '13px', color: '#64748b', background: 'rgba(255,255,255,0.05)', padding: '6px 14px', borderRadius: '10px' }}>{apiStudents.length} طالب</span>
                            </div>
                            {studentsLoading ? (
                                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>جاري تحميل الطلاب...</div>
                            ) : apiStudents.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                                    <div style={{ fontSize: '60px', marginBottom: '16px' }}>📭</div>
                                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#e2e8f0', margin: '0 0 8px' }}>لا يوجد طلاب بعد</h3>
                                    <p style={{ fontSize: '14px', color: '#64748b' }}>سيظهر الطلاب هنا بعد تسجيلهم في موادك</p>
                                </div>
                            ) : (
                                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr', padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', gap: '12px' }}>
                                        {['الطالب', 'البريد الإلكتروني'].map(h => (
                                            <span key={h} style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>{h}</span>
                                        ))}
                                    </div>
                                    {apiStudents.map((st, idx) => (
                                        <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr', padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center', gap: '12px', transition: 'background 0.15s' }}
                                            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>{st.avatar}</div>
                                                <div style={{ fontSize: '14px', fontWeight: 600, color: '#e2e8f0' }}>{st.name}</div>
                                            </div>
                                            <span style={{ fontSize: '13px', color: '#94a3b8' }}>{st.email}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ANALYTICS — from API stats */}
                    {activeNav === 'analytics' && (
                        <div style={{ animation: 'fadeIn 0.3s ease' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#e2e8f0', margin: '0 0 20px' }}>📈 الإحصائيات</h2>
                            <div className="teacher-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                                {[
                                    { label: 'عدد المواد', value: totalSubjects.toString(), icon: '📚', bg: 'rgba(245,158,11,0.12)', bc: 'rgba(245,158,11,0.2)', vc: '#f59e0b' },
                                    { label: 'إجمالي الطلاب', value: totalStudents.toString(), icon: '👥', bg: 'rgba(14,165,233,0.12)', bc: 'rgba(14,165,233,0.2)', vc: '#38bdf8' },
                                    { label: 'المحاضرات', value: totalLectures.toString(), icon: '🎬', bg: 'rgba(168,85,247,0.12)', bc: 'rgba(168,85,247,0.2)', vc: '#a855f7' },
                                    { label: 'منشورة', value: publishedCount.toString(), icon: '✅', bg: 'rgba(34,197,94,0.12)', bc: 'rgba(34,197,94,0.2)', vc: '#22c55e' },
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
                                    {subjects.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '14px' }}>لا توجد مواد بعد</div>
                                    ) : subjects.map(sub => {
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
                                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#e2e8f0', margin: '0 0 16px' }}>🕐 آخر الأنشطة</h3>
                                    {apiActivities.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '14px' }}>لا توجد أنشطة حديثة</div>
                                    ) : apiActivities.map((a, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderBottom: i < apiActivities.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
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
                                    <div style={{ fontSize: '13px', color: '#64748b' }}>مدرس معتمد</div>
                                    <button style={{ marginTop: '8px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px', padding: '6px 14px', color: '#f59e0b', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Cairo', sans-serif" }}>تغيير الصورة</button>
                                </div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {[
                                    { label: 'الاسم الكامل', value: user?.name || 'المدرس', type: 'text', id: 'profile-name' },
                                    { label: 'البريد الإلكتروني', value: user?.email || '', type: 'email', id: 'profile-email' },
                                ].map((f, i) => (
                                    <div key={i}>
                                        <label htmlFor={f.id} style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8', marginBottom: '6px', display: 'block' }}>{f.label}</label>
                                        <input id={f.id} name={f.id} defaultValue={f.value} type={f.type} style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#e2e8f0', fontSize: '14px', fontFamily: "'Cairo', sans-serif", outline: 'none' }} />
                                    </div>
                                ))}
                                <div>
                                    <label htmlFor="profile-bio" style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8', marginBottom: '6px', display: 'block' }}>نبذة عنك</label>
                                    <textarea id="profile-bio" name="profile-bio" defaultValue="" rows={3} style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#e2e8f0', fontSize: '14px', fontFamily: "'Cairo', sans-serif", outline: 'none', resize: 'vertical' as const }} />
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
                newSubjectPrice={newSubjectPrice}
                setNewSubjectPrice={setNewSubjectPrice}
                newSubjectLevel={newSubjectLevel}
                setNewSubjectLevel={setNewSubjectLevel}
                newSubjectImageUrl={newSubjectImageUrl}
                setNewSubjectImageUrl={setNewSubjectImageUrl}
                newLevels={newLevels}
                addLevel={addLevel}
                removeLevel={removeLevel}
                updateLevelName={updateLevelName}
                addLecture={addLecture}
                removeLecture={removeLecture}
                updateLecture={updateLecture}
                onSave={saveSubject}
                isSaving={isSaving}
            />
        </div>
    );
};

export default TeacherDashboard;
    