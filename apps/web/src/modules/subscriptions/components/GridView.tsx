import { SimpleGrid } from '@mantine/core';
import { SubscriptionCard } from './SubscriptionCard';
import type { Subscription, SubscriptionBillingCycle, SubscriptionStatus } from '../types';

interface GridViewProps {
    subscriptions: Subscription[];
    onEdit: (subscription: Subscription) => void;
    onDelete: (id: string) => void;
    onPause: (id: string) => void;
    onResume: (id: string) => void;
    formatCurrency: (amount: number) => string;
    formatDate: (date?: string) => string;
    billingCycleLabels: Record<SubscriptionBillingCycle, string>;
    statusLabels: Record<SubscriptionStatus, string>;
    categoryLabels: Record<string, string>;
}

export function GridView({
    subscriptions,
    onEdit,
    onDelete,
    onPause,
    onResume,
    formatCurrency,
    formatDate,
    billingCycleLabels,
    statusLabels,
    categoryLabels,
}: GridViewProps) {
    return (
        <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md">
            {subscriptions.map((subscription) => (
                <SubscriptionCard
                    key={subscription.id}
                    subscription={subscription}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onPause={onPause}
                    onResume={onResume}
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                    billingCycleLabels={billingCycleLabels}
                    statusLabels={statusLabels}
                    categoryLabels={categoryLabels}
                />
            ))}
        </SimpleGrid>
    );
}
