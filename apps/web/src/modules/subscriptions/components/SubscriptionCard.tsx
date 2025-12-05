import {
    Card,
    Text,
    Stack,
    Group,
    Badge,
    Menu,
    ActionIcon,
    Flex,
} from '@mantine/core';
import {
    IconDotsVertical,
    IconEdit,
    IconTrash,
    IconPlayerPause,
    IconPlayerPlay,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { Subscription, SubscriptionBillingCycle, SubscriptionStatus } from '../types';
import { statusColors } from '../types';

interface SubscriptionCardProps {
    subscription: Subscription;
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

export function SubscriptionCard({
    subscription,
    onEdit,
    onDelete,
    onPause,
    onResume,
    formatCurrency,
    formatDate,
    billingCycleLabels,
    statusLabels,
    categoryLabels,
}: SubscriptionCardProps) {
    const { t } = useTranslation();

    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Card.Section withBorder inheritPadding py="xs">
                <Group justify="space-between">
                    <Text fw={600} size="lg">
                        {subscription.name}
                    </Text>
                    <Menu shadow="md" width={200}>
                        <Menu.Target>
                            <ActionIcon variant="subtle" color="gray">
                                <IconDotsVertical size={16} />
                            </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Item
                                leftSection={<IconEdit size={14} />}
                                onClick={() => onEdit(subscription)}
                            >
                                {t('common.edit')}
                            </Menu.Item>
                            {subscription.status === 'active' ? (
                                <Menu.Item
                                    leftSection={<IconPlayerPause size={14} />}
                                    onClick={() => onPause(subscription.id)}
                                >
                                    {t('subscriptions.pause')}
                                </Menu.Item>
                            ) : subscription.status === 'paused' ? (
                                <Menu.Item
                                    leftSection={<IconPlayerPlay size={14} />}
                                    onClick={() => onResume(subscription.id)}
                                >
                                    {t('subscriptions.resume')}
                                </Menu.Item>
                            ) : null}
                            <Menu.Divider />
                            <Menu.Item
                                color="red"
                                leftSection={<IconTrash size={14} />}
                                onClick={() => onDelete(subscription.id)}
                            >
                                {t('common.delete')}
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </Group>
            </Card.Section>

            <Stack gap="md" mt="md">
                {subscription.description && (
                    <Text size="sm" c="dimmed" lineClamp={2}>
                        {subscription.description}
                    </Text>
                )}

                <Group justify="space-between">
                    <Text size="xl" fw={700} c="blue">
                        {formatCurrency(subscription.amount)}
                    </Text>
                    <Badge color={statusColors[subscription.status]} variant="light">
                        {statusLabels[subscription.status]}
                    </Badge>
                </Group>

                <Stack gap="xs">
                    <Flex justify="space-between" align="center">
                        <Text size="sm" c="dimmed">
                            {t('subscriptions.billingCycleLabel')}:
                        </Text>
                        <Text size="sm" fw={500}>
                            {billingCycleLabels[subscription.billingCycle]}
                        </Text>
                    </Flex>

                    <Flex justify="space-between" align="center">
                        <Text size="sm" c="dimmed">
                            {t('subscriptions.billingDay')}:
                        </Text>
                        <Text size="sm" fw={500}>
                            {t('subscriptions.ofMonth', { day: subscription.billingDay })}
                        </Text>
                    </Flex>

                    {subscription.nextBillingDate && (
                        <Flex justify="space-between" align="center">
                            <Text size="sm" c="dimmed">
                                {t('subscriptions.nextBilling')}:
                            </Text>
                            <Text size="sm" fw={500}>
                                {formatDate(subscription.nextBillingDate)}
                            </Text>
                        </Flex>
                    )}

                    <Flex justify="space-between" align="center">
                        <Text size="sm" c="dimmed">
                            {t('common.category')}:
                        </Text>
                        <Badge size="sm" variant="light">
                            {categoryLabels[subscription.category] || subscription.category}
                        </Badge>
                    </Flex>

                    {subscription.website && (
                        <Flex justify="space-between" align="center">
                            <Text size="sm" c="dimmed">
                                {t('subscriptions.website')}:
                            </Text>
                            <Text
                                size="sm"
                                c="blue"
                                component="a"
                                href={subscription.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: 'none' }}
                            >
                                {t('subscriptions.link')}
                            </Text>
                        </Flex>
                    )}
                </Stack>
            </Stack>
        </Card>
    );
}
