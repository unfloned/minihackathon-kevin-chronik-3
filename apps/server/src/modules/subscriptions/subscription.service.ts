import { AppDatabase } from '../../app/database';
import { GamificationService } from '../gamification/gamification.service';
import { Subscription, SubscriptionBillingCycle, SubscriptionStatus, User } from '@ycmm/core';

export interface CreateSubscriptionDto {
    name: string;
    description?: string;
    amount: number;
    currency?: string;
    billingCycle: SubscriptionBillingCycle;
    billingDay?: number;
    nextBillingDate?: string;
    category?: string;
    color?: string;
    icon?: string;
    website?: string;
    startDate?: string;
    reminderEnabled?: boolean;
    reminderDaysBefore?: number;
}

export interface UpdateSubscriptionDto {
    name?: string;
    description?: string;
    amount?: number;
    currency?: string;
    billingCycle?: SubscriptionBillingCycle;
    billingDay?: number;
    nextBillingDate?: string;
    category?: string;
    color?: string;
    icon?: string;
    website?: string;
    status?: SubscriptionStatus;
    reminderEnabled?: boolean;
    reminderDaysBefore?: number;
}

export interface SubscriptionStats {
    totalMonthly: number;
    totalYearly: number;
    activeCount: number;
    pausedCount: number;
    byCategory: { category: string; amount: number; count: number }[];
    upcomingBillings: { subscription: Subscription; daysUntil: number }[];
}

export class SubscriptionService {
    constructor(
        private db: AppDatabase,
        private gamificationService: GamificationService
    ) {}

    private calculateNextBillingDate(billingCycle: SubscriptionBillingCycle, billingDay: number): string {
        const today = new Date();
        const result = new Date(today);

        switch (billingCycle) {
            case 'weekly':
                // Next occurrence of billingDay (0-6, Sunday-Saturday)
                const currentDay = today.getDay();
                const daysUntil = (billingDay - currentDay + 7) % 7 || 7;
                result.setDate(today.getDate() + daysUntil);
                break;

            case 'monthly':
                result.setDate(billingDay);
                if (result <= today) {
                    result.setMonth(result.getMonth() + 1);
                }
                break;

            case 'quarterly':
                result.setDate(billingDay);
                if (result <= today) {
                    result.setMonth(result.getMonth() + 3);
                }
                break;

            case 'yearly':
                result.setDate(billingDay);
                if (result <= today) {
                    result.setFullYear(result.getFullYear() + 1);
                }
                break;
        }

        return result.toISOString().split('T')[0];
    }

    private calculateMonthlyEquivalent(amount: number, billingCycle: SubscriptionBillingCycle): number {
        switch (billingCycle) {
            case 'weekly':
                return amount * 4.33; // Average weeks per month
            case 'monthly':
                return amount;
            case 'quarterly':
                return amount / 3;
            case 'yearly':
                return amount / 12;
        }
    }

    async create(userId: string, dto: CreateSubscriptionDto): Promise<Subscription> {
        const subscription = new Subscription();
        subscription.user = this.db.getReference(User, userId);
        subscription.name = dto.name;
        subscription.description = dto.description;
        subscription.amount = dto.amount;
        subscription.currency = dto.currency || 'EUR';
        subscription.billingCycle = dto.billingCycle;
        subscription.billingDay = dto.billingDay || new Date().getDate();
        subscription.nextBillingDate = dto.nextBillingDate ||
            this.calculateNextBillingDate(dto.billingCycle, subscription.billingDay);
        subscription.category = dto.category;
        subscription.color = dto.color || '#228be6';
        subscription.icon = dto.icon;
        subscription.website = dto.website;
        subscription.startDate = dto.startDate || new Date().toISOString().split('T')[0];
        subscription.reminderEnabled = dto.reminderEnabled || false;
        subscription.reminderDaysBefore = dto.reminderDaysBefore || 3;
        subscription.status = 'active';
        subscription.createdAt = new Date();
        subscription.updatedAt = new Date();

        await this.db.persist(subscription);

        // Award XP
        await this.gamificationService.awardXp(userId, 10, 'subscription_added');

        // Check for first subscription achievement
        await this.gamificationService.checkAndUnlockAchievement(userId, 'first_subscription');

        // Check for subscriptions_5 achievement
        const subCount = await this.db.query(Subscription).useInnerJoinWith('user').filter({ id: userId }).end().count();
        if (subCount >= 5) {
            await this.gamificationService.checkAndUnlockAchievement(userId, 'subscriptions_5');
        }

        return subscription;
    }

    async getAll(userId: string): Promise<Subscription[]> {
        return this.db.query(Subscription)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .orderBy('name', 'asc')
            .find();
    }

    async getActive(userId: string): Promise<Subscription[]> {
        return this.db.query(Subscription)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .filter({ status: 'active' })
            .orderBy('nextBillingDate', 'asc')
            .find();
    }

    async getById(id: string, userId: string): Promise<Subscription | undefined> {
        return this.db.query(Subscription)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .filter({ id })
            .findOneOrUndefined();
    }

    async update(id: string, userId: string, dto: UpdateSubscriptionDto): Promise<Subscription | null> {
        const subscription = await this.getById(id, userId);
        if (!subscription) return null;

        if (dto.name !== undefined) subscription.name = dto.name;
        if (dto.description !== undefined) subscription.description = dto.description;
        if (dto.amount !== undefined) subscription.amount = dto.amount;
        if (dto.currency !== undefined) subscription.currency = dto.currency;
        if (dto.billingCycle !== undefined) subscription.billingCycle = dto.billingCycle;
        if (dto.billingDay !== undefined) subscription.billingDay = dto.billingDay;
        if (dto.nextBillingDate !== undefined) subscription.nextBillingDate = dto.nextBillingDate;
        if (dto.category !== undefined) subscription.category = dto.category;
        if (dto.color !== undefined) subscription.color = dto.color;
        if (dto.icon !== undefined) subscription.icon = dto.icon;
        if (dto.website !== undefined) subscription.website = dto.website;
        if (dto.reminderEnabled !== undefined) subscription.reminderEnabled = dto.reminderEnabled;
        if (dto.reminderDaysBefore !== undefined) subscription.reminderDaysBefore = dto.reminderDaysBefore;

        if (dto.status !== undefined) {
            subscription.status = dto.status;
            if (dto.status === 'cancelled') {
                subscription.cancelledAt = new Date();
            }
        }

        // Recalculate next billing date if cycle or day changed
        if (dto.billingCycle !== undefined || dto.billingDay !== undefined) {
            subscription.nextBillingDate = this.calculateNextBillingDate(
                subscription.billingCycle,
                subscription.billingDay
            );
        }

        subscription.updatedAt = new Date();
        await this.db.persist(subscription);
        return subscription;
    }

    async delete(id: string, userId: string): Promise<boolean> {
        const subscription = await this.getById(id, userId);
        if (!subscription) return false;

        await this.db.remove(subscription);
        return true;
    }

    async cancel(id: string, userId: string): Promise<Subscription | null> {
        const result = await this.update(id, userId, { status: 'cancelled' });
        if (result) {
            // Award achievement for cancelling a subscription (being a sparfuchs)
            await this.gamificationService.checkAndUnlockAchievement(userId, 'subscription_cancelled');
        }
        return result;
    }

    async pause(id: string, userId: string): Promise<Subscription | null> {
        return this.update(id, userId, { status: 'paused' });
    }

    async resume(id: string, userId: string): Promise<Subscription | null> {
        const subscription = await this.getById(id, userId);
        if (!subscription) return null;

        subscription.status = 'active';
        subscription.nextBillingDate = this.calculateNextBillingDate(
            subscription.billingCycle,
            subscription.billingDay
        );
        subscription.updatedAt = new Date();

        await this.db.persist(subscription);
        return subscription;
    }

    async getStats(userId: string): Promise<SubscriptionStats> {
        const subscriptions = await this.getAll(userId);
        const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
        const pausedSubscriptions = subscriptions.filter(s => s.status === 'paused');

        // Calculate monthly total
        const totalMonthly = activeSubscriptions.reduce((sum, sub) => {
            return sum + this.calculateMonthlyEquivalent(sub.amount, sub.billingCycle);
        }, 0);

        const totalYearly = totalMonthly * 12;

        // Group by category
        const categoryMap = new Map<string, { amount: number; count: number }>();
        for (const sub of activeSubscriptions) {
            const cat = sub.category || 'Sonstiges';
            const existing = categoryMap.get(cat) || { amount: 0, count: 0 };
            categoryMap.set(cat, {
                amount: existing.amount + this.calculateMonthlyEquivalent(sub.amount, sub.billingCycle),
                count: existing.count + 1,
            });
        }
        const byCategory = Array.from(categoryMap.entries())
            .map(([category, data]) => ({ category, ...data }))
            .sort((a, b) => b.amount - a.amount);

        // Upcoming billings (next 14 days)
        const today = new Date();
        const twoWeeksLater = new Date();
        twoWeeksLater.setDate(twoWeeksLater.getDate() + 14);

        const upcomingBillings = activeSubscriptions
            .map(sub => {
                const billingDate = new Date(sub.nextBillingDate);
                const daysUntil = Math.ceil((billingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                return { subscription: sub, daysUntil };
            })
            .filter(item => item.daysUntil >= 0 && item.daysUntil <= 14)
            .sort((a, b) => a.daysUntil - b.daysUntil)
            .slice(0, 5);

        return {
            totalMonthly: Math.round(totalMonthly * 100) / 100,
            totalYearly: Math.round(totalYearly * 100) / 100,
            activeCount: activeSubscriptions.length,
            pausedCount: pausedSubscriptions.length,
            byCategory,
            upcomingBillings,
        };
    }

    async updateNextBillingDates(): Promise<void> {
        // This should be called by a scheduled job to advance billing dates
        const today = new Date().toISOString().split('T')[0];
        const subscriptions = await this.db.query(Subscription)
            .filter({ status: 'active', nextBillingDate: { $lte: today } })
            .find();

        for (const sub of subscriptions) {
            sub.nextBillingDate = this.calculateNextBillingDate(sub.billingCycle, sub.billingDay);
            sub.updatedAt = new Date();
            await this.db.persist(sub);
        }
    }
}
