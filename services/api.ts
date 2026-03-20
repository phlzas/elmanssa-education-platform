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
            id: Number(item.id),
            guidId: item.guidId || undefined,
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
            id: Number(item.id),
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

export const validateCoupon = async (code: string, courseId?: number) => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/v1/orders/validate-coupon`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, courseId })
        });
        if (!res.ok) throw new Error('Invalid coupon');
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error('Error validating coupon', error);
        throw error;
    }
};

export const createOrder = async (data: { courseId: number, paymentMethod: string, couponCode?: string, billingFullName: string, billingEmail: string, billingPhone?: string }, token?: string) => {
    try {
        const headers: any = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${API_BASE_URL}/api/v1/orders`, {
            method: 'POST',
            headers,
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

export const startAIConversation = async (token?: string) => {
    try {
        const headers: any = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${API_BASE_URL}/api/v1/ai/conversations`, {
            method: 'POST',
            headers
        });
        if (!res.ok) throw new Error('Failed to start AI conversation');
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error('Error starting AI conversation', error);
        throw error;
    }
};

export const sendAIMessage = async (conversationId: string, message: string, token?: string) => {
    try {
        const headers: any = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${API_BASE_URL}/api/v1/ai/conversations/${conversationId}/messages`, {
            method: 'POST',
            headers,
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

export const fetchTeacherStats = async (token: string) => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/v1/teacher/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch teacher stats');
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error('Error fetching teacher stats', error);
        return null;
    }
};

export const pingTeacherAuth = async (token: string) => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/v1/teacher`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.status === 200;
    } catch {
        return false;
    }
};

// Fetch teacher's subjects/courses
export const fetchTeacherCourses = async (token: string) => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/v1/teacher/subjects`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch teacher subjects');
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error('Error fetching teacher subjects', error);
        return [];
    }
};

// Create a new course (was createTeacherSubject)
export const createTeacherCourse = async (token: string, data: { 
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
        const res = await fetch(`${API_BASE_URL}/api/v1/subjects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
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
export const createCourseWithCurriculum = async (token: string, data: {
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
        title: data.title,
        description: data.description,
        icon: '📚',
        category: data.category,
        duration: data.duration,
        level: data.level,
        language: data.language,
        price: data.price,
        imageUrl: data.imageUrl,
        levels: data.sections.map((section, idx) => ({
            title: section.title,
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

// Update subject (was updateTeacherSubject)
export const updateTeacherCourse = async (token: string, courseId: number, data: { 
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
        const res = await fetch(`${API_BASE_URL}/api/v1/teacher/subjects/${courseId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title: data.title, description: data.description })
        });
        if (!res.ok) throw new Error('Failed to update subject');
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error('Error updating subject', error);
        throw error;
    }
};

// Delete subject (was deleteTeacherSubject)
export const deleteTeacherCourse = async (token: string, courseId: number) => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/v1/teacher/subjects/${courseId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to delete subject');
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error('Error deleting subject', error);
        throw error;
    }
};

// Create section in a course
export const createCourseSection = async (token: string, courseId: number, data: { title: string; sortOrder?: number }) => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/v1/subjects/${courseId}/sections`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
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

// Update section
export const updateCourseSection = async (token: string, sectionId: number, data: { title?: string; sortOrder?: number }) => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/v1/subjects/sections/${sectionId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
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

// Delete section
export const deleteCourseSection = async (token: string, sectionId: number) => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/v1/subjects/sections/${sectionId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to delete section');
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error('Error deleting section', error);
        throw error;
    }
};

// Create lecture in a section
export const createSectionLecture = async (token: string, sectionId: number, data: { 
    title: string; 
    duration?: string;
    videoUrl?: string;
    sortOrder?: number;
    isPreview?: boolean;
}) => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/v1/subjects/sections/${sectionId}/lectures`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
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

// Update lecture
export const updateSectionLecture = async (token: string, lectureId: number, data: { 
    title?: string; 
    duration?: string;
    videoUrl?: string;
    sortOrder?: number;
    isPreview?: boolean;
}) => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/v1/subjects/lectures/${lectureId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
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

// Delete lecture
export const deleteSectionLecture = async (token: string, lectureId: number) => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/v1/subjects/lectures/${lectureId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to delete lecture');
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error('Error deleting lecture', error);
        throw error;
    }
};

export const fetchTeacherStudents = async (token: string, search?: string, page = 1, perPage = 20) => {
    try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        params.append('page', page.toString());
        params.append('per_page', perPage.toString());

        const res = await fetch(`${API_BASE_URL}/api/v1/teacher/students?${params}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch teacher students');
        const json = await res.json();
        return json.data || [];
    } catch (error) {
        console.error('Error fetching teacher students', error);
        return [];
    }
};

// Publish/unpublish subject
export const publishTeacherSubject = async (token: string, courseId: string, status: string) => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/v1/teacher/subjects/${courseId}/publish`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
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

export const fetchStudentProgress = async (token: string) => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/v1/student/progress`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch student progress');
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error('Error fetching student progress', error);
        return null;
    }
};

export const fetchStudentEnrollments = async (token: string) => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/v1/student/enrollments`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(`Failed to fetch student enrollments: ${res.status} ${res.statusText}`);
        const json = await res.json();
        return json.data || [];
    } catch (error) {
        console.error('Error fetching student enrollments', error);
        return [];
    }
};

// Fetch student's courses
export const fetchStudentCourses = async (token: string) => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/v1/student/courses`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch student courses');
        const json = await res.json();
        return json.data || [];
    } catch (error) {
        console.error('Error fetching student courses', error);
        return [];
    }
};

// Fetch student course detail
export const fetchStudentCourseDetail = async (courseId: number, token: string) => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/v1/student/courses/${courseId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch course detail');
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error('Error fetching course detail', error);
        return null;
    }
};

// Fetch lecture detail for student
export const fetchStudentLectureDetail = async (lectureId: number, token: string) => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/v1/student/lectures/${lectureId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch lecture detail');
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error('Error fetching lecture detail', error);
        return null;
    }
};

// Record lecture watch progress
export const recordLectureWatch = async (token: string, lectureId: number, data: { 
    watchedSeconds: number; 
    totalSeconds: number;
    isCompleted?: boolean;
}) => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/v1/student/lectures/${lectureId}/watch`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
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

// Fetch lecture transcript
export const fetchLectureTranscript = async (lectureId: number, token: string) => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/v1/student/lectures/${lectureId}/transcript`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch transcript');
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error('Error fetching transcript', error);
        return null;
    }
};


export const updateStudentProgress = async (token: string, data: { lectureId: string; completed: boolean; progressPct?: number }) => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/v1/student/progress`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
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

// Legacy function for backward compatibility - fetches subject (teacher-created content)
// This is used by VideoViewer for older subject-based content
export const fetchSubjectById = async (id: string, token: string): Promise<{ data: any | null; error?: string }> => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/v1/student/subjects/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(`Failed to fetch subject: ${res.status} ${res.statusText}`);
        const json = await res.json();

        if (json?.data) {
            const item = json.data;
            const curriculum = Array.isArray(item.levels)
                ? item.levels.map((lv: any) => ({
                    section: lv.title ?? lv.name ?? '',
                    lectures: Array.isArray(lv.lectures)
                        ? lv.lectures.map((l: any) => ({
                            id: Number(l.id),
                            title: l.title ?? '',
                            durationSeconds: typeof l.durationSeconds === 'number' ? l.durationSeconds : undefined,
                            videoUrl: l.videoUrl || undefined,
                        }))
                        : []
                }))
                : undefined;

            const data = {
                id: Number(item.id),
                title: item.title || item.name || '',
                category: 'Subject',
                description: item.description || '',
                instructorId: typeof item.teacherId === 'number' ? item.teacherId : undefined,
                instructorName: item.teacherName ?? undefined,
                rating: 4.5,
                students: item.studentsCount || 0,
                price: 0,
                isFree: true,
                imageUrl: '/assets/courses/default.png',
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
