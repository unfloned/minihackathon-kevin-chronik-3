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
    Paper,
    ThemeIcon,
} from '@mantine/core';
import { IconArrowLeft, IconDeviceFloppy, IconMicrophone } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { useRequest, useMutation } from '../../../hooks';
import { NoteRichTextEditor } from '../../../components/RichTextEditor';
import { VoiceRecorder, VoiceInputButton } from '../../../components/VoiceRecorder';
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
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditing = id && id !== 'new';

    const [form, setForm] = useState<NoteForm>(defaultForm);
    const [showVoicePanel, setShowVoicePanel] = useState(false);

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
                title: t('common.error'),
                message: t('notes.enterTitle'),
                color: 'red',
            });
            return;
        }

        if (isEditing) {
            await updateNote({ id: id!, data: form });
            notifications.show({
                title: t('common.success'),
                message: t('notes.noteUpdated'),
                color: 'green',
            });
        } else {
            const result = await createNote(form);
            if (result) {
                notifications.show({
                    title: t('common.success'),
                    message: t('notes.noteCreated'),
                    color: 'green',
                });
            }
        }
        navigate('/app/notes');
    };

    const handleVoiceTranscript = (transcript: string) => {
        // Append voice transcript to content
        const newContent = form.content
            ? `${form.content}<p>${transcript}</p>`
            : `<p>${transcript}</p>`;
        setForm({ ...form, content: newContent });
        setShowVoicePanel(false);
    };

    const handleTitleVoice = (text: string) => {
        setForm({ ...form, title: form.title ? `${form.title} ${text}` : text });
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
                                {isEditing ? t('notes.editNote') : t('notes.newNote')}
                            </Title>
                            <Text c="dimmed" size="sm">
                                {isEditing ? t('notes.editDescription') : t('notes.createDescription')}
                            </Text>
                        </div>
                    </Group>
                    <Button
                        leftSection={<IconDeviceFloppy size={18} />}
                        onClick={handleSave}
                        loading={creating || updating}
                    >
                        {t('common.save')}
                    </Button>
                </Group>

                {/* Voice Note Panel */}
                {!isEditing && (
                    <Paper withBorder p="md" radius="md" bg="var(--mantine-color-blue-light)">
                        <Group justify="space-between" align="center">
                            <Group gap="sm">
                                <ThemeIcon size="lg" variant="light" color="blue" radius="xl">
                                    <IconMicrophone size={20} />
                                </ThemeIcon>
                                <div>
                                    <Text fw={500}>{t('voice.voiceNote')}</Text>
                                    <Text size="xs" c="dimmed">{t('voice.voiceNoteHint')}</Text>
                                </div>
                            </Group>
                            {!showVoicePanel && (
                                <Button
                                    variant="filled"
                                    color="blue"
                                    leftSection={<IconMicrophone size={16} />}
                                    onClick={() => setShowVoicePanel(true)}
                                >
                                    {t('voice.startRecording')}
                                </Button>
                            )}
                        </Group>
                        {showVoicePanel && (
                            <Stack mt="md">
                                <VoiceRecorder
                                    onTranscriptComplete={handleVoiceTranscript}
                                    onCancel={() => setShowVoicePanel(false)}
                                    placeholder={t('voice.speakNote')}
                                    autoStart
                                />
                            </Stack>
                        )}
                    </Paper>
                )}

                {/* Form */}
                <Card withBorder>
                    <Stack gap="md">
                        <Group gap="xs" align="flex-end">
                            <TextInput
                                label={t('common.title')}
                                placeholder={t('notes.titlePlaceholder')}
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.currentTarget.value })}
                                required
                                size="md"
                                style={{ flex: 1 }}
                            />
                            <VoiceInputButton onTranscript={handleTitleVoice} size="lg" />
                        </Group>

                        <div>
                            <Group justify="space-between" mb={4}>
                                <Text size="sm" fw={500}>
                                    {t('common.content')}
                                </Text>
                            </Group>
                            <NoteRichTextEditor
                                content={form.content}
                                onChange={(content) => setForm({ ...form, content })}
                                placeholder={t('notes.contentPlaceholder')}
                            />
                        </div>

                        <Group grow>
                            <TagsInput
                                label={t('common.tags')}
                                placeholder={t('notes.tagsPlaceholder')}
                                value={form.tags}
                                onChange={(tags) => setForm({ ...form, tags })}
                            />

                            <ColorInput
                                label={t('common.color')}
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
