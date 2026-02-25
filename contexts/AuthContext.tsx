
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AccountType } from '../App';

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
    logout: () => void;
    updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'elmanssa_auth_user';

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

    const login = useCallback(async (email: string, _password: string) => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1200));

        // Mock: determine role from email pattern
        const isTeacher = email.includes('teacher') || email.includes('معلم') || email.includes('prof');
        const name = email.split('@')[0].replace(/[._]/g, ' ');

        const newUser: User = {
            id: `user_${Date.now()}`,
            name: name.charAt(0).toUpperCase() + name.slice(1),
            email,
            role: isTeacher ? 'teacher' : 'student',
        };
        setUser(newUser);
    }, []);

    const signup = useCallback(async (name: string, email: string, _password: string, role: AccountType) => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1200));

        const newUser: User = {
            id: `user_${Date.now()}`,
            name,
            email,
            role,
        };
        setUser(newUser);
    }, []);

    const logout = useCallback(() => {
        setUser(null);
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
