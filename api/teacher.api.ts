import { apiRequest } from "./client";

export function getTeacherProfile() {
    return apiRequest("/teacher");
}

export function getSubjects() {
    return apiRequest("/teacher/subjects");
}

export function createSubject(data: {
    name: string;
    description?: string;
    icon?: string;
    levels?: { name: string; sortOrder?: number; lectures?: { title: string; videoUrl?: string; sortOrder?: number }[] }[];
}) {
    return apiRequest("/teacher/subjects", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export function updateSubject(id: string, data: { name?: string; description?: string; icon?: string }) {
    return apiRequest(`/teacher/subjects/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export function deleteSubject(id: string) {
    return apiRequest(`/teacher/subjects/${id}`, {
        method: "DELETE",
    });
}

export function publishSubject(id: string, status: string) {
    return apiRequest(`/teacher/subjects/${id}/publish`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
    });
}

export function getTeacherStats() {
    return apiRequest("/teacher/stats");
}

export function getTeacherStudents(search?: string) {
    const qs = search ? `?search=${encodeURIComponent(search)}` : "";
    return apiRequest(`/teacher/students${qs}`);
}
