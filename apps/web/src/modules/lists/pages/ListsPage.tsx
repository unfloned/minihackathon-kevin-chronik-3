import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Container,
    Button,
    Group,
    Stack,
    SegmentedControl,
    Paper,
    Skeleton,
    SimpleGrid,
    Text,
    ThemeIcon,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
    IconPlus,
    IconCheck,
    IconAlertCircle,
    IconLayoutGrid,
    IconListDetails,
    IconClipboardList,
    IconArchive,
} from '@tabler/icons-react';
import { useRequest, useMutation, useViewMode } from '../../../hooks';
import { PageTitle } from '../../../components/PageTitle';
import { CardStatistic } from '../../../components/CardStatistic';
import { GridView, TableView, ListFormModal } from '../components';
import { defaultNewListData, type List, type NewListData } from '../types';

function ListsPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [view, setView] = useState<'active' | 'archived'>('active');
    const [editingList, setEditingList] = useState<List | null>(null);
    const [globalViewMode, setViewMode] = useViewMode();
    const viewMode = globalViewMode === 'list' || globalViewMode === 'table' ? 'list' : 'grid';

    const listTypeOptions = [
        { value: 'shopping', label: t('lists.types.shopping') },
        { value: 'todo', label: t('lists.types.todo') },
        { value: 'packing', label: t('common.list') },
        { value: 'checklist', label: t('lists.types.checklist') },
        { value: 'custom', label: t('lists.types.custom') },
    ];

    const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] = useDisclosure(false);
    const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);

    const [newListData, setNewListData] = useState<NewListData>(defaultNewListData);

    // Fetch lists
    const {
        data: activeLists,
        isLoading: loadingActive,
        refetch: refetchActive,
    } = useRequest<List[]>('/lists');

    const {
        data: archivedLists,
        isLoading: loadingArchived,
        refetch: refetchArchived,
    } = useRequest<List[]>('/lists/archived');

    // Mutations
    const { mutate: createList, isLoading: creatingList } = useMutation<List, typeof newListData>(
        '/lists',
        {
            method: 'POST',
            onSuccess: () => {
                notifications.show({
                    title: t('common.success'),
                    message: t('lists.listCreated'),
                    color: 'green',
                    icon: <IconCheck size={16} />,
                });
                closeCreateModal();
                setNewListData(defaultNewListData);
                refetchActive();
            },
            onError: (error: string) => {
                notifications.show({
                    title: t('common.error'),
                    message: error || t('errors.generic'),
                    color: 'red',
                    icon: <IconAlertCircle size={16} />,
                });
            },
        }
    );

    const { mutate: updateList, isLoading: updatingList } = useMutation<List, any>(
        (vars) => `/lists/${vars.id}`,
        {
            method: 'PATCH',
            onSuccess: () => {
                notifications.show({
                    title: t('common.success'),
                    message: t('lists.listUpdated'),
                    color: 'green',
                    icon: <IconCheck size={16} />,
                });
                closeEditModal();
                setEditingList(null);
                refetchActive();
                refetchArchived();
            },
            onError: (error: string) => {
                notifications.show({
                    title: t('common.error'),
                    message: error || t('errors.generic'),
                    color: 'red',
                    icon: <IconAlertCircle size={16} />,
                });
            },
        }
    );

    const { mutate: deleteList } = useMutation<void, { id: string }>(
        (vars) => `/lists/${vars.id}`,
        {
            method: 'DELETE',
            onSuccess: () => {
                notifications.show({
                    title: t('common.success'),
                    message: t('lists.listDeleted'),
                    color: 'green',
                    icon: <IconCheck size={16} />,
                });
                refetchActive();
                refetchArchived();
            },
            onError: (error: string) => {
                notifications.show({
                    title: t('common.error'),
                    message: error || t('errors.generic'),
                    color: 'red',
                    icon: <IconAlertCircle size={16} />,
                });
            },
        }
    );

    const { mutate: archiveList } = useMutation<void, { id: string }>(
        (vars) => `/lists/${vars.id}/archive`,
        {
            method: 'POST',
            onSuccess: () => {
                notifications.show({
                    title: t('common.success'),
                    message: t('notes.noteArchived'),
                    color: 'green',
                    icon: <IconCheck size={16} />,
                });
                refetchActive();
            },
            onError: (error: string) => {
                notifications.show({
                    title: t('common.error'),
                    message: error || t('errors.generic'),
                    color: 'red',
                    icon: <IconAlertCircle size={16} />,
                });
            },
        }
    );

    const { mutate: unarchiveList } = useMutation<void, { id: string }>(
        (vars) => `/lists/${vars.id}/unarchive`,
        {
            method: 'POST',
            onSuccess: () => {
                notifications.show({
                    title: t('common.success'),
                    message: t('notes.noteUnarchived'),
                    color: 'green',
                    icon: <IconCheck size={16} />,
                });
                refetchArchived();
                refetchActive();
            },
            onError: (error: string) => {
                notifications.show({
                    title: t('common.error'),
                    message: error || t('errors.generic'),
                    color: 'red',
                    icon: <IconAlertCircle size={16} />,
                });
            },
        }
    );

    const handleCreateList = () => {
        createList(newListData);
    };

    const handleUpdateList = () => {
        if (!editingList) return;
        updateList({
            id: editingList.id,
            name: editingList.name,
            description: editingList.description,
            type: editingList.type,
            color: editingList.color,
        });
    };

    const handleDeleteList = (listId: string) => {
        if (confirm(t('lists.deleteList') + '?')) {
            deleteList({ id: listId });
        }
    };

    const handleArchiveList = (listId: string) => {
        archiveList({ id: listId });
    };

    const handleUnarchiveList = (listId: string) => {
        unarchiveList({ id: listId });
    };

    const openEditListModal = (list: List) => {
        setEditingList({ ...list });
        openEditModal();
    };

    const handleNavigate = (listId: string) => {
        navigate(`/app/lists/${listId}`);
    };

    const lists = view === 'active' ? activeLists : archivedLists;
    const isLoading = view === 'active' ? loadingActive : loadingArchived;

    // Calculate stats
    const totalLists = activeLists?.length || 0;
    const totalItems = activeLists?.reduce((sum, list) => sum + list.items.length, 0) || 0;
    const completedItems = activeLists?.reduce((sum, list) => sum + list.items.filter(i => i.completed).length, 0) || 0;
    const archivedCount = archivedLists?.length || 0;

    return (
        <Container size="xl" py="xl">
            <Stack gap="lg">
                {/* Header */}
                <Group justify="space-between" align="center">
                    <PageTitle title={t('lists.title')} subtitle={t('lists.subtitle')} />
                    <Button leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
                        {t('lists.newList')}
                    </Button>
                </Group>

                {/* Stats */}
                <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="lg">
                    <CardStatistic
                        type="icon"
                        title={t('lists.stats.total')}
                        value={totalLists}
                        icon={IconClipboardList}
                        color="blue"
                        isLoading={loadingActive}
                    />
                    <CardStatistic
                        type="icon"
                        title={t('lists.stats.items')}
                        value={totalItems}
                        icon={IconListDetails}
                        color="violet"
                        isLoading={loadingActive}
                    />
                    <CardStatistic
                        type="circular"
                        title={t('lists.stats.completed')}
                        value={`${completedItems}/${totalItems}`}
                        progress={totalItems > 0 ? (completedItems / totalItems) * 100 : 0}
                        color="green"
                        isLoading={loadingActive}
                        ringSize={40}
                        ringThickness={4}
                    />
                    <CardStatistic
                        type="icon"
                        title={t('notes.stats.archived')}
                        value={archivedCount}
                        icon={IconArchive}
                        color="gray"
                        isLoading={loadingArchived}
                    />
                </SimpleGrid>

                {/* Filters */}
                <Paper shadow="sm" p="md" radius="md" withBorder>
                    <Group justify="space-between">
                        <SegmentedControl
                            value={view}
                            onChange={(value) => setView(value as 'active' | 'archived')}
                            data={[
                                { label: t('notes.active'), value: 'active' },
                                { label: t('notes.archived'), value: 'archived' },
                            ]}
                        />
                        <SegmentedControl
                            value={viewMode}
                            onChange={(value) => setViewMode(value as 'grid' | 'list')}
                            data={[
                                { value: 'grid', label: <IconLayoutGrid size={16} /> },
                                { value: 'list', label: <IconListDetails size={16} /> },
                            ]}
                        />
                    </Group>
                </Paper>

                {/* Content */}
                {isLoading ? (
                    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} height={250} radius="md" />
                        ))}
                    </SimpleGrid>
                ) : !lists || lists.length === 0 ? (
                    <Paper p="xl" withBorder radius="md">
                        <Stack align="center" gap="md">
                            <ThemeIcon size={64} variant="light" color="gray" radius="xl">
                                <IconClipboardList size={32} />
                            </ThemeIcon>
                            <Text c="dimmed" ta="center">
                                {view === 'active' ? t('lists.emptyState') : t('notes.noArchivedNotes')}
                            </Text>
                            {view === 'active' && (
                                <Button leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
                                    {t('lists.createFirst')}
                                </Button>
                            )}
                        </Stack>
                    </Paper>
                ) : viewMode === 'list' ? (
                    <TableView
                        lists={lists}
                        listTypeOptions={listTypeOptions}
                        onNavigate={handleNavigate}
                        onEdit={openEditListModal}
                        onArchive={handleArchiveList}
                        onUnarchive={handleUnarchiveList}
                        onDelete={handleDeleteList}
                    />
                ) : (
                    <GridView
                        lists={lists}
                        listTypeOptions={listTypeOptions}
                        onNavigate={handleNavigate}
                        onEdit={openEditListModal}
                        onArchive={handleArchiveList}
                        onUnarchive={handleUnarchiveList}
                        onDelete={handleDeleteList}
                    />
                )}
            </Stack>

            {/* Create List Modal */}
            <ListFormModal
                opened={createModalOpened}
                onClose={closeCreateModal}
                mode="create"
                listData={newListData}
                setListData={setNewListData}
                onSubmit={handleCreateList}
                isLoading={creatingList}
                listTypeOptions={listTypeOptions}
            />

            {/* Edit List Modal */}
            {editingList && (
                <ListFormModal
                    opened={editModalOpened}
                    onClose={closeEditModal}
                    mode="edit"
                    listData={editingList}
                    setListData={setEditingList}
                    onSubmit={handleUpdateList}
                    isLoading={updatingList}
                    listTypeOptions={listTypeOptions}
                />
            )}
        </Container>
    );
}

export default ListsPage;
