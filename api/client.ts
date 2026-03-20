import { API_BASE } from "../config/api.config";
import { getToken, clearToken } from "../utils/token";

function extractErrorMessage(body: any, status: number): string {
    return (
        body?.error?.message ||
        body?.message ||
        body?.title ||
        `Request failed (${status})`
    );
}

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

    if (response.status === 401) {
        clearToken();
        window.dispatchEvent(new CustomEvent("auth:expired"));
        const err = new Error("انتهت صلاحية الجلسة");
        (err as any).status = 401;
        throw err;
    }

    if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const err = new Error(extractErrorMessage(errorBody, response.status));
        (err as any).status = response.status;
        throw err;
    }

    return response.json();
}
