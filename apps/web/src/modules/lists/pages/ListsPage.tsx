import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Container,
    Card,
    Text,
    Button,
    Group,
    Stack,
    Modal,
    TextInput,
    Textarea,
    Select,
    ColorInput,
    SegmentedControl,
    ActionIcon,
    Badge,
    Menu,
    Paper,
    Skeleton,
    SimpleGrid,
    Progress,
    ThemeIcon,
    Table,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
    IconPlus,
    IconTrash,
    IconEdit,
    IconArchive,
    IconArchiveOff,
    IconDotsVertical,
    IconCheck,
    IconAlertCircle,
    IconList,
    IconShoppingCart,
    IconChecklist,
    IconBriefcase,
    IconLayoutGrid,
    IconListDetails,
    IconClipboardList,
    IconCheckbox,
} from '@tabler/icons-react';
import { useRequest, useMutation, useViewMode } from '../../../hooks';
import { PageTitle } from '../../../components/PageTitle';
import { CardStatistic } from '../../../components/CardStatistic';
import type { ListSimple, ListType } from '@ycmm/core';

// Alias for component usage
type List = ListSimple;

const listTypeIcons: Record<string, typeof IconList> = {
    shopping: IconShoppingCart,
    todo: IconChecklist,
    packing: IconBriefcase,
    checklist: IconCheckbox,
    custom: IconClipboardList,
};

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

    const [newListData, setNewListData] = useState({
        name: '',
        description: '',
        type: 'todo' as ListType,
        color: '#228be6',
    });

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
                setNewListData({ name: '', description: '', type: 'todo', color: '#228be6' });
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

    const lists = view === 'active' ? activeLists : archivedLists;
    const isLoading = view === 'active' ? loadingActive : loadingArchived;

    // Calculate stats
    const totalLists = activeLists?.length || 0;
    const totalItems = activeLists?.reduce((sum, list) => sum + list.items.length, 0) || 0;
    const completedItems = activeLists?.reduce((sum, list) => sum + list.items.filter(i => i.completed).length, 0) || 0;
    const archivedCount = archivedLists?.length || 0;

    const getListProgress = (list: List) => {
        if (list.items.length === 0) return 0;
        return (list.items.filter(i => i.completed).length / list.items.length) * 100;
    };

    const renderListCard = (list: List) => {
        const Icon = listTypeIcons[list.type] || IconList;
        const progress = getListProgress(list);
        const completedCount = list.items.filter(i => i.completed).length;

        return (
            <Card
                key={list.id}
                shadow="sm"
                padding="lg"
                radius="md"
                withBorder
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/app/lists/${list.id}`)}
            >
                <Stack gap="md">
                    <Group justify="space-between">
                        <Group gap="sm">
                            <ThemeIcon size="lg" radius="md" color={list.color} variant="light">
                                <Icon size={20} />
                            </ThemeIcon>
                            <div>
                                <Text fw={600} size="lg">{list.name}</Text>
                                {list.description && (
                                    <Text size="sm" c="dimmed" lineClamp={1}>{list.description}</Text>
                                )}
                            </div>
                        </Group>
                        <Menu shadow="md" width={200}>
                            <Menu.Target>
                                <ActionIcon variant="subtle" color="gray" onClick={(e) => e.stopPropagation()}>
                                    <IconDotsVertical size={16} />
                                </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                                <Menu.Item
                                    leftSection={<IconEdit size={14} />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openEditListModal(list);
                                    }}
                                >
                                    {t('common.edit')}
                                </Menu.Item>
                                {!list.isArchived ? (
                                    <Menu.Item
                                        leftSection={<IconArchive size={14} />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleArchiveList(list.id);
                                        }}
                                    >
                                        {t('common.archive')}
                                    </Menu.Item>
                                ) : (
                                    <Menu.Item
                                        leftSection={<IconArchiveOff size={14} />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleUnarchiveList(list.id);
                                        }}
                                    >
                                        {t('common.unarchive')}
                                    </Menu.Item>
                                )}
                                <Menu.Divider />
                                <Menu.Item
                                    color="red"
                                    leftSection={<IconTrash size={14} />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteList(list.id);
                                    }}
                                >
                                    {t('common.delete')}
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </Group>

                    <Group gap="xs">
                        <Badge color="gray" variant="light" size="sm">
                            {listTypeOptions.find((opt) => opt.value === list.type)?.label}
                        </Badge>
                        <Badge color={progress === 100 ? 'green' : 'blue'} variant="light" size="sm">
                            {completedCount}/{list.items.length} {t('common.completed').toLowerCase()}
                        </Badge>
                    </Group>

                    {list.items.length > 0 && (
                        <Progress value={progress} color={list.color} size="sm" radius="xl" />
                    )}

                    {list.items.length === 0 && (
                        <Text size="sm" c="dimmed" ta="center">
                            {t('lists.emptyListState')}
                        </Text>
                    )}
                </Stack>
            </Card>
        );
    };

    const renderTableView = () => (
        <Paper shadow="sm" withBorder radius="md">
            <Table striped highlightOnHover>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>{t('common.list')}</Table.Th>
                        <Table.Th>{t('common.type')}</Table.Th>
                        <Table.Th>{t('common.progress')}</Table.Th>
                        <Table.Th>{t('lists.items')}</Table.Th>
                        <Table.Th>{t('common.date')}</Table.Th>
                        <Table.Th>{t('common.actions')}</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {lists?.map((list) => {
                        const Icon = listTypeIcons[list.type] || IconList;
                        const progress = getListProgress(list);
                        const completedCount = list.items.filter(i => i.completed).length;

                        return (
                            <Table.Tr
                                key={list.id}
                                style={{ cursor: 'pointer' }}
                                onClick={() => navigate(`/app/lists/${list.id}`)}
                            >
                                <Table.Td>
                                    <Group gap="sm">
                                        <ThemeIcon size="sm" radius="md" color={list.color} variant="light">
                                            <Icon size={14} />
                                        </ThemeIcon>
                                        <div>
                                            <Text size="sm" fw={500}>{list.name}</Text>
                                            {list.description && (
                                                <Text size="xs" c="dimmed" lineClamp={1}>{list.description}</Text>
                                            )}
                                        </div>
                                    </Group>
                                </Table.Td>
                                <Table.Td>
                                    <Badge size="sm" variant="light">
                                        {listTypeOptions.find((opt) => opt.value === list.type)?.label}
                                    </Badge>
                                </Table.Td>
                                <Table.Td>
                                    <Group gap="xs">
                                        <Progress value={progress} color={list.color} size="sm" style={{ width: 60 }} />
                                        <Text size="xs" c="dimmed">{Math.round(progress)}%</Text>
                                    </Group>
                                </Table.Td>
                                <Table.Td>
                                    <Text size="sm">{completedCount}/{list.items.length}</Text>
                                </Table.Td>
                                <Table.Td>
                                    <Text size="sm">{new Date(list.createdAt).toLocaleDateString('de-DE')}</Text>
                                </Table.Td>
                                <Table.Td>
                                    <Menu shadow="md" width={200}>
                                        <Menu.Target>
                                            <ActionIcon variant="subtle" color="gray" onClick={(e) => e.stopPropagation()}>
                                                <IconDotsVertical size={16} />
                                            </ActionIcon>
                                        </Menu.Target>
                                        <Menu.Dropdown>
                                            <Menu.Item
                                                leftSection={<IconEdit size={14} />}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openEditListModal(list);
                                                }}
                                            >
                                                Bearbeiten
                                            </Menu.Item>
                                            {!list.isArchived ? (
                                                <Menu.Item
                                                    leftSection={<IconArchive size={14} />}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleArchiveList(list.id);
                                                    }}
                                                >
                                                    Archivieren
                                                </Menu.Item>
                                            ) : (
                                                <Menu.Item
                                                    leftSection={<IconArchiveOff size={14} />}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleUnarchiveList(list.id);
                                                    }}
                                                >
                                                    Wiederherstellen
                                                </Menu.Item>
                                            )}
                                            <Menu.Divider />
                                            <Menu.Item
                                                color="red"
                                                leftSection={<IconTrash size={14} />}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteList(list.id);
                                                }}
                                            >
                                                Löschen
                                            </Menu.Item>
                                        </Menu.Dropdown>
                                    </Menu>
                                </Table.Td>
                            </Table.Tr>
                        );
                    })}
                </Table.Tbody>
            </Table>
        </Paper>
    );

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
                    renderTableView()
                ) : (
                    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
                        {lists.map(renderListCard)}
                    </SimpleGrid>
                )}
            </Stack>

            {/* Create List Modal */}
            <Modal opened={createModalOpened} onClose={closeCreateModal} title={t('lists.newList')} size="md">
                <Stack gap="md">
                    <TextInput
                        label={t('common.name')}
                        placeholder={t('common.name')}
                        required
                        value={newListData.name}
                        onChange={(e) => setNewListData({ ...newListData, name: e.currentTarget.value })}
                    />
                    <Textarea
                        label={t('common.description')}
                        placeholder={`${t('common.description')} (${t('common.optional').toLowerCase()})`}
                        value={newListData.description}
                        onChange={(e) => setNewListData({ ...newListData, description: e.currentTarget.value })}
                        minRows={3}
                    />
                    <Select
                        label={t('common.type')}
                        placeholder={t('common.type')}
                        required
                        value={newListData.type}
                        onChange={(value) => setNewListData({ ...newListData, type: value as ListType })}
                        data={listTypeOptions}
                    />
                    <ColorInput
                        label={t('common.color')}
                        placeholder={t('common.color')}
                        value={newListData.color}
                        onChange={(value) => setNewListData({ ...newListData, color: value })}
                        swatches={['#228be6', '#40c057', '#fab005', '#fd7e14', '#fa5252', '#be4bdb', '#7950f2', '#15aabf']}
                    />
                    <Group justify="flex-end" mt="md">
                        <Button variant="subtle" onClick={closeCreateModal}>
                            {t('common.cancel')}
                        </Button>
                        <Button
                            onClick={handleCreateList}
                            loading={creatingList}
                            disabled={!newListData.name.trim()}
                        >
                            {t('common.create')}
                        </Button>
                    </Group>
                </Stack>
            </Modal>

            {/* Edit List Modal */}
            <Modal opened={editModalOpened} onClose={closeEditModal} title={t('lists.editList')} size="md">
                {editingList && (
                    <Stack gap="md">
                        <TextInput
                            label={t('common.name')}
                            placeholder={t('common.name')}
                            required
                            value={editingList.name}
                            onChange={(e) => setEditingList({ ...editingList, name: e.currentTarget.value })}
                        />
                        <Textarea
                            label={t('common.description')}
                            placeholder={`${t('common.description')} (${t('common.optional').toLowerCase()})`}
                            value={editingList.description}
                            onChange={(e) => setEditingList({ ...editingList, description: e.currentTarget.value })}
                            minRows={3}
                        />
                        <Select
                            label={t('common.type')}
                            placeholder={t('common.type')}
                            required
                            value={editingList.type}
                            onChange={(value) => setEditingList({ ...editingList, type: value as ListType })}
                            data={listTypeOptions}
                        />
                        <ColorInput
                            label={t('common.color')}
                            placeholder={t('common.color')}
                            value={editingList.color}
                            onChange={(value) => setEditingList({ ...editingList, color: value })}
                            swatches={['#228be6', '#40c057', '#fab005', '#fd7e14', '#fa5252', '#be4bdb', '#7950f2', '#15aabf']}
                        />
                        <Group justify="flex-end" mt="md">
                            <Button variant="subtle" onClick={closeEditModal}>
                                {t('common.cancel')}
                            </Button>
                            <Button
                                onClick={handleUpdateList}
                                loading={updatingList}
                                disabled={!editingList.name.trim()}
                            >
                                {t('common.save')}
                            </Button>
                        </Group>
                    </Stack>
                )}
            </Modal>
        </Container>
    );
}

export default ListsPage;
