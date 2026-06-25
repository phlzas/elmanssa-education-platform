import { API_BASE } from "../config/api.config";
import { getToken, setToken, setRefreshToken, getRefreshToken, clearAllTokens } from "../utils/token";
import { sanitizeErrorMessage } from "../utils/sanitize";

function extractErrorMessage(body: any, status: number): string {
    const rawMessage =
        body?.error?.message ||
        body?.message ||
        body?.title ||
        `Request failed (${status})`;
    return sanitizeErrorMessage(rawMessage);
}

// ── In-memory GET cache ───────────────────────────────────────────────────────
// Caches public (unauthenticated) GET responses for a short TTL so navigating
// back to the home page doesn't re-hit the API on every visit.
interface CacheEntry { data: any; expiresAt: number }
const _cache = new Map<string, CacheEntry>();

/** TTLs in milliseconds for specific endpoint prefixes */
const CACHE_TTLS: Array<[string, number]> = [
    ['/subjects/popular', 5 * 60 * 1000],   // popular courses — 5 min
    ['/subjects',         2 * 60 * 1000],   // course list — 2 min
    ['/content/stats',    5 * 60 * 1000],   // homepage stats — 5 min
];

function getCacheTtl(endpoint: string): number | null {
    for (const [prefix, ttl] of CACHE_TTLS) {
        if (endpoint.startsWith(prefix)) return ttl;
    }
    return null;
}

/** Invalidate all cached entries (call after mutations). */
export function invalidateCache(prefix?: string) {
    if (!prefix) { _cache.clear(); return; }
    for (const key of _cache.keys()) {
        if (key.startsWith(prefix)) _cache.delete(key);
    }
}

// ── Token refresh ─────────────────────────────────────────────────────────────
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

/**
 * Low-level authenticated fetch with token refresh support.
 */
export async function authedFetch(url: string, options: RequestInit = {}, _retry = false): Promise<Response> {
    const token = getToken();
    const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

    const headers: Record<string, string> = {
        ...(token && { Authorization: `Bearer ${token}` }),
        ...((options.headers as Record<string, string>) || {}),
    };

    if (!isFormData && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
    }

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401 && !_retry) {
        const refreshed = await tryRefresh();
        if (refreshed) return authedFetch(url, options, true);
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

    return response;
}

/**
 * High-level JSON API request with automatic token refresh, error handling,
 * and short-lived in-memory caching for public GET endpoints.
 */
export async function apiRequest(endpoint: string, options: RequestInit = {}, _retry = false): Promise<any> {
    const method = (options.method ?? "GET").toUpperCase();
    const isGet = method === "GET";
    const ttl = isGet ? getCacheTtl(endpoint) : null;

    // Return cached data if still fresh
    if (ttl !== null) {
        const cached = _cache.get(endpoint);
        if (cached && cached.expiresAt > Date.now()) {
            return cached.data;
        }
    }

    const response = await authedFetch(`${API_BASE}${endpoint}`, options, _retry);

    if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const err = new Error(extractErrorMessage(errorBody, response.status));
        (err as any).status = response.status;
        throw err;
    }

    const data = await response.json();

    // Store in cache for eligible GET endpoints
    if (ttl !== null) {
        _cache.set(endpoint, { data, expiresAt: Date.now() + ttl });
    }

    return data;
}
