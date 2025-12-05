import webpush from 'web-push';
import { AppDatabase } from '../../app/database';
import { AppConfig } from '../../app/config';
import { PushSubscription, User } from '@ycmm/core';

export interface PushPayload {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: Record<string, unknown>;
    actions?: { action: string; title: string }[];
}

export class PushService {
    private isConfigured = false;

    constructor(
        private db: AppDatabase,
        private config: AppConfig
    ) {
        this.initializeVapid();
    }

    private initializeVapid() {
        if (this.config.vapidPublicKey && this.config.vapidPrivateKey) {
            webpush.setVapidDetails(
                this.config.vapidEmail,
                this.config.vapidPublicKey,
                this.config.vapidPrivateKey
            );
            this.isConfigured = true;
            console.log('[Push] VAPID keys configured successfully');
        } else {
            console.log('[Push] VAPID keys not configured - push notifications disabled');
            console.log('[Push] Generate keys with: npx web-push generate-vapid-keys');
        }
    }

    getVapidPublicKey(): string | null {
        return this.isConfigured ? this.config.vapidPublicKey : null;
    }

    isEnabled(): boolean {
        return this.isConfigured;
    }

    async subscribe(
        userId: string,
        endpoint: string,
        p256dh: string,
        auth: string,
        userAgent?: string
    ): Promise<PushSubscription> {
        // Check if subscription already exists
        const existing = await this.db.query(PushSubscription)
            .filter({ endpoint })
            .findOneOrUndefined();

        if (existing) {
            // Update existing subscription
            existing.p256dh = p256dh;
            existing.auth = auth;
            existing.userAgent = userAgent;
            existing.lastUsedAt = new Date();
            await this.db.persist(existing);
            return existing;
        }

        // Create new subscription
        const user = await this.db.query(User).filter({ id: userId }).findOne();

        const subscription = new PushSubscription();
        subscription.user = user;
        subscription.endpoint = endpoint;
        subscription.p256dh = p256dh;
        subscription.auth = auth;
        subscription.userAgent = userAgent;
        subscription.createdAt = new Date();

        await this.db.persist(subscription);
        console.log(`[Push] New subscription for user ${userId}`);

        return subscription;
    }

    async unsubscribe(endpoint: string): Promise<boolean> {
        const subscription = await this.db.query(PushSubscription)
            .filter({ endpoint })
            .findOneOrUndefined();

        if (subscription) {
            await this.db.remove(subscription);
            console.log(`[Push] Subscription removed`);
            return true;
        }
        return false;
    }

    async unsubscribeAll(userId: string): Promise<number> {
        const subscriptions = await this.db.query(PushSubscription)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .find();

        for (const sub of subscriptions) {
            await this.db.remove(sub);
        }

        return subscriptions.length;
    }

    async sendToUser(userId: string, payload: PushPayload): Promise<{ sent: number; failed: number }> {
        if (!this.isConfigured) {
            console.log('[Push] Not configured, skipping notification');
            return { sent: 0, failed: 0 };
        }

        const subscriptions = await this.db.query(PushSubscription)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .find();

        let sent = 0;
        let failed = 0;

        for (const sub of subscriptions) {
            try {
                await this.sendNotification(sub, payload);
                sub.lastUsedAt = new Date();
                await this.db.persist(sub);
                sent++;
            } catch (error: unknown) {
                const err = error as { statusCode?: number };
                console.error(`[Push] Failed to send to ${sub.endpoint}:`, err);

                // Remove invalid subscriptions (410 Gone, 404 Not Found)
                if (err.statusCode === 410 || err.statusCode === 404) {
                    await this.db.remove(sub);
                    console.log(`[Push] Removed invalid subscription`);
                }
                failed++;
            }
        }

        return { sent, failed };
    }

    async sendToAll(payload: PushPayload): Promise<{ sent: number; failed: number }> {
        if (!this.isConfigured) {
            return { sent: 0, failed: 0 };
        }

        const subscriptions = await this.db.query(PushSubscription).find();

        let sent = 0;
        let failed = 0;

        for (const sub of subscriptions) {
            try {
                await this.sendNotification(sub, payload);
                sent++;
            } catch {
                failed++;
            }
        }

        return { sent, failed };
    }

    private async sendNotification(subscription: PushSubscription, payload: PushPayload): Promise<void> {
        const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth,
            },
        };

        const notificationPayload = JSON.stringify({
            title: payload.title,
            body: payload.body,
            icon: payload.icon || '/pwa-192x192.png',
            badge: payload.badge || '/pwa-192x192.png',
            tag: payload.tag,
            data: payload.data,
            actions: payload.actions,
        });

        await webpush.sendNotification(pushSubscription, notificationPayload);
    }

    async getUserSubscriptions(userId: string): Promise<PushSubscription[]> {
        return this.db.query(PushSubscription)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .find();
    }
}
