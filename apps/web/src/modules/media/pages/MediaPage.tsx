import { useState, useMemo } from 'react';
import {
    Text,
    Button,
    Group,
    Stack,
    TextInput,
    Select,
    SimpleGrid,
    SegmentedControl,
    Paper,
    ThemeIcon,
    Skeleton,
    Container,
} from '@mantine/core';
import { PageTitle } from '../../../components/PageTitle';
import { CardStatistic } from '../../../components/CardStatistic';
import { useForm } from '@mantine/form';
import {
    IconMovie,
    IconCheck,
    IconLayoutGrid,
    IconList,
    IconStar,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useRequest, useMutation, useViewMode } from '../../../hooks';
import { notifications } from '@mantine/notifications';
import type { MediaStats } from '@ycmm/core';
import {
    MediaItem,
    CreateMediaDto,
    mediaTypeIcons,
    mediaTypeKeys,
    statusKeys,
    statusColors,
    defaultFormValues,
} from '../types';
import { GridView, TableView, MediaFormModal } from '../components';

export default function MediaPage() {
    const { t } = useTranslation();
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [globalViewMode, setViewMode] = useViewMode();
    // Fallback to 'grid' if global viewMode is not supported by this page
    const viewMode = ['grid', 'list'].includes(globalViewMode) ? globalViewMode : 'grid';

    // Dynamic labels from translations
    const mediaTypes = mediaTypeKeys.map((key) => ({
        value: key,
        label: t(`media.types.${key}`),
        icon: mediaTypeIcons[key],
    }));

    const statusOptions = statusKeys.map((key) => ({
        value: key,
        label: t(`media.status.${key === 'in_progress' ? 'inProgress' : key === 'on_hold' ? 'onHold' : key}`),
        color: statusColors[key],
    }));

    const { data: items, isLoading, refetch } = useRequest<MediaItem[]>('/media');
    const { data: stats } = useRequest<MediaStats>('/media/stats');

    const { mutate: createItem, isLoading: creating } = useMutation<MediaItem, CreateMediaDto>(
        '/media',
        { method: 'POST' }
    );

    const { mutate: updateItem } = useMutation<MediaItem, { id: string } & Partial<CreateMediaDto>>(
        (vars) => `/media/${vars.id}`,
        { method: 'PATCH' }
    );

    const { mutate: deleteItem } = useMutation<{ success: boolean }, { id: string }>(
        (vars) => `/media/${vars.id}`,
        { method: 'DELETE' }
    );

    const form = useForm({
        initialValues: defaultFormValues,
    });

    const filteredItems = useMemo(() => {
        if (!items) return [];
        return items.filter(item => {
            const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.creator.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = typeFilter === 'all' || item.type === typeFilter;
            const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
            return matchesSearch && matchesType && matchesStatus;
        });
    }, [items, searchQuery, typeFilter, statusFilter]);

    const openCreateModal = () => {
        setEditingItem(null);
        form.reset();
        setModalOpen(true);
    };

    const openEditModal = (item: MediaItem) => {
        setEditingItem(item);
        form.setValues({
            type: item.type,
            title: item.title,
            originalTitle: item.originalTitle || '',
            year: item.year,
            creator: item.creator || '',
            coverUrl: item.coverUrl || '',
            description: item.description || '',
            status: item.status,
            rating: item.rating,
            review: item.review || '',
            genre: item.genre || [],
            tags: item.tags || [],
            source: item.source || '',
            progressCurrent: item.progress?.current || 0,
            progressTotal: item.progress?.total || 0,
            progressUnit: item.progress?.unit || '',
        });
        setModalOpen(true);
    };

    const handleClose = () => {
        setEditingItem(null);
        setModalOpen(false);
    };

    const handleCreate = async () => {
        if (!form.values.title.trim()) {
            notifications.show({
                title: t('common.error'),
                message: t('media.enterTitle'),
                color: 'red',
            });
            return;
        }

        const payload: CreateMediaDto = {
            type: form.values.type,
            title: form.values.title,
            originalTitle: form.values.originalTitle || undefined,
            year: form.values.year,
            creator: form.values.creator || undefined,
            coverUrl: form.values.coverUrl || undefined,
            description: form.values.description || undefined,
            status: form.values.status,
            rating: form.values.rating,
            review: form.values.review || undefined,
            genre: form.values.genre.length > 0 ? form.values.genre : undefined,
            tags: form.values.tags.length > 0 ? form.values.tags : undefined,
            source: form.values.source || undefined,
        };

        // Add progress if values are provided
        if (form.values.progressTotal > 0) {
            payload.progress = {
                current: form.values.progressCurrent,
                total: form.values.progressTotal,
                unit: form.values.progressUnit || '',
            };
        }

        await createItem(payload);
        notifications.show({
            title: t('common.success'),
            message: t('media.mediaCreated'),
            color: 'green',
        });
        handleClose();
        refetch();
    };

    const handleUpdate = async () => {
        if (!editingItem || !form.values.title.trim()) return;

        const payload: Partial<CreateMediaDto> = {
            type: form.values.type,
            title: form.values.title,
            originalTitle: form.values.originalTitle || undefined,
            year: form.values.year,
            creator: form.values.creator || undefined,
            coverUrl: form.values.coverUrl || undefined,
            description: form.values.description || undefined,
            status: form.values.status,
            rating: form.values.rating,
            review: form.values.review || undefined,
            genre: form.values.genre.length > 0 ? form.values.genre : undefined,
            tags: form.values.tags.length > 0 ? form.values.tags : undefined,
            source: form.values.source || undefined,
        };

        // Add progress if values are provided
        if (form.values.progressTotal > 0) {
            payload.progress = {
                current: form.values.progressCurrent,
                total: form.values.progressTotal,
                unit: form.values.progressUnit || '',
            };
        }

        await updateItem({ id: editingItem.id, ...payload });
        notifications.show({
            title: t('common.success'),
            message: t('media.mediaUpdated'),
            color: 'green',
        });
        handleClose();
        refetch();
    };

    const handleDelete = async (id: string) => {
        await deleteItem({ id });
        notifications.show({
            title: t('common.success'),
            message: t('media.mediaDeleted'),
            color: 'green',
        });
        refetch();
    };

    return (
        <Container size="xl" py="xl">
            <Stack gap="lg">
                {/* Header */}
                <Group justify="space-between">
                    <PageTitle title={t('media.title')} subtitle={t('media.subtitle')} />
                    <Button onClick={openCreateModal}>{t('media.addMedia')}</Button>
                </Group>

                {/* Stats */}
                {stats && (
                    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
                        <CardStatistic
                            type="icon"
                            title={t('media.stats.total')}
                            value={stats.total}
                            icon={IconLayoutGrid}
                            color="blue"
                        />
                        <CardStatistic
                            type="icon"
                            title={t('media.stats.completedThisYear')}
                            value={stats.completedThisYear}
                            icon={IconCheck}
                            color="green"
                        />
                        <CardStatistic
                            type="icon"
                            title={t('media.stats.averageRating')}
                            value={stats.averageRating ? stats.averageRating.toFixed(1) : '-'}
                            icon={IconStar}
                            color="yellow"
                        />
                    </SimpleGrid>
                )}

                {/* Filters */}
                <Paper shadow="sm" withBorder p="md" radius="md" mb="lg">
                    <Group>
                        <TextInput
                            placeholder={t('media.search')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.currentTarget.value)}
                            style={{ flex: 1 }}
                        />
                        <Select
                            placeholder={t('common.type')}
                            value={typeFilter}
                            onChange={(value) => setTypeFilter(value || 'all')}
                            data={[
                                { value: 'all', label: t('media.allTypes') },
                                ...mediaTypes.map(mt => ({ value: mt.value, label: mt.label })),
                            ]}
                            style={{ width: 200 }}
                        />
                        <Select
                            placeholder={t('common.status')}
                            value={statusFilter}
                            onChange={(value) => setStatusFilter(value || 'all')}
                            data={[
                                { value: 'all', label: t('media.allStatus') },
                                ...statusOptions.map(s => ({ value: s.value, label: s.label })),
                            ]}
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

                {/* Media Grid/List */}
                {isLoading ? (
                    <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }}>
                        {[...Array(8)].map((_, i) => (
                            <Skeleton key={i} height={400} radius="md" />
                        ))}
                    </SimpleGrid>
                ) : filteredItems.length === 0 ? (
                    <Paper shadow="sm" withBorder p="xl" radius="md" ta="center">
                        <ThemeIcon size={64} variant="light" color="gray" radius="xl" mx="auto">
                            <IconMovie size={32} />
                        </ThemeIcon>
                        <Text mt="md" c="dimmed">
                            {searchQuery || typeFilter !== 'all' || statusFilter !== 'all'
                                ? t('media.noMediaFound')
                                : t('media.emptyState')}
                        </Text>
                        {!searchQuery && typeFilter === 'all' && statusFilter === 'all' && (
                            <Button mt="md" onClick={openCreateModal}>
                                {t('media.createFirst')}
                            </Button>
                        )}
                    </Paper>
                ) : viewMode === 'grid' ? (
                    <GridView
                        items={filteredItems}
                        onEdit={openEditModal}
                        onDelete={handleDelete}
                        mediaTypes={mediaTypes}
                    />
                ) : (
                    <TableView
                        items={filteredItems}
                        onEdit={openEditModal}
                        onDelete={handleDelete}
                        mediaTypes={mediaTypes}
                    />
                )}

                {/* Create/Edit Modal */}
                <MediaFormModal
                    opened={modalOpen}
                    onClose={handleClose}
                    form={form}
                    isEditing={!!editingItem}
                    isCreating={creating}
                    onSubmit={editingItem ? handleUpdate : handleCreate}
                    mediaTypes={mediaTypes}
                    statusOptions={statusOptions}
                />
            </Stack>
        </Container>
    );
}
