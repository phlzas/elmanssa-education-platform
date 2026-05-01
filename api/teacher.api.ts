import { apiRequest } from "./client";
import { sanitizeSearchQuery, validateGuid, sanitizePlainText, validatePrice } from "../utils/validation";

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
    levels?: { name: string; sortOrder?: number; lectures?: { title: string; videoUrl?: string; mediaFileId?: string; sortOrder?: number }[] }[];
}) {
    // Sanitize input data
    const sanitizedData = {
        ...data,
        name: sanitizePlainText(data.name, 200),
        description: data.description ? sanitizePlainText(data.description, 5000) : undefined,
        icon: data.icon ? sanitizePlainText(data.icon, 50) : undefined,
    };
    return apiRequest("/teacher/subjects", {
        method: "POST",
        body: JSON.stringify(sanitizedData),
    });
}

export function updateSubject(id: string, data: {
    name?: string;
    title?: string;
    description?: string;
    category?: string;
    duration?: number;
    level?: string;
    language?: string;
    price?: number;
    imageUrl?: string;
    icon?: string;
    status?: string;
}) {
    // Validate ID
    if (!validateGuid(id)) {
        throw new Error('معرف المادة غير صالح');
    }

    // Sanitize and validate input data
    const sanitizedData: Record<string, any> = {};

    if (data.name !== undefined) {
        sanitizedData.name = sanitizePlainText(data.name, 200);
    }
    if (data.title !== undefined) {
        sanitizedData.title = sanitizePlainText(data.title, 200);
    }
    if (data.description !== undefined) {
        sanitizedData.description = sanitizePlainText(data.description, 5000);
    }
    if (data.category !== undefined) {
        sanitizedData.category = sanitizePlainText(data.category, 100);
    }
    if (data.level !== undefined) {
        sanitizedData.level = sanitizePlainText(data.level, 50);
    }
    if (data.language !== undefined) {
        sanitizedData.language = sanitizePlainText(data.language, 50);
    }
    if (data.price !== undefined) {
        if (!validatePrice(data.price)) {
            throw new Error('السعر غير صالح');
        }
        sanitizedData.price = data.price;
    }
    if (data.duration !== undefined) {
        const durationNum = Number(data.duration);
        if (isNaN(durationNum) || durationNum < 0 || durationNum > 9999) {
            throw new Error('المدة غير صالحة');
        }
        sanitizedData.duration = durationNum;
    }
    if (data.imageUrl !== undefined) {
        sanitizedData.imageUrl = data.imageUrl ? sanitizePlainText(data.imageUrl, 1000) : undefined;
    }
    if (data.icon !== undefined) {
        sanitizedData.icon = sanitizePlainText(data.icon, 50);
    }
    if (data.status !== undefined) {
        // Only allow specific status values
        const allowedStatuses = ['draft', 'published', 'archived', 'pending'];
        if (!allowedStatuses.includes(data.status)) {
            throw new Error('الحالة غير صالحة');
        }
        sanitizedData.status = data.status;
    }

    return apiRequest(`/teacher/subjects/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(sanitizedData),
    });
}

export function deleteSubject(id: string) {
    // Validate ID
    if (!validateGuid(id)) {
        throw new Error('معرف المادة غير صالح');
    }
    return apiRequest(`/teacher/subjects/${encodeURIComponent(id)}`, {
        method: "DELETE",
    });
}

export function publishSubject(id: string, status: string) {
    // Validate ID
    if (!validateGuid(id)) {
        throw new Error('معرف المادة غير صالح');
    }
    // Validate status
    const allowedStatuses = ['draft', 'published', 'archived', 'pending'];
    if (!allowedStatuses.includes(status)) {
        throw new Error('الحالة غير صالحة');
    }
    return apiRequest(`/teacher/subjects/${encodeURIComponent(id)}/publish`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
    });
}

export function getTeacherStats() {
    return apiRequest("/teacher/stats");
}

export function getTeacherStudents(search?: string) {
    // Sanitize search parameter
    let qs = "";
    if (search) {
        const sanitizedSearch = sanitizeSearchQuery(search);
        if (sanitizedSearch) {
            qs = `?search=${encodeURIComponent(sanitizedSearch)}`;
        }
    }
    return apiRequest(`/teacher/students${qs}`);
}
