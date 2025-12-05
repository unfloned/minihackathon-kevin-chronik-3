import { http, HttpBadRequestError } from '@deepkit/http';
import { PushService } from './push.service';
import { User } from '@ycmm/core';

interface SubscribeRequest {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
    userAgent?: string;
}

@http.controller('/api/push')
export class PushController {
    constructor(private pushService: PushService) {}

    @http.GET('/vapid-key')
    async getVapidKey() {
        const key = this.pushService.getVapidPublicKey();
        return {
            enabled: this.pushService.isEnabled(),
            vapidPublicKey: key
        };
    }

    @(http.POST('/subscribe').group('auth-required'))
    async subscribe(user: User, body: SubscribeRequest) {
        if (!this.pushService.isEnabled()) {
            throw new HttpBadRequestError('Push notifications are not configured');
        }

        if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
            throw new HttpBadRequestError('Invalid subscription data');
        }

        const subscription = await this.pushService.subscribe(
            user.id,
            body.endpoint,
            body.keys.p256dh,
            body.keys.auth,
            body.userAgent
        );

        return {
            success: true,
            subscriptionId: subscription.id
        };
    }

    @(http.POST('/unsubscribe').group('auth-required'))
    async unsubscribe(body: { endpoint: string }) {
        if (!body.endpoint) {
            throw new HttpBadRequestError('Endpoint is required');
        }

        const removed = await this.pushService.unsubscribe(body.endpoint);
        return { success: removed };
    }

    @(http.GET('/subscriptions').group('auth-required'))
    async getSubscriptions(user: User) {
        const subscriptions = await this.pushService.getUserSubscriptions(user.id);
        return subscriptions.map(sub => ({
            id: sub.id,
            userAgent: sub.userAgent,
            createdAt: sub.createdAt,
            lastUsedAt: sub.lastUsedAt,
        }));
    }

    @(http.DELETE('/subscriptions').group('auth-required'))
    async unsubscribeAll(user: User) {
        const count = await this.pushService.unsubscribeAll(user.id);
        return { success: true, removed: count };
    }

    @(http.POST('/test').group('auth-required'))
    async sendTestNotification(user: User) {
        if (!this.pushService.isEnabled()) {
            throw new HttpBadRequestError('Push notifications are not configured');
        }

        const result = await this.pushService.sendToUser(user.id, {
            title: 'Test Notification',
            body: 'Push-Benachrichtigungen funktionieren!',
            tag: 'test',
        });

        return result;
    }
}
