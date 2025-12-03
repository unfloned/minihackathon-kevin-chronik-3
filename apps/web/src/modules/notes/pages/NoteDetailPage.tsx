import { useNavigate, useParams } from 'react-router-dom';
import {
    Container,
    Title,
    Text,
    Card,
    Group,
    Stack,
    Button,
    Badge,
    ThemeIcon,
    Skeleton,
    ActionIcon,
    Menu,
} from '@mantine/core';
import {
    IconArrowLeft,
    IconEdit,
    IconPin,
    IconPinnedOff,
    IconArchive,
    IconArchiveOff,
    IconTrash,
    IconDotsVertical,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useRequest, useMutation } from '../../../hooks';
import { RichTextViewer } from '../../../components/RichTextEditor';
import type { NoteSimple } from '@ycmm/core';

// Alias for component usage
type Note = NoteSimple;

export default function NoteDetailPage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const { data: note, isLoading, refetch } = useRequest<Note>(
        id ? `/notes/${id}` : ''
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

    const { mutate: deleteNote } = useMutation<void, { id: string }>(
        (vars) => `/notes/${vars.id}`,
        { method: 'DELETE' }
    );

    const handleBack = () => {
        navigate('/app/notes');
    };

    const handleEdit = () => {
        navigate(`/app/notes/${id}/edit`);
    };

    const handleTogglePin = async () => {
        if (!id) return;
        await togglePin({ id });
        refetch();
    };

    const handleArchive = async () => {
        if (!id) return;
        await archiveNote({ id });
        notifications.show({
            title: 'Erfolg',
            message: 'Notiz archiviert',
            color: 'green',
        });
        navigate('/app/notes');
    };

    const handleUnarchive = async () => {
        if (!id) return;
        await unarchiveNote({ id });
        notifications.show({
            title: 'Erfolg',
            message: 'Notiz wiederhergestellt',
            color: 'green',
        });
        refetch();
    };

    const handleDelete = async () => {
        if (!id) return;
        await deleteNote({ id });
        notifications.show({
            title: 'Erfolg',
            message: 'Notiz gelöscht',
            color: 'green',
        });
        navigate('/app/notes');
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (isLoading) {
        return (
            <Container size="xl" py="xl">
                <Stack gap="lg">
                    <Skeleton height={40} width={200} />
                    <Skeleton height={300} />
                </Stack>
            </Container>
        );
    }

    if (!note) {
        return (
            <Container size="xl" py="xl">
                <Stack gap="lg" align="center">
                    <Text c="dimmed">Notiz nicht gefunden</Text>
                    <Button onClick={handleBack}>Zurück zur Übersicht</Button>
                </Stack>
            </Container>
        );
    }

    return (
        <Container size="xl" py="xl">
            <Stack gap="lg">
                {/* Header */}
                <Group justify="space-between">
                    <Group>
                        <ActionIcon variant="subtle" size="lg" onClick={handleBack}>
                            <IconArrowLeft size={20} />
                        </ActionIcon>
                        <div>
                            <Group gap="xs">
                                <Title order={2}>{note.title}</Title>
                                {note.isPinned && (
                                    <ThemeIcon size="sm" variant="light" color="yellow">
                                        <IconPin size={14} />
                                    </ThemeIcon>
                                )}
                                {note.isArchived && (
                                    <Badge color="gray" size="sm">Archiviert</Badge>
                                )}
                            </Group>
                            <Text c="dimmed" size="sm">
                                Zuletzt bearbeitet: {formatDate(note.updatedAt)}
                            </Text>
                        </div>
                    </Group>
                    <Group>
                        <Button
                            leftSection={<IconEdit size={18} />}
                            onClick={handleEdit}
                        >
                            Bearbeiten
                        </Button>
                        <Menu shadow="md" width={180} position="bottom-end">
                            <Menu.Target>
                                <ActionIcon variant="subtle" size="lg">
                                    <IconDotsVertical size={20} />
                                </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                                {!note.isArchived && (
                                    <Menu.Item
                                        leftSection={note.isPinned ? <IconPinnedOff size={16} /> : <IconPin size={16} />}
                                        onClick={handleTogglePin}
                                    >
                                        {note.isPinned ? 'Lösen' : 'Anpinnen'}
                                    </Menu.Item>
                                )}
                                {note.isArchived ? (
                                    <Menu.Item
                                        leftSection={<IconArchiveOff size={16} />}
                                        onClick={handleUnarchive}
                                    >
                                        Wiederherstellen
                                    </Menu.Item>
                                ) : (
                                    <Menu.Item
                                        leftSection={<IconArchive size={16} />}
                                        onClick={handleArchive}
                                    >
                                        Archivieren
                                    </Menu.Item>
                                )}
                                <Menu.Divider />
                                <Menu.Item
                                    leftSection={<IconTrash size={16} />}
                                    color="red"
                                    onClick={handleDelete}
                                >
                                    Löschen
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </Group>
                </Group>

                {/* Tags */}
                {note.tags.length > 0 && (
                    <Group gap="xs">
                        {note.tags.map(tag => (
                            <Badge key={tag} variant="light">
                                {tag}
                            </Badge>
                        ))}
                    </Group>
                )}

                {/* Content */}
                <Card
                    withBorder
                    padding="xl"
                    style={{ borderLeftWidth: 4, borderLeftColor: note.color }}
                >
                    {note.content ? (
                        <RichTextViewer content={note.content} />
                    ) : (
                        <Text c="dimmed" fs="italic">
                            Diese Notiz hat keinen Inhalt.
                        </Text>
                    )}
                </Card>
            </Stack>
        </Container>
    );
}
