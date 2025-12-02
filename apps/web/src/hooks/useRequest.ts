import { useState, useCallback, useEffect, useRef } from 'react';
import { api, getErrorMessage } from '../config/api';

interface UseRequestOptions<T> {
    /** Initial data before first fetch */
    initialData?: T;
    /** Fetch on mount */
    immediate?: boolean;
    /** Require auth for this request */
    auth?: boolean;
    /** Dependencies that trigger refetch */
    deps?: unknown[];
}

interface UseRequestState<T> {
    data: T | null;
    error: string | null;
    isLoading: boolean;
    isError: boolean;
    isSuccess: boolean;
}

interface UseRequestReturn<T> extends UseRequestState<T> {
    refetch: () => Promise<T | null>;
    reset: () => void;
}

export function useRequest<T>(
    endpoint: string,
    options: UseRequestOptions<T> = {}
): UseRequestReturn<T> {
    const { initialData = null, immediate = true, auth = true, deps = [] } = options;

    const [state, setState] = useState<UseRequestState<T>>({
        data: initialData as T | null,
        error: null,
        isLoading: immediate,
        isError: false,
        isSuccess: false,
    });

    const isMounted = useRef(true);

    const fetchData = useCallback(async (): Promise<T | null> => {
        setState(prev => ({ ...prev, isLoading: true, error: null, isError: false }));

        try {
            const data = await api.get<T>(endpoint, { auth });

            if (isMounted.current) {
                setState({
                    data,
                    error: null,
                    isLoading: false,
                    isError: false,
                    isSuccess: true,
                });
            }
            return data;
        } catch (err) {
            const message = getErrorMessage(err);
            if (isMounted.current) {
                setState(prev => ({
                    ...prev,
                    error: message,
                    isLoading: false,
                    isError: true,
                    isSuccess: false,
                }));
            }
            return null;
        }
    }, [endpoint, auth]);

    const reset = useCallback(() => {
        setState({
            data: initialData as T | null,
            error: null,
            isLoading: false,
            isError: false,
            isSuccess: false,
        });
    }, [initialData]);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        if (immediate) {
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [immediate, ...deps]);

    return {
        ...state,
        refetch: fetchData,
        reset,
    };
}

interface UseMutationOptions {
    /** Require auth for this request */
    auth?: boolean;
    /** HTTP method */
    method?: 'POST' | 'PATCH' | 'PUT' | 'DELETE';
    /** Callback on success */
    onSuccess?: (data: unknown) => void;
    /** Callback on error */
    onError?: (error: string) => void;
}

interface UseMutationState<T> {
    data: T | null;
    error: string | null;
    isLoading: boolean;
    isError: boolean;
    isSuccess: boolean;
}

interface UseMutationReturn<T, TVariables> extends UseMutationState<T> {
    mutate: (variables?: TVariables) => Promise<T | null>;
    reset: () => void;
}

export function useMutation<T, TVariables = unknown>(
    endpoint: string | ((variables: TVariables) => string),
    options: UseMutationOptions = {}
): UseMutationReturn<T, TVariables> {
    const { auth = true, method = 'POST', onSuccess, onError } = options;

    const [state, setState] = useState<UseMutationState<T>>({
        data: null,
        error: null,
        isLoading: false,
        isError: false,
        isSuccess: false,
    });

    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    const mutate = useCallback(
        async (variables?: TVariables): Promise<T | null> => {
            setState(prev => ({ ...prev, isLoading: true, error: null, isError: false }));

            const url = typeof endpoint === 'function' ? endpoint(variables as TVariables) : endpoint;

            try {
                let data: T;

                switch (method) {
                    case 'DELETE':
                        data = await api.delete<T>(url, { auth });
                        break;
                    case 'PATCH':
                        data = await api.patch<T>(url, variables, { auth });
                        break;
                    case 'PUT':
                        data = await api.request<T>(url, { method: 'PUT', body: JSON.stringify(variables), auth });
                        break;
                    case 'POST':
                    default:
                        data = await api.post<T>(url, variables, { auth });
                        break;
                }

                if (isMounted.current) {
                    setState({
                        data,
                        error: null,
                        isLoading: false,
                        isError: false,
                        isSuccess: true,
                    });
                }

                onSuccess?.(data);
                return data;
            } catch (err) {
                const message = getErrorMessage(err);

                if (isMounted.current) {
                    setState(prev => ({
                        ...prev,
                        error: message,
                        isLoading: false,
                        isError: true,
                        isSuccess: false,
                    }));
                }

                onError?.(message);
                return null;
            }
        },
        [endpoint, method, auth, onSuccess, onError]
    );

    const reset = useCallback(() => {
        setState({
            data: null,
            error: null,
            isLoading: false,
            isError: false,
            isSuccess: false,
        });
    }, []);

    return {
        ...state,
        mutate,
        reset,
    };
}
