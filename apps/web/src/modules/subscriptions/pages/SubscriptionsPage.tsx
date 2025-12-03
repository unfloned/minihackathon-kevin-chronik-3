import { useState } from 'react';
import {
    Container,
    Title,
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
} from '@tabler/icons-react';
import { useRequest, useMutation } from '../../../hooks';
import { notifications } from '@mantine/notifications';
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

const billingCycleLabels: Record<SubscriptionBillingCycle, string> = {
    weekly: 'Wöchentlich',
    monthly: 'Monatlich',
    quarterly: 'Vierteljährlich',
    yearly: 'Jährlich',
};

const statusColors: Record<SubscriptionStatus, string> = {
    active: 'green',
    paused: 'yellow',
    cancelled: 'gray',
};

const statusLabels: Record<SubscriptionStatus, string> = {
    active: 'Aktiv',
    paused: 'Pausiert',
    cancelled: 'Gekündigt',
};

const categoryOptions = [
    { value: 'entertainment', label: 'Unterhaltung' },
    { value: 'productivity', label: 'Produktivität' },
    { value: 'utilities', label: 'Versorgung' },
    { value: 'health', label: 'Gesundheit' },
    { value: 'education', label: 'Bildung' },
    { value: 'finance', label: 'Finanzen' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'other', label: 'Sonstiges' },
];

const categoryLabels: Record<string, string> = {
    entertainment: 'Unterhaltung',
    productivity: 'Produktivität',
    utilities: 'Versorgung',
    health: 'Gesundheit',
    education: 'Bildung',
    finance: 'Finanzen',
    shopping: 'Shopping',
    other: 'Sonstiges',
};

const billingCycleOptions = [
    { value: 'weekly', label: 'Wöchentlich' },
    { value: 'monthly', label: 'Monatlich' },
    { value: 'quarterly', label: 'Vierteljährlich' },
    { value: 'yearly', label: 'Jährlich' },
];

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
    const [opened, { open, close }] = useDisclosure(false);
    const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
    const [formData, setFormData] = useState<CreateSubscriptionForm>(emptyForm);

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
                title: 'Erfolg',
                message: 'Abonnement erfolgreich erstellt',
                color: 'green',
            });
            refetchSubscriptions();
            refetchStats();
            handleCloseModal();
        },
        onError: (error) => {
            notifications.show({
                title: 'Fehler',
                message: error || 'Fehler beim Erstellen des Abonnements',
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
                    title: 'Erfolg',
                    message: 'Abonnement erfolgreich aktualisiert',
                    color: 'green',
                });
                refetchSubscriptions();
                refetchStats();
                handleCloseModal();
            },
            onError: (error) => {
                notifications.show({
                    title: 'Fehler',
                    message: error || 'Fehler beim Aktualisieren des Abonnements',
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
                    title: 'Erfolg',
                    message: 'Abonnement erfolgreich gelöscht',
                    color: 'green',
                });
                refetchSubscriptions();
                refetchStats();
            },
            onError: (error) => {
                notifications.show({
                    title: 'Fehler',
                    message: error || 'Fehler beim Löschen des Abonnements',
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
                    title: 'Erfolg',
                    message: 'Abonnement pausiert',
                    color: 'green',
                });
                refetchSubscriptions();
                refetchStats();
            },
            onError: (error) => {
                notifications.show({
                    title: 'Fehler',
                    message: error || 'Fehler beim Pausieren des Abonnements',
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
                    title: 'Erfolg',
                    message: 'Abonnement fortgesetzt',
                    color: 'green',
                });
                refetchSubscriptions();
                refetchStats();
            },
            onError: (error) => {
                notifications.show({
                    title: 'Fehler',
                    message: error || 'Fehler beim Fortsetzen des Abonnements',
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
                title: 'Fehler',
                message: 'Bitte füllen Sie alle Pflichtfelder aus',
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
        if (window.confirm('Möchten Sie dieses Abonnement wirklich löschen?')) {
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
                    <div>
                        <Title order={1}>Abonnements</Title>
                        <Text c="dimmed" size="sm" mt="xs">
                            Verwalten Sie Ihre wiederkehrenden Abonnements
                        </Text>
                    </div>
                    <Button
                        leftSection={<IconPlus size={16} />}
                        onClick={handleOpenCreateModal}
                        loading={createMutation.isLoading}
                    >
                        Neues Abo
                    </Button>
                </Group>

                {/* Stats Cards */}
                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
                    <Paper shadow="xs" p="md" radius="md" withBorder>
                        <Group justify="space-between">
                            <div>
                                <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                                    Monatliche Kosten
                                </Text>
                                {statsLoading ? (
                                    <Skeleton height={32} mt="xs" />
                                ) : (
                                    <Text fw={700} size="xl" mt="xs">
                                        {formatCurrency(stats?.monthlyCost || 0)}
                                    </Text>
                                )}
                            </div>
                            <ActionIcon size="lg" variant="light" color="blue" radius="md">
                                <IconCoin size={20} />
                            </ActionIcon>
                        </Group>
                    </Paper>

                    <Paper shadow="xs" p="md" radius="md" withBorder>
                        <Group justify="space-between">
                            <div>
                                <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                                    Jährliche Kosten
                                </Text>
                                {statsLoading ? (
                                    <Skeleton height={32} mt="xs" />
                                ) : (
                                    <Text fw={700} size="xl" mt="xs">
                                        {formatCurrency(stats?.yearlyCost || 0)}
                                    </Text>
                                )}
                            </div>
                            <ActionIcon size="lg" variant="light" color="green" radius="md">
                                <IconCalendar size={20} />
                            </ActionIcon>
                        </Group>
                    </Paper>

                    <Paper shadow="xs" p="md" radius="md" withBorder>
                        <Group justify="space-between">
                            <div>
                                <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                                    Aktive Abos
                                </Text>
                                {statsLoading ? (
                                    <Skeleton height={32} mt="xs" />
                                ) : (
                                    <Text fw={700} size="xl" mt="xs">
                                        {stats?.count || 0}
                                    </Text>
                                )}
                            </div>
                            <ActionIcon size="lg" variant="light" color="grape" radius="md">
                                <IconReceipt size={20} />
                            </ActionIcon>
                        </Group>
                    </Paper>
                </SimpleGrid>

                {/* Subscriptions List */}
                <Stack gap="md">
                    <Title order={2} size="h3">
                        Ihre Abonnements
                    </Title>

                    {isLoading ? (
                        <Stack gap="md">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} height={120} radius="md" />
                            ))}
                        </Stack>
                    ) : !subscriptions || subscriptions.length === 0 ? (
                        <Paper shadow="xs" p="xl" radius="md" withBorder>
                            <Stack align="center" gap="md">
                                <IconReceipt size={48} style={{ opacity: 0.3 }} />
                                <div style={{ textAlign: 'center' }}>
                                    <Text fw={500} size="lg">
                                        Keine Abonnements vorhanden
                                    </Text>
                                    <Text c="dimmed" size="sm" mt="xs">
                                        Erstellen Sie Ihr erstes Abonnement, um loszulegen
                                    </Text>
                                </div>
                                <Button
                                    leftSection={<IconPlus size={16} />}
                                    onClick={handleOpenCreateModal}
                                >
                                    Neues Abo erstellen
                                </Button>
                            </Stack>
                        </Paper>
                    ) : (
                        <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md">
                            {subscriptions.map((subscription) => (
                                <Card key={subscription.id} shadow="xs" padding="lg" radius="md" withBorder>
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
                                                        Bearbeiten
                                                    </Menu.Item>
                                                    {subscription.status === 'active' ? (
                                                        <Menu.Item
                                                            leftSection={<IconPlayerPause size={14} />}
                                                            onClick={() => handlePause(subscription.id)}
                                                        >
                                                            Pausieren
                                                        </Menu.Item>
                                                    ) : subscription.status === 'paused' ? (
                                                        <Menu.Item
                                                            leftSection={<IconPlayerPlay size={14} />}
                                                            onClick={() => handleResume(subscription.id)}
                                                        >
                                                            Fortsetzen
                                                        </Menu.Item>
                                                    ) : null}
                                                    <Menu.Divider />
                                                    <Menu.Item
                                                        color="red"
                                                        leftSection={<IconTrash size={14} />}
                                                        onClick={() => handleDelete(subscription.id)}
                                                    >
                                                        Löschen
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
                                                    Abrechnungszyklus:
                                                </Text>
                                                <Text size="sm" fw={500}>
                                                    {billingCycleLabels[subscription.billingCycle]}
                                                </Text>
                                            </Flex>

                                            <Flex justify="space-between" align="center">
                                                <Text size="sm" c="dimmed">
                                                    Abrechnungstag:
                                                </Text>
                                                <Text size="sm" fw={500}>
                                                    {subscription.billingDay}. des Monats
                                                </Text>
                                            </Flex>

                                            {subscription.nextBillingDate && (
                                                <Flex justify="space-between" align="center">
                                                    <Text size="sm" c="dimmed">
                                                        Nächste Abrechnung:
                                                    </Text>
                                                    <Text size="sm" fw={500}>
                                                        {formatDate(subscription.nextBillingDate)}
                                                    </Text>
                                                </Flex>
                                            )}

                                            <Flex justify="space-between" align="center">
                                                <Text size="sm" c="dimmed">
                                                    Kategorie:
                                                </Text>
                                                <Badge size="sm" variant="light">
                                                    {categoryLabels[subscription.category] || subscription.category}
                                                </Badge>
                                            </Flex>

                                            {subscription.website && (
                                                <Flex justify="space-between" align="center">
                                                    <Text size="sm" c="dimmed">
                                                        Website:
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
                                                        Link
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
                        {editingSubscription ? 'Abonnement bearbeiten' : 'Neues Abonnement'}
                    </Text>
                }
                size="lg"
            >
                <Stack gap="md">
                    <TextInput
                        label="Name"
                        placeholder="z.B. Netflix, Spotify, etc."
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />

                    <Textarea
                        label="Beschreibung"
                        placeholder="Optionale Beschreibung des Abonnements"
                        minRows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />

                    <NumberInput
                        label="Betrag"
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
                        label="Abrechnungszyklus"
                        placeholder="Wählen Sie einen Zyklus"
                        required
                        data={billingCycleOptions}
                        value={formData.billingCycle}
                        onChange={(value) =>
                            setFormData({ ...formData, billingCycle: value as SubscriptionBillingCycle })
                        }
                    />

                    <NumberInput
                        label="Abrechnungstag"
                        placeholder="Tag des Monats"
                        required
                        min={1}
                        max={31}
                        value={formData.billingDay}
                        onChange={(value) => setFormData({ ...formData, billingDay: Number(value) || 1 })}
                    />

                    <Select
                        label="Kategorie"
                        placeholder="Wählen Sie eine Kategorie"
                        required
                        data={categoryOptions}
                        value={formData.category}
                        onChange={(value) => setFormData({ ...formData, category: value || 'other' })}
                    />

                    <TextInput
                        label="Website"
                        placeholder="https://example.com"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    />

                    <Group justify="flex-end" mt="md">
                        <Button variant="subtle" onClick={handleCloseModal}>
                            Abbrechen
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            loading={createMutation.isLoading || updateMutation.isLoading}
                        >
                            {editingSubscription ? 'Aktualisieren' : 'Erstellen'}
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </Container>
    );
}
