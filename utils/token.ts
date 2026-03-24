const TOKEN_KEY = "elmanssa_auth_token";
const REFRESH_KEY = "elmanssa_refresh_token";

export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_KEY);
}

export function setRefreshToken(token: string): void {
    localStorage.setItem(REFRESH_KEY, token);
}

export function clearRefreshToken(): void {
    localStorage.removeItem(REFRESH_KEY);
}

export function clearAllTokens(): void {
    clearToken();
    clearRefreshToken();
}
