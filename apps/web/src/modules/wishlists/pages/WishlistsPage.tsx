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
    Table,
    SegmentedControl,
    Container,
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
    IconLayoutGrid,
    IconList,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useRequest, useMutation, useViewMode } from '../../../hooks';
import { PageTitle } from '../../../components/PageTitle';
import { CardStatistic } from '../../../components/CardStatistic';
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

function formatPrice(price?: PriceInfo): string {
    if (!price) return '-';
    return `${price.amount.toFixed(2)} ${price.currency}`;
}

export default function WishlistsPage() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<string | null>('all');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<WishlistItem | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');
    const [globalViewMode, setViewMode] = useViewMode();
    // Fallback to 'grid' if global viewMode is not supported by this page
    const viewMode = ['grid', 'list'].includes(globalViewMode) ? globalViewMode : 'grid';

    const categoryOptions: { value: WishlistCategory; label: string; icon: typeof IconDevices }[] = [
        { value: 'tech', label: t('wishlists.categories.tech'), icon: IconDevices },
        { value: 'fashion', label: t('wishlists.categories.fashion'), icon: IconShirt },
        { value: 'home', label: t('wishlists.categories.home'), icon: IconHome },
        { value: 'hobby', label: t('wishlists.categories.hobby'), icon: IconPalette },
        { value: 'books', label: t('wishlists.categories.books'), icon: IconBook },
        { value: 'travel', label: t('wishlists.categories.travel'), icon: IconPlane },
        { value: 'experience', label: t('wishlists.categories.experience'), icon: IconStar },
        { value: 'other', label: t('wishlists.categories.other'), icon: IconDots },
    ];

    const priorityOptions: { value: WishlistPriority; label: string; color: string }[] = [
        { value: 'low', label: t('wishlists.priority.low'), color: 'gray' },
        { value: 'medium', label: t('wishlists.priority.medium'), color: 'blue' },
        { value: 'high', label: t('wishlists.priority.high'), color: 'orange' },
        { value: 'must_have', label: t('wishlists.priority.mustHave'), color: 'red' },
    ];

    const getCategoryIcon = (category: WishlistCategory) => {
        const config = categoryOptions.find(c => c.value === category);
        const Icon = config?.icon || IconDots;
        return <Icon size={16} />;
    };

    const getPriorityBadge = (priority: WishlistPriority) => {
        const config = priorityOptions.find(p => p.value === priority);
        return (
            <Badge size="xs" color={config?.color || 'gray'}>
                {config?.label || priority}
            </Badge>
        );
    };

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
        if (confirm(t('wishlists.deleteConfirm'))) {
            await deleteItem({ id });
            await refetch();
        }
    };

    const handlePurchase = async (id: string) => {
        await purchaseItem({ id });
        await refetch();
    };

    return (
        <Container size="xl" py="xl">
            <Stack gap="lg">
                {/* Header */}
                <Group justify="space-between">
                    <PageTitle title={t('wishlists.title')} subtitle={t('wishlists.subtitle')} />
                    <Button onClick={openCreateModal}>{t('wishlists.newItem')}</Button>
                </Group>

                {/* Stats */}
                <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="lg">
                    <CardStatistic
                        type="icon"
                        title={t('wishlists.stats.totalItems')}
                        value={stats?.totalItems || 0}
                        icon={IconHeart}
                        color="pink"
                    />
                    <CardStatistic
                        type="icon"
                        title={t('wishlists.stats.totalValue')}
                        value={formatPrice(stats?.totalValue ? { amount: stats.totalValue, currency: 'EUR' } : undefined)}
                        icon={IconCurrencyEuro}
                        color="green"
                    />
                    <CardStatistic
                        type="icon"
                        title={t('wishlists.stats.giftIdeas')}
                        value={stats?.giftIdeas || 0}
                        icon={IconGift}
                        color="violet"
                    />
                    <CardStatistic
                        type="icon"
                        title={t('wishlists.stats.purchased')}
                        value={stats?.purchased || 0}
                        icon={IconShoppingCart}
                        color="blue"
                    />
                </SimpleGrid>

                {/* Search Bar */}
                <Paper shadow="sm" withBorder p="md" radius="md">
                    <Group>
                        <TextInput
                            placeholder={t('wishlists.search')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.currentTarget.value)}
                            style={{ flex: 1 }}
                        />
                        <Select
                            placeholder={t('wishlists.form.category')}
                            data={[
                                { value: 'all', label: t('wishlists.allCategories') },
                                ...categoryOptions.map(c => ({ value: c.value, label: c.label })),
                            ]}
                            value={categoryFilter}
                            onChange={(value) => setCategoryFilter(value || 'all')}
                            style={{ width: 180 }}
                        />
                        <Select
                            placeholder={t('wishlists.form.priority')}
                            data={[
                                { value: 'all', label: t('wishlists.allPriorities') },
                                ...priorityOptions.map(p => ({ value: p.value, label: p.label })),
                            ]}
                            value={priorityFilter}
                            onChange={(value) => setPriorityFilter(value || 'all')}
                            style={{ width: 180 }}
                        />
                        <SegmentedControl
                            value={viewMode}
                            onChange={(value) => setViewMode(value as 'grid' | 'list')}
                            data={[
                                { value: 'grid', label: <IconLayoutGrid size={16} /> },
                                { value: 'list', label: <IconList size={16} /> },
                            ]}
                        />
                    </Group>
                </Paper>

                {/* Content */}
                <Tabs value={activeTab} onChange={setActiveTab}>
                <Tabs.List>
                    <Tabs.Tab value="all" leftSection={<IconHeart size={16} />}>
                        {t('wishlists.tabs.all')}
                    </Tabs.Tab>
                    <Tabs.Tab value="gifts" leftSection={<IconGift size={16} />}>
                        {t('wishlists.tabs.gifts')}
                    </Tabs.Tab>
                    <Tabs.Tab value="purchased" leftSection={<IconShoppingCart size={16} />}>
                        {t('wishlists.tabs.purchased')}
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="all" pt="md">
                    {isLoading ? (
                        <Text>{t('wishlists.loading')}</Text>
                    ) : filteredItems.length === 0 ? (
                        <Paper shadow="sm" p="xl" radius="md" withBorder>
                            <Stack align="center" gap="md">
                                <ThemeIcon size={60} radius="xl" variant="light">
                                    <IconHeart size={32} />
                                </ThemeIcon>
                                <Text size="lg" fw={500}>{t('wishlists.emptyState')}</Text>
                                <Text c="dimmed" ta="center">
                                    {t('wishlists.emptyStateDesc')}
                                </Text>
                                <Button onClick={openCreateModal} leftSection={<IconPlus size={18} />}>
                                    {t('wishlists.newItem')}
                                </Button>
                            </Stack>
                        </Paper>
                    ) : viewMode === 'grid' ? (
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
                                                        {t('wishlists.modal.edit')}
                                                    </Menu.Item>
                                                    <Menu.Item
                                                        leftSection={<IconTrash size={14} />}
                                                        color="red"
                                                        onClick={() => handleDelete(item.id)}
                                                    >
                                                        {t('wishlists.modal.delete')}
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
                                                    {t('wishlists.labels.gift')}
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
                                                {t('wishlists.labels.for')} {item.giftFor}
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
                                                        {t('wishlists.actions.toProduct')}
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
                                            {t('wishlists.actions.markPurchased')}
                                        </Button>
                                    </Stack>
                                </Card>
                            ))}
                        </SimpleGrid>
                    ) : (
                        <Paper shadow="sm" withBorder radius="md">
                            <Table striped highlightOnHover>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>{t('wishlists.table.item')}</Table.Th>
                                        <Table.Th>{t('wishlists.table.category')}</Table.Th>
                                        <Table.Th>{t('wishlists.table.priority')}</Table.Th>
                                        <Table.Th>{t('wishlists.table.price')}</Table.Th>
                                        <Table.Th>{t('wishlists.table.shop')}</Table.Th>
                                        <Table.Th>{t('wishlists.table.actions')}</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {filteredItems.map((item) => (
                                        <Table.Tr key={item.id}>
                                            <Table.Td>
                                                <Group gap="sm">
                                                    {item.imageUrl ? (
                                                        <Image src={item.imageUrl} width={40} height={40} radius="sm" fit="cover" />
                                                    ) : (
                                                        <ThemeIcon size={40} variant="light" radius="sm">
                                                            {getCategoryIcon(item.category)}
                                                        </ThemeIcon>
                                                    )}
                                                    <div>
                                                        <Text fw={500} size="sm">{item.name}</Text>
                                                        {item.isGiftIdea && (
                                                            <Badge size="xs" color="pink" leftSection={<IconGift size={10} />}>
                                                                Geschenk
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </Group>
                                            </Table.Td>
                                            <Table.Td>
                                                <Badge size="xs" variant="light" leftSection={getCategoryIcon(item.category)}>
                                                    {categoryOptions.find(c => c.value === item.category)?.label}
                                                </Badge>
                                            </Table.Td>
                                            <Table.Td>{getPriorityBadge(item.priority)}</Table.Td>
                                            <Table.Td>{item.price ? formatPrice(item.price) : '-'}</Table.Td>
                                            <Table.Td>{item.store || '-'}</Table.Td>
                                            <Table.Td>
                                                <Group gap="xs">
                                                    <ActionIcon
                                                        variant="light"
                                                        color="green"
                                                        size="sm"
                                                        onClick={() => handlePurchase(item.id)}
                                                    >
                                                        <IconCheck size={14} />
                                                    </ActionIcon>
                                                    <Menu shadow="md" position="bottom-end">
                                                        <Menu.Target>
                                                            <ActionIcon variant="subtle" size="sm">
                                                                <IconDots size={16} />
                                                            </ActionIcon>
                                                        </Menu.Target>
                                                        <Menu.Dropdown>
                                                            {item.productUrl && (
                                                                <Menu.Item
                                                                    leftSection={<IconExternalLink size={14} />}
                                                                    component="a"
                                                                    href={item.productUrl}
                                                                    target="_blank"
                                                                >
                                                                    {t('wishlists.actions.toProduct')}
                                                                </Menu.Item>
                                                            )}
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
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        </Paper>
                    )}
                </Tabs.Panel>

                <Tabs.Panel value="gifts" pt="md">
                    {isLoading ? (
                        <Text>{t('wishlists.loading')}</Text>
                    ) : filteredItems.length === 0 ? (
                        <Paper shadow="sm" p="xl" radius="md" withBorder>
                            <Stack align="center" gap="md">
                                <ThemeIcon size={60} radius="xl" variant="light" color="pink">
                                    <IconGift size={32} />
                                </ThemeIcon>
                                <Text size="lg" fw={500}>{t('wishlists.emptyGifts')}</Text>
                                <Text c="dimmed" ta="center">
                                    {t('wishlists.emptyGiftsDesc')}
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
                                                        {t('wishlists.modal.edit')}
                                                    </Menu.Item>
                                                    <Menu.Item
                                                        leftSection={<IconTrash size={14} />}
                                                        color="red"
                                                        onClick={() => handleDelete(item.id)}
                                                    >
                                                        {t('wishlists.modal.delete')}
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
                                                {t('wishlists.labels.for')} {item.giftFor}
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
                                            {t('wishlists.actions.markPurchased')}
                                        </Button>
                                    </Stack>
                                </Card>
                            ))}
                        </SimpleGrid>
                    )}
                </Tabs.Panel>

                <Tabs.Panel value="purchased" pt="md">
                    {isLoading ? (
                        <Text>{t('wishlists.loading')}</Text>
                    ) : filteredItems.length === 0 ? (
                        <Paper shadow="sm" p="xl" radius="md" withBorder>
                            <Stack align="center" gap="md">
                                <ThemeIcon size={60} radius="xl" variant="light" color="green">
                                    <IconShoppingCart size={32} />
                                </ThemeIcon>
                                <Text size="lg" fw={500}>{t('wishlists.emptyPurchased')}</Text>
                                <Text c="dimmed" ta="center">
                                    {t('wishlists.emptyPurchasedDesc')}
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
                                                        {t('wishlists.modal.edit')}
                                                    </Menu.Item>
                                                    <Menu.Item
                                                        leftSection={<IconTrash size={14} />}
                                                        color="red"
                                                        onClick={() => handleDelete(item.id)}
                                                    >
                                                        {t('wishlists.modal.delete')}
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
                                                    {t('wishlists.labels.gift')}
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
                                                {t('wishlists.labels.for')} {item.giftFor}
                                                {item.occasion && ` (${item.occasion})`}
                                            </Text>
                                        )}

                                        {item.purchasedAt && (
                                            <Badge size="xs" color="green" leftSection={<IconCheck size={12} />}>
                                                {t('wishlists.labels.purchasedOn')} {new Date(item.purchasedAt).toLocaleDateString('de-DE')}
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
                title={editingItem ? t('wishlists.form.editTitle') : t('wishlists.form.newTitle')}
                size="lg"
            >
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack gap="md">
                        <TextInput
                            label={t('wishlists.form.name')}
                            placeholder={t('wishlists.form.namePlaceholder')}
                            required
                            {...form.getInputProps('name')}
                        />

                        <Textarea
                            label={t('wishlists.form.description')}
                            placeholder={t('wishlists.form.descriptionPlaceholder')}
                            minRows={3}
                            {...form.getInputProps('description')}
                        />

                        <TextInput
                            label={t('wishlists.form.imageUrl')}
                            placeholder={t('wishlists.form.imageUrlPlaceholder')}
                            {...form.getInputProps('imageUrl')}
                        />

                        <TextInput
                            label={t('wishlists.form.productUrl')}
                            placeholder={t('wishlists.form.productUrlPlaceholder')}
                            {...form.getInputProps('productUrl')}
                        />

                        <Group grow>
                            <Select
                                label={t('wishlists.form.category')}
                                data={categoryOptions.map(c => ({ value: c.value, label: c.label }))}
                                {...form.getInputProps('category')}
                            />

                            <Select
                                label={t('wishlists.form.priority')}
                                data={priorityOptions.map(p => ({ value: p.value, label: p.label }))}
                                {...form.getInputProps('priority')}
                            />
                        </Group>

                        <Group grow>
                            <NumberInput
                                label={t('wishlists.form.price')}
                                placeholder={t('wishlists.form.pricePlaceholder')}
                                decimalScale={2}
                                fixedDecimalScale
                                min={0}
                                {...form.getInputProps('priceAmount')}
                            />

                            <Select
                                label={t('wishlists.form.currency')}
                                data={[
                                    { value: 'EUR', label: 'EUR' },
                                    { value: 'USD', label: 'USD' },
                                    { value: 'GBP', label: 'GBP' },
                                ]}
                                {...form.getInputProps('priceCurrency')}
                            />
                        </Group>

                        <TextInput
                            label={t('wishlists.form.store')}
                            placeholder={t('wishlists.form.storePlaceholder')}
                            {...form.getInputProps('store')}
                        />

                        <Switch
                            label={t('wishlists.form.isGiftIdea')}
                            {...form.getInputProps('isGiftIdea', { type: 'checkbox' })}
                        />

                        {form.values.isGiftIdea && (
                            <>
                                <TextInput
                                    label={t('wishlists.form.giftFor')}
                                    placeholder={t('wishlists.form.giftForPlaceholder')}
                                    {...form.getInputProps('giftFor')}
                                />

                                <TextInput
                                    label={t('wishlists.form.occasionLabel')}
                                    placeholder={t('wishlists.form.occasionPlaceholder')}
                                    {...form.getInputProps('occasion')}
                                />
                            </>
                        )}

                        <Textarea
                            label={t('wishlists.form.notes')}
                            placeholder={t('wishlists.form.notesPlaceholder')}
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
                                {t('common.cancel')}
                            </Button>
                            <Button type="submit">
                                {editingItem ? t('common.save') : t('common.create')}
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>
            </Stack>
        </Container>
    );
}
