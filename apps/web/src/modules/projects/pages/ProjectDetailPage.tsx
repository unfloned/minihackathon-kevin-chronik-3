import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Title,
    Text,
    Group,
    Stack,
    Button,
    ActionIcon,
    Badge,
    Paper,
    Progress,
    Checkbox,
    ThemeIcon,
    TextInput,
    Textarea,
    Select,
    Menu,
    Skeleton,
    Card,
    SimpleGrid,
    Modal,
    ColorInput,
} from '@mantine/core';
import { DateInput, DateValue } from '@mantine/dates';

// Helper to convert Mantine v8 DateValue to Date
const toDateOrNull = (value: DateValue): Date | null => {
    if (!value) return null;
    if (value instanceof Date) return value;
    return new Date(value);
};
import { useDisclosure } from '@mantine/hooks';
import {
    IconArrowLeft,
    IconPlus,
    IconTrash,
    IconEdit,
    IconCalendar,
    IconPlayerPlay,
    IconPlayerPause,
    IconCheck,
    IconX,
    IconTarget,
    IconFlag,
    IconDotsVertical,
    IconArchive,
    IconClock,
    IconChecklist,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useRequest, useMutation, useConfetti } from '../../../hooks';

type ProjectType = 'project' | 'goal';
type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
type TaskPriority = 'low' | 'medium' | 'high';

interface ProjectTask {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    dueDate?: string;
    priority: TaskPriority;
    order: number;
}

interface Milestone {
    id: string;
    title: string;
    description?: string;
    targetDate: string;
    completed: boolean;
    completedAt?: string;
}

interface Project {
    id: string;
    name: string;
    description: string;
    type: ProjectType;
    status: ProjectStatus;
    progress: number;
    startDate?: string;
    targetDate?: string;
    completedAt?: string;
    tasks: ProjectTask[];
    milestones: Milestone[];
    category: string;
    tags: string[];
    color: string;
    isArchived: boolean;
    createdAt: string;
    updatedAt: string;
}

const statusOptions = [
    { value: 'planning', label: 'Planung', icon: IconCalendar, color: 'gray' },
    { value: 'active', label: 'Aktiv', icon: IconPlayerPlay, color: 'blue' },
    { value: 'on_hold', label: 'Pausiert', icon: IconPlayerPause, color: 'yellow' },
    { value: 'completed', label: 'Abgeschlossen', icon: IconCheck, color: 'green' },
    { value: 'cancelled', label: 'Abgebrochen', icon: IconX, color: 'red' },
];

const priorityOptions = [
    { value: 'low', label: 'Niedrig', color: 'gray' },
    { value: 'medium', label: 'Mittel', color: 'yellow' },
    { value: 'high', label: 'Hoch', color: 'red' },
];

export default function ProjectDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const confetti = useConfetti();
    const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);

    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('medium');
    const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
    const [newMilestoneDate, setNewMilestoneDate] = useState<Date | null>(null);

    const [editForm, setEditForm] = useState({
        name: '',
        description: '',
        color: '#228be6',
        targetDate: null as Date | null,
    });

    const { data: project, isLoading, refetch } = useRequest<Project>(`/projects/${id}`);

    useEffect(() => {
        if (project) {
            setEditForm({
                name: project.name,
                description: project.description,
                color: project.color,
                targetDate: project.targetDate ? new Date(project.targetDate) : null,
            });
        }
    }, [project]);

    const { mutate: updateProject } = useMutation<Project, Partial<Project>>(
        `/projects/${id}`,
        { method: 'PATCH' }
    );

    const { mutate: deleteProject } = useMutation<void, void>(
        `/projects/${id}`,
        { method: 'DELETE' }
    );

    const { mutate: archiveProject } = useMutation<Project, void>(
        `/projects/${id}/archive`,
        { method: 'POST' }
    );

    const { mutate: addTask } = useMutation<Project, { title: string; priority: TaskPriority }>(
        `/projects/${id}/tasks`,
        { method: 'POST' }
    );

    const { mutate: toggleTask } = useMutation<Project, { taskId: string }>(
        (vars) => `/projects/${id}/tasks/${vars.taskId}/toggle`,
        { method: 'POST' }
    );

    const { mutate: deleteTask } = useMutation<Project, { taskId: string }>(
        (vars) => `/projects/${id}/tasks/${vars.taskId}`,
        { method: 'DELETE' }
    );

    const { mutate: addMilestone } = useMutation<Project, { title: string; targetDate: string }>(
        `/projects/${id}/milestones`,
        { method: 'POST' }
    );

    const { mutate: toggleMilestone } = useMutation<Project, { milestoneId: string }>(
        (vars) => `/projects/${id}/milestones/${vars.milestoneId}/toggle`,
        { method: 'POST' }
    );

    const { mutate: deleteMilestone } = useMutation<Project, { milestoneId: string }>(
        (vars) => `/projects/${id}/milestones/${vars.milestoneId}`,
        { method: 'DELETE' }
    );

    const handleStatusChange = async (status: ProjectStatus) => {
        await updateProject({ status });
        refetch();
        notifications.show({
            title: 'Status aktualisiert',
            message: `Status auf "${statusOptions.find(s => s.value === status)?.label}" geändert`,
            color: 'green',
        });
    };

    const handleSaveEdit = async () => {
        await updateProject({
            name: editForm.name,
            description: editForm.description,
            color: editForm.color,
            targetDate: editForm.targetDate?.toISOString(),
        });
        closeEditModal();
        refetch();
        notifications.show({ title: 'Gespeichert', message: 'Projekt aktualisiert', color: 'green' });
    };

    const handleDelete = async () => {
        if (!confirm('Möchtest du dieses Projekt wirklich löschen?')) return;
        await deleteProject();
        notifications.show({ title: 'Gelöscht', message: 'Projekt wurde gelöscht', color: 'green' });
        navigate('/app/projects');
    };

    const handleArchive = async () => {
        await archiveProject();
        notifications.show({ title: 'Archiviert', message: 'Projekt wurde archiviert', color: 'green' });
        navigate('/app/projects');
    };

    const handleAddTask = async () => {
        if (!newTaskTitle.trim()) return;
        await addTask({ title: newTaskTitle, priority: newTaskPriority });
        setNewTaskTitle('');
        setNewTaskPriority('medium');
        refetch();
    };

    const handleToggleTask = async (taskId: string) => {
        // Check if task is being completed (not unchecked)
        const task = project?.tasks.find(t => t.id === taskId);
        const isCompleting = task && !task.completed;

        await toggleTask({ taskId });

        // Trigger confetti only when completing a task
        if (isCompleting) {
            confetti.fire();
        }

        refetch();
    };

    const handleDeleteTask = async (taskId: string) => {
        await deleteTask({ taskId });
        refetch();
    };

    const handleAddMilestone = async () => {
        if (!newMilestoneTitle.trim() || !newMilestoneDate) return;
        await addMilestone({ title: newMilestoneTitle, targetDate: newMilestoneDate.toISOString() });
        setNewMilestoneTitle('');
        setNewMilestoneDate(null);
        refetch();
    };

    const handleToggleMilestone = async (milestoneId: string) => {
        // Check if milestone is being completed (not unchecked)
        const milestone = project?.milestones.find(m => m.id === milestoneId);
        const isCompleting = milestone && !milestone.completed;

        await toggleMilestone({ milestoneId });

        // Trigger bigger confetti for milestone completion
        if (isCompleting) {
            confetti.achievementUnlock();
        }

        refetch();
    };

    const handleDeleteMilestone = async (milestoneId: string) => {
        await deleteMilestone({ milestoneId });
        refetch();
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('de-DE', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    const getStatusOption = (status: ProjectStatus) => statusOptions.find(s => s.value === status);

    if (isLoading) {
        return (
            <Container size="lg" py="xl">
                <Stack gap="lg">
                    <Skeleton height={40} width={200} />
                    <Skeleton height={200} />
                    <SimpleGrid cols={2}>
                        <Skeleton height={300} />
                        <Skeleton height={300} />
                    </SimpleGrid>
                </Stack>
            </Container>
        );
    }

    if (!project) {
        return (
            <Container size="lg" py="xl">
                <Paper withBorder p="xl" ta="center">
                    <Text c="dimmed">Projekt nicht gefunden</Text>
                    <Button mt="md" onClick={() => navigate('/app/projects')}>
                        Zurück zur Übersicht
                    </Button>
                </Paper>
            </Container>
        );
    }

    const currentStatus = getStatusOption(project.status);
    const StatusIcon = currentStatus?.icon || IconTarget;
    const completedTasks = project.tasks.filter(t => t.completed).length;
    const completedMilestones = project.milestones.filter(m => m.completed).length;

    return (
        <Container size="lg" py="xl">
            <Stack gap="xl">
                {/* Header */}
                <Group justify="space-between" align="flex-start">
                    <Group>
                        <ActionIcon
                            variant="subtle"
                            size="lg"
                            onClick={() => navigate('/app/projects')}
                        >
                            <IconArrowLeft size={20} />
                        </ActionIcon>
                        <div>
                            <Group gap="sm">
                                <ThemeIcon size="lg" color={project.color} variant="light">
                                    {project.type === 'goal' ? <IconTarget size={20} /> : <IconFlag size={20} />}
                                </ThemeIcon>
                                <Title order={2}>{project.name}</Title>
                            </Group>
                            {project.description && (
                                <Text c="dimmed" mt={4}>{project.description}</Text>
                            )}
                        </div>
                    </Group>

                    <Group>
                        <Menu shadow="md" position="bottom-end">
                            <Menu.Target>
                                <Button variant="light" rightSection={<IconDotsVertical size={16} />}>
                                    Aktionen
                                </Button>
                            </Menu.Target>
                            <Menu.Dropdown>
                                <Menu.Item leftSection={<IconEdit size={16} />} onClick={openEditModal}>
                                    Bearbeiten
                                </Menu.Item>
                                <Menu.Item leftSection={<IconArchive size={16} />} onClick={handleArchive}>
                                    Archivieren
                                </Menu.Item>
                                <Menu.Divider />
                                <Menu.Item leftSection={<IconTrash size={16} />} color="red" onClick={handleDelete}>
                                    Löschen
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </Group>
                </Group>

                {/* Status & Progress */}
                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
                    <Card withBorder padding="lg">
                        <Group justify="space-between" mb="md">
                            <Text size="sm" fw={500} c="dimmed">Status</Text>
                            <Badge color={currentStatus?.color} leftSection={<StatusIcon size={12} />}>
                                {currentStatus?.label}
                            </Badge>
                        </Group>
                        <Select
                            data={statusOptions.map(s => ({ value: s.value, label: s.label }))}
                            value={project.status}
                            onChange={(value) => value && handleStatusChange(value as ProjectStatus)}
                            size="sm"
                        />
                    </Card>

                    <Card withBorder padding="lg">
                        <Group justify="space-between" mb="md">
                            <Text size="sm" fw={500} c="dimmed">Fortschritt</Text>
                            <Text fw={600}>{project.progress}%</Text>
                        </Group>
                        <Progress value={project.progress} size="lg" color={project.color} radius="xl" />
                        <Group justify="space-between" mt="xs">
                            <Text size="xs" c="dimmed">
                                <IconChecklist size={12} style={{ marginRight: 4 }} />
                                {completedTasks}/{project.tasks.length} Tasks
                            </Text>
                            <Text size="xs" c="dimmed">
                                <IconTarget size={12} style={{ marginRight: 4 }} />
                                {completedMilestones}/{project.milestones.length} Meilensteine
                            </Text>
                        </Group>
                    </Card>

                    <Card withBorder padding="lg">
                        <Text size="sm" fw={500} c="dimmed" mb="md">Zeitplan</Text>
                        <Stack gap="xs">
                            <Group justify="space-between">
                                <Text size="sm" c="dimmed">Erstellt</Text>
                                <Text size="sm">{formatDate(project.createdAt)}</Text>
                            </Group>
                            {project.targetDate && (
                                <Group justify="space-between">
                                    <Text size="sm" c="dimmed">Zieldatum</Text>
                                    <Text size="sm" fw={500}>{formatDate(project.targetDate)}</Text>
                                </Group>
                            )}
                            {project.completedAt && (
                                <Group justify="space-between">
                                    <Text size="sm" c="dimmed">Abgeschlossen</Text>
                                    <Text size="sm" c="green">{formatDate(project.completedAt)}</Text>
                                </Group>
                            )}
                        </Stack>
                    </Card>
                </SimpleGrid>

                {/* Tasks & Milestones */}
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
                    {/* Tasks */}
                    <Card withBorder padding="lg">
                        <Group justify="space-between" mb="lg">
                            <Group gap="xs">
                                <ThemeIcon size="sm" variant="light" color="blue">
                                    <IconChecklist size={14} />
                                </ThemeIcon>
                                <Text fw={600}>Aufgaben</Text>
                            </Group>
                            <Badge variant="light">{completedTasks}/{project.tasks.length}</Badge>
                        </Group>

                        {/* Add Task */}
                        <Paper withBorder p="sm" mb="md">
                            <Group>
                                <TextInput
                                    placeholder="Neue Aufgabe..."
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.currentTarget.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                                    style={{ flex: 1 }}
                                    size="sm"
                                />
                                <Select
                                    data={priorityOptions}
                                    value={newTaskPriority}
                                    onChange={(v) => setNewTaskPriority((v as TaskPriority) || 'medium')}
                                    size="sm"
                                    w={100}
                                />
                                <ActionIcon
                                    variant="filled"
                                    color="blue"
                                    onClick={handleAddTask}
                                    disabled={!newTaskTitle.trim()}
                                >
                                    <IconPlus size={16} />
                                </ActionIcon>
                            </Group>
                        </Paper>

                        {/* Task List */}
                        <Stack gap="xs" style={{ maxHeight: 400, overflowY: 'auto' }}>
                            {project.tasks.length === 0 ? (
                                <Text c="dimmed" ta="center" py="xl" size="sm">
                                    Noch keine Aufgaben vorhanden
                                </Text>
                            ) : (
                                project.tasks
                                    .sort((a, b) => {
                                        if (a.completed !== b.completed) return a.completed ? 1 : -1;
                                        return a.order - b.order;
                                    })
                                    .map(task => (
                                        <Paper key={task.id} withBorder p="sm">
                                            <Group justify="space-between" wrap="nowrap">
                                                <Checkbox
                                                    checked={task.completed}
                                                    onChange={() => handleToggleTask(task.id)}
                                                    label={
                                                        <Text
                                                            size="sm"
                                                            td={task.completed ? 'line-through' : undefined}
                                                            c={task.completed ? 'dimmed' : undefined}
                                                        >
                                                            {task.title}
                                                        </Text>
                                                    }
                                                />
                                                <Group gap="xs">
                                                    <Badge
                                                        size="xs"
                                                        variant="dot"
                                                        color={priorityOptions.find(p => p.value === task.priority)?.color}
                                                    >
                                                        {priorityOptions.find(p => p.value === task.priority)?.label}
                                                    </Badge>
                                                    <ActionIcon
                                                        variant="subtle"
                                                        color="red"
                                                        size="sm"
                                                        onClick={() => handleDeleteTask(task.id)}
                                                    >
                                                        <IconTrash size={14} />
                                                    </ActionIcon>
                                                </Group>
                                            </Group>
                                        </Paper>
                                    ))
                            )}
                        </Stack>
                    </Card>

                    {/* Milestones */}
                    <Card withBorder padding="lg">
                        <Group justify="space-between" mb="lg">
                            <Group gap="xs">
                                <ThemeIcon size="sm" variant="light" color="orange">
                                    <IconTarget size={14} />
                                </ThemeIcon>
                                <Text fw={600}>Meilensteine</Text>
                            </Group>
                            <Badge variant="light" color="orange">{completedMilestones}/{project.milestones.length}</Badge>
                        </Group>

                        {/* Add Milestone */}
                        <Paper withBorder p="sm" mb="md">
                            <Stack gap="xs">
                                <TextInput
                                    placeholder="Neuer Meilenstein..."
                                    value={newMilestoneTitle}
                                    onChange={(e) => setNewMilestoneTitle(e.currentTarget.value)}
                                    size="sm"
                                />
                                <Group>
                                    <DateInput
                                        placeholder="Zieldatum"
                                        value={newMilestoneDate}
                                        onChange={(v) => setNewMilestoneDate(toDateOrNull(v))}
                                        size="sm"
                                        style={{ flex: 1 }}
                                        leftSection={<IconCalendar size={14} />}
                                    />
                                    <ActionIcon
                                        variant="filled"
                                        color="orange"
                                        onClick={handleAddMilestone}
                                        disabled={!newMilestoneTitle.trim() || !newMilestoneDate}
                                    >
                                        <IconPlus size={16} />
                                    </ActionIcon>
                                </Group>
                            </Stack>
                        </Paper>

                        {/* Milestone List */}
                        <Stack gap="xs" style={{ maxHeight: 400, overflowY: 'auto' }}>
                            {project.milestones.length === 0 ? (
                                <Text c="dimmed" ta="center" py="xl" size="sm">
                                    Noch keine Meilensteine vorhanden
                                </Text>
                            ) : (
                                project.milestones
                                    .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime())
                                    .map(milestone => {
                                        const isOverdue = !milestone.completed && new Date(milestone.targetDate) < new Date();
                                        return (
                                            <Paper key={milestone.id} withBorder p="sm">
                                                <Group justify="space-between" wrap="nowrap">
                                                    <Checkbox
                                                        checked={milestone.completed}
                                                        onChange={() => handleToggleMilestone(milestone.id)}
                                                        label={
                                                            <Stack gap={0}>
                                                                <Text
                                                                    size="sm"
                                                                    td={milestone.completed ? 'line-through' : undefined}
                                                                    c={milestone.completed ? 'dimmed' : undefined}
                                                                >
                                                                    {milestone.title}
                                                                </Text>
                                                                <Group gap={4}>
                                                                    <IconClock size={12} />
                                                                    <Text
                                                                        size="xs"
                                                                        c={isOverdue ? 'red' : 'dimmed'}
                                                                        fw={isOverdue ? 500 : undefined}
                                                                    >
                                                                        {formatDate(milestone.targetDate)}
                                                                    </Text>
                                                                </Group>
                                                            </Stack>
                                                        }
                                                    />
                                                    <ActionIcon
                                                        variant="subtle"
                                                        color="red"
                                                        size="sm"
                                                        onClick={() => handleDeleteMilestone(milestone.id)}
                                                    >
                                                        <IconTrash size={14} />
                                                    </ActionIcon>
                                                </Group>
                                            </Paper>
                                        );
                                    })
                            )}
                        </Stack>
                    </Card>
                </SimpleGrid>
            </Stack>

            {/* Edit Modal */}
            <Modal opened={editModalOpened} onClose={closeEditModal} title="Projekt bearbeiten" size="md">
                <Stack>
                    <TextInput
                        label="Name"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.currentTarget.value })}
                        required
                    />
                    <Textarea
                        label="Beschreibung"
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.currentTarget.value })}
                        minRows={2}
                    />
                    <DateInput
                        label="Zieldatum"
                        value={editForm.targetDate}
                        onChange={(date) => setEditForm({ ...editForm, targetDate: toDateOrNull(date) })}
                        clearable
                    />
                    <ColorInput
                        label="Farbe"
                        value={editForm.color}
                        onChange={(color) => setEditForm({ ...editForm, color })}
                        swatches={['#228be6', '#40c057', '#fab005', '#fd7e14', '#fa5252', '#be4bdb', '#7950f2', '#15aabf']}
                    />
                    <Button onClick={handleSaveEdit} fullWidth mt="md">
                        Speichern
                    </Button>
                </Stack>
            </Modal>
        </Container>
    );
}
