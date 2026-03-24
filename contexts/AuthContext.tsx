import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AccountType } from '../App';
import { API_BASE } from '../config/api.config';
import { setToken, clearToken, setRefreshToken, getRefreshToken, clearAllTokens } from '../utils/token';

export interface User {
    id: string;
    name: string;
    email: string;
    role: AccountType;
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    isLoggedIn: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (name: string, email: string, password: string, role: AccountType, phoneNumber: string, nationalId: string) => Promise<void>;
    signupTeacher: (payload: {
        name: string; email: string; password: string; nationalId: string;
        phoneNumber: string; yearsOfExperience: number; specialization?: string;
        bio?: string; cvUrl?: string; avatarUrl?: string;
    }) => Promise<void>;
    logout: () => void;
    updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const STORAGE_KEY = 'elmanssa_auth_user';

function extractErrorMessage(data: any, fallback: string): string {
    if (data.errors && typeof data.errors === 'object') {
        const messages: string[] = [];
        for (const [field, errors] of Object.entries(data.errors)) {
            if (Array.isArray(errors)) {
                for (const err of errors) messages.push(formatValidationMessage(field, err));
            }
        }
        if (messages.length > 0) return messages.join('\n');
    }
    if (data.error?.details && Array.isArray(data.error.details))
        return data.error.details.map((d: any) => d.message || d).join('\n');
    if (data.error?.message) return data.error.message;
    if (data.title && data.status === 401) return 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
    if (data.title) return data.title;
    if (data.message) return data.message;
    return fallback;
}

function formatValidationMessage(field: string, message: string): string {
    const fieldMap: Record<string, string> = {
        Email: 'البريد الإلكتروني', Password: 'كلمة المرور', Name: 'الاسم',
        NationalId: 'الرقم القومي', PhoneNumber: 'رقم الهاتف',
        Specialization: 'التخصص', Bio: 'النبذة الشخصية',
        CvUrl: 'رابط السيرة الذاتية', YearsOfExperience: 'سنوات الخبرة',
    };
    const arField = fieldMap[field] || field;
    if (message === `${field} is required` || message === 'is required') return `${arField} مطلوب`;
    return `${arField}: ${message}`;
}

function persistSession(data: any, fallbackName: string, fallbackEmail: string, fallbackRole: AccountType): User {
    if (data.token) setToken(data.token);
    if (data.refreshToken) setRefreshToken(data.refreshToken);
    return {
        id: data.userId,
        name: data.name || fallbackName,
        email: data.email || fallbackEmail,
        role: (data.role?.toLowerCase() as AccountType) || fallbackRole,
    };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : null;
        } catch { return null; }
    });

    useEffect(() => {
        if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        else localStorage.removeItem(STORAGE_KEY);
    }, [user]);

    // Handle token expiry events fired by api/client.ts
    useEffect(() => {
        const handleExpired = () => {
            setUser(prev => { if (prev) clearAllTokens(); return null; });
        };
        window.addEventListener('auth:expired', handleExpired);
        return () => window.removeEventListener('auth:expired', handleExpired);
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (res.status === 401) throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة. تأكد من صحة بياناتك');
        if (!res.ok || !data.success) throw new Error(extractErrorMessage(data, 'فشل تسجيل الدخول'));
        setUser(persistSession(data, email.split('@')[0], email, 'student'));
    }, []);

    const signup = useCallback(async (name: string, email: string, password: string, role: AccountType, phoneNumber: string, nationalId: string) => {
        const res = await fetch(`${API_BASE}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role, phoneNumber, nationalId }),
        });
        const data = await res.json();
        if (res.status === 400) throw new Error(extractErrorMessage(data, 'بيانات غير صحيحة. تحقق من الحقول المطلوبة'));
        if (!res.ok || !data.success) throw new Error(extractErrorMessage(data, 'فشل إنشاء الحساب'));
        setUser(persistSession(data, name, email, role));
    }, []);

    const signupTeacher = useCallback(async (payload: {
        name: string; email: string; password: string; nationalId: string;
        phoneNumber: string; yearsOfExperience: number; specialization?: string;
        bio?: string; cvUrl?: string; avatarUrl?: string;
    }) => {
        const res = await fetch(`${API_BASE}/auth/signup/teacher`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.status === 400) throw new Error(extractErrorMessage(data, 'بيانات غير صحيحة. تحقق من جميع الحقول المطلوبة'));
        if (!res.ok || !data.success) throw new Error(extractErrorMessage(data, 'فشل إنشاء حساب المدرس'));
        setUser(persistSession(data, payload.name, payload.email, 'teacher'));
    }, []);

    const logout = useCallback(() => {
        // Fire-and-forget server-side revocation
        const rt = getRefreshToken();
        if (rt) {
            fetch(`${API_BASE}/auth/logout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken: rt }),
            }).catch(() => {});
        }
        setUser(null);
        clearAllTokens();
    }, []);

    const updateUser = useCallback((updates: Partial<User>) => {
        setUser(prev => prev ? { ...prev, ...updates } : null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, signup, signupTeacher, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
};

export default AuthContext;
