import type { SubscriptionSimple, SubscriptionBillingCycle, SubscriptionStatus } from '@ycmm/core';

// Alias for component usage
export type Subscription = SubscriptionSimple;

export type { SubscriptionBillingCycle, SubscriptionStatus };

export interface CreateSubscriptionForm {
    name: string;
    description: string;
    amount: number;
    billingCycle: SubscriptionBillingCycle;
    billingDay: number;
    category: string;
    website: string;
}

export const statusColors: Record<SubscriptionStatus, string> = {
    active: 'green',
    paused: 'yellow',
    cancelled: 'gray',
};

export const categoryKeys = ['entertainment', 'productivity', 'utilities', 'health', 'education', 'finance', 'shopping', 'other'] as const;
export const billingCycleKeys: SubscriptionBillingCycle[] = ['weekly', 'monthly', 'quarterly', 'yearly'];

export const emptyForm: CreateSubscriptionForm = {
    name: '',
    description: '',
    amount: 0,
    billingCycle: 'monthly',
    billingDay: 1,
    category: 'other',
    website: '',
};
