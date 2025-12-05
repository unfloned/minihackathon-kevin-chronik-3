import { useState, useEffect, useCallback } from 'react';
import { api } from '../config/api';

interface PushState {
    isSupported: boolean;
    isEnabled: boolean;
    permission: NotificationPermission;
    isLoading: boolean;
    error: string | null;
}

interface VapidResponse {
    enabled: boolean;
    vapidPublicKey: string | null;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
    if (!buffer) return '';
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

export function usePushNotifications() {
    const [state, setState] = useState<PushState>({
        isSupported: false,
        isEnabled: false,
        permission: 'default',
        isLoading: true,
        error: null,
    });

    const [vapidKey, setVapidKey] = useState<string | null>(null);

    // Check support and current state
    useEffect(() => {
        const checkSupport = async () => {
            const isSupported =
                'serviceWorker' in navigator &&
                'PushManager' in window &&
                'Notification' in window;

            if (!isSupported) {
                setState({
                    isSupported: false,
                    isEnabled: false,
                    permission: 'denied',
                    isLoading: false,
                    error: null,
                });
                return;
            }

            // Get VAPID key from server
            try {
                const response = await api.get<VapidResponse>('/push/vapid-key', { auth: false });
                if (response.enabled && response.vapidPublicKey) {
                    setVapidKey(response.vapidPublicKey);
                } else {
                    setState(prev => ({
                        ...prev,
                        isSupported: false,
                        isLoading: false,
                        error: 'Push notifications not configured on server',
                    }));
                    return;
                }
            } catch {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: 'Could not fetch push configuration',
                }));
                return;
            }

            const permission = Notification.permission;

            // Check if already subscribed
            let isEnabled = false;
            if (permission === 'granted') {
                try {
                    const registration = await navigator.serviceWorker.ready;
                    const subscription = await registration.pushManager.getSubscription();
                    isEnabled = !!subscription;
                } catch {
                    // Ignore errors
                }
            }

            setState({
                isSupported: true,
                isEnabled,
                permission,
                isLoading: false,
                error: null,
            });
        };

        checkSupport();
    }, []);

    const subscribe = useCallback(async () => {
        if (!vapidKey) {
            setState(prev => ({ ...prev, error: 'VAPID key not available' }));
            return false;
        }

        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            // Request permission
            const permission = await Notification.requestPermission();

            if (permission !== 'granted') {
                setState(prev => ({
                    ...prev,
                    permission,
                    isLoading: false,
                    error: permission === 'denied' ? 'Benachrichtigungen wurden blockiert' : null,
                }));
                return false;
            }

            // Get service worker registration
            const registration = await navigator.serviceWorker.ready;

            // Subscribe to push
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidKey),
            });

            // Send subscription to server
            const p256dh = arrayBufferToBase64(subscription.getKey('p256dh'));
            const auth = arrayBufferToBase64(subscription.getKey('auth'));

            await api.post('/push/subscribe', {
                endpoint: subscription.endpoint,
                keys: { p256dh, auth },
                userAgent: navigator.userAgent,
            });

            setState(prev => ({
                ...prev,
                isEnabled: true,
                permission: 'granted',
                isLoading: false,
                error: null,
            }));

            return true;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Subscription failed';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: message,
            }));
            return false;
        }
    }, [vapidKey]);

    const unsubscribe = useCallback(async () => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                // Unsubscribe from push manager
                await subscription.unsubscribe();

                // Remove from server
                await api.post('/push/unsubscribe', {
                    endpoint: subscription.endpoint,
                });
            }

            setState(prev => ({
                ...prev,
                isEnabled: false,
                isLoading: false,
                error: null,
            }));

            return true;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unsubscribe failed';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: message,
            }));
            return false;
        }
    }, []);

    const sendTestNotification = useCallback(async () => {
        try {
            await api.post('/push/test');
            return true;
        } catch {
            return false;
        }
    }, []);

    return {
        ...state,
        subscribe,
        unsubscribe,
        sendTestNotification,
    };
}
