
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
const TOKEN_KEY = 'elmanssa_auth_token';

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
            localStorage.removeItem(TOKEN_KEY);
        }
    }, [user]);

    const login = useCallback(async (email: string, password: string) => {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
            let errorMsg = data.message || 'Login failed';
            if (data.error && data.error.details) {
                errorMsg = data.error.details.map((d: any) => d.message).join(', ');
            } else if (data.error && data.error.message) {
                errorMsg = data.error.message;
            } else if (data.title) {
                errorMsg = data.title;
            }
            throw new Error(errorMsg);
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

    const signup = useCallback(async (name: string, email: string, password: string, role: AccountType) => {
        const res = await fetch(`${API_BASE}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role })
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
            let errorMsg = data.message || 'Signup failed';
            if (data.error && data.error.details) {
                errorMsg = data.error.details.map((d: any) => d.message).join(', ');
            } else if (data.error && data.error.message) {
                errorMsg = data.error.message;
            }
            throw new Error(errorMsg);
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
        if (!res.ok || !data.success) {
            let errorMsg = data.message || 'Signup failed';
            if (data.error && data.error.details) {
                errorMsg = data.error.details.map((d: any) => d.message).join(', ');
            } else if (data.error && data.error.message) {
                errorMsg = data.error.message;
            }
            throw new Error(errorMsg);
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
