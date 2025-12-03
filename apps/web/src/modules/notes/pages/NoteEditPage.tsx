import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Container,
    Title,
    Text,
    Card,
    Group,
    Stack,
    Button,
    TextInput,
    TagsInput,
    ColorInput,
    Skeleton,
    ActionIcon,
} from '@mantine/core';
import { IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useRequest, useMutation } from '../../../hooks';
import { NoteRichTextEditor } from '../../../components/RichTextEditor';
import type { NoteSimple } from '@ycmm/core';

// Alias for component usage
type Note = NoteSimple;

interface NoteForm {
    title: string;
    content: string;
    tags: string[];
    color: string;
}

const defaultForm: NoteForm = {
    title: '',
    content: '',
    tags: [],
    color: '#228be6',
};

export default function NoteEditPage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditing = id && id !== 'new';

    const [form, setForm] = useState<NoteForm>(defaultForm);

    const { data: note, isLoading } = useRequest<Note>(
        isEditing ? `/notes/${id}` : ''
    );

    const { mutate: createNote, isLoading: creating } = useMutation<Note, NoteForm>(
        '/notes',
        { method: 'POST' }
    );

    const { mutate: updateNote, isLoading: updating } = useMutation<Note, { id: string; data: Partial<NoteForm> }>(
        (vars) => `/notes/${vars.id}`,
        { method: 'PATCH' }
    );

    useEffect(() => {
        if (note) {
            setForm({
                title: note.title,
                content: note.content,
                tags: note.tags,
                color: note.color,
            });
        }
    }, [note]);

    const handleSave = async () => {
        if (!form.title.trim()) {
            notifications.show({
                title: 'Fehler',
                message: 'Bitte gib einen Titel ein',
                color: 'red',
            });
            return;
        }

        if (isEditing) {
            await updateNote({ id: id!, data: form });
            notifications.show({
                title: 'Erfolg',
                message: 'Notiz aktualisiert',
                color: 'green',
            });
        } else {
            const result = await createNote(form);
            if (result) {
                notifications.show({
                    title: 'Erfolg',
                    message: 'Notiz erstellt',
                    color: 'green',
                });
            }
        }
        navigate('/app/notes');
    };

    const handleBack = () => {
        navigate('/app/notes');
    };

    if (isEditing && isLoading) {
        return (
            <Container size="xl" py="xl">
                <Stack gap="lg">
                    <Skeleton height={40} width={200} />
                    <Skeleton height={50} />
                    <Skeleton height={300} />
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
                            <Title order={2}>
                                {isEditing ? 'Notiz bearbeiten' : 'Neue Notiz'}
                            </Title>
                            <Text c="dimmed" size="sm">
                                {isEditing ? 'Änderungen an deiner Notiz vornehmen' : 'Erstelle eine neue Notiz'}
                            </Text>
                        </div>
                    </Group>
                    <Button
                        leftSection={<IconDeviceFloppy size={18} />}
                        onClick={handleSave}
                        loading={creating || updating}
                    >
                        Speichern
                    </Button>
                </Group>

                {/* Form */}
                <Card withBorder>
                    <Stack gap="md">
                        <TextInput
                            label="Titel"
                            placeholder="Titel der Notiz"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.currentTarget.value })}
                            required
                            size="md"
                        />

                        <div>
                            <Text size="sm" fw={500} mb={4}>
                                Inhalt
                            </Text>
                            <NoteRichTextEditor
                                content={form.content}
                                onChange={(content) => setForm({ ...form, content })}
                                placeholder="Schreibe deine Notiz..."
                            />
                        </div>

                        <Group grow>
                            <TagsInput
                                label="Tags"
                                placeholder="Tags eingeben und Enter drücken"
                                value={form.tags}
                                onChange={(tags) => setForm({ ...form, tags })}
                            />

                            <ColorInput
                                label="Farbe"
                                value={form.color}
                                onChange={(color) => setForm({ ...form, color })}
                                swatches={[
                                    '#228be6', '#40c057', '#fab005', '#fd7e14',
                                    '#fa5252', '#be4bdb', '#7950f2', '#15aabf',
                                ]}
                            />
                        </Group>
                    </Stack>
                </Card>
            </Stack>
        </Container>
    );
}
