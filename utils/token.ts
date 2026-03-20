const TOKEN_KEY = "elmanssa_auth_token";

export function getToken(): string | null {
    const token = localStorage.getItem(TOKEN_KEY);
    console.log('[getToken] Retrieved token:', token ? `EXISTS (${token.substring(0, 20)}...)` : 'MISSING');
    return token;
}

export function setToken(token: string): void {
    console.log('[setToken] Storing token:', token ? `${token.substring(0, 20)}...` : 'EMPTY');
    localStorage.setItem(TOKEN_KEY, token);
    console.log('[setToken] Token stored successfully');
}

export function clearToken(): void {
    console.log('[clearToken] Clearing token');
    localStorage.removeItem(TOKEN_KEY);
}
