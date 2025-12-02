import { entity, PrimaryKey, Index } from '@deepkit/type';

export type SubscriptionBillingCycle = 'weekly' | 'monthly' | 'quarterly' | 'yearly';
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled';

@entity.name('subscriptions')
export class Subscription {
    id: string & PrimaryKey = '';
    userId: string & Index = '';

    name: string = '';
    description?: string;

    amount: number = 0;
    currency: string = 'EUR';
    billingCycle: SubscriptionBillingCycle = 'monthly';

    // Billing date (day of month for monthly, or full date for yearly)
    billingDay: number = 1;
    nextBillingDate: string = ''; // YYYY-MM-DD format

    category?: string; // e.g., 'entertainment', 'productivity', 'utilities'
    color: string = '#228be6';
    icon?: string;
    website?: string;

    status: SubscriptionStatus = 'active';

    // Reminder settings
    reminderEnabled: boolean = false;
    reminderDaysBefore: number = 3;

    startDate: string = ''; // When the subscription started
    cancelledAt?: Date;
    createdAt: Date = new Date();
    updatedAt: Date = new Date();
}
