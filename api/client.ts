import { API_BASE } from "../config/api.config";
import { getToken, setToken, setRefreshToken, getRefreshToken, clearAllTokens } from "../utils/token";

function extractErrorMessage(body: any, status: number): string {
    return (
        body?.error?.message ||
        body?.message ||
        body?.title ||
        `Request failed (${status})`
    );
}

// Prevent multiple simultaneous refresh calls
let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
        const refreshToken = getRefreshToken();
        if (!refreshToken) return false;

        try {
            const res = await fetch(`${API_BASE}/auth/refresh`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refreshToken }),
            });

            if (!res.ok) return false;

            const data = await res.json();
            if (data.token) setToken(data.token);
            if (data.refreshToken) setRefreshToken(data.refreshToken);
            return true;
        } catch {
            return false;
        } finally {
            refreshPromise = null;
        }
    })();

    return refreshPromise;
}

export async function apiRequest(endpoint: string, options: RequestInit = {}, _retry = false): Promise<any> {
    const token = getToken();

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
    });

    // Silent refresh on 401 — try once
    if (response.status === 401 && !_retry) {
        const refreshed = await tryRefresh();
        if (refreshed) {
            return apiRequest(endpoint, options, true);
        }
        // Refresh failed — full logout
        clearAllTokens();
        window.dispatchEvent(new CustomEvent("auth:expired"));
        const err = new Error("انتهت صلاحية الجلسة");
        (err as any).status = 401;
        throw err;
    }

    if (response.status === 401 && _retry) {
        clearAllTokens();
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
