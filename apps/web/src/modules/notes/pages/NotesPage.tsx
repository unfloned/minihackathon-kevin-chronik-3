import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Title,
    Text,
    SimpleGrid,
    Card,
    Group,
    Stack,
    Button,
    ActionIcon,
    Badge,
    TextInput,
    Menu,
    Paper,
    Skeleton,
    SegmentedControl,
    ThemeIcon,
} from '@mantine/core';
import {
    IconPlus,
    IconSearch,
    IconDotsVertical,
    IconEdit,
    IconTrash,
    IconPin,
    IconPinnedOff,
    IconArchive,
    IconArchiveOff,
    IconNote,
    IconTag,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useRequest, useMutation } from '../../../hooks';
import type { NoteSimple } from '@ycmm/core';

// Alias for component usage
type Note = NoteSimple;

export default function NotesPage() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [view, setView] = useState<'active' | 'archived'>('active');

    const { data: notes, isLoading, refetch } = useRequest<Note[]>('/notes');
    const { data: archivedNotes, refetch: refetchArchived } = useRequest<Note[]>('/notes/archived');
    const { data: allTags } = useRequest<string[]>('/notes/tags');

    const { mutate: deleteNote } = useMutation<void, { id: string }>(
        (vars) => `/notes/${vars.id}`,
        { method: 'DELETE' }
    );

    const { mutate: togglePin } = useMutation<Note, { id: string }>(
        (vars) => `/notes/${vars.id}/pin`,
        { method: 'POST' }
    );

    const { mutate: archiveNote } = useMutation<Note, { id: string }>(
        (vars) => `/notes/${vars.id}/archive`,
        { method: 'POST' }
    );

    const { mutate: unarchiveNote } = useMutation<Note, { id: string }>(
        (vars) => `/notes/${vars.id}/unarchive`,
        { method: 'POST' }
    );

    const handleOpenCreate = () => {
        navigate('/app/notes/new');
    };

    const handleOpenNote = (note: Note) => {
        navigate(`/app/notes/${note.id}`);
    };

    const handleOpenEdit = (note: Note, e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/app/notes/${note.id}/edit`);
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        await deleteNote({ id });
        notifications.show({
            title: 'Erfolg',
            message: 'Notiz gelöscht',
            color: 'green',
        });
        refetch();
        refetchArchived();
    };

    const handleTogglePin = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        await togglePin({ id });
        refetch();
    };

    const handleArchive = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        await archiveNote({ id });
        notifications.show({
            title: 'Erfolg',
            message: 'Notiz archiviert',
            color: 'green',
        });
        refetch();
        refetchArchived();
    };

    const handleUnarchive = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        await unarchiveNote({ id });
        notifications.show({
            title: 'Erfolg',
            message: 'Notiz wiederhergestellt',
            color: 'green',
        });
        refetch();
        refetchArchived();
    };

    const displayNotes = view === 'active' ? notes : archivedNotes;

    const filteredNotes = displayNotes?.filter(note => {
        const matchesSearch = !searchQuery ||
            note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.content.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesTag = !selectedTag || note.tags.includes(selectedTag);

        return matchesSearch && matchesTag;
    }) || [];

    const pinnedNotes = filteredNotes.filter(n => n.isPinned);
    const unpinnedNotes = filteredNotes.filter(n => !n.isPinned);

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Strip HTML tags for preview
    const stripHtml = (html: string) => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || '';
    };

    const NoteCard = ({ note }: { note: Note }) => (
        <Card
            withBorder
            padding="lg"
            style={{ borderLeftWidth: 4, borderLeftColor: note.color, cursor: 'pointer' }}
            onClick={() => handleOpenNote(note)}
        >
            <Group justify="space-between" align="flex-start" mb="sm">
                <Group gap="xs">
                    {note.isPinned && (
                        <ThemeIcon size="sm" variant="light" color="yellow">
                            <IconPin size={12} />
                        </ThemeIcon>
                    )}
                    <Text fw={600} lineClamp={1}>{note.title}</Text>
                </Group>
                <Menu shadow="md" position="bottom-end">
                    <Menu.Target>
                        <ActionIcon variant="subtle" size="sm" onClick={(e) => e.stopPropagation()}>
                            <IconDotsVertical size={16} />
                        </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Item
                            leftSection={<IconEdit size={16} />}
                            onClick={(e) => handleOpenEdit(note, e)}
                        >
                            Bearbeiten
                        </Menu.Item>
                        {!note.isArchived && (
                            <Menu.Item
                                leftSection={note.isPinned ? <IconPinnedOff size={16} /> : <IconPin size={16} />}
                                onClick={(e) => handleTogglePin(note.id, e)}
                            >
                                {note.isPinned ? 'Lösen' : 'Anpinnen'}
                            </Menu.Item>
                        )}
                        {note.isArchived ? (
                            <Menu.Item
                                leftSection={<IconArchiveOff size={16} />}
                                onClick={(e) => handleUnarchive(note.id, e)}
                            >
                                Wiederherstellen
                            </Menu.Item>
                        ) : (
                            <Menu.Item
                                leftSection={<IconArchive size={16} />}
                                onClick={(e) => handleArchive(note.id, e)}
                            >
                                Archivieren
                            </Menu.Item>
                        )}
                        <Menu.Divider />
                        <Menu.Item
                            leftSection={<IconTrash size={16} />}
                            color="red"
                            onClick={(e) => handleDelete(note.id, e)}
                        >
                            Löschen
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </Group>

            {note.content && (
                <Text size="sm" c="dimmed" lineClamp={3} mb="sm">
                    {stripHtml(note.content)}
                </Text>
            )}

            {note.tags.length > 0 && (
                <Group gap={4} mb="sm">
                    {note.tags.map(tag => (
                        <Badge
                            key={tag}
                            size="xs"
                            variant="light"
                            style={{ cursor: 'pointer' }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTag(tag);
                            }}
                        >
                            {tag}
                        </Badge>
                    ))}
                </Group>
            )}

            <Text size="xs" c="dimmed">
                {formatDate(note.updatedAt)}
            </Text>
        </Card>
    );

    return (
        <Container size="xl" py="xl">
            <Stack gap="lg">
                {/* Header */}
                <Group justify="space-between">
                    <div>
                        <Title order={2}>Notizen</Title>
                        <Text c="dimmed">
                            Deine persönlichen Notizen und Ideen
                        </Text>
                    </div>
                    <Button leftSection={<IconPlus size={18} />} onClick={handleOpenCreate}>
                        Neue Notiz
                    </Button>
                </Group>

                {/* Filters */}
                <Paper withBorder p="md">
                    <Group>
                        <TextInput
                            placeholder="Suchen..."
                            leftSection={<IconSearch size={16} />}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.currentTarget.value)}
                            style={{ flex: 1 }}
                        />
                        <SegmentedControl
                            value={view}
                            onChange={(v) => setView(v as 'active' | 'archived')}
                            data={[
                                { label: 'Aktiv', value: 'active' },
                                { label: 'Archiv', value: 'archived' },
                            ]}
                        />
                    </Group>

                    {allTags && allTags.length > 0 && (
                        <Group mt="md" gap="xs">
                            <IconTag size={16} color="var(--mantine-color-dimmed)" />
                            <Badge
                                variant={selectedTag === null ? 'filled' : 'light'}
                                style={{ cursor: 'pointer' }}
                                onClick={() => setSelectedTag(null)}
                            >
                                Alle
                            </Badge>
                            {allTags.map(tag => (
                                <Badge
                                    key={tag}
                                    variant={selectedTag === tag ? 'filled' : 'light'}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                                >
                                    {tag}
                                </Badge>
                            ))}
                        </Group>
                    )}
                </Paper>

                {/* Notes Grid */}
                {isLoading ? (
                    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                        {[...Array(6)].map((_, i) => (
                            <Skeleton key={i} height={180} radius="md" />
                        ))}
                    </SimpleGrid>
                ) : filteredNotes.length === 0 ? (
                    <Paper withBorder p="xl" ta="center">
                        <ThemeIcon size={64} variant="light" color="gray" radius="xl" mx="auto">
                            <IconNote size={32} />
                        </ThemeIcon>
                        <Text mt="md" c="dimmed">
                            {view === 'archived'
                                ? 'Keine archivierten Notizen'
                                : searchQuery || selectedTag
                                    ? 'Keine Notizen gefunden'
                                    : 'Noch keine Notizen vorhanden'
                            }
                        </Text>
                        {view === 'active' && !searchQuery && !selectedTag && (
                            <Button mt="md" onClick={handleOpenCreate}>
                                Erste Notiz erstellen
                            </Button>
                        )}
                    </Paper>
                ) : (
                    <Stack gap="lg">
                        {pinnedNotes.length > 0 && view === 'active' && (
                            <>
                                <Text size="sm" fw={500} c="dimmed" tt="uppercase">
                                    Angepinnt
                                </Text>
                                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                                    {pinnedNotes.map(note => (
                                        <NoteCard key={note.id} note={note} />
                                    ))}
                                </SimpleGrid>
                            </>
                        )}

                        {unpinnedNotes.length > 0 && (
                            <>
                                {pinnedNotes.length > 0 && view === 'active' && (
                                    <Text size="sm" fw={500} c="dimmed" tt="uppercase">
                                        Weitere Notizen
                                    </Text>
                                )}
                                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                                    {unpinnedNotes.map(note => (
                                        <NoteCard key={note.id} note={note} />
                                    ))}
                                </SimpleGrid>
                            </>
                        )}
                    </Stack>
                )}
            </Stack>
        </Container>
    );
}
