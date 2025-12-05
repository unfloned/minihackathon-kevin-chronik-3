import { useState } from 'react';
import {
    Text,
    SimpleGrid,
    Group,
    Stack,
    Button,
    TextInput,
    Select,
    Paper,
    Skeleton,
    SegmentedControl,
    Container,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useDisclosure } from '@mantine/hooks';
import {
    IconBox,
    IconCurrencyEuro,
    IconUser,
    IconCategory,
    IconLayoutGrid,
    IconList,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useRequest, useMutation, useViewMode } from '../../../hooks';
import { PageTitle } from '../../../components/PageTitle';
import { CardStatistic } from '../../../components/CardStatistic';
import { InventoryItem, CreateItemForm, defaultForm } from '../types';
import {
    GridView,
    TableView,
    InventoryFormModal,
    LendItemModal,
} from '../components';

export default function InventoryPage() {
    const { t } = useTranslation();
    const [opened, { open, close }] = useDisclosure(false);
    const [lendOpened, { open: openLend, close: closeLend }] = useDisclosure(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [lendingItem, setLendingItem] = useState<InventoryItem | null>(null);
    const [form, setForm] = useState<CreateItemForm>(defaultForm);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState<string | null>(null);
    const [filterLocation, setFilterLocation] = useState<string | null>(null);
    const [globalViewMode, setViewMode] = useViewMode();
    // Map global viewMode to this page's supported modes (grid/list)
    const viewMode = globalViewMode === 'list' || globalViewMode === 'table' ? 'list' : 'grid';
    const [lendTo, setLendTo] = useState('');
    const [lendReturn, setLendReturn] = useState<Date | null>(null);

    const { data: items, isLoading, refetch } = useRequest<InventoryItem[]>('/inventory');
    const { data: categories } = useRequest<string[]>('/inventory/categories');
    const { data: locations } = useRequest<{ area: string; containers: string[] }[]>('/inventory/locations');
    const { data: stats } = useRequest<{
        totalItems: number;
        totalValue: number;
        lentItems: number;
        categories: number;
        locations: number;
    }>('/inventory/stats');

    const { mutate: createItem, isLoading: creating } = useMutation<InventoryItem, CreateItemForm>(
        '/inventory',
        { method: 'POST' }
    );

    const { mutate: updateItem } = useMutation<InventoryItem, { id: string; data: Partial<CreateItemForm> }>(
        (vars) => `/inventory/${vars.id}`,
        { method: 'PATCH' }
    );

    const { mutate: deleteItem } = useMutation<void, { id: string }>(
        (vars) => `/inventory/${vars.id}`,
        { method: 'DELETE' }
    );

    const { mutate: lendItem } = useMutation<InventoryItem, { id: string; to: string; expectedReturn?: string }>(
        (vars) => `/inventory/${vars.id}/lend`,
        { method: 'POST' }
    );

    const { mutate: returnItem } = useMutation<InventoryItem, { id: string }>(
        (vars) => `/inventory/${vars.id}/return`,
        { method: 'POST' }
    );

    const handleOpenCreate = () => {
        setEditingItem(null);
        setForm(defaultForm);
        open();
    };

    const handleOpenEdit = (item: InventoryItem) => {
        setEditingItem(item);
        setForm({
            name: item.name,
            description: item.description,
            category: item.category,
            location: item.location,
            quantity: item.quantity,
            purchasePrice: item.purchasePrice,
            currentValue: item.currentValue,
            serialNumber: item.serialNumber,
        });
        open();
    };

    const handleOpenLend = (item: InventoryItem) => {
        setLendingItem(item);
        setLendTo('');
        setLendReturn(null);
        openLend();
    };

    const handleSubmit = async () => {
        try {
            if (editingItem) {
                await updateItem({ id: editingItem.id, data: form });
                notifications.show({
                    title: t('common.success'),
                    message: t('inventory.itemUpdated'),
                    color: 'green',
                });
            } else {
                await createItem(form);
                notifications.show({
                    title: t('common.success'),
                    message: t('inventory.itemCreated'),
                    color: 'green',
                });
            }
            close();
            refetch();
        } catch (error) {
            notifications.show({
                title: t('common.error'),
                message: t('errors.generic'),
                color: 'red',
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t('inventory.deleteConfirm'))) return;

        try {
            await deleteItem({ id });
            notifications.show({
                title: t('common.success'),
                message: t('inventory.itemDeleted'),
                color: 'green',
            });
            refetch();
        } catch (error) {
            notifications.show({
                title: t('common.error'),
                message: t('inventory.deleteError'),
                color: 'red',
            });
        }
    };

    const handleLendSubmit = async () => {
        if (!lendingItem || !lendTo) return;

        try {
            await lendItem({
                id: lendingItem.id,
                to: lendTo,
                expectedReturn: lendReturn?.toISOString(),
            });
            notifications.show({
                title: t('common.success'),
                message: t('inventory.itemLent'),
                color: 'green',
            });
            closeLend();
            refetch();
        } catch (error) {
            notifications.show({
                title: t('common.error'),
                message: t('inventory.lendError'),
                color: 'red',
            });
        }
    };

    const handleReturn = async (id: string) => {
        try {
            await returnItem({ id });
            notifications.show({
                title: t('common.success'),
                message: t('inventory.itemReturned'),
                color: 'green',
            });
            refetch();
        } catch (error) {
            notifications.show({
                title: t('common.error'),
                message: t('inventory.returnError'),
                color: 'red',
            });
        }
    };

    // Filter items
    const filteredItems = items?.filter((item) => {
        const matchesSearch = !searchQuery ||
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.serialNumber.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = !filterCategory || item.category === filterCategory;
        const matchesLocation = !filterLocation || item.location.area === filterLocation;

        return matchesSearch && matchesCategory && matchesLocation;
    }) || [];

    return (
        <Container size="xl" py="xl">
            <Stack gap="lg">
                {/* Header */}
                <Group justify="space-between">
                    <PageTitle title={t('inventory.title')} subtitle={t('inventory.subtitle')} />
                    <Button onClick={handleOpenCreate}>{t('inventory.newItem')}</Button>
                </Group>

                {/* Stats */}
                {stats && (
                    <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="lg">
                        <CardStatistic
                            type="icon"
                            title={t('inventory.stats.total')}
                            value={stats.totalItems}
                            icon={IconBox}
                            color="blue"
                        />
                        <CardStatistic
                            type="icon"
                            title={t('inventory.stats.value')}
                            value={`${stats.totalValue.toFixed(2)} EUR`}
                            icon={IconCurrencyEuro}
                            color="green"
                        />
                        <CardStatistic
                            type="icon"
                            title={t('inventory.stats.lent')}
                            value={stats.lentItems}
                            icon={IconUser}
                            color="orange"
                        />
                        <CardStatistic
                            type="icon"
                            title={t('inventory.stats.categories')}
                            value={stats.categories}
                            icon={IconCategory}
                            color="violet"
                        />
                    </SimpleGrid>
                )}

                {/* Search Bar */}
                <Paper shadow="sm" withBorder p="md" radius="md">
                    <Group>
                        <TextInput
                            placeholder={t('inventory.searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.currentTarget.value)}
                            style={{ flex: 1 }}
                        />
                        <Select
                            placeholder={t('common.category')}
                            data={categories || []}
                            value={filterCategory}
                            onChange={setFilterCategory}
                            clearable
                            style={{ width: 200 }}
                        />
                        <Select
                            placeholder={t('inventory.location')}
                            data={locations?.map(l => l.area) || []}
                            value={filterLocation}
                            onChange={setFilterLocation}
                            clearable
                            style={{ width: 200 }}
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
                {isLoading ? (
                    <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
                        {[...Array(6)].map((_, i) => (
                            <Skeleton key={i} height={200} />
                        ))}
                    </SimpleGrid>
                ) : filteredItems.length === 0 ? (
                    <Paper withBorder p="xl" ta="center">
                        <Text c="dimmed">{t('inventory.noItemsFound')}</Text>
                    </Paper>
                ) : viewMode !== 'list' ? (
                    <GridView
                        items={filteredItems}
                        onEdit={handleOpenEdit}
                        onDelete={handleDelete}
                        onLend={handleOpenLend}
                        onReturn={handleReturn}
                    />
                ) : (
                    <TableView
                        items={filteredItems}
                        onEdit={handleOpenEdit}
                        onDelete={handleDelete}
                        onLend={handleOpenLend}
                        onReturn={handleReturn}
                    />
                )}

                {/* Create/Edit Modal */}
                <InventoryFormModal
                    opened={opened}
                    onClose={close}
                    editingItem={editingItem}
                    form={form}
                    setForm={setForm}
                    onSubmit={handleSubmit}
                    creating={creating}
                    categories={categories ?? undefined}
                />

                {/* Lend Modal */}
                <LendItemModal
                    opened={lendOpened}
                    onClose={closeLend}
                    lendingItem={lendingItem}
                    lendTo={lendTo}
                    setLendTo={setLendTo}
                    lendReturn={lendReturn}
                    setLendReturn={setLendReturn}
                    onSubmit={handleLendSubmit}
                />
            </Stack>
        </Container>
    );
}
