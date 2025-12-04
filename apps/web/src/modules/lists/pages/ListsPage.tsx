import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const listTypeOptions = [
    { value: 'shopping', label: 'Einkaufsliste' },
    { value: 'todo', label: 'To-Do Liste' },
    { value: 'packing', label: 'Packliste' },
    { value: 'checklist', label: 'Checkliste' },
    { value: 'custom', label: 'Benutzerdefiniert' },
];

const listTypeIcons: Record<string, typeof IconList> = {
    shopping: IconShoppingCart,
    todo: IconChecklist,
    packing: IconBriefcase,
    checklist: IconCheckbox,
    custom: IconClipboardList,
};

function ListsPage() {
    const navigate = useNavigate();
    const [view, setView] = useState<'active' | 'archived'>('active');
    const [editingList, setEditingList] = useState<List | null>(null);
    const [globalViewMode, setViewMode] = useViewMode();
    const viewMode = globalViewMode === 'list' || globalViewMode === 'table' ? 'list' : 'grid';

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
                    title: 'Erfolg',
                    message: 'Liste erfolgreich erstellt',
                    color: 'green',
                    icon: <IconCheck size={16} />,
                });
                closeCreateModal();
                setNewListData({ name: '', description: '', type: 'todo', color: '#228be6' });
                refetchActive();
            },
            onError: (error: string) => {
                notifications.show({
                    title: 'Fehler',
                    message: error || 'Liste konnte nicht erstellt werden',
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
                    title: 'Erfolg',
                    message: 'Liste erfolgreich aktualisiert',
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
                    title: 'Fehler',
                    message: error || 'Liste konnte nicht aktualisiert werden',
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
                    title: 'Erfolg',
                    message: 'Liste erfolgreich gelöscht',
                    color: 'green',
                    icon: <IconCheck size={16} />,
                });
                refetchActive();
                refetchArchived();
            },
            onError: (error: string) => {
                notifications.show({
                    title: 'Fehler',
                    message: error || 'Liste konnte nicht gelöscht werden',
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
                    title: 'Erfolg',
                    message: 'Liste erfolgreich archiviert',
                    color: 'green',
                    icon: <IconCheck size={16} />,
                });
                refetchActive();
            },
            onError: (error: string) => {
                notifications.show({
                    title: 'Fehler',
                    message: error || 'Liste konnte nicht archiviert werden',
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
                    title: 'Erfolg',
                    message: 'Liste erfolgreich wiederhergestellt',
                    color: 'green',
                    icon: <IconCheck size={16} />,
                });
                refetchArchived();
                refetchActive();
            },
            onError: (error: string) => {
                notifications.show({
                    title: 'Fehler',
                    message: error || 'Liste konnte nicht wiederhergestellt werden',
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
        if (confirm('Möchten Sie diese Liste wirklich löschen?')) {
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
                    </Group>

                    <Group gap="xs">
                        <Badge color="gray" variant="light" size="sm">
                            {listTypeOptions.find((opt) => opt.value === list.type)?.label}
                        </Badge>
                        <Badge color={progress === 100 ? 'green' : 'blue'} variant="light" size="sm">
                            {completedCount}/{list.items.length} erledigt
                        </Badge>
                    </Group>

                    {list.items.length > 0 && (
                        <Progress value={progress} color={list.color} size="sm" radius="xl" />
                    )}

                    {list.items.length === 0 && (
                        <Text size="sm" c="dimmed" ta="center">
                            Keine Einträge
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
                        <Table.Th>Liste</Table.Th>
                        <Table.Th>Typ</Table.Th>
                        <Table.Th>Fortschritt</Table.Th>
                        <Table.Th>Einträge</Table.Th>
                        <Table.Th>Erstellt</Table.Th>
                        <Table.Th>Aktionen</Table.Th>
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
                    <PageTitle title="Listen" subtitle="Verwalte deine Einkaufs-, To-Do- und Packlisten" />
                    <Button leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
                        Neue Liste
                    </Button>
                </Group>

                {/* Stats */}
                <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="lg">
                    <CardStatistic
                        type="icon"
                        title="Aktive Listen"
                        value={totalLists}
                        icon={IconClipboardList}
                        color="blue"
                        isLoading={loadingActive}
                    />
                    <CardStatistic
                        type="icon"
                        title="Einträge gesamt"
                        value={totalItems}
                        icon={IconListDetails}
                        color="violet"
                        isLoading={loadingActive}
                    />
                    <CardStatistic
                        type="circular"
                        title="Erledigt"
                        value={`${completedItems}/${totalItems}`}
                        progress={totalItems > 0 ? (completedItems / totalItems) * 100 : 0}
                        color="green"
                        isLoading={loadingActive}
                        ringSize={40}
                        ringThickness={4}
                    />
                    <CardStatistic
                        type="icon"
                        title="Archiviert"
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
                                { label: 'Aktive Listen', value: 'active' },
                                { label: 'Archiviert', value: 'archived' },
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
                                {view === 'active' ? 'Keine aktiven Listen vorhanden' : 'Keine archivierten Listen vorhanden'}
                            </Text>
                            {view === 'active' && (
                                <Button leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
                                    Erste Liste erstellen
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
            <Modal opened={createModalOpened} onClose={closeCreateModal} title="Neue Liste erstellen" size="md">
                <Stack gap="md">
                    <TextInput
                        label="Name"
                        placeholder="Listenname"
                        required
                        value={newListData.name}
                        onChange={(e) => setNewListData({ ...newListData, name: e.currentTarget.value })}
                    />
                    <Textarea
                        label="Beschreibung"
                        placeholder="Beschreibung (optional)"
                        value={newListData.description}
                        onChange={(e) => setNewListData({ ...newListData, description: e.currentTarget.value })}
                        minRows={3}
                    />
                    <Select
                        label="Typ"
                        placeholder="Listentyp auswählen"
                        required
                        value={newListData.type}
                        onChange={(value) => setNewListData({ ...newListData, type: value as ListType })}
                        data={listTypeOptions}
                    />
                    <ColorInput
                        label="Farbe"
                        placeholder="Farbe auswählen"
                        value={newListData.color}
                        onChange={(value) => setNewListData({ ...newListData, color: value })}
                        swatches={['#228be6', '#40c057', '#fab005', '#fd7e14', '#fa5252', '#be4bdb', '#7950f2', '#15aabf']}
                    />
                    <Group justify="flex-end" mt="md">
                        <Button variant="subtle" onClick={closeCreateModal}>
                            Abbrechen
                        </Button>
                        <Button
                            onClick={handleCreateList}
                            loading={creatingList}
                            disabled={!newListData.name.trim()}
                        >
                            Erstellen
                        </Button>
                    </Group>
                </Stack>
            </Modal>

            {/* Edit List Modal */}
            <Modal opened={editModalOpened} onClose={closeEditModal} title="Liste bearbeiten" size="md">
                {editingList && (
                    <Stack gap="md">
                        <TextInput
                            label="Name"
                            placeholder="Listenname"
                            required
                            value={editingList.name}
                            onChange={(e) => setEditingList({ ...editingList, name: e.currentTarget.value })}
                        />
                        <Textarea
                            label="Beschreibung"
                            placeholder="Beschreibung (optional)"
                            value={editingList.description}
                            onChange={(e) => setEditingList({ ...editingList, description: e.currentTarget.value })}
                            minRows={3}
                        />
                        <Select
                            label="Typ"
                            placeholder="Listentyp auswählen"
                            required
                            value={editingList.type}
                            onChange={(value) => setEditingList({ ...editingList, type: value as ListType })}
                            data={listTypeOptions}
                        />
                        <ColorInput
                            label="Farbe"
                            placeholder="Farbe auswählen"
                            value={editingList.color}
                            onChange={(value) => setEditingList({ ...editingList, color: value })}
                            swatches={['#228be6', '#40c057', '#fab005', '#fd7e14', '#fa5252', '#be4bdb', '#7950f2', '#15aabf']}
                        />
                        <Group justify="flex-end" mt="md">
                            <Button variant="subtle" onClick={closeEditModal}>
                                Abbrechen
                            </Button>
                            <Button
                                onClick={handleUpdateList}
                                loading={updatingList}
                                disabled={!editingList.name.trim()}
                            >
                                Speichern
                            </Button>
                        </Group>
                    </Stack>
                )}
            </Modal>
        </Container>
    );
}

export default ListsPage;
