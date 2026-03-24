import { Course, Lecture, CurriculumSection } from '../types';
import { getToken } from '../utils/token';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

async function authedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = getToken();
    console.log('[authedFetch] Token retrieved:', token ? 'EXISTS' : 'MISSING');
    console.log('[authedFetch] URL:', url);
    
    const res = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers as Record<string, string> || {}),
        },
    });
    
    console.log('[authedFetch] Response status:', res.status);
    return res;
}

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/api\/v1$/, '') ?? '';

export const fetchCourses = async (): Promise<{ data: Course[]; error?: string }> => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/v1/subjects`);
        if (!res.ok) throw new Error(`Failed to fetch courses: ${res.status} ${res.statusText}`);
        const json = await res.json();

        const raw = Array.isArray(json) ? json : (json.data ?? []);
        const items = Array.isArray(raw) ? raw : [];
        const data: Course[] = items.map((item: any) => ({
            id: Number(item.id) || 0,
            guidId: typeof item.id === 'string' && item.id.includes('-') ? item.id : (item.guidId || undefined),
            title: item.title ?? '',
            category: item.category ?? 'عام',
            description: item.description ?? '',
            instructorName: item.instructorName ?? undefined,
            instructorId: typeof item.instructorId === 'number' ? item.instructorId : undefined,
            rating: typeof item.rating === 'number' ? item.rating : 4.5,
            duration: typeof item.duration === 'number' ? item.duration : undefined,
            lecturesCount: typeof item.lecturesCount === 'number' ? item.lecturesCount : undefined,
            level: item.level ?? undefined,
            language: item.language ?? 'العربية',
            students: typeof item.studentsCount === 'number' ? item.studentsCount : 0,
            price: typeof item.price === 'number' ? item.price : 0,
            isFree: item.price === 0,
            imageUrl: item.imageUrl || '/assets/courses/default.png',
            lastUpdated: item.createdAt ?? item.updatedAt ?? undefined,
        }));
        return { data };
    } catch (error: any) {
        console.error('Error fetching courses', error);
        return { data: [], error: error?.message || 'Unknown error' };
    }
};

export const fetchCourseById = async (id: string | number): Promise<{ data: Course | null; error?: string }> => {
    try {
        const courseId = typeof id === 'number' ? id.toString() : id;
        const res = await fetch(`${API_BASE_URL}/api/v1/subjects/${courseId}`);
        if (!res.ok) throw new Error(`Failed to fetch course: ${res.status} ${res.statusText}`);
        const json = await res.json();

        const item = json.data ?? json;
        if (!item) return { data: null };

        const curriculum: CurriculumSection[] | undefined = Array.isArray(item.curriculumSections)
            ? item.curriculumSections.map((s: any) => ({
                section: s.title ?? '',
                lectures: Array.isArray(s.lectures)
                    ? s.lectures.map((l: any): Lecture => ({
                        id: Number(l.id),
                        title: l.title ?? '',
                        durationSeconds: typeof l.durationSeconds === 'number' ? l.durationSeconds : undefined,
                        videoUrl: l.videoUrl || undefined,
                    }))
                    : []
            }))
            : undefined;

        const data: Course = {
            id: Number(item.id) || 0,
            guidId: typeof item.id === 'string' && item.id.includes('-') ? item.id : (item.guidId || undefined),
            title: item.title ?? '',
            category: item.category ?? 'عام',
            description: item.description ?? '',
            instructorName: item.instructorName ?? undefined,
            instructorId: typeof item.instructorId === 'number' ? item.instructorId : undefined,
            rating: typeof item.rating === 'number' ? item.rating : 4.5,
            duration: typeof item.duration === 'number' ? item.duration : undefined,
            lecturesCount: typeof item.lecturesCount === 'number' ? item.lecturesCount : undefined,
            level: item.level ?? undefined,
            language: item.language ?? 'العربية',
            students: typeof item.studentsCount === 'number' ? item.studentsCount : 0,
            price: typeof item.price === 'number' ? item.price : 0,
            isFree: item.price === 0,
            imageUrl: item.imageUrl || '/assets/courses/default.png',
            lastUpdated: item.createdAt ?? item.updatedAt ?? undefined,
            curriculum,
        };
        return { data };
    } catch (error: any) {
        console.error('Error fetching course by ID', error);
        return { data: null, error: error?.message || 'Unknown error' };
    }
};

export const sendContactMessage = async (data: { name: string; email: string; type: string; subject: string; message: string }) => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/v1/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to send message');
        return await res.json();
    } catch (error) {
        console.error('Error sending contact message', error);
        throw error;
    }
};

export const fetchStats = async () => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/v1/stats`);
        if (!res.ok) throw new Error('Failed to fetch stats');
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error('Error fetching stats', error);
        return null;
    }
};

export const fetchTestimonials = async () => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/v1/testimonials`);
        if (!res.ok) throw new Error(`Failed to fetch testimonials: ${res.status} ${res.statusText}`);
        const json = await res.json();
        const raw = Array.isArray(json) ? json : (json.data ?? []);
        if (Array.isArray(raw)) {
            return raw.map((t: any) => ({
                id: t.id,
                name: t.userName || t.studentName || 'طالب',
                role: t.role || t.jobTitle || '',
                avatar: t.avatarUrl || 'https://i.pravatar.cc/150',
                text: t.text || t.content || '',
                rating: typeof t.rating === 'number' ? t.rating : 5,
                course: t.courseName || ''
            }));
        }
        return [];
    } catch (error) {
        console.error('Error fetching testimonials', error);
        return [];
    }
};

export const validateCoupon = async (code: string, subjectId?: string) => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/v1/orders/validate-coupon`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, subjectId })
        });
        if (!res.ok) throw new Error('Invalid coupon');
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error('Error validating coupon', error);
        throw error;
    }
};

export const createOrder = async (data: { subjectId: string, paymentMethod: string, couponCode?: string, billingFullName: string, billingEmail: string, billingPhone?: string }) => {
    try {
        const res = await authedFetch(`${API_BASE_URL}/api/v1/orders`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to create order');
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error('Error creating order', error);
        throw error;
    }
};

export const startAIConversation = async () => {
    try {
        const res = await authedFetch(`${API_BASE_URL}/api/v1/ai/conversations`, { method: 'POST' });
        if (!res.ok) throw new Error('Failed to start AI conversation');
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error('Error starting AI conversation', error);
        throw error;
    }
};

export const sendAIMessage = async (conversationId: string, message: string) => {
    try {
        const res = await authedFetch(`${API_BASE_URL}/api/v1/ai/conversations/${conversationId}/messages`, {
            method: 'POST',
            body: JSON.stringify({ message })
        });
        if (!res.ok) throw new Error('Failed to send AI message');
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error('Error sending AI message', error);
        throw error;
    }
};

// ═══════════════════════════════════════════════════════════
// Teacher Dashboard APIs - Using COURSES (not subjects)
// ═══════════════════════════════════════════════════════════

export const fetchTeacherStats = async () => {
    try {
        const res = await authedFetch(`${API_BASE_URL}/api/v1/teacher/stats`);
        if (!res.ok) throw new Error('Failed to fetch teacher stats');
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error('Error fetching teacher stats', error);
        return null;
    }
};

export const pingTeacherAuth = async () => {
    try {
        const res = await authedFetch(`${API_BASE_URL}/api/v1/teacher`);
        return res.status === 200;
    } catch {
        return false;
    }
};

export const fetchTeacherCourses = async () => {
    try {
        const res = await authedFetch(`${API_BASE_URL}/api/v1/teacher/subjects`);
        if (!res.ok) throw new Error('Failed to fetch teacher subjects');
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error('Error fetching teacher subjects', error);
        return [];
    }
};

export const createTeacherCourse = async (data: { 
    title: string; 
    description?: string; 
    category: string;
    duration?: number;
    level?: string;
    language?: string;
    price?: number;
    imageUrl?: string;
}) => {
    try {
        const res = await authedFetch(`${API_BASE_URL}/api/v1/subjects`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to create course');
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error('Error creating course', error);
        throw error;
    }
};

// NEW: Create subject with complete curriculum (levels + lectures) in one API call
export const createCourseWithCurriculum = async (data: {
    title: string;
    description?: string;
    category: string;
    duration: number;
    level?: string;
    language?: string;
    price: number;
    imageUrl?: string;
    sections: Array<{
        title: string;
        sortOrder?: number;
        lectures: Array<{
            title: string;
            duration?: string;
            videoUrl?: string;
            sortOrder?: number;
            isPreview?: boolean;
        }>;
    }>;
}) => {
    const payload = {
        name: data.title,       // backend SubjectCreateDTO requires "name"
        title: data.title,      // also send title as fallback
        description: data.description,
        icon: '📚',
        levels: data.sections.map((section, idx) => ({
            name: section.title,  // backend LevelCreateDTO requires "name"
            sortOrder: section.sortOrder ?? idx,
            lectures: section.lectures.map((lec, lecIdx) => ({
                title: lec.title,
                duration: lec.duration,
                videoUrl: lec.videoUrl,
                sortOrder: lec.sortOrder ?? lecIdx,
            })),
        })),
    };

    const res = await authedFetch(`${API_BASE}/teacher/subjects`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        const message = errorJson.error?.message || errorJson.message || errorJson.title || `فشل إنشاء المادة (${res.status})`;
        const error: any = new Error(message);
        error.status = res.status;
        error.response = errorJson;
        throw error;
    }

    const json = await res.json();
    return json.data;
};

export const updateTeacherCourse = async (courseId: string | number, data: { 
    title?: string; 
    description?: string; 
    category?: string;
    duration?: number;
    level?: string;
    language?: string;
    price?: number;
    imageUrl?: string;
    status?: string;
}) => {
    try {
        const res = await authedFetch(`${API_BASE_URL}/api/v1/teacher/subjects/${courseId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update subject');
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error('Error updating subject', error);
        throw error;
    }
};

export const deleteTeacherCourse = async (courseId: number) => {
    try {
        const res = await authedFetch(`${API_BASE_URL}/api/v1/teacher/subjects/${courseId}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed to delete subject');
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error('Error deleting subject', error);
        throw error;
    }
};

export const createCourseSection = async (courseId: number, data: { title: string; sortOrder?: number }) => {
    try {
        const res = await authedFetch(`${API_BASE_URL}/api/v1/subjects/${courseId}/sections`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to create section');
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error('Error creating section', error);
        throw error;
    }
};

export const updateCourseSection = async (sectionId: number, data: { title?: string; sortOrder?: number }) => {
    try {
        const res = await authedFetch(`${API_BASE_URL}/api/v1/subjects/sections/${sectionId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update section');
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error('Error updating section', error);
        throw error;
    }
};

export const deleteCourseSection = async (sectionId: number) => {
    try {
        const res = await authedFetch(`${API_BASE_URL}/api/v1/subjects/sections/${sectionId}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed to delete section');
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error('Error deleting section', error);
        throw error;
    }
};

export const createSectionLecture = async (sectionId: number, data: { 
    title: string; 
    duration?: string;
    videoUrl?: string;
    sortOrder?: number;
    isPreview?: boolean;
}) => {
    try {
        const res = await authedFetch(`${API_BASE_URL}/api/v1/subjects/sections/${sectionId}/lectures`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to create lecture');
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error('Error creating lecture', error);
        throw error;
    }
};

export const updateSectionLecture = async (lectureId: number, data: { 
    title?: string; 
    duration?: string;
    videoUrl?: string;
    sortOrder?: number;
    isPreview?: boolean;
}) => {
    try {
        const res = await authedFetch(`${API_BASE_URL}/api/v1/subjects/lectures/${lectureId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update lecture');
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error('Error updating lecture', error);
        throw error;
    }
};

export const deleteSectionLecture = async (lectureId: number) => {
    try {
        const res = await authedFetch(`${API_BASE_URL}/api/v1/subjects/lectures/${lectureId}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed to delete lecture');
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error('Error deleting lecture', error);
        throw error;
    }
};

export const fetchTeacherStudents = async (search?: string, page = 1, perPage = 20) => {
    try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        params.append('page', page.toString());
        params.append('per_page', perPage.toString());

        const res = await authedFetch(`${API_BASE_URL}/api/v1/teacher/students?${params}`);
        if (!res.ok) throw new Error('Failed to fetch teacher students');
        const json = await res.json();
        return json.data || [];
    } catch (error) {
        console.error('Error fetching teacher students', error);
        return [];
    }
};

export const publishTeacherSubject = async (courseId: string, status: string) => {
    try {
        const res = await authedFetch(`${API_BASE_URL}/api/v1/teacher/subjects/${courseId}/publish`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
        if (!res.ok) throw new Error('Failed to update subject status');
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error('Error updating subject status', error);
        throw error;
    }
};

// Keep old function names for backward compatibility but mark as deprecated
export const fetchTeacherSubjects = fetchTeacherCourses;
export const createTeacherSubject = createTeacherCourse;
export const updateTeacherSubject = updateTeacherCourse;
export const deleteTeacherSubject = deleteTeacherCourse;

// ═══════════════════════════════════════════════════════════
// Student Dashboard APIs
// ═══════════════════════════════════════════════════════════

export const fetchStudentProgress = async () => {
    try {
        const res = await authedFetch(`${API_BASE_URL}/api/v1/student/progress`);
        if (!res.ok) throw new Error('Failed to fetch student progress');
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error('Error fetching student progress', error);
        return null;
    }
};

export const fetchStudentEnrollments = async () => {
    try {
        const res = await authedFetch(`${API_BASE_URL}/api/v1/student/enrollments`);
        if (!res.ok) throw new Error(`Failed to fetch student enrollments: ${res.status} ${res.statusText}`);
        const json = await res.json();
        return json.data || [];
    } catch (error) {
        console.error('Error fetching student enrollments', error);
        return [];
    }
};

export const fetchStudentCourses = async () => {
    try {
        const res = await authedFetch(`${API_BASE_URL}/api/v1/student/courses`);
        if (!res.ok) throw new Error('Failed to fetch student courses');
        const json = await res.json();
        return json.data || [];
    } catch (error) {
        console.error('Error fetching student courses', error);
        return [];
    }
};

export const fetchStudentCourseDetail = async (courseId: number) => {
    try {
        const res = await authedFetch(`${API_BASE_URL}/api/v1/student/courses/${courseId}`);
        if (!res.ok) throw new Error('Failed to fetch course detail');
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error('Error fetching course detail', error);
        return null;
    }
};

export const fetchStudentLectureDetail = async (lectureId: number) => {
    try {
        const res = await authedFetch(`${API_BASE_URL}/api/v1/student/lectures/${lectureId}`);
        if (!res.ok) throw new Error('Failed to fetch lecture detail');
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error('Error fetching lecture detail', error);
        return null;
    }
};

export const recordLectureWatch = async (lectureId: number, data: { 
    watchedSeconds: number; 
    totalSeconds: number;
    isCompleted?: boolean;
}) => {
    try {
        const res = await authedFetch(`${API_BASE_URL}/api/v1/student/lectures/${lectureId}/watch`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to record watch progress');
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error('Error recording watch progress', error);
        throw error;
    }
};

export const fetchLectureTranscript = async (lectureId: number) => {
    try {
        const res = await authedFetch(`${API_BASE_URL}/api/v1/student/lectures/${lectureId}/transcript`);
        if (!res.ok) throw new Error('Failed to fetch transcript');
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error('Error fetching transcript', error);
        return null;
    }
};


export const updateStudentProgress = async (data: { lectureId: string; completed: boolean; progressPct?: number }) => {
    try {
        const res = await authedFetch(`${API_BASE_URL}/api/v1/student/progress`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update progress');
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error('Error updating progress', error);
        throw error;
    }
};

// Fetches a subject by Guid ID — maps both curriculumSections and levels shapes
export const fetchSubjectById = async (id: string): Promise<{ data: any | null; error?: string }> => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/v1/subjects/${id}`);
        if (!res.ok) throw new Error(`Failed to fetch subject: ${res.status} ${res.statusText}`);
        const json = await res.json();

        if (json?.data) {
            const item = json.data;

            // Handle both response shapes:
            // 1. curriculumSections[].title + lectures[] (CoursesController / existing endpoint)
            // 2. levels[].name + lectures[] (SubjectsController / teacher endpoint)
            let curriculum: any[] | undefined;

            if (Array.isArray(item.curriculumSections) && item.curriculumSections.length > 0) {
                curriculum = item.curriculumSections.map((s: any) => ({
                    section: s.title ?? s.name ?? '',
                    lectures: Array.isArray(s.lectures)
                        ? s.lectures.map((l: any) => ({
                            id: l.id,
                            title: l.title ?? '',
                            duration: l.duration || l.durationSeconds
                                ? `${Math.floor((l.durationSeconds || 0) / 60)}:${String((l.durationSeconds || 0) % 60).padStart(2, '0')}`
                                : '10:00',
                            videoUrl: l.videoUrl || undefined,
                        }))
                        : []
                }));
            } else if (Array.isArray(item.levels)) {
                curriculum = item.levels.map((lv: any) => ({
                    section: lv.name ?? lv.title ?? '',
                    lectures: Array.isArray(lv.lectures)
                        ? lv.lectures.map((l: any) => ({
                            id: l.id,
                            title: l.title ?? '',
                            duration: l.duration || '10:00',
                            videoUrl: l.videoUrl || undefined,
                        }))
                        : []
                }));
            }

            const data = {
                id: item.guidId || item.id,
                title: item.title || item.name || '',
                category: item.category || 'Subject',
                description: item.description || '',
                instructorName: item.instructorName ?? undefined,
                rating: item.rating ?? 4.5,
                students: item.studentsCount || 0,
                price: item.price ?? 0,
                isFree: (item.price ?? 0) === 0,
                imageUrl: item.imageUrl || '/assets/courses/default.png',
                lastUpdated: item.createdAt,
                curriculum,
            };
            return { data };
        }
        return { data: null };
    } catch (error: any) {
        console.error('Error fetching subject by ID', error);
        return { data: null, error: error?.message || 'Unknown error' };
    }
};
