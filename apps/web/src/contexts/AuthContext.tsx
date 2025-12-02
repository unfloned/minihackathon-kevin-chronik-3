import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { api } from '../config/api';
import type { UserPublic, SessionResponse } from '@ycmm/core';

interface AuthContextType {
    user: UserPublic | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    createDemoAccount: () => Promise<void>;
}

interface RegisterData {
    email: string;
    password: string;
    displayName: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserPublic | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const isLoggingOut = useRef(false);
    const navigate = useNavigate();

    const logout = useCallback(async () => {
        try {
            await api.post('/auth/logout', {}, { auth: false });
        } catch {
            // Ignore logout errors
        }
        setUser(null);
    }, []);

    const handleUnauthorized = useCallback(() => {
        if (isLoggingOut.current) return;
        isLoggingOut.current = true;

        setUser(null);

        notifications.show({
            title: 'Sitzung abgelaufen',
            message: 'Du wurdest automatisch abgemeldet. Bitte melde dich erneut an.',
            color: 'orange',
            autoClose: 5000,
        });

        navigate('/auth');

        setTimeout(() => {
            isLoggingOut.current = false;
        }, 1000);
    }, [navigate]);

    useEffect(() => {
        api.setOnUnauthorized(handleUnauthorized);
        return () => {
            api.setOnUnauthorized(null);
        };
    }, [handleUnauthorized]);

    const fetchUser = useCallback(async () => {
        try {
            const response = await api.get<SessionResponse>('/auth/session');
            if (response.authenticated && response.user) {
                setUser(response.user);
                return true;
            }
            setUser(null);
            return false;
        } catch {
            setUser(null);
            return false;
        }
    }, []);

    const refreshUser = useCallback(async () => {
        await fetchUser();
    }, [fetchUser]);

    useEffect(() => {
        fetchUser().finally(() => setIsLoading(false));
    }, [fetchUser]);

    async function login(email: string, password: string) {
        const user = await api.post<UserPublic>('/auth/login', { email, password }, { auth: false });
        setUser(user);
    }

    async function register(data: RegisterData) {
        const user = await api.post<UserPublic>('/auth/register', data, { auth: false });
        setUser(user);
    }

    async function createDemoAccount() {
        const user = await api.post<UserPublic>('/auth/demo', {}, { auth: false });
        setUser(user);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                register,
                logout,
                refreshUser,
                createDemoAccount,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
