import { useState, useMemo } from 'react';
import {
    Text,
    Button,
    Group,
    Stack,
    Card,
    Badge,
    TextInput,
    Select,
    Textarea,
    NumberInput,
    Modal,
    ActionIcon,
    SimpleGrid,
    Image,
    Tabs,
    ThemeIcon,
    Switch,
    Menu,
    Paper,
    Anchor,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
    IconPlus,
    IconHeart,
    IconShoppingCart,
    IconGift,
    IconCheck,
    IconEdit,
    IconTrash,
    IconExternalLink,
    IconCurrencyEuro,
    IconDevices,
    IconShirt,
    IconHome,
    IconPalette,
    IconBook,
    IconPlane,
    IconStar,
    IconDots,
} from '@tabler/icons-react';
import { useRequest, useMutation } from '../../../hooks';
import PageLayout, { StatsGrid } from '../../../components/PageLayout';
import type {
    WishlistPriority,
    WishlistCategory,
    PriceInfo,
    WishlistItemWithDetails,
    WishlistStats,
    CreateWishlistItemDto,
} from '@ycmm/core';

// Alias for component usage
type WishlistItem = WishlistItemWithDetails;

const categoryOptions: { value: WishlistCategory; label: string; icon: typeof IconDevices }[] = [
    { value: 'tech', label: 'Technik', icon: IconDevices },
    { value: 'fashion', label: 'Mode', icon: IconShirt },
    { value: 'home', label: 'Zuhause', icon: IconHome },
    { value: 'hobby', label: 'Hobby', icon: IconPalette },
    { value: 'books', label: 'Bücher', icon: IconBook },
    { value: 'travel', label: 'Reisen', icon: IconPlane },
    { value: 'experience', label: 'Erlebnis', icon: IconStar },
    { value: 'other', label: 'Sonstiges', icon: IconDots },
];

const priorityOptions: { value: WishlistPriority; label: string; color: string }[] = [
    { value: 'low', label: 'Niedrig', color: 'gray' },
    { value: 'medium', label: 'Mittel', color: 'blue' },
    { value: 'high', label: 'Hoch', color: 'orange' },
    { value: 'must_have', label: 'Must-Have', color: 'red' },
];

function getCategoryIcon(category: WishlistCategory) {
    const config = categoryOptions.find(c => c.value === category);
    const Icon = config?.icon || IconDots;
    return <Icon size={16} />;
}

function getPriorityBadge(priority: WishlistPriority) {
    const config = priorityOptions.find(p => p.value === priority);
    return (
        <Badge size="xs" color={config?.color || 'gray'}>
            {config?.label || priority}
        </Badge>
    );
}

function formatPrice(price?: PriceInfo): string {
    if (!price) return '-';
    return `${price.amount.toFixed(2)} ${price.currency}`;
}

export default function WishlistsPage() {
    const [activeTab, setActiveTab] = useState<string | null>('all');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<WishlistItem | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');

    const { data: items, isLoading, refetch } = useRequest<WishlistItem[]>('/wishlist-items');
    const { data: stats } = useRequest<WishlistStats>('/wishlist-items/stats');

    const { mutate: createItem } = useMutation<WishlistItem, CreateWishlistItemDto>(
        '/wishlist-items',
        { method: 'POST' }
    );

    const { mutate: updateItem } = useMutation<WishlistItem, { id: string; data: Partial<CreateWishlistItemDto> }>(
        (vars) => `/wishlist-items/${vars.id}`,
        { method: 'PATCH' }
    );

    const { mutate: deleteItem } = useMutation<{ success: boolean }, { id: string }>(
        (vars) => `/wishlist-items/${vars.id}`,
        { method: 'DELETE' }
    );

    const { mutate: purchaseItem } = useMutation<WishlistItem, { id: string }>(
        (vars) => `/wishlist-items/${vars.id}/purchase`,
        { method: 'POST' }
    );

    const form = useForm({
        initialValues: {
            name: '',
            description: '',
            imageUrl: '',
            productUrl: '',
            category: 'other' as WishlistCategory,
            priority: 'medium' as WishlistPriority,
            priceAmount: undefined as number | undefined,
            priceCurrency: 'EUR',
            targetPrice: undefined as number | undefined,
            isGiftIdea: false,
            giftFor: '',
            occasion: '',
            notes: '',
            store: '',
        },
    });

    const filteredItems = useMemo(() => {
        if (!items) return [];
        let filtered = items.filter(item => {
            // Tab filter
            if (activeTab === 'gifts' && !item.isGiftIdea) return false;
            if (activeTab === 'purchased' && !item.isPurchased) return false;
            if (activeTab === 'all' && item.isPurchased) return false;

            // Search
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.store.toLowerCase().includes(searchQuery.toLowerCase());

            // Filters
            const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
            const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;

            return matchesSearch && matchesCategory && matchesPriority;
        });

        // Sort by priority
        const priorityOrder: Record<WishlistPriority, number> = { must_have: 0, high: 1, medium: 2, low: 3 };
        filtered.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

        return filtered;
    }, [items, activeTab, searchQuery, categoryFilter, priorityFilter]);

    const openCreateModal = () => {
        setEditingItem(null);
        form.reset();
        setModalOpen(true);
    };

    const openEditModal = (item: WishlistItem) => {
        setEditingItem(item);
        form.setValues({
            name: item.name,
            description: item.description || '',
            imageUrl: item.imageUrl || '',
            productUrl: item.productUrl || '',
            category: item.category,
            priority: item.priority,
            priceAmount: item.price?.amount,
            priceCurrency: item.price?.currency || 'EUR',
            targetPrice: item.targetPrice,
            isGiftIdea: item.isGiftIdea,
            giftFor: item.giftFor || '',
            occasion: item.occasion || '',
            notes: item.notes || '',
            store: item.store || '',
        });
        setModalOpen(true);
    };

    const handleSubmit = async (values: typeof form.values) => {
        const dto: CreateWishlistItemDto = {
            name: values.name,
            description: values.description || undefined,
            imageUrl: values.imageUrl || undefined,
            productUrl: values.productUrl || undefined,
            category: values.category,
            priority: values.priority,
            price: values.priceAmount ? {
                amount: values.priceAmount,
                currency: values.priceCurrency,
            } : undefined,
            targetPrice: values.targetPrice || undefined,
            isGiftIdea: values.isGiftIdea,
            giftFor: values.giftFor || undefined,
            occasion: values.occasion || undefined,
            notes: values.notes || undefined,
            store: values.store || undefined,
        };

        if (editingItem) {
            await updateItem({ id: editingItem.id, data: dto });
        } else {
            await createItem(dto);
        }

        await refetch();
        setModalOpen(false);
        form.reset();
    };

    const handleDelete = async (id: string) => {
        if (confirm('Möchten Sie diesen Artikel wirklich löschen?')) {
            await deleteItem({ id });
            await refetch();
        }
    };

    const handlePurchase = async (id: string) => {
        await purchaseItem({ id });
        await refetch();
    };

    const statsData = [
        {
            value: stats?.totalItems || 0,
            label: 'Gesamt Artikel',
        },
        {
            value: formatPrice(stats?.totalValue ? { amount: stats.totalValue, currency: 'EUR' } : undefined),
            label: 'Gesamtwert',
        },
        {
            value: stats?.giftIdeas || 0,
            label: 'Geschenkideen',
        },
        {
            value: stats?.purchased || 0,
            label: 'Gekauft',
        },
    ];

    return (
        <PageLayout
            header={{
                title: 'Wunschliste',
                subtitle: 'Verwalte deine Wünsche und Geschenkideen',
                actionLabel: 'Neuer Artikel',
                onAction: openCreateModal,
            }}
            stats={<StatsGrid stats={statsData} />}
            searchBar={{
                value: searchQuery,
                onChange: setSearchQuery,
                placeholder: 'Artikel suchen...',
                rightSection: (
                    <Group gap="xs">
                        <Select
                            placeholder="Kategorie"
                            data={[
                                { value: 'all', label: 'Alle Kategorien' },
                                ...categoryOptions.map(c => ({ value: c.value, label: c.label })),
                            ]}
                            value={categoryFilter}
                            onChange={(value) => setCategoryFilter(value || 'all')}
                            style={{ width: 180 }}
                        />
                        <Select
                            placeholder="Priorität"
                            data={[
                                { value: 'all', label: 'Alle Prioritäten' },
                                ...priorityOptions.map(p => ({ value: p.value, label: p.label })),
                            ]}
                            value={priorityFilter}
                            onChange={(value) => setPriorityFilter(value || 'all')}
                            style={{ width: 180 }}
                        />
                    </Group>
                ),
            }}
        >
            <Tabs value={activeTab} onChange={setActiveTab}>
                <Tabs.List>
                    <Tabs.Tab value="all" leftSection={<IconHeart size={16} />}>
                        Alle Artikel
                    </Tabs.Tab>
                    <Tabs.Tab value="gifts" leftSection={<IconGift size={16} />}>
                        Geschenkideen
                    </Tabs.Tab>
                    <Tabs.Tab value="purchased" leftSection={<IconShoppingCart size={16} />}>
                        Gekauft
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="all" pt="md">
                    {isLoading ? (
                        <Text>Laden...</Text>
                    ) : filteredItems.length === 0 ? (
                        <Paper p="xl" withBorder>
                            <Stack align="center" gap="md">
                                <ThemeIcon size={60} radius="xl" variant="light">
                                    <IconHeart size={32} />
                                </ThemeIcon>
                                <Text size="lg" fw={500}>Keine Artikel gefunden</Text>
                                <Text c="dimmed" ta="center">
                                    Füge deinen ersten Artikel zur Wunschliste hinzu
                                </Text>
                                <Button onClick={openCreateModal} leftSection={<IconPlus size={18} />}>
                                    Neuer Artikel
                                </Button>
                            </Stack>
                        </Paper>
                    ) : (
                        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                            {filteredItems.map((item) => (
                                <Card key={item.id} shadow="sm" padding="lg" radius="md" withBorder>
                                    <Card.Section>
                                        {item.imageUrl ? (
                                            <Image
                                                src={item.imageUrl}
                                                height={180}
                                                alt={item.name}
                                                fit="cover"
                                            />
                                        ) : (
                                            <Group
                                                h={180}
                                                align="center"
                                                justify="center"
                                                style={{ background: 'var(--mantine-color-gray-1)' }}
                                            >
                                                <ThemeIcon size={60} variant="light" radius="xl">
                                                    {getCategoryIcon(item.category)}
                                                </ThemeIcon>
                                            </Group>
                                        )}
                                    </Card.Section>

                                    <Stack gap="xs" mt="md">
                                        <Group justify="space-between" align="flex-start">
                                            <div style={{ flex: 1 }}>
                                                <Text fw={500} lineClamp={1}>{item.name}</Text>
                                                {item.store && (
                                                    <Text size="xs" c="dimmed">{item.store}</Text>
                                                )}
                                            </div>
                                            <Menu shadow="md" width={200}>
                                                <Menu.Target>
                                                    <ActionIcon variant="subtle" color="gray">
                                                        <IconDots size={16} />
                                                    </ActionIcon>
                                                </Menu.Target>
                                                <Menu.Dropdown>
                                                    <Menu.Item
                                                        leftSection={<IconEdit size={14} />}
                                                        onClick={() => openEditModal(item)}
                                                    >
                                                        Bearbeiten
                                                    </Menu.Item>
                                                    <Menu.Item
                                                        leftSection={<IconTrash size={14} />}
                                                        color="red"
                                                        onClick={() => handleDelete(item.id)}
                                                    >
                                                        Löschen
                                                    </Menu.Item>
                                                </Menu.Dropdown>
                                            </Menu>
                                        </Group>

                                        {item.description && (
                                            <Text size="sm" c="dimmed" lineClamp={2}>
                                                {item.description}
                                            </Text>
                                        )}

                                        <Group gap="xs">
                                            {getPriorityBadge(item.priority)}
                                            <Badge size="xs" variant="light" leftSection={getCategoryIcon(item.category)}>
                                                {categoryOptions.find(c => c.value === item.category)?.label}
                                            </Badge>
                                            {item.isGiftIdea && (
                                                <Badge size="xs" color="pink" leftSection={<IconGift size={12} />}>
                                                    Geschenk
                                                </Badge>
                                            )}
                                        </Group>

                                        {item.price && (
                                            <Group gap="xs">
                                                <IconCurrencyEuro size={16} />
                                                <Text fw={600}>{formatPrice(item.price)}</Text>
                                            </Group>
                                        )}

                                        {item.giftFor && (
                                            <Text size="xs" c="dimmed">
                                                Für: {item.giftFor}
                                                {item.occasion && ` (${item.occasion})`}
                                            </Text>
                                        )}

                                        <Group gap="xs" mt="xs">
                                            {item.productUrl && (
                                                <Anchor
                                                    href={item.productUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    size="sm"
                                                >
                                                    <Group gap={4}>
                                                        <IconExternalLink size={14} />
                                                        Zum Produkt
                                                    </Group>
                                                </Anchor>
                                            )}
                                        </Group>

                                        <Button
                                            fullWidth
                                            variant="light"
                                            color="green"
                                            leftSection={<IconCheck size={16} />}
                                            onClick={() => handlePurchase(item.id)}
                                            mt="xs"
                                        >
                                            Als gekauft markieren
                                        </Button>
                                    </Stack>
                                </Card>
                            ))}
                        </SimpleGrid>
                    )}
                </Tabs.Panel>

                <Tabs.Panel value="gifts" pt="md">
                    {isLoading ? (
                        <Text>Laden...</Text>
                    ) : filteredItems.length === 0 ? (
                        <Paper p="xl" withBorder>
                            <Stack align="center" gap="md">
                                <ThemeIcon size={60} radius="xl" variant="light" color="pink">
                                    <IconGift size={32} />
                                </ThemeIcon>
                                <Text size="lg" fw={500}>Keine Geschenkideen gefunden</Text>
                                <Text c="dimmed" ta="center">
                                    Füge deine erste Geschenkidee hinzu
                                </Text>
                            </Stack>
                        </Paper>
                    ) : (
                        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                            {filteredItems.map((item) => (
                                <Card key={item.id} shadow="sm" padding="lg" radius="md" withBorder>
                                    <Card.Section>
                                        {item.imageUrl ? (
                                            <Image
                                                src={item.imageUrl}
                                                height={180}
                                                alt={item.name}
                                                fit="cover"
                                            />
                                        ) : (
                                            <Group
                                                h={180}
                                                align="center"
                                                justify="center"
                                                style={{ background: 'var(--mantine-color-gray-1)' }}
                                            >
                                                <ThemeIcon size={60} variant="light" radius="xl">
                                                    {getCategoryIcon(item.category)}
                                                </ThemeIcon>
                                            </Group>
                                        )}
                                    </Card.Section>

                                    <Stack gap="xs" mt="md">
                                        <Group justify="space-between" align="flex-start">
                                            <div style={{ flex: 1 }}>
                                                <Text fw={500} lineClamp={1}>{item.name}</Text>
                                                {item.store && (
                                                    <Text size="xs" c="dimmed">{item.store}</Text>
                                                )}
                                            </div>
                                            <Menu shadow="md" width={200}>
                                                <Menu.Target>
                                                    <ActionIcon variant="subtle" color="gray">
                                                        <IconDots size={16} />
                                                    </ActionIcon>
                                                </Menu.Target>
                                                <Menu.Dropdown>
                                                    <Menu.Item
                                                        leftSection={<IconEdit size={14} />}
                                                        onClick={() => openEditModal(item)}
                                                    >
                                                        Bearbeiten
                                                    </Menu.Item>
                                                    <Menu.Item
                                                        leftSection={<IconTrash size={14} />}
                                                        color="red"
                                                        onClick={() => handleDelete(item.id)}
                                                    >
                                                        Löschen
                                                    </Menu.Item>
                                                </Menu.Dropdown>
                                            </Menu>
                                        </Group>

                                        {item.description && (
                                            <Text size="sm" c="dimmed" lineClamp={2}>
                                                {item.description}
                                            </Text>
                                        )}

                                        <Group gap="xs">
                                            {getPriorityBadge(item.priority)}
                                            <Badge size="xs" variant="light" leftSection={getCategoryIcon(item.category)}>
                                                {categoryOptions.find(c => c.value === item.category)?.label}
                                            </Badge>
                                        </Group>

                                        {item.price && (
                                            <Group gap="xs">
                                                <IconCurrencyEuro size={16} />
                                                <Text fw={600}>{formatPrice(item.price)}</Text>
                                            </Group>
                                        )}

                                        {item.giftFor && (
                                            <Text size="xs" c="dimmed">
                                                Für: {item.giftFor}
                                                {item.occasion && ` (${item.occasion})`}
                                            </Text>
                                        )}

                                        {item.productUrl && (
                                            <Anchor
                                                href={item.productUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                size="sm"
                                            >
                                                <Group gap={4}>
                                                    <IconExternalLink size={14} />
                                                    Zum Produkt
                                                </Group>
                                            </Anchor>
                                        )}

                                        <Button
                                            fullWidth
                                            variant="light"
                                            color="green"
                                            leftSection={<IconCheck size={16} />}
                                            onClick={() => handlePurchase(item.id)}
                                            mt="xs"
                                        >
                                            Als gekauft markieren
                                        </Button>
                                    </Stack>
                                </Card>
                            ))}
                        </SimpleGrid>
                    )}
                </Tabs.Panel>

                <Tabs.Panel value="purchased" pt="md">
                    {isLoading ? (
                        <Text>Laden...</Text>
                    ) : filteredItems.length === 0 ? (
                        <Paper p="xl" withBorder>
                            <Stack align="center" gap="md">
                                <ThemeIcon size={60} radius="xl" variant="light" color="green">
                                    <IconShoppingCart size={32} />
                                </ThemeIcon>
                                <Text size="lg" fw={500}>Keine gekauften Artikel</Text>
                                <Text c="dimmed" ta="center">
                                    Artikel die du kaufst erscheinen hier
                                </Text>
                            </Stack>
                        </Paper>
                    ) : (
                        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                            {filteredItems.map((item) => (
                                <Card key={item.id} shadow="sm" padding="lg" radius="md" withBorder>
                                    <Card.Section>
                                        {item.imageUrl ? (
                                            <Image
                                                src={item.imageUrl}
                                                height={180}
                                                alt={item.name}
                                                fit="cover"
                                            />
                                        ) : (
                                            <Group
                                                h={180}
                                                align="center"
                                                justify="center"
                                                style={{ background: 'var(--mantine-color-gray-1)' }}
                                            >
                                                <ThemeIcon size={60} variant="light" radius="xl">
                                                    {getCategoryIcon(item.category)}
                                                </ThemeIcon>
                                            </Group>
                                        )}
                                    </Card.Section>

                                    <Stack gap="xs" mt="md">
                                        <Group justify="space-between" align="flex-start">
                                            <div style={{ flex: 1 }}>
                                                <Text fw={500} lineClamp={1}>{item.name}</Text>
                                                {item.store && (
                                                    <Text size="xs" c="dimmed">{item.store}</Text>
                                                )}
                                            </div>
                                            <Menu shadow="md" width={200}>
                                                <Menu.Target>
                                                    <ActionIcon variant="subtle" color="gray">
                                                        <IconDots size={16} />
                                                    </ActionIcon>
                                                </Menu.Target>
                                                <Menu.Dropdown>
                                                    <Menu.Item
                                                        leftSection={<IconEdit size={14} />}
                                                        onClick={() => openEditModal(item)}
                                                    >
                                                        Bearbeiten
                                                    </Menu.Item>
                                                    <Menu.Item
                                                        leftSection={<IconTrash size={14} />}
                                                        color="red"
                                                        onClick={() => handleDelete(item.id)}
                                                    >
                                                        Löschen
                                                    </Menu.Item>
                                                </Menu.Dropdown>
                                            </Menu>
                                        </Group>

                                        {item.description && (
                                            <Text size="sm" c="dimmed" lineClamp={2}>
                                                {item.description}
                                            </Text>
                                        )}

                                        <Group gap="xs">
                                            {getPriorityBadge(item.priority)}
                                            <Badge size="xs" variant="light" leftSection={getCategoryIcon(item.category)}>
                                                {categoryOptions.find(c => c.value === item.category)?.label}
                                            </Badge>
                                            {item.isGiftIdea && (
                                                <Badge size="xs" color="pink" leftSection={<IconGift size={12} />}>
                                                    Geschenk
                                                </Badge>
                                            )}
                                        </Group>

                                        {item.price && (
                                            <Group gap="xs">
                                                <IconCurrencyEuro size={16} />
                                                <Text fw={600}>{formatPrice(item.price)}</Text>
                                            </Group>
                                        )}

                                        {item.giftFor && (
                                            <Text size="xs" c="dimmed">
                                                Für: {item.giftFor}
                                                {item.occasion && ` (${item.occasion})`}
                                            </Text>
                                        )}

                                        {item.purchasedAt && (
                                            <Badge size="xs" color="green" leftSection={<IconCheck size={12} />}>
                                                Gekauft am {new Date(item.purchasedAt).toLocaleDateString('de-DE')}
                                            </Badge>
                                        )}

                                        {item.productUrl && (
                                            <Anchor
                                                href={item.productUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                size="sm"
                                            >
                                                <Group gap={4}>
                                                    <IconExternalLink size={14} />
                                                    Zum Produkt
                                                </Group>
                                            </Anchor>
                                        )}
                                    </Stack>
                                </Card>
                            ))}
                        </SimpleGrid>
                    )}
                </Tabs.Panel>
            </Tabs>

            <Modal
                opened={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditingItem(null);
                    form.reset();
                }}
                title={editingItem ? 'Artikel bearbeiten' : 'Neuer Artikel'}
                size="lg"
            >
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack gap="md">
                        <TextInput
                            label="Name"
                            placeholder="z.B. Smartwatch"
                            required
                            {...form.getInputProps('name')}
                        />

                        <Textarea
                            label="Beschreibung"
                            placeholder="Beschreibe den Artikel..."
                            minRows={3}
                            {...form.getInputProps('description')}
                        />

                        <TextInput
                            label="Bild-URL"
                            placeholder="https://..."
                            {...form.getInputProps('imageUrl')}
                        />

                        <TextInput
                            label="Produkt-URL"
                            placeholder="https://..."
                            {...form.getInputProps('productUrl')}
                        />

                        <Group grow>
                            <Select
                                label="Kategorie"
                                data={categoryOptions.map(c => ({ value: c.value, label: c.label }))}
                                {...form.getInputProps('category')}
                            />

                            <Select
                                label="Priorität"
                                data={priorityOptions.map(p => ({ value: p.value, label: p.label }))}
                                {...form.getInputProps('priority')}
                            />
                        </Group>

                        <Group grow>
                            <NumberInput
                                label="Preis"
                                placeholder="0.00"
                                decimalScale={2}
                                fixedDecimalScale
                                min={0}
                                {...form.getInputProps('priceAmount')}
                            />

                            <Select
                                label="Währung"
                                data={[
                                    { value: 'EUR', label: 'EUR' },
                                    { value: 'USD', label: 'USD' },
                                    { value: 'GBP', label: 'GBP' },
                                ]}
                                {...form.getInputProps('priceCurrency')}
                            />
                        </Group>

                        <TextInput
                            label="Geschäft"
                            placeholder="z.B. Amazon, MediaMarkt"
                            {...form.getInputProps('store')}
                        />

                        <Switch
                            label="Als Geschenkidee markieren"
                            {...form.getInputProps('isGiftIdea', { type: 'checkbox' })}
                        />

                        {form.values.isGiftIdea && (
                            <>
                                <TextInput
                                    label="Für wen?"
                                    placeholder="z.B. Mama, Papa, Freund"
                                    {...form.getInputProps('giftFor')}
                                />

                                <TextInput
                                    label="Anlass"
                                    placeholder="z.B. Geburtstag, Weihnachten"
                                    {...form.getInputProps('occasion')}
                                />
                            </>
                        )}

                        <Textarea
                            label="Notizen"
                            placeholder="Zusätzliche Notizen..."
                            minRows={2}
                            {...form.getInputProps('notes')}
                        />

                        <Group justify="flex-end" mt="md">
                            <Button
                                variant="subtle"
                                onClick={() => {
                                    setModalOpen(false);
                                    setEditingItem(null);
                                    form.reset();
                                }}
                            >
                                Abbrechen
                            </Button>
                            <Button type="submit">
                                {editingItem ? 'Speichern' : 'Erstellen'}
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>
        </PageLayout>
    );
}
