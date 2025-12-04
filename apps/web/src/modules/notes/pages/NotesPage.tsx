import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
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
import { useTranslation } from 'react-i18next';
import { useRequest, useMutation } from '../../../hooks';
import { PageTitle } from '../../../components/PageTitle';
import type { NoteSimple } from '@ycmm/core';

// Alias for component usage
type Note = NoteSimple;

export default function NotesPage() {
    const { t } = useTranslation();
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
            title: t('common.success'),
            message: t('notes.noteDeleted'),
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
            title: t('common.success'),
            message: t('notes.noteArchived'),
            color: 'green',
        });
        refetch();
        refetchArchived();
    };

    const handleUnarchive = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        await unarchiveNote({ id });
        notifications.show({
            title: t('common.success'),
            message: t('notes.noteUnarchived'),
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
                            {t('notes.edit')}
                        </Menu.Item>
                        {!note.isArchived && (
                            <Menu.Item
                                leftSection={note.isPinned ? <IconPinnedOff size={16} /> : <IconPin size={16} />}
                                onClick={(e) => handleTogglePin(note.id, e)}
                            >
                                {note.isPinned ? t('notes.unpin') : t('notes.pin')}
                            </Menu.Item>
                        )}
                        {note.isArchived ? (
                            <Menu.Item
                                leftSection={<IconArchiveOff size={16} />}
                                onClick={(e) => handleUnarchive(note.id, e)}
                            >
                                {t('notes.restore')}
                            </Menu.Item>
                        ) : (
                            <Menu.Item
                                leftSection={<IconArchive size={16} />}
                                onClick={(e) => handleArchive(note.id, e)}
                            >
                                {t('notes.archive')}
                            </Menu.Item>
                        )}
                        <Menu.Divider />
                        <Menu.Item
                            leftSection={<IconTrash size={16} />}
                            color="red"
                            onClick={(e) => handleDelete(note.id, e)}
                        >
                            {t('notes.delete')}
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
                    <PageTitle title={t('notes.title')} subtitle={t('notes.subtitle')} />
                    <Button leftSection={<IconPlus size={18} />} onClick={handleOpenCreate}>
                        {t('notes.newNote')}
                    </Button>
                </Group>

                {/* Filters */}
                <Paper withBorder p="md">
                    <Group>
                        <TextInput
                            placeholder={t('notes.search')}
                            leftSection={<IconSearch size={16} />}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.currentTarget.value)}
                            style={{ flex: 1 }}
                        />
                        <SegmentedControl
                            value={view}
                            onChange={(v) => setView(v as 'active' | 'archived')}
                            data={[
                                { label: t('notes.active'), value: 'active' },
                                { label: t('notes.archivedView'), value: 'archived' },
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
                                {t('notes.all')}
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
                                ? t('notes.noArchivedNotes')
                                : searchQuery || selectedTag
                                    ? t('notes.noNotesFound')
                                    : t('notes.noNotesYet')
                            }
                        </Text>
                        {view === 'active' && !searchQuery && !selectedTag && (
                            <Button mt="md" onClick={handleOpenCreate}>
                                {t('notes.createFirst')}
                            </Button>
                        )}
                    </Paper>
                ) : (
                    <Stack gap="lg">
                        {pinnedNotes.length > 0 && view === 'active' && (
                            <>
                                <Text size="sm" fw={500} c="dimmed" tt="uppercase">
                                    {t('notes.pinnedSection')}
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
                                        {t('notes.otherNotes')}
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
