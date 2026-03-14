import { apiRequest } from "./client";

export function getEnrollments() {
    return apiRequest("/student/enrollments");
}

export function getProgress() {
    return apiRequest("/student/progress");
}

export function updateProgress(data: { lectureId: string; completed: boolean; progressPct?: number }) {
    return apiRequest("/student/progress", {
        method: "POST",
        body: JSON.stringify(data),
    });
}
