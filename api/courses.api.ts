import { apiRequest } from "./client";
import { Course, Lecture, CurriculumSection } from "../types";

// ─── Raw API calls ───────────────────────────────────────────

export function getCourses(params?: { category?: string; level?: string; search?: string; page?: number; per_page?: number }) {
    const qs = new URLSearchParams();
    if (params?.category) qs.append("category", params.category);
    if (params?.level) qs.append("level", params.level);
    if (params?.search) qs.append("search", params.search);
    if (params?.page) qs.append("page", String(params.page));
    if (params?.per_page) qs.append("per_page", String(params.per_page));
    const query = qs.toString();
    return apiRequest(`/subjects${query ? `?${query}` : ""}`);
}

export function getCourse(id: number | string) {
    return apiRequest(`/subjects/${id}`);
}

export function getPopularCourses() {
    return apiRequest("/subjects/popular");
}

export function createCourse(data: {
    title: string;
    description?: string;
    category: string;
    duration?: number;
    level?: string;
    language?: string;
    price?: number;
    imageUrl?: string;
}) {
    return apiRequest("/subjects", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export function getReviews(courseId: number | string) {
    return apiRequest(`/subjects/${courseId}/reviews`);
}

export function createReview(courseId: number | string, data: { rating: number; comment?: string }) {
    return apiRequest(`/subjects/${courseId}/reviews`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

// ─── Helpers: map raw API item → Course type ─────────────────

function mapCourseItem(item: any): Course {
    return {
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
    };
}

function mapCourseDetail(item: any): Course {
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

    return {
        ...mapCourseItem(item),
        curriculum,
    };
}

// ─── Data-mapping wrappers (used by components) ──────────────

export const fetchCourses = async (): Promise<{ data: Course[]; error?: string }> => {
    try {
        const json = await getCourses();
        const raw = Array.isArray(json) ? json : (json.data ?? []);
        const items = Array.isArray(raw) ? raw : [];
        const data: Course[] = items.map(mapCourseItem);
        return { data };
    } catch (error: any) {
        console.error('Error fetching courses', error);
        return { data: [], error: error?.message || 'Unknown error' };
    }
};

export const fetchCourseById = async (id: number): Promise<{ data: Course | null; error?: string }> => {
    try {
        const json = await getCourse(id);
        const item = json.data ?? json;
        if (!item) return { data: null };
        const data: Course = mapCourseDetail(item);
        return { data };
    } catch (error: any) {
        console.error('Error fetching course by ID', error);
        return { data: null, error: error?.message || 'Unknown error' };
    }
};
