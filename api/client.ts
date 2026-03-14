import { API_BASE } from "../config/api.config";
import { getToken } from "../utils/token";

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
    const token = getToken();

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
    });

    if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const message =
            errorBody?.error?.message ||
            errorBody?.message ||
            errorBody?.title ||
            `Request failed (${response.status})`;
        const err = new Error(message);
        (err as any).status = response.status;
        throw err;
    }

    return response.json();
}
