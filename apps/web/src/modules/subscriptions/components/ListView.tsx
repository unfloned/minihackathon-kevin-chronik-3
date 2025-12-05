import {
    Paper,
    Table,
    Text,
    Badge,
    Menu,
    ActionIcon,
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

interface ListViewProps {
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

export function ListView({
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
}: ListViewProps) {
    const { t } = useTranslation();

    return (
        <Paper shadow="sm" withBorder radius="md">
            <Table striped highlightOnHover>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>{t('subscriptions.table.name')}</Table.Th>
                        <Table.Th>{t('subscriptions.table.amount')}</Table.Th>
                        <Table.Th>{t('subscriptions.table.cycle')}</Table.Th>
                        <Table.Th>{t('subscriptions.table.category')}</Table.Th>
                        <Table.Th>{t('subscriptions.table.status')}</Table.Th>
                        <Table.Th>{t('subscriptions.table.nextBilling')}</Table.Th>
                        <Table.Th>{t('subscriptions.table.actions')}</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {subscriptions.map((subscription) => (
                        <Table.Tr key={subscription.id}>
                            <Table.Td>
                                <Text size="sm" fw={500}>{subscription.name}</Text>
                            </Table.Td>
                            <Table.Td>
                                <Text size="sm" fw={700} c="blue">{formatCurrency(subscription.amount)}</Text>
                            </Table.Td>
                            <Table.Td>
                                <Text size="sm">{billingCycleLabels[subscription.billingCycle]}</Text>
                            </Table.Td>
                            <Table.Td>
                                <Badge size="sm" variant="light">
                                    {categoryLabels[subscription.category] || subscription.category}
                                </Badge>
                            </Table.Td>
                            <Table.Td>
                                <Badge color={statusColors[subscription.status]} size="sm">
                                    {statusLabels[subscription.status]}
                                </Badge>
                            </Table.Td>
                            <Table.Td>
                                <Text size="sm">{formatDate(subscription.nextBillingDate)}</Text>
                            </Table.Td>
                            <Table.Td>
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
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
        </Paper>
    );
}
