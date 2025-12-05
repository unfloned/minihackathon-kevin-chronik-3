import { useState, useMemo } from 'react';
import {
    Text,
    Button,
    Group,
    Stack,
    TextInput,
    Select,
    Tabs,
    SegmentedControl,
    Container,
    SimpleGrid,
    Paper,
} from '@mantine/core';
import {
    IconHeart,
    IconShoppingCart,
    IconGift,
    IconCurrencyEuro,
    IconLayoutGrid,
    IconList,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { useRequest, useMutation, useViewMode } from '../../../hooks';
import { PageTitle } from '../../../components/PageTitle';
import { CardStatistic } from '../../../components/CardStatistic';
import type { CreateWishlistItemDto, WishlistStats } from '@ycmm/core';
import type { WishlistItem, WishlistFormValues, SharingInfo } from '../types';
import { categoryOptions, priorityOptions, priorityOrder, formatPrice } from '../types';
import {
    GridView,
    ListView,
    WishlistFormModal,
    SharingPanel,
    EmptyState,
} from '../components';

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

    // Sharing state
    const { data: sharingInfo, refetch: refetchSharing } = useRequest<SharingInfo>('/wishlists/default/sharing');
    const { mutate: toggleSharing, isLoading: togglingSharing } = useMutation<SharingInfo, { isPublic: boolean }>(
        '/wishlists/default/sharing',
        { method: 'POST' }
    );

    const handleToggleSharing = async () => {
        const newState = !sharingInfo?.isPublic;
        await toggleSharing({ isPublic: newState });
        await refetchSharing();
        notifications.show({
            title: newState ? t('wishlists.sharing.enabled') : t('wishlists.sharing.disabled'),
            message: newState ? t('wishlists.sharing.enabledDesc') : t('wishlists.sharing.disabledDesc'),
            color: newState ? 'green' : 'gray',
        });
    };

    const handleCopyLink = () => {
        if (sharingInfo?.shareUrl) {
            const fullUrl = `${window.location.origin}${sharingInfo.shareUrl}`;
            navigator.clipboard.writeText(fullUrl);
            notifications.show({
                title: t('wishlists.sharing.linkCopied'),
                message: t('wishlists.sharing.linkCopiedDesc'),
                color: 'green',
            });
        }
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
        filtered.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

        return filtered;
    }, [items, activeTab, searchQuery, categoryFilter, priorityFilter]);

    const openCreateModal = () => {
        setEditingItem(null);
        setModalOpen(true);
    };

    const openEditModal = (item: WishlistItem) => {
        setEditingItem(item);
        setModalOpen(true);
    };

    const handleSubmit = async (values: WishlistFormValues) => {
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
        setEditingItem(null);
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

    const handleCloseModal = () => {
        setModalOpen(false);
        setEditingItem(null);
    };

    const renderTabContent = (showPurchaseButton: boolean = true) => {
        if (isLoading) {
            return <Text>{t('wishlists.loading')}</Text>;
        }

        if (filteredItems.length === 0) {
            const variant = activeTab === 'gifts' ? 'gifts' : activeTab === 'purchased' ? 'purchased' : 'all';
            return <EmptyState variant={variant} onCreateClick={activeTab === 'all' ? openCreateModal : undefined} />;
        }

        if (viewMode === 'grid') {
            return (
                <GridView
                    items={filteredItems}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                    onPurchase={handlePurchase}
                    showPurchaseButton={showPurchaseButton}
                />
            );
        }

        return (
            <ListView
                items={filteredItems}
                onEdit={openEditModal}
                onDelete={handleDelete}
                onPurchase={handlePurchase}
            />
        );
    };

    return (
        <Container size="xl" py="xl">
            <Stack gap="lg">
                {/* Header */}
                <Group justify="space-between">
                    <PageTitle title={t('wishlists.title')} subtitle={t('wishlists.subtitle')} />
                    <Button onClick={openCreateModal}>{t('wishlists.newItem')}</Button>
                </Group>

                {/* Sharing Panel */}
                <SharingPanel
                    sharingInfo={sharingInfo || undefined}
                    onToggleSharing={handleToggleSharing}
                    onCopyLink={handleCopyLink}
                    isToggling={togglingSharing}
                />

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
                                ...categoryOptions.map(c => ({ value: c.value, label: t(c.label) })),
                            ]}
                            value={categoryFilter}
                            onChange={(value) => setCategoryFilter(value || 'all')}
                            style={{ width: 180 }}
                        />
                        <Select
                            placeholder={t('wishlists.form.priority')}
                            data={[
                                { value: 'all', label: t('wishlists.allPriorities') },
                                ...priorityOptions.map(p => ({ value: p.value, label: t(p.label) })),
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
                        {renderTabContent(true)}
                    </Tabs.Panel>

                    <Tabs.Panel value="gifts" pt="md">
                        {renderTabContent(true)}
                    </Tabs.Panel>

                    <Tabs.Panel value="purchased" pt="md">
                        {renderTabContent(false)}
                    </Tabs.Panel>
                </Tabs>

                {/* Form Modal */}
                <WishlistFormModal
                    opened={modalOpen}
                    onClose={handleCloseModal}
                    onSubmit={handleSubmit}
                    editingItem={editingItem}
                />
            </Stack>
        </Container>
    );
}
