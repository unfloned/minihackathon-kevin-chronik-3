const API_BASE_URL = '/api';

interface RequestOptions extends RequestInit {
    auth?: boolean;
}

type UnauthorizedCallback = () => void;

// Event-based system for unauthorized handling
const unauthorizedListeners: Set<UnauthorizedCallback> = new Set();
let isHandlingUnauthorized = false;

export function addUnauthorizedListener(callback: UnauthorizedCallback): () => void {
    unauthorizedListeners.add(callback);
    return () => {
        unauthorizedListeners.delete(callback);
    };
}

function notifyUnauthorized() {
    if (isHandlingUnauthorized) return;
    isHandlingUnauthorized = true;

    unauthorizedListeners.forEach(cb => cb());

    // Fallback: if no listeners, redirect directly
    if (unauthorizedListeners.size === 0) {
        window.location.href = '/auth';
    }

    setTimeout(() => {
        isHandlingUnauthorized = false;
    }, 1000);
}

class ApiClient {
    private baseUrl: string;
    private isRefreshing = false;
    private refreshPromise: Promise<boolean> | null = null;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    // Legacy method for backwards compatibility
    setOnUnauthorized(_callback: UnauthorizedCallback | null) {
        // No-op - using event system now
    }

    private async tryRefreshToken(): Promise<boolean> {
        if (this.isRefreshing && this.refreshPromise) {
            return this.refreshPromise;
        }

        this.isRefreshing = true;
        this.refreshPromise = this.doRefreshToken();

        try {
            return await this.refreshPromise;
        } finally {
            this.isRefreshing = false;
            this.refreshPromise = null;
        }
    }

    private async doRefreshToken(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/auth/refresh`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.ok) {
                const data = await response.json();
                return data.success === true;
            }
            return false;
        } catch {
            return false;
        }
    }

    async request<T>(endpoint: string, options: RequestOptions = {}, retryCount = 0): Promise<T> {
        const { auth = true, ...fetchOptions } = options;

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...fetchOptions.headers,
        };

        const url = `${this.baseUrl}${endpoint}`;

        try {
            const response = await fetch(url, {
                ...fetchOptions,
                headers,
                credentials: 'include',
            });

            if (response.status === 401 && auth && retryCount === 0) {
                const refreshed = await this.tryRefreshToken();
                if (refreshed) {
                    return this.request<T>(endpoint, options, retryCount + 1);
                } else {
                    notifyUnauthorized();
                    throw new Error('Session expired. Please login again.');
                }
            }

            if (response.status === 403) {
                const error = await response.json().catch(() => ({ message: 'Access denied' }));
                notifyUnauthorized();
                throw new Error(error.message || 'Access denied');
            }

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'Request failed' }));
                throw new Error(error.message || `HTTP ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    get<T>(endpoint: string, options?: RequestOptions) {
        return this.request<T>(endpoint, { ...options, method: 'GET' });
    }

    post<T>(endpoint: string, body?: unknown, options?: RequestOptions) {
        return this.request<T>(endpoint, {
            ...options,
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    patch<T>(endpoint: string, body?: unknown, options?: RequestOptions) {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PATCH',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    delete<T>(endpoint: string, options?: RequestOptions) {
        return this.request<T>(endpoint, { ...options, method: 'DELETE' });
    }
}

export const api = new ApiClient(API_BASE_URL);
export default api;

export function getErrorMessage(error: unknown, fallback = 'Ein Fehler ist aufgetreten'): string {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    if (error && typeof error === 'object' && 'message' in error) {
        return String((error as { message: unknown }).message);
    }
    return fallback;
}
