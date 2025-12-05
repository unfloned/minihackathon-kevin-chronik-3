import { AppDatabase } from '../../app/database';
import { PushService } from '../push/push.service';
import { NotificationService } from '../notifications/notification.service';
import {
    User,
    Habit,
    HabitLog,
    Deadline,
    Subscription,
} from '@ycmm/core';

export class NotificationSchedulerService {
    private habitReminderInterval: NodeJS.Timeout | null = null;
    private deadlineCheckInterval: NodeJS.Timeout | null = null;
    private streakWarningInterval: NodeJS.Timeout | null = null;

    constructor(
        private db: AppDatabase,
        private pushService: PushService,
        private notificationService: NotificationService
    ) {}

    start() {
        console.log('[Scheduler] Starting notification scheduler...');

        // Check every minute for habit reminders
        this.habitReminderInterval = setInterval(
            () => this.checkHabitReminders(),
            60 * 1000 // Every minute
        );

        // Check every hour for deadline warnings
        this.deadlineCheckInterval = setInterval(
            () => this.checkDeadlineWarnings(),
            60 * 60 * 1000 // Every hour
        );

        // Check at 20:00 for streak warnings (run every 30 minutes, check time inside)
        this.streakWarningInterval = setInterval(
            () => this.checkStreakWarnings(),
            30 * 60 * 1000 // Every 30 minutes
        );

        // Run initial checks
        this.checkDeadlineWarnings();
        this.checkSubscriptionReminders();

        console.log('[Scheduler] Notification scheduler started');
    }

    stop() {
        if (this.habitReminderInterval) {
            clearInterval(this.habitReminderInterval);
        }
        if (this.deadlineCheckInterval) {
            clearInterval(this.deadlineCheckInterval);
        }
        if (this.streakWarningInterval) {
            clearInterval(this.streakWarningInterval);
        }
        console.log('[Scheduler] Notification scheduler stopped');
    }

    /**
     * Check for habit reminders based on user's preferred reminder time
     */
    async checkHabitReminders() {
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        // Find users who have habit reminders enabled and it's their reminder time
        const users = await this.db.query(User)
            .filter({ isDemo: false })
            .find();

        for (const user of users) {
            if (!user.notificationPreferences?.enabled || !user.notificationPreferences?.habitReminders) {
                continue;
            }

            const reminderTime = user.notificationPreferences.habitReminderTime || '20:00';

            // Check if it's the right time (within 1 minute window)
            if (currentTime !== reminderTime) {
                continue;
            }

            // Get uncompleted habits for today
            const habits = await this.db.query(Habit)
                .useInnerJoinWith('user').filter({ id: user.id }).end()
                .filter({ isArchived: false })
                .find();

            const today = new Date().toISOString().split('T')[0];
            const uncompletedHabits: Habit[] = [];

            for (const habit of habits) {
                const todayLog = await this.db.query(HabitLog)
                    .useInnerJoinWith('habit').filter({ id: habit.id }).end()
                    .filter({ date: today })
                    .findOneOrUndefined();

                if (!todayLog || !todayLog.completed) {
                    uncompletedHabits.push(habit);
                }
            }

            if (uncompletedHabits.length === 0) {
                continue;
            }

            // Send push notification
            const habitNames = uncompletedHabits.slice(0, 3).map(h => h.name).join(', ');
            const moreText = uncompletedHabits.length > 3 ? ` (+${uncompletedHabits.length - 3} mehr)` : '';

            await this.pushService.sendToUser(user.id, {
                title: 'Habit-Erinnerung',
                body: `Noch offen: ${habitNames}${moreText}`,
                tag: 'habit-reminder',
                data: { type: 'habit' },
            });

            // Also create in-app notification
            await this.notificationService.create(
                user.id,
                'reminder',
                'Habit-Erinnerung',
                `Du hast heute noch ${uncompletedHabits.length} Habit(s) offen`,
                '/app/habits'
            );
        }
    }

    /**
     * Check for deadline warnings based on user preferences
     */
    async checkDeadlineWarnings() {
        const users = await this.db.query(User)
            .filter({ isDemo: false })
            .find();

        for (const user of users) {
            if (!user.notificationPreferences?.enabled || !user.notificationPreferences?.deadlineWarnings) {
                continue;
            }

            const daysBefore = user.notificationPreferences.deadlineDaysBefore || [3, 1, 0];

            const deadlines = await this.db.query(Deadline)
                .useInnerJoinWith('user').filter({ id: user.id }).end()
                .filter({ status: 'pending' })
                .find();

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            for (const deadline of deadlines) {
                const dueDate = new Date(deadline.dueDate);
                dueDate.setHours(0, 0, 0, 0);

                const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                // Check if this matches any of the reminder days
                if (!daysBefore.includes(daysUntilDue)) {
                    continue;
                }

                // Create unique notification tag to avoid duplicates
                const notificationTag = `deadline-${deadline.id}-${daysUntilDue}`;

                let message: string;
                if (daysUntilDue === 0) {
                    message = `"${deadline.title}" ist heute fällig!`;
                } else if (daysUntilDue === 1) {
                    message = `"${deadline.title}" ist morgen fällig!`;
                } else {
                    message = `"${deadline.title}" ist in ${daysUntilDue} Tagen fällig`;
                }

                await this.pushService.sendToUser(user.id, {
                    title: 'Deadline-Erinnerung',
                    body: message,
                    tag: notificationTag,
                    data: { type: 'deadline', deadlineId: deadline.id },
                });

                await this.notificationService.create(
                    user.id,
                    'warning',
                    'Deadline-Erinnerung',
                    message,
                    '/app/deadlines'
                );
            }
        }
    }

    /**
     * Check for subscription payment reminders
     */
    async checkSubscriptionReminders() {
        const users = await this.db.query(User)
            .filter({ isDemo: false })
            .find();

        for (const user of users) {
            if (!user.notificationPreferences?.enabled || !user.notificationPreferences?.subscriptionReminders) {
                continue;
            }

            const subscriptions = await this.db.query(Subscription)
                .useInnerJoinWith('user').filter({ id: user.id }).end()
                .filter({ status: 'active', reminderEnabled: true })
                .find();

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            for (const sub of subscriptions) {
                if (!sub.nextBillingDate) continue;

                const billingDate = new Date(sub.nextBillingDate);
                billingDate.setHours(0, 0, 0, 0);

                const daysUntilBilling = Math.ceil((billingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                const reminderDays = sub.reminderDaysBefore || 3;

                if (daysUntilBilling !== reminderDays) {
                    continue;
                }

                const message = `${sub.name}: ${sub.amount.toFixed(2)} ${sub.currency} werden in ${daysUntilBilling} Tagen abgebucht`;

                await this.pushService.sendToUser(user.id, {
                    title: 'Abo-Erinnerung',
                    body: message,
                    tag: `subscription-${sub.id}`,
                    data: { type: 'subscription', subscriptionId: sub.id },
                });

                await this.notificationService.create(
                    user.id,
                    'info',
                    'Abo-Erinnerung',
                    message,
                    '/app/subscriptions'
                );
            }
        }
    }

    /**
     * Check for streak warnings (habits not completed today, sent in evening)
     */
    async checkStreakWarnings() {
        const now = new Date();
        const currentHour = now.getHours();

        // Only run between 19:00 and 21:00
        if (currentHour < 19 || currentHour > 21) {
            return;
        }

        const users = await this.db.query(User)
            .filter({ isDemo: false })
            .find();

        for (const user of users) {
            if (!user.notificationPreferences?.enabled || !user.notificationPreferences?.streakWarnings) {
                continue;
            }

            const habits = await this.db.query(Habit)
                .useInnerJoinWith('user').filter({ id: user.id }).end()
                .filter({ isArchived: false })
                .find();

            const today = new Date().toISOString().split('T')[0];
            const atRiskHabits: Habit[] = [];

            for (const habit of habits) {
                // Only warn for habits with active streaks
                if (habit.currentStreak < 3) {
                    continue;
                }

                const todayLog = await this.db.query(HabitLog)
                    .useInnerJoinWith('habit').filter({ id: habit.id }).end()
                    .filter({ date: today })
                    .findOneOrUndefined();

                if (!todayLog || !todayLog.completed) {
                    atRiskHabits.push(habit);
                }
            }

            if (atRiskHabits.length === 0) {
                continue;
            }

            const habitInfo = atRiskHabits
                .slice(0, 2)
                .map(h => `${h.name} (${h.currentStreak} Tage)`)
                .join(', ');

            await this.pushService.sendToUser(user.id, {
                title: 'Streak in Gefahr! 🔥',
                body: `${habitInfo} - nicht vergessen!`,
                tag: 'streak-warning',
                data: { type: 'habit' },
            });
        }
    }
}
