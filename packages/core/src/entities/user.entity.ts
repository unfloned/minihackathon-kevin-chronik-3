import { entity, PrimaryKey, Unique, uuid, UUID } from '@deepkit/type';

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

@entity.name('users')
export class User {
    id: UUID & PrimaryKey = uuid();
    email: string & Unique = '';
    password: string = '';
    displayName: string = '';
    isDemo: boolean = false;
    isAdmin: boolean = false;
    level: number = 1;
    xp: number = 0;
    locale: string = 'de';

    // Public profile / Achievement Showcase
    profilePublic: boolean = false;
    profileSlug: string = '';

    // Push Notification preferences
    notificationPreferences: NotificationPreferences = { ...defaultNotificationPreferences };

    // Demo account expiration (for cleanup of abandoned sessions)
    demoExpiresAt?: Date;

    createdAt: Date = new Date();
    updatedAt: Date = new Date();
}

export type UserPublic = Readonly<Omit<User, 'password'>>;
