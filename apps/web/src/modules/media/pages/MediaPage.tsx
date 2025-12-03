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
    Progress,
    Image,
    SegmentedControl,
    MultiSelect,
    Paper,
    Menu,
    ThemeIcon,
    Skeleton,
    Table,
    Container,
} from '@mantine/core';
import { PageTitle } from '../../../components/PageTitle';
import { CardStatistic } from '../../../components/CardStatistic';
import { useForm } from '@mantine/form';
import {
    IconMovie,
    IconBook,
    IconDeviceGamepad,
    IconDeviceTv,
    IconMicrophone,
    IconEdit,
    IconTrash,
    IconPlayerPlay,
    IconCheck,
    IconClock,
    IconX,
    IconLayoutGrid,
    IconList,
    IconDotsVertical,
    IconStar,
    IconStarFilled,
} from '@tabler/icons-react';
import { useRequest, useMutation, useViewMode } from '../../../hooks';
import { notifications } from '@mantine/notifications';
import type {
    MediaType,
    MediaStatus,
    MediaItemWithDetails,
    MediaStats,
    CreateMediaItemDto,
} from '@ycmm/core';

// Alias for component usage
type MediaItem = MediaItemWithDetails;
type CreateMediaDto = CreateMediaItemDto;

const mediaTypes: { value: MediaType; label: string; icon: typeof IconMovie }[] = [
    { value: 'movie', label: 'Film', icon: IconMovie },
    { value: 'series', label: 'Serie', icon: IconDeviceTv },
    { value: 'book', label: 'Buch', icon: IconBook },
    { value: 'game', label: 'Spiel', icon: IconDeviceGamepad },
    { value: 'podcast', label: 'Podcast', icon: IconMicrophone },
    { value: 'anime', label: 'Anime', icon: IconDeviceTv },
];

const statusOptions: { value: MediaStatus; label: string; color: string; icon: typeof IconClock }[] = [
    { value: 'wishlist', label: 'Watchlist', color: 'blue', icon: IconClock },
    { value: 'in_progress', label: 'In Bearbeitung', color: 'yellow', icon: IconPlayerPlay },
    { value: 'completed', label: 'Abgeschlossen', color: 'green', icon: IconCheck },
    { value: 'on_hold', label: 'Pausiert', color: 'orange', icon: IconClock },
    { value: 'dropped', label: 'Abgebrochen', color: 'red', icon: IconX },
];

const genreOptions = [
    'Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime',
    'Documentary', 'Drama', 'Fantasy', 'Historical', 'Horror', 'Mystery',
    'Romance', 'Sci-Fi', 'Thriller', 'War', 'Western',
];

function getStatusBadge(status: MediaStatus) {
    const config = statusOptions.find(s => s.value === status);
    return (
        <Badge color={config?.color || 'gray'} size="sm">
            {config?.label || status}
        </Badge>
    );
}

export default function MediaPage() {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [globalViewMode, setViewMode] = useViewMode();
    // Fallback to 'grid' if global viewMode is not supported by this page
    const viewMode = ['grid', 'list'].includes(globalViewMode) ? globalViewMode : 'grid';


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
        initialValues: {
            type: 'movie' as MediaType,
            title: '',
            originalTitle: '',
            year: undefined as number | undefined,
            creator: '',
            coverUrl: '',
            description: '',
            status: 'wishlist' as MediaStatus,
            rating: undefined as number | undefined,
            review: '',
            genre: [] as string[],
            tags: [] as string[],
            source: '',
            progressCurrent: 0,
            progressTotal: 0,
            progressUnit: '',
        },
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
                title: 'Fehler',
                message: 'Bitte gib einen Titel ein',
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
            title: 'Erfolg',
            message: 'Medium erfolgreich erstellt',
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
            title: 'Erfolg',
            message: 'Medium erfolgreich aktualisiert',
            color: 'green',
        });
        handleClose();
        refetch();
    };

    const handleDelete = async (id: string) => {
        await deleteItem({ id });
        notifications.show({
            title: 'Erfolg',
            message: 'Medium erfolgreich gelöscht',
            color: 'green',
        });
        refetch();
    };

    const MediaCard = ({ item }: { item: MediaItem }) => {
        const typeConfig = mediaTypes.find(t => t.value === item.type);
        const Icon = typeConfig?.icon || IconMovie;

        // Calculate progress percentage
        const progressPercent = item.progress?.total && item.progress.total > 0
            ? (item.progress.current / item.progress.total) * 100
            : 0;

        return (
            <Card shadow="sm" withBorder padding="lg" radius="md" style={{ height: '100%' }}>
                <Card.Section>
                    {item.coverUrl ? (
                        <Image src={item.coverUrl} height={200} alt={item.title} fit="cover" />
                    ) : (
                        <Paper bg="gray.1" h={200} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ThemeIcon size={60} variant="light" color="gray">
                                <Icon size={40} />
                            </ThemeIcon>
                        </Paper>
                    )}
                </Card.Section>

                <Stack gap="sm" mt="md">
                    <Group justify="space-between" align="flex-start">
                        <div style={{ flex: 1 }}>
                            <Group gap="xs" mb={4}>
                                <ThemeIcon size="sm" variant="light" color="blue">
                                    <Icon size={14} />
                                </ThemeIcon>
                                <Text size="xs" c="dimmed">
                                    {typeConfig?.label}
                                </Text>
                            </Group>
                            <Text fw={600} lineClamp={2}>
                                {item.title}
                            </Text>
                            {item.creator && (
                                <Text size="sm" c="dimmed" lineClamp={1}>
                                    {item.creator}
                                </Text>
                            )}
                            {item.year && (
                                <Text size="xs" c="dimmed">
                                    {item.year}
                                </Text>
                            )}
                        </div>
                        <Menu shadow="md" position="bottom-end">
                            <Menu.Target>
                                <ActionIcon variant="subtle" size="sm">
                                    <IconDotsVertical size={16} />
                                </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                                <Menu.Item
                                    leftSection={<IconEdit size={16} />}
                                    onClick={() => openEditModal(item)}
                                >
                                    Bearbeiten
                                </Menu.Item>
                                <Menu.Divider />
                                <Menu.Item
                                    leftSection={<IconTrash size={16} />}
                                    color="red"
                                    onClick={() => handleDelete(item.id)}
                                >
                                    Löschen
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </Group>

                    {item.description && (
                        <Text size="sm" c="dimmed" lineClamp={3}>
                            {item.description}
                        </Text>
                    )}

                    <Group gap="xs">
                        {getStatusBadge(item.status)}
                        {item.rating && (
                            <Group gap={4}>
                                <IconStarFilled size={14} style={{ color: 'gold' }} />
                                <Text size="sm" fw={500}>
                                    {item.rating}/10
                                </Text>
                            </Group>
                        )}
                    </Group>

                    {item.progress && item.progress.total > 0 && (
                        <div>
                            <Group justify="space-between" mb={4}>
                                <Text size="xs" c="dimmed">
                                    Fortschritt
                                </Text>
                                <Text size="xs" c="dimmed">
                                    {item.progress.current}/{item.progress.total} {item.progress.unit}
                                </Text>
                            </Group>
                            <Progress value={progressPercent} size="sm" />
                        </div>
                    )}

                    {item.genre && item.genre.length > 0 && (
                        <Group gap={4}>
                            {item.genre.slice(0, 3).map((g) => (
                                <Badge key={g} size="xs" variant="dot">
                                    {g}
                                </Badge>
                            ))}
                            {item.genre.length > 3 && (
                                <Text size="xs" c="dimmed">
                                    +{item.genre.length - 3}
                                </Text>
                            )}
                        </Group>
                    )}
                </Stack>
            </Card>
        );
    };

    return (
        <Container size="xl" py="xl">
            <Stack gap="lg">
                {/* Header */}
                <Group justify="space-between">
                    <PageTitle title="Medien" subtitle="Verwalte deine Filme, Serien, Bücher und mehr" />
                    <Button onClick={openCreateModal}>Medium hinzufügen</Button>
                </Group>

                {/* Stats */}
                {stats && (
                    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
                        <CardStatistic
                            type="icon"
                            title="Gesamt"
                            value={stats.total}
                            icon={IconLayoutGrid}
                            color="blue"
                        />
                        <CardStatistic
                            type="icon"
                            title="Abgeschlossen dieses Jahr"
                            value={stats.completedThisYear}
                            icon={IconCheck}
                            color="green"
                        />
                        <CardStatistic
                            type="icon"
                            title="Durchschnittliche Bewertung"
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
                        placeholder="Suchen..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.currentTarget.value)}
                        style={{ flex: 1 }}
                    />
                    <Select
                        placeholder="Typ"
                        value={typeFilter}
                        onChange={(value) => setTypeFilter(value || 'all')}
                        data={[
                            { value: 'all', label: 'Alle Typen' },
                            ...mediaTypes.map(t => ({ value: t.value, label: t.label })),
                        ]}
                        style={{ width: 200 }}
                    />
                    <Select
                        placeholder="Status"
                        value={statusFilter}
                        onChange={(value) => setStatusFilter(value || 'all')}
                        data={[
                            { value: 'all', label: 'Alle Status' },
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
                            ? 'Keine Medien gefunden'
                            : 'Noch keine Medien vorhanden'}
                    </Text>
                    {!searchQuery && typeFilter === 'all' && statusFilter === 'all' && (
                        <Button mt="md" onClick={openCreateModal}>
                            Erstes Medium hinzufügen
                        </Button>
                    )}
                </Paper>
            ) : viewMode === 'grid' ? (
                <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }}>
                    {filteredItems.map((item) => (
                        <MediaCard key={item.id} item={item} />
                    ))}
                </SimpleGrid>
            ) : (
                <Paper shadow="sm" withBorder radius="md">
                    <Table striped highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Titel</Table.Th>
                                <Table.Th>Typ</Table.Th>
                                <Table.Th>Jahr</Table.Th>
                                <Table.Th>Status</Table.Th>
                                <Table.Th>Bewertung</Table.Th>
                                <Table.Th>Fortschritt</Table.Th>
                                <Table.Th>Aktionen</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {filteredItems.map((item) => {
                                const typeConfig = mediaTypes.find(t => t.value === item.type);
                                const progressPercent = item.progress?.total && item.progress.total > 0
                                    ? (item.progress.current / item.progress.total) * 100
                                    : 0;
                                return (
                                    <Table.Tr key={item.id}>
                                        <Table.Td>
                                            <Group gap="sm">
                                                {item.coverUrl ? (
                                                    <Image src={item.coverUrl} width={40} height={56} radius="sm" fit="cover" />
                                                ) : (
                                                    <ThemeIcon size={40} variant="light" color="gray">
                                                        {typeConfig?.icon ? <typeConfig.icon size={20} /> : <IconMovie size={20} />}
                                                    </ThemeIcon>
                                                )}
                                                <div>
                                                    <Text fw={500} size="sm">{item.title}</Text>
                                                    {item.creator && <Text size="xs" c="dimmed">{item.creator}</Text>}
                                                </div>
                                            </Group>
                                        </Table.Td>
                                        <Table.Td>
                                            <Badge variant="light" size="sm">
                                                {typeConfig?.label || item.type}
                                            </Badge>
                                        </Table.Td>
                                        <Table.Td>{item.year || '-'}</Table.Td>
                                        <Table.Td>{getStatusBadge(item.status)}</Table.Td>
                                        <Table.Td>
                                            {item.rating ? (
                                                <Group gap={4}>
                                                    <IconStarFilled size={14} style={{ color: 'gold' }} />
                                                    <Text size="sm">{item.rating}/10</Text>
                                                </Group>
                                            ) : '-'}
                                        </Table.Td>
                                        <Table.Td>
                                            {item.progress && item.progress.total > 0 ? (
                                                <Group gap="xs">
                                                    <Progress value={progressPercent} size="sm" style={{ width: 60 }} />
                                                    <Text size="xs" c="dimmed">
                                                        {item.progress.current}/{item.progress.total}
                                                    </Text>
                                                </Group>
                                            ) : '-'}
                                        </Table.Td>
                                        <Table.Td>
                                            <Menu shadow="md" position="bottom-end">
                                                <Menu.Target>
                                                    <ActionIcon variant="subtle" size="sm">
                                                        <IconDotsVertical size={16} />
                                                    </ActionIcon>
                                                </Menu.Target>
                                                <Menu.Dropdown>
                                                    <Menu.Item
                                                        leftSection={<IconEdit size={16} />}
                                                        onClick={() => openEditModal(item)}
                                                    >
                                                        Bearbeiten
                                                    </Menu.Item>
                                                    <Menu.Divider />
                                                    <Menu.Item
                                                        leftSection={<IconTrash size={16} />}
                                                        color="red"
                                                        onClick={() => handleDelete(item.id)}
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
            )}

            {/* Create/Edit Modal */}
            <Modal
                opened={modalOpen}
                onClose={handleClose}
                title={editingItem ? 'Medium bearbeiten' : 'Neues Medium'}
                size="lg"
            >
                <Stack>
                    <Select
                        label="Typ"
                        placeholder="Wähle einen Typ"
                        data={mediaTypes.map(t => ({ value: t.value, label: t.label }))}
                        {...form.getInputProps('type')}
                        required
                    />

                    <TextInput
                        label="Titel"
                        placeholder="z.B. Inception"
                        {...form.getInputProps('title')}
                        required
                    />

                    <TextInput
                        label="Originaltitel"
                        placeholder="Optional"
                        {...form.getInputProps('originalTitle')}
                    />

                    <Group grow>
                        <NumberInput
                            label="Jahr"
                            placeholder="2010"
                            min={1900}
                            max={new Date().getFullYear() + 5}
                            {...form.getInputProps('year')}
                        />

                        <TextInput
                            label="Ersteller/Regisseur/Autor"
                            placeholder="z.B. Christopher Nolan"
                            {...form.getInputProps('creator')}
                        />
                    </Group>

                    <TextInput
                        label="Cover URL"
                        placeholder="https://..."
                        {...form.getInputProps('coverUrl')}
                    />

                    <Textarea
                        label="Beschreibung"
                        placeholder="Kurze Zusammenfassung..."
                        minRows={3}
                        {...form.getInputProps('description')}
                    />

                    <Select
                        label="Status"
                        placeholder="Wähle einen Status"
                        data={statusOptions.map(s => ({ value: s.value, label: s.label }))}
                        {...form.getInputProps('status')}
                    />

                    <Group grow>
                        <NumberInput
                            label="Bewertung"
                            placeholder="1-10"
                            min={0}
                            max={10}
                            step={0.5}
                            {...form.getInputProps('rating')}
                        />

                        <TextInput
                            label="Quelle"
                            placeholder="z.B. Netflix, Amazon Prime"
                            {...form.getInputProps('source')}
                        />
                    </Group>

                    <Textarea
                        label="Rezension"
                        placeholder="Deine Meinung..."
                        minRows={3}
                        {...form.getInputProps('review')}
                    />

                    <MultiSelect
                        label="Genres"
                        placeholder="Wähle Genres"
                        data={genreOptions}
                        {...form.getInputProps('genre')}
                        searchable
                    />

                    <Text size="sm" fw={500} mt="md">
                        Fortschritt (optional)
                    </Text>

                    <Group grow>
                        <NumberInput
                            label="Aktuell"
                            placeholder="0"
                            min={0}
                            {...form.getInputProps('progressCurrent')}
                        />

                        <NumberInput
                            label="Gesamt"
                            placeholder="0"
                            min={0}
                            {...form.getInputProps('progressTotal')}
                        />

                        <TextInput
                            label="Einheit"
                            placeholder="z.B. Seiten, Folgen"
                            {...form.getInputProps('progressUnit')}
                        />
                    </Group>

                    <Group justify="flex-end" mt="md">
                        <Button variant="subtle" onClick={handleClose}>
                            Abbrechen
                        </Button>
                        <Button
                            onClick={editingItem ? handleUpdate : handleCreate}
                            loading={creating}
                        >
                            {editingItem ? 'Speichern' : 'Erstellen'}
                        </Button>
                    </Group>
                </Stack>
            </Modal>
            </Stack>
        </Container>
    );
}
