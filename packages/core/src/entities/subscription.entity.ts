import { entity, PrimaryKey, Reference, uuid, UUID } from '@deepkit/type';
import { User } from './user.entity.js';

export type SubscriptionBillingCycle = 'weekly' | 'monthly' | 'quarterly' | 'yearly';
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled';

@entity.name('subscriptions')
export class Subscription {
    id: UUID & PrimaryKey = uuid();
    user!: User & Reference;

    name: string = '';
    description?: string;

    amount: number = 0;
    currency: string = 'EUR';
    billingCycle: SubscriptionBillingCycle = 'monthly';

    billingDay: number = 1;
    nextBillingDate: string = '';

    category?: string;
    color: string = '#228be6';
    icon?: string;
    website?: string;

    status: SubscriptionStatus = 'active';

    reminderEnabled: boolean = false;
    reminderDaysBefore: number = 3;

    startDate: string = '';
    cancelledAt?: Date;
    createdAt: Date = new Date();
    updatedAt: Date = new Date();
}

export type SubscriptionFrontend = Readonly<Subscription>;
