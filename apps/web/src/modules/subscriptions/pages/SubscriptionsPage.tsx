import { useState } from 'react';
import {
    Container,
    Text,
    Card,
    Group,
    Stack,
    Button,
    ActionIcon,
    Badge,
    Modal,
    TextInput,
    Textarea,
    NumberInput,
    Select,
    SimpleGrid,
    Skeleton,
    Menu,
    Paper,
    Flex,
    Table,
    SegmentedControl,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
    IconPlus,
    IconDotsVertical,
    IconEdit,
    IconTrash,
    IconPlayerPause,
    IconPlayerPlay,
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
import type { SubscriptionSimple, SubscriptionStats, SubscriptionBillingCycle, SubscriptionStatus } from '@ycmm/core';

// Alias for component usage
type Subscription = SubscriptionSimple;

interface CreateSubscriptionForm {
    name: string;
    description: string;
    amount: number;
    billingCycle: SubscriptionBillingCycle;
    billingDay: number;
    category: string;
    website: string;
}

const statusColors: Record<SubscriptionStatus, string> = {
    active: 'green',
    paused: 'yellow',
    cancelled: 'gray',
};

const categoryKeys = ['entertainment', 'productivity', 'utilities', 'health', 'education', 'finance', 'shopping', 'other'] as const;
const billingCycleKeys: SubscriptionBillingCycle[] = ['weekly', 'monthly', 'quarterly', 'yearly'];

const emptyForm: CreateSubscriptionForm = {
    name: '',
    description: '',
    amount: 0,
    billingCycle: 'monthly',
    billingDay: 1,
    category: 'other',
    website: '',
};

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
                                                            onClick={() => handleOpenEditModal(subscription)}
                                                        >
                                                            {t('common.edit')}
                                                        </Menu.Item>
                                                        {subscription.status === 'active' ? (
                                                            <Menu.Item
                                                                leftSection={<IconPlayerPause size={14} />}
                                                                onClick={() => handlePause(subscription.id)}
                                                            >
                                                                {t('subscriptions.pause')}
                                                            </Menu.Item>
                                                        ) : subscription.status === 'paused' ? (
                                                            <Menu.Item
                                                                leftSection={<IconPlayerPlay size={14} />}
                                                                onClick={() => handleResume(subscription.id)}
                                                            >
                                                                {t('subscriptions.resume')}
                                                            </Menu.Item>
                                                        ) : null}
                                                        <Menu.Divider />
                                                        <Menu.Item
                                                            color="red"
                                                            leftSection={<IconTrash size={14} />}
                                                            onClick={() => handleDelete(subscription.id)}
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
                    ) : (
                        <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md">
                            {subscriptions.map((subscription) => (
                                <Card key={subscription.id} shadow="sm" padding="lg" radius="md" withBorder>
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
                                                        onClick={() => handleOpenEditModal(subscription)}
                                                    >
                                                        {t('common.edit')}
                                                    </Menu.Item>
                                                    {subscription.status === 'active' ? (
                                                        <Menu.Item
                                                            leftSection={<IconPlayerPause size={14} />}
                                                            onClick={() => handlePause(subscription.id)}
                                                        >
                                                            {t('subscriptions.pause')}
                                                        </Menu.Item>
                                                    ) : subscription.status === 'paused' ? (
                                                        <Menu.Item
                                                            leftSection={<IconPlayerPlay size={14} />}
                                                            onClick={() => handleResume(subscription.id)}
                                                        >
                                                            {t('subscriptions.resume')}
                                                        </Menu.Item>
                                                    ) : null}
                                                    <Menu.Divider />
                                                    <Menu.Item
                                                        color="red"
                                                        leftSection={<IconTrash size={14} />}
                                                        onClick={() => handleDelete(subscription.id)}
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
                            ))}
                        </SimpleGrid>
                    )}
                </Stack>
            </Stack>

            {/* Create/Edit Modal */}
            <Modal
                opened={opened}
                onClose={handleCloseModal}
                title={
                    <Text size="lg" fw={600}>
                        {editingSubscription ? t('subscriptions.editSubscription') : t('subscriptions.newSubscription')}
                    </Text>
                }
                size="lg"
            >
                <Stack gap="md">
                    <TextInput
                        label={t('common.name')}
                        placeholder={t('subscriptions.namePlaceholder')}
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />

                    <Textarea
                        label={t('subscriptions.descriptionLabel')}
                        placeholder={t('subscriptions.descriptionPlaceholder')}
                        minRows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />

                    <NumberInput
                        label={t('subscriptions.amount')}
                        placeholder="0.00"
                        required
                        min={0}
                        decimalScale={2}
                        fixedDecimalScale
                        prefix="€ "
                        value={formData.amount}
                        onChange={(value) => setFormData({ ...formData, amount: Number(value) || 0 })}
                    />

                    <Select
                        label={t('subscriptions.billingCycleLabel')}
                        placeholder={t('subscriptions.selectCycle')}
                        required
                        data={billingCycleOptions}
                        value={formData.billingCycle}
                        onChange={(value) =>
                            setFormData({ ...formData, billingCycle: value as SubscriptionBillingCycle })
                        }
                    />

                    <NumberInput
                        label={t('subscriptions.billingDay')}
                        placeholder={t('subscriptions.billingDayPlaceholder')}
                        required
                        min={1}
                        max={31}
                        value={formData.billingDay}
                        onChange={(value) => setFormData({ ...formData, billingDay: Number(value) || 1 })}
                    />

                    <Select
                        label={t('common.category')}
                        placeholder={t('subscriptions.selectCategory')}
                        required
                        data={categoryOptions}
                        value={formData.category}
                        onChange={(value) => setFormData({ ...formData, category: value || 'other' })}
                    />

                    <TextInput
                        label={t('subscriptions.website')}
                        placeholder={t('subscriptions.websitePlaceholder')}
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    />

                    <Group justify="flex-end" mt="md">
                        <Button variant="subtle" onClick={handleCloseModal}>
                            {t('common.cancel')}
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            loading={createMutation.isLoading || updateMutation.isLoading}
                        >
                            {editingSubscription ? t('common.save') : t('common.create')}
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </Container>
    );
}
