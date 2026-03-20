
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AccountType } from '../App';
import { API_BASE } from '../config/api.config';
import { setToken, clearToken } from '../utils/token';

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
    signup: (name: string, email: string, password: string, role: AccountType) => Promise<void>;
    signupTeacher: (payload: {
        name: string;
        email: string;
        password: string;
        nationalId: string;
        phoneNumber: string;
        yearsOfExperience: number;
        specialization?: string;
        bio?: string;
        cvUrl?: string;
        avatarUrl?: string;
    }) => Promise<void>;
    logout: () => void;
    updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'elmanssa_auth_user';

function extractErrorMessage(data: any, fallback: string): string {
    // Handle ASP.NET Core validation errors
    if (data.errors && typeof data.errors === 'object') {
        const messages: string[] = [];
        for (const [field, errors] of Object.entries(data.errors)) {
            if (Array.isArray(errors)) {
                for (const err of errors) {
                    messages.push(formatValidationMessage(field, err));
                }
            }
        }
        if (messages.length > 0) return messages.join('\n');
    }
    
    // Handle custom API error format
    if (data.error?.details && Array.isArray(data.error.details)) {
        return data.error.details.map((d: any) => d.message || d).join('\n');
    }
    if (data.error?.message) return data.error.message;
    
    // Handle other formats
    if (data.title && data.status === 401) return 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
    if (data.title) return data.title;
    if (data.message) return data.message;
    
    return fallback;
}

function formatValidationMessage(field: string, message: string): string {
    const fieldTranslations: Record<string, string> = {
        'Email': 'البريد الإلكتروني',
        'Password': 'كلمة المرور',
        'Name': 'الاسم',
        'NationalId': 'الرقم القومي',
        'PhoneNumber': 'رقم الهاتف',
        'Specialization': 'التخصص',
        'Bio': 'النبذة الشخصية',
        'CvUrl': 'رابط السيرة الذاتية',
        'YearsOfExperience': 'سنوات الخبرة',
    };
    
    const messageTranslations: Record<string, string> = {
        'is required': 'مطلوب',
        'must contain uppercase, lowercase, and number': 'يجب أن تحتوي على حرف كبير وحرف صغير ورقم',
        'must be a valid email': 'يجب أن يكون بريد إلكتروني صحيح',
        'must be at least': 'يجب أن يكون على الأقل',
        'already exists': 'موجود بالفعل',
        'Invalid': 'غير صحيح',
    };
    
    const arField = fieldTranslations[field] || field;
    let arMessage = message;
    for (const [eng, ar] of Object.entries(messageTranslations)) {
        if (message.includes(eng)) {
            arMessage = message.replace(eng, ar);
            break;
        }
    }
    
    // If message is just "X is required"
    if (message === `${field} is required` || message === 'is required') {
        return `${arField} مطلوب`;
    }
    
    return `${arField}: ${arMessage}`;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    });

    useEffect(() => {
        if (user) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, [user]);

    useEffect(() => {
        const handleExpired = () => {
            // Only log out if we actually have a session — avoids nuking state on transient 401s
            setUser(prev => {
                if (prev) clearToken();
                return null;
            });
        };
        window.addEventListener('auth:expired', handleExpired);
        return () => window.removeEventListener('auth:expired', handleExpired);
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.status === 401) {
            throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة. تأكد من صحة بياناتك');
        }

        if (!res.ok || !data.success) {
            throw new Error(extractErrorMessage(data, 'فشل تسجيل الدخول'));
        }

        if (data.token) {
            setToken(data.token);
        }

        const newUser: User = {
            id: data.userId,
            name: data.name || email.split('@')[0],
            email: data.email || email,
            role: (data.role?.toLowerCase() as AccountType) || 'student',
        };
        setUser(newUser);
    }, []);

    const signup = useCallback(async (name: string, email: string, password: string, role: AccountType, metadata?: {
        phoneNumber?: string;
        nationalId?: string;
        avatarUrl?: string;
        bio?: string;
    }) => {
        const res = await fetch(`${API_BASE}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role, ...metadata })
        });

        const data = await res.json();

        if (res.status === 400) {
            throw new Error(extractErrorMessage(data, 'بيانات غير صحيحة. تحقق من الحقول المطلوبة'));
        }

        if (!res.ok || !data.success) {
            throw new Error(extractErrorMessage(data, 'فشل إنشاء الحساب'));
        }

        if (data.token) {
            setToken(data.token);
        }

        const newUser: User = {
            id: data.userId,
            name: data.name || name,
            email: data.email || email,
            role: (data.role?.toLowerCase() as AccountType) || role,
        };
        setUser(newUser);
    }, []);

    const signupTeacher = useCallback(async (payload: {
        name: string;
        email: string;
        password: string;
        nationalId: string;
        phoneNumber: string;
        yearsOfExperience: number;
        specialization?: string;
        bio?: string;
        cvUrl?: string;
        avatarUrl?: string;
    }) => {
        const res = await fetch(`${API_BASE}/auth/signup/teacher`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (res.status === 400) {
            throw new Error(extractErrorMessage(data, 'بيانات غير صحيحة. تحقق من جميع الحقول المطلوبة'));
        }
        if (!res.ok || !data.success) {
            throw new Error(extractErrorMessage(data, 'فشل إنشاء حساب المدرس'));
        }
        if (data.token) {
            setToken(data.token);
        }
        const newUser: User = {
            id: data.userId,
            name: data.name || payload.name,
            email: data.email || payload.email,
            role: 'teacher',
        };
        setUser(newUser);
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        clearToken();
    }, []);

    const updateUser = useCallback((updates: Partial<User>) => {
        setUser((prev) => (prev ? { ...prev, ...updates } : null));
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoggedIn: !!user,
                login,
                signup,
                signupTeacher,
                logout,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
