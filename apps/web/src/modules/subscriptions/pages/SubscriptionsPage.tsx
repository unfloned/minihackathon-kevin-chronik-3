import { useState } from 'react';
import {
    Container,
    Text,
    Group,
    Stack,
    Button,
    SimpleGrid,
    Skeleton,
    Paper,
    SegmentedControl,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
    IconPlus,
    IconCoin,
    IconCalendar,
    IconReceipt,
    IconLayoutGrid,
    IconList,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useRequest, useMutation, useViewMode } from '../../../hooks';
import { notifications } from '@mantine/notifications';
import { PageTitle } from '../../../components/PageTitle';
import { CardStatistic } from '../../../components/CardStatistic';
import type { SubscriptionStats } from '@ycmm/core';
import {
    type Subscription,
    type CreateSubscriptionForm,
    type SubscriptionBillingCycle,
    type SubscriptionStatus,
    emptyForm,
    categoryKeys,
    billingCycleKeys,
} from '../types';
import {
    ListView,
    GridView,
    SubscriptionFormModal,
} from '../components';

export default function SubscriptionsPage() {
    const { t } = useTranslation();
    const [opened, { open, close }] = useDisclosure(false);
    const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
    const [formData, setFormData] = useState<CreateSubscriptionForm>(emptyForm);
    const [globalViewMode, setViewMode] = useViewMode();
    // Map global viewMode to this page's supported modes (grid/list)
    const viewMode = globalViewMode === 'list' || globalViewMode === 'table' ? 'list' : 'grid';

    // Dynamic labels from translations
    const billingCycleLabels: Record<SubscriptionBillingCycle, string> = {
        weekly: t('subscriptions.billingCycle.weekly'),
        monthly: t('subscriptions.billingCycle.monthly'),
        quarterly: t('subscriptions.billingCycle.quarterly'),
        yearly: t('subscriptions.billingCycle.yearly'),
    };

    const statusLabels: Record<SubscriptionStatus, string> = {
        active: t('subscriptions.status.active'),
        paused: t('subscriptions.status.paused'),
        cancelled: t('subscriptions.status.cancelled'),
    };

    const categoryLabels: Record<string, string> = categoryKeys.reduce((acc, key) => {
        acc[key] = t(`subscriptions.categories.${key}`);
        return acc;
    }, {} as Record<string, string>);

    const categoryOptions = categoryKeys.map((key) => ({
        value: key,
        label: t(`subscriptions.categories.${key}`),
    }));

    const billingCycleOptions = billingCycleKeys.map((key) => ({
        value: key,
        label: t(`subscriptions.billingCycle.${key}`),
    }));

    // Fetch subscriptions
    const {
        data: subscriptions,
        isLoading: subscriptionsLoading,
        refetch: refetchSubscriptions,
    } = useRequest<Subscription[]>('/subscriptions');

    // Fetch stats
    const {
        data: stats,
        isLoading: statsLoading,
        refetch: refetchStats,
    } = useRequest<SubscriptionStats>('/subscriptions/stats');

    // Create subscription
    const createMutation = useMutation<Subscription, CreateSubscriptionForm>('/subscriptions', {
        method: 'POST',
        onSuccess: () => {
            notifications.show({
                title: t('common.success'),
                message: t('subscriptions.subscriptionCreated'),
                color: 'green',
            });
            refetchSubscriptions();
            refetchStats();
            handleCloseModal();
        },
        onError: (error) => {
            notifications.show({
                title: t('common.error'),
                message: error || t('subscriptions.createError'),
                color: 'red',
            });
        },
    });

    // Update subscription
    const updateMutation = useMutation<Subscription, Partial<CreateSubscriptionForm>>(
        () => `/subscriptions/${editingSubscription?.id}`,
        {
            method: 'PATCH',
            onSuccess: () => {
                notifications.show({
                    title: t('common.success'),
                    message: t('subscriptions.subscriptionUpdated'),
                    color: 'green',
                });
                refetchSubscriptions();
                refetchStats();
                handleCloseModal();
            },
            onError: (error) => {
                notifications.show({
                    title: t('common.error'),
                    message: error || t('subscriptions.updateError'),
                    color: 'red',
                });
            },
        }
    );

    // Delete subscription
    const deleteMutation = useMutation<void, { id: string }>(
        (variables) => `/subscriptions/${variables.id}`,
        {
            method: 'DELETE',
            onSuccess: () => {
                notifications.show({
                    title: t('common.success'),
                    message: t('subscriptions.subscriptionDeleted'),
                    color: 'green',
                });
                refetchSubscriptions();
                refetchStats();
            },
            onError: (error) => {
                notifications.show({
                    title: t('common.error'),
                    message: error || t('subscriptions.deleteError'),
                    color: 'red',
                });
            },
        }
    );

    // Pause subscription
    const pauseMutation = useMutation<Subscription, { id: string }>(
        (variables) => `/subscriptions/${variables.id}/pause`,
        {
            method: 'POST',
            onSuccess: () => {
                notifications.show({
                    title: t('common.success'),
                    message: t('subscriptions.subscriptionPaused'),
                    color: 'green',
                });
                refetchSubscriptions();
                refetchStats();
            },
            onError: (error) => {
                notifications.show({
                    title: t('common.error'),
                    message: error || t('subscriptions.pauseError'),
                    color: 'red',
                });
            },
        }
    );

    // Resume subscription
    const resumeMutation = useMutation<Subscription, { id: string }>(
        (variables) => `/subscriptions/${variables.id}/resume`,
        {
            method: 'POST',
            onSuccess: () => {
                notifications.show({
                    title: t('common.success'),
                    message: t('subscriptions.subscriptionResumed'),
                    color: 'green',
                });
                refetchSubscriptions();
                refetchStats();
            },
            onError: (error) => {
                notifications.show({
                    title: t('common.error'),
                    message: error || t('subscriptions.resumeError'),
                    color: 'red',
                });
            },
        }
    );

    const handleOpenCreateModal = () => {
        setEditingSubscription(null);
        setFormData(emptyForm);
        open();
    };

    const handleOpenEditModal = (subscription: Subscription) => {
        setEditingSubscription(subscription);
        setFormData({
            name: subscription.name,
            description: subscription.description,
            amount: subscription.amount,
            billingCycle: subscription.billingCycle,
            billingDay: subscription.billingDay,
            category: subscription.category,
            website: subscription.website,
        });
        open();
    };

    const handleCloseModal = () => {
        close();
        setEditingSubscription(null);
        setFormData(emptyForm);
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.amount) {
            notifications.show({
                title: t('common.error'),
                message: t('subscriptions.requiredFields'),
                color: 'red',
            });
            return;
        }

        if (editingSubscription) {
            await updateMutation.mutate(formData);
        } else {
            await createMutation.mutate(formData);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm(t('subscriptions.deleteConfirm'))) {
            await deleteMutation.mutate({ id } as any);
        }
    };

    const handlePause = async (id: string) => {
        await pauseMutation.mutate({ id } as any);
    };

    const handleResume = async (id: string) => {
        await resumeMutation.mutate({ id } as any);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
        }).format(amount);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('de-DE');
    };

    const isLoading = subscriptionsLoading || statsLoading;

    return (
        <Container size="xl" py="xl">
            <Stack gap="xl">
                {/* Header */}
                <Group justify="space-between" align="center">
                    <PageTitle title={t('subscriptions.title')} subtitle={t('subscriptions.subtitle')} />
                    <Button
                        leftSection={<IconPlus size={16} />}
                        onClick={handleOpenCreateModal}
                        loading={createMutation.isLoading}
                    >
                        {t('subscriptions.newSubscription')}
                    </Button>
                </Group>

                {/* Stats Cards */}
                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
                    <CardStatistic
                        type="icon"
                        title={t('subscriptions.stats.monthlyTotal')}
                        value={formatCurrency(stats?.totalMonthly || 0)}
                        icon={IconCoin}
                        color="blue"
                        subtitle={t('subscriptions.stats.perMonth')}
                        isLoading={statsLoading}
                    />

                    <CardStatistic
                        type="icon"
                        title={t('subscriptions.stats.yearlyTotal')}
                        value={formatCurrency(stats?.totalYearly || 0)}
                        icon={IconCalendar}
                        color="green"
                        subtitle={t('subscriptions.stats.perYear')}
                        isLoading={statsLoading}
                    />

                    <CardStatistic
                        type="icon"
                        title={t('subscriptions.stats.activeCount')}
                        value={stats?.activeCount || 0}
                        icon={IconReceipt}
                        color="grape"
                        subtitle={t('subscriptions.stats.subscriptions')}
                        isLoading={statsLoading}
                    />
                </SimpleGrid>

                {/* Subscriptions List */}
                <Stack gap="md">
                    <Group justify="space-between" align="center">
                        <Text fw={700} size="lg">{t('subscriptions.yourSubscriptions')}</Text>
                        <SegmentedControl
                            value={viewMode}
                            onChange={(value) => setViewMode(value as 'grid' | 'list')}
                            data={[
                                { value: 'grid', label: <IconLayoutGrid size={16} /> },
                                { value: 'list', label: <IconList size={16} /> },
                            ]}
                        />
                    </Group>

                    {isLoading ? (
                        <Stack gap="md">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} height={120} radius="md" />
                            ))}
                        </Stack>
                    ) : !subscriptions || subscriptions.length === 0 ? (
                        <Paper shadow="sm" p="xl" radius="md" withBorder>
                            <Stack align="center" gap="md">
                                <IconReceipt size={48} style={{ opacity: 0.3 }} />
                                <div style={{ textAlign: 'center' }}>
                                    <Text fw={500} size="lg">
                                        {t('subscriptions.noSubscriptions')}
                                    </Text>
                                    <Text c="dimmed" size="sm" mt="xs">
                                        {t('subscriptions.createFirstHint')}
                                    </Text>
                                </div>
                                <Button
                                    leftSection={<IconPlus size={16} />}
                                    onClick={handleOpenCreateModal}
                                >
                                    {t('subscriptions.createFirst')}
                                </Button>
                            </Stack>
                        </Paper>
                    ) : viewMode === 'list' ? (
                        <ListView
                            subscriptions={subscriptions}
                            onEdit={handleOpenEditModal}
                            onDelete={handleDelete}
                            onPause={handlePause}
                            onResume={handleResume}
                            formatCurrency={formatCurrency}
                            formatDate={formatDate}
                            billingCycleLabels={billingCycleLabels}
                            statusLabels={statusLabels}
                            categoryLabels={categoryLabels}
                        />
                    ) : (
                        <GridView
                            subscriptions={subscriptions}
                            onEdit={handleOpenEditModal}
                            onDelete={handleDelete}
                            onPause={handlePause}
                            onResume={handleResume}
                            formatCurrency={formatCurrency}
                            formatDate={formatDate}
                            billingCycleLabels={billingCycleLabels}
                            statusLabels={statusLabels}
                            categoryLabels={categoryLabels}
                        />
                    )}
                </Stack>
            </Stack>

            {/* Create/Edit Modal */}
            <SubscriptionFormModal
                opened={opened}
                onClose={handleCloseModal}
                formData={formData}
                onFormDataChange={setFormData}
                onSubmit={handleSubmit}
                isEditing={!!editingSubscription}
                isLoading={createMutation.isLoading || updateMutation.isLoading}
                billingCycleOptions={billingCycleOptions}
                categoryOptions={categoryOptions}
            />
        </Container>
    );
}
