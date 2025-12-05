import { entity, PrimaryKey, uuid, UUID, Reference } from '@deepkit/type';
import { User } from './user.entity';

@entity.name('push_subscriptions')
export class PushSubscription {
    id: UUID & PrimaryKey = uuid();
    user: User & Reference = {} as User;

    // Web Push subscription data
    endpoint: string = '';
    p256dh: string = '';  // Public key
    auth: string = '';    // Auth secret

    // Device info (optional, for managing multiple devices)
    userAgent?: string;
    deviceName?: string;

    createdAt: Date = new Date();
    lastUsedAt?: Date;
}

// Notification preferences (stored in User or separate entity)
export interface NotificationPreferences {
    enabled: boolean;
    habitReminders: boolean;
    habitReminderTime: string; // "20:00"
    deadlineWarnings: boolean;
    deadlineDaysBefore: number[]; // [3, 1, 0]
    subscriptionReminders: boolean;
    streakWarnings: boolean;
}

export const defaultNotificationPreferences: NotificationPreferences = {
    enabled: true,
    habitReminders: true,
    habitReminderTime: '20:00',
    deadlineWarnings: true,
    deadlineDaysBefore: [3, 1, 0],
    subscriptionReminders: true,
    streakWarnings: true,
};
