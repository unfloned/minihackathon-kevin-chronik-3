import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Text,
    SimpleGrid,
    Card,
    Group,
    Stack,
    Button,
    ActionIcon,
    Badge,
    Modal,
    TextInput,
    Textarea,
    Select,
    ColorInput,
    Menu,
    Paper,
    Skeleton,
    Progress,
    ThemeIcon,
    SegmentedControl,
    Container,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import {
    IconPlus,
    IconSearch,
    IconDotsVertical,
    IconEdit,
    IconTrash,
    IconArchive,
    IconArchiveOff,
    IconTarget,
    IconFlag,
    IconCalendar,
    IconPlayerPlay,
    IconPlayerPause,
    IconCheck,
    IconX,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useRequest, useMutation } from '../../../hooks';
import { PageTitle } from '../../../components/PageTitle';
import type { ProjectSimple, ProjectType, ProjectStatus } from '@ycmm/core';

// Alias for component usage
type Project = ProjectSimple;

interface CreateProjectForm {
    name: string;
    description: string;
    type: ProjectType;
    color: string;
    targetDate?: Date;
}

const defaultForm: CreateProjectForm = {
    name: '',
    description: '',
    type: 'project',
    color: '#228be6',
};

const projectTypeOptions = [
    { value: 'project', label: 'Projekt' },
    { value: 'goal', label: 'Ziel' },
];

const statusOptions = [
    { value: 'planning', label: 'Planung' },
    { value: 'active', label: 'Aktiv' },
    { value: 'on_hold', label: 'Pausiert' },
    { value: 'completed', label: 'Abgeschlossen' },
    { value: 'cancelled', label: 'Abgebrochen' },
];

const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
        case 'planning': return 'gray';
        case 'active': return 'blue';
        case 'on_hold': return 'yellow';
        case 'completed': return 'green';
        case 'cancelled': return 'red';
    }
};

const getStatusIcon = (status: ProjectStatus) => {
    switch (status) {
        case 'planning': return IconCalendar;
        case 'active': return IconPlayerPlay;
        case 'on_hold': return IconPlayerPause;
        case 'completed': return IconCheck;
        case 'cancelled': return IconX;
    }
};

export default function ProjectsPage() {
    const navigate = useNavigate();
    const [opened, { open, close }] = useDisclosure(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [form, setForm] = useState<CreateProjectForm>(defaultForm);
    const [searchQuery, setSearchQuery] = useState('');
    const [view, setView] = useState<'active' | 'archived'>('active');
    const [filterType, setFilterType] = useState<ProjectType | 'all'>('all');

    const { data: projects, isLoading, refetch } = useRequest<Project[]>('/projects');
    const { data: archivedProjects, refetch: refetchArchived } = useRequest<Project[]>('/projects/archived');

    const { mutate: createProject, isLoading: creating } = useMutation<Project, CreateProjectForm>(
        '/projects',
        { method: 'POST' }
    );

    const { mutate: updateProject } = useMutation<Project, { id: string; data: Partial<Project> }>(
        (vars) => `/projects/${vars.id}`,
        { method: 'PATCH' }
    );

    const { mutate: deleteProject } = useMutation<void, { id: string }>(
        (vars) => `/projects/${vars.id}`,
        { method: 'DELETE' }
    );

    const { mutate: archiveProject } = useMutation<Project, { id: string }>(
        (vars) => `/projects/${vars.id}/archive`,
        { method: 'POST' }
    );

    const { mutate: unarchiveProject } = useMutation<Project, { id: string }>(
        (vars) => `/projects/${vars.id}/unarchive`,
        { method: 'POST' }
    );

    const handleOpenCreate = () => {
        setEditingProject(null);
        setForm(defaultForm);
        open();
    };

    const handleOpenEdit = (project: Project) => {
        setEditingProject(project);
        setForm({
            name: project.name,
            description: project.description,
            type: project.type,
            color: project.color,
            targetDate: project.targetDate ? new Date(project.targetDate) : undefined,
        });
        open();
    };

    const handleSubmit = async () => {
        if (!form.name.trim()) {
            notifications.show({
                title: 'Fehler',
                message: 'Bitte gib einen Namen ein',
                color: 'red',
            });
            return;
        }

        try {
            if (editingProject) {
                await updateProject({
                    id: editingProject.id,
                    data: {
                        name: form.name,
                        description: form.description,
                        type: form.type,
                        color: form.color,
                        targetDate: form.targetDate?.toISOString(),
                    },
                });
                notifications.show({
                    title: 'Erfolg',
                    message: 'Projekt wurde aktualisiert',
                    color: 'green',
                });
            } else {
                await createProject(form);
                notifications.show({
                    title: 'Erfolg',
                    message: 'Projekt wurde erstellt',
                    color: 'green',
                });
            }
            close();
            setForm(defaultForm);
            refetch();
            refetchArchived();
        } catch (error) {
            notifications.show({
                title: 'Fehler',
                message: 'Es ist ein Fehler aufgetreten',
                color: 'red',
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bist du sicher, dass du dieses Projekt löschen möchtest?')) {
            return;
        }

        try {
            await deleteProject({ id });
            notifications.show({
                title: 'Erfolg',
                message: 'Projekt wurde gelöscht',
                color: 'green',
            });
            refetch();
            refetchArchived();
        } catch (error) {
            notifications.show({
                title: 'Fehler',
                message: 'Es ist ein Fehler aufgetreten',
                color: 'red',
            });
        }
    };

    const handleArchive = async (id: string) => {
        try {
            await archiveProject({ id });
            notifications.show({
                title: 'Erfolg',
                message: 'Projekt wurde archiviert',
                color: 'green',
            });
            refetch();
            refetchArchived();
        } catch (error) {
            notifications.show({
                title: 'Fehler',
                message: 'Es ist ein Fehler aufgetreten',
                color: 'red',
            });
        }
    };

    const handleUnarchive = async (id: string) => {
        try {
            await unarchiveProject({ id });
            notifications.show({
                title: 'Erfolg',
                message: 'Projekt wurde wiederhergestellt',
                color: 'green',
            });
            refetch();
            refetchArchived();
        } catch (error) {
            notifications.show({
                title: 'Fehler',
                message: 'Es ist ein Fehler aufgetreten',
                color: 'red',
            });
        }
    };

    const displayProjects = view === 'active' ? projects : archivedProjects;

    const filteredProjects = displayProjects?.filter((project) => {
        const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'all' || project.type === filterType;
        return matchesSearch && matchesType;
    }) || [];

    return (
        <Container size="xl" py="xl">
            <Stack gap="lg">
                {/* Header */}
                <Group justify="space-between">
                    <PageTitle title="Projekte & Ziele" subtitle="Verwalte deine Projekte und Ziele" />
                    <Button leftSection={<IconPlus size={16} />} onClick={handleOpenCreate}>
                        Neues Projekt
                    </Button>
                </Group>

                {/* Filters */}
                <Group>
                    <SegmentedControl
                        value={view}
                        onChange={(value) => setView(value as 'active' | 'archived')}
                        data={[
                            { label: 'Aktiv', value: 'active' },
                            { label: 'Archiviert', value: 'archived' },
                        ]}
                    />
                    <SegmentedControl
                        value={filterType}
                        onChange={(value) => setFilterType(value as ProjectType | 'all')}
                        data={[
                            { label: 'Alle', value: 'all' },
                            { label: 'Projekte', value: 'project' },
                            { label: 'Ziele', value: 'goal' },
                        ]}
                    />
                </Group>

                <TextInput
                    placeholder="Projekte suchen..."
                    leftSection={<IconSearch size={16} />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />

                {isLoading ? (
                    <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} height={200} />
                        ))}
                    </SimpleGrid>
                ) : filteredProjects.length === 0 ? (
                    <Paper p="xl" withBorder>
                        <Stack align="center" gap="md">
                            <ThemeIcon size={60} radius="xl" variant="light">
                                <IconTarget size={30} />
                            </ThemeIcon>
                            <Text size="lg" fw={500}>
                                Keine Projekte gefunden
                            </Text>
                            <Text c="dimmed" size="sm">
                                {view === 'active'
                                    ? 'Erstelle dein erstes Projekt, um loszulegen'
                                    : 'Du hast noch keine archivierten Projekte'}
                            </Text>
                        </Stack>
                    </Paper>
                ) : (
                    <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
                        {filteredProjects.map((project) => {
                            const StatusIcon = getStatusIcon(project.status);
                            const statusLabel = statusOptions.find((opt) => opt.value === project.status)?.label;

                            return (
                                <Card
                                    key={project.id}
                                    shadow="sm"
                                    padding="lg"
                                    radius="md"
                                    withBorder
                                    style={{ cursor: 'pointer', position: 'relative' }}
                                    onClick={() => navigate(`/app/projects/${project.id}`)}
                                >
                                    <Stack gap="sm">
                                        <Group justify="space-between" wrap="nowrap">
                                            <Group gap="xs" wrap="nowrap">
                                                <ThemeIcon
                                                    size="lg"
                                                    radius="md"
                                                    variant="light"
                                                    color={project.color}
                                                >
                                                    {project.type === 'project' ? (
                                                        <IconTarget size={20} />
                                                    ) : (
                                                        <IconFlag size={20} />
                                                    )}
                                                </ThemeIcon>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <Text fw={500} lineClamp={1}>
                                                        {project.name}
                                                    </Text>
                                                </div>
                                            </Group>
                                            <Menu position="bottom-end" withArrow>
                                                <Menu.Target>
                                                    <ActionIcon
                                                        variant="subtle"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <IconDotsVertical size={16} />
                                                    </ActionIcon>
                                                </Menu.Target>
                                                <Menu.Dropdown>
                                                    <Menu.Item
                                                        leftSection={<IconEdit size={16} />}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleOpenEdit(project);
                                                        }}
                                                    >
                                                        Bearbeiten
                                                    </Menu.Item>
                                                    {view === 'active' ? (
                                                        <Menu.Item
                                                            leftSection={<IconArchive size={16} />}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleArchive(project.id);
                                                            }}
                                                        >
                                                            Archivieren
                                                        </Menu.Item>
                                                    ) : (
                                                        <Menu.Item
                                                            leftSection={<IconArchiveOff size={16} />}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleUnarchive(project.id);
                                                            }}
                                                        >
                                                            Wiederherstellen
                                                        </Menu.Item>
                                                    )}
                                                    <Menu.Divider />
                                                    <Menu.Item
                                                        color="red"
                                                        leftSection={<IconTrash size={16} />}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(project.id);
                                                        }}
                                                    >
                                                        Löschen
                                                    </Menu.Item>
                                                </Menu.Dropdown>
                                            </Menu>
                                        </Group>

                                        <Text size="sm" c="dimmed" lineClamp={2}>
                                            {project.description || 'Keine Beschreibung'}
                                        </Text>

                                        <Group gap="xs">
                                            <Badge
                                                color={getStatusColor(project.status)}
                                                variant="light"
                                                leftSection={
                                                    <ThemeIcon
                                                        size="xs"
                                                        color={getStatusColor(project.status)}
                                                        variant="transparent"
                                                    >
                                                        <StatusIcon size={12} />
                                                    </ThemeIcon>
                                                }
                                            >
                                                {statusLabel}
                                            </Badge>
                                            <Badge variant="light" color={project.color}>
                                                {project.type === 'project' ? 'Projekt' : 'Ziel'}
                                            </Badge>
                                        </Group>

                                        <Stack gap="xs">
                                            <Group justify="space-between">
                                                <Text size="xs" c="dimmed">
                                                    Fortschritt
                                                </Text>
                                                <Text size="xs" fw={500}>
                                                    {project.progress}%
                                                </Text>
                                            </Group>
                                            <Progress value={project.progress} color={project.color} />
                                        </Stack>

                                        {project.targetDate && (
                                            <Group gap="xs">
                                                <IconCalendar size={14} stroke={1.5} />
                                                <Text size="xs" c="dimmed">
                                                    Ziel: {new Date(project.targetDate).toLocaleDateString('de-DE')}
                                                </Text>
                                            </Group>
                                        )}
                                    </Stack>
                                </Card>
                            );
                        })}
                    </SimpleGrid>
                )}

                <Modal
                opened={opened}
                onClose={close}
                title={editingProject ? 'Projekt bearbeiten' : 'Neues Projekt'}
                size="md"
            >
                <Stack gap="md">
                    <TextInput
                        label="Name"
                        placeholder="Projektname eingeben"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                    />

                    <Textarea
                        label="Beschreibung"
                        placeholder="Projektbeschreibung eingeben"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        minRows={3}
                    />

                    <Select
                        label="Typ"
                        data={projectTypeOptions}
                        value={form.type}
                        onChange={(value) => setForm({ ...form, type: value as ProjectType })}
                        required
                    />

                    <ColorInput
                        label="Farbe"
                        value={form.color}
                        onChange={(value) => setForm({ ...form, color: value })}
                        format="hex"
                        swatches={[
                            '#228be6',
                            '#40c057',
                            '#fab005',
                            '#fd7e14',
                            '#fa5252',
                            '#e64980',
                            '#be4bdb',
                            '#7950f2',
                        ]}
                    />

                    <DateInput
                        label="Zieldatum"
                        placeholder="Zieldatum auswählen"
                        value={form.targetDate}
                        onChange={(value) => setForm({ ...form, targetDate: value || undefined })}
                        clearable
                    />

                    <Group justify="flex-end" mt="md">
                        <Button variant="subtle" onClick={close}>
                            Abbrechen
                        </Button>
                        <Button onClick={handleSubmit} loading={creating}>
                            {editingProject ? 'Aktualisieren' : 'Erstellen'}
                        </Button>
                    </Group>
                </Stack>
            </Modal>
            </Stack>
        </Container>
    );
}
