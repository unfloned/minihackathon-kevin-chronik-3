import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
    Table,
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
    IconLayoutGrid,
    IconList,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useRequest, useMutation, useViewMode } from '../../../hooks';
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
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [opened, { open, close }] = useDisclosure(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [form, setForm] = useState<CreateProjectForm>(defaultForm);
    const [searchQuery, setSearchQuery] = useState('');
    const [view, setView] = useState<'active' | 'archived'>('active');
    const [filterType, setFilterType] = useState<ProjectType | 'all'>('all');
    const [globalViewMode, setViewMode] = useViewMode();
    const viewMode = globalViewMode === 'list' || globalViewMode === 'table' ? 'list' : 'grid';

    const projectTypeOptions = [
        { value: 'project', label: 'Projekt' },
        { value: 'goal', label: 'Ziel' },
    ];

    const statusOptions = [
        { value: 'planning', label: t('projects.status.planning') },
        { value: 'active', label: t('projects.status.active') },
        { value: 'on_hold', label: t('projects.status.onHold') },
        { value: 'completed', label: t('projects.status.completed') },
        { value: 'cancelled', label: t('projects.status.cancelled') },
    ];

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
                title: t('common.error'),
                message: t('habits.enterName'),
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
                    title: t('common.success'),
                    message: t('projects.projectUpdated'),
                    color: 'green',
                });
            } else {
                await createProject(form);
                notifications.show({
                    title: t('common.success'),
                    message: t('projects.projectCreated'),
                    color: 'green',
                });
            }
            close();
            setForm(defaultForm);
            refetch();
            refetchArchived();
        } catch (error) {
            notifications.show({
                title: t('common.error'),
                message: t('errors.generic'),
                color: 'red',
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm(t('inventory.deleteConfirm'))) {
            return;
        }

        try {
            await deleteProject({ id });
            notifications.show({
                title: t('common.success'),
                message: t('projects.projectDeleted'),
                color: 'green',
            });
            refetch();
            refetchArchived();
        } catch (error) {
            notifications.show({
                title: t('common.error'),
                message: t('errors.generic'),
                color: 'red',
            });
        }
    };

    const handleArchive = async (id: string) => {
        try {
            await archiveProject({ id });
            notifications.show({
                title: t('common.success'),
                message: t('notes.noteArchived'),
                color: 'green',
            });
            refetch();
            refetchArchived();
        } catch (error) {
            notifications.show({
                title: t('common.error'),
                message: t('errors.generic'),
                color: 'red',
            });
        }
    };

    const handleUnarchive = async (id: string) => {
        try {
            await unarchiveProject({ id });
            notifications.show({
                title: t('common.success'),
                message: t('notes.noteUnarchived'),
                color: 'green',
            });
            refetch();
            refetchArchived();
        } catch (error) {
            notifications.show({
                title: t('common.error'),
                message: t('errors.generic'),
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
                    <PageTitle title={t('projects.title')} subtitle={t('projects.subtitle')} />
                    <Button leftSection={<IconPlus size={16} />} onClick={handleOpenCreate}>
                        {t('projects.newProject')}
                    </Button>
                </Group>

                {/* Filters */}
                <Group>
                    <SegmentedControl
                        value={view}
                        onChange={(value) => setView(value as 'active' | 'archived')}
                        data={[
                            { label: t('common.active'), value: 'active' },
                            { label: t('notes.archived'), value: 'archived' },
                        ]}
                    />
                    <SegmentedControl
                        value={filterType}
                        onChange={(value) => setFilterType(value as ProjectType | 'all')}
                        data={[
                            { label: t('common.all'), value: 'all' },
                            { label: 'Projekte', value: 'project' },
                            { label: 'Ziele', value: 'goal' },
                        ]}
                    />
                </Group>

                <Group>
                    <TextInput
                        placeholder={t('common.search')}
                        leftSection={<IconSearch size={16} />}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ flex: 1 }}
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
                                {t('projects.emptyState')}
                            </Text>
                            <Text c="dimmed" size="sm">
                                {view === 'active'
                                    ? t('projects.createFirst')
                                    : t('notes.noArchivedNotes')}
                            </Text>
                        </Stack>
                    </Paper>
                ) : viewMode === 'grid' ? (
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
                                                        {t('common.edit')}
                                                    </Menu.Item>
                                                    {view === 'active' ? (
                                                        <Menu.Item
                                                            leftSection={<IconArchive size={16} />}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleArchive(project.id);
                                                            }}
                                                        >
                                                            {t('common.archive')}
                                                        </Menu.Item>
                                                    ) : (
                                                        <Menu.Item
                                                            leftSection={<IconArchiveOff size={16} />}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleUnarchive(project.id);
                                                            }}
                                                        >
                                                            {t('common.unarchive')}
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
                                                        {t('common.delete')}
                                                    </Menu.Item>
                                                </Menu.Dropdown>
                                            </Menu>
                                        </Group>

                                        <Text size="sm" c="dimmed" lineClamp={2}>
                                            {project.description || t('common.description')}
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
                                                    {t('common.progress')}
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
                                                    {t('projects.deadline')}: {new Date(project.targetDate).toLocaleDateString('de-DE')}
                                                </Text>
                                            </Group>
                                        )}
                                    </Stack>
                                </Card>
                            );
                        })}
                    </SimpleGrid>
                ) : (
                    <Paper shadow="sm" withBorder radius="md">
                        <Table striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>{t('common.name')}</Table.Th>
                                    <Table.Th>{t('common.type')}</Table.Th>
                                    <Table.Th>{t('common.status')}</Table.Th>
                                    <Table.Th>{t('common.progress')}</Table.Th>
                                    <Table.Th>{t('projects.deadline')}</Table.Th>
                                    <Table.Th>{t('common.actions')}</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {filteredProjects.map((project) => {
                                    const StatusIcon = getStatusIcon(project.status);
                                    const statusLabel = statusOptions.find((opt) => opt.value === project.status)?.label;

                                    return (
                                        <Table.Tr
                                            key={project.id}
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => navigate(`/app/projects/${project.id}`)}
                                        >
                                            <Table.Td>
                                                <Group gap="sm">
                                                    <ThemeIcon
                                                        size="sm"
                                                        radius="md"
                                                        variant="light"
                                                        color={project.color}
                                                    >
                                                        {project.type === 'project' ? (
                                                            <IconTarget size={14} />
                                                        ) : (
                                                            <IconFlag size={14} />
                                                        )}
                                                    </ThemeIcon>
                                                    <Text fw={500} size="sm">{project.name}</Text>
                                                </Group>
                                            </Table.Td>
                                            <Table.Td>
                                                <Badge variant="light" color={project.color} size="sm">
                                                    {project.type === 'project' ? 'Projekt' : 'Ziel'}
                                                </Badge>
                                            </Table.Td>
                                            <Table.Td>
                                                <Badge
                                                    color={getStatusColor(project.status)}
                                                    variant="light"
                                                    size="sm"
                                                    leftSection={<StatusIcon size={12} />}
                                                >
                                                    {statusLabel}
                                                </Badge>
                                            </Table.Td>
                                            <Table.Td>
                                                <Group gap="xs">
                                                    <Progress value={project.progress} color={project.color} size="sm" style={{ width: 80 }} />
                                                    <Text size="xs" fw={500}>{project.progress}%</Text>
                                                </Group>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text size="sm" c="dimmed">
                                                    {project.targetDate
                                                        ? new Date(project.targetDate).toLocaleDateString('de-DE')
                                                        : '-'}
                                                </Text>
                                            </Table.Td>
                                            <Table.Td>
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
                                                            {t('common.edit')}
                                                        </Menu.Item>
                                                        {view === 'active' ? (
                                                            <Menu.Item
                                                                leftSection={<IconArchive size={16} />}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleArchive(project.id);
                                                                }}
                                                            >
                                                                {t('common.archive')}
                                                            </Menu.Item>
                                                        ) : (
                                                            <Menu.Item
                                                                leftSection={<IconArchiveOff size={16} />}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleUnarchive(project.id);
                                                                }}
                                                            >
                                                                {t('common.unarchive')}
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
                                                            {t('common.delete')}
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

                <Modal
                opened={opened}
                onClose={close}
                title={editingProject ? t('projects.editProject') : t('projects.newProject')}
                size="md"
            >
                <Stack gap="md">
                    <TextInput
                        label={t('common.name')}
                        placeholder={t('meals.namePlaceholder')}
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                    />

                    <Textarea
                        label={t('common.description')}
                        placeholder={t('meals.descriptionPlaceholder')}
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        minRows={3}
                    />

                    <Select
                        label={t('common.type')}
                        data={projectTypeOptions}
                        value={form.type}
                        onChange={(value) => setForm({ ...form, type: value as ProjectType })}
                        required
                    />

                    <ColorInput
                        label={t('common.color')}
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
                        label={t('projects.deadline')}
                        placeholder={t('deadlines.selectDate')}
                        value={form.targetDate}
                        onChange={(value) => setForm({ ...form, targetDate: toDateOrNull(value) ?? undefined })}
                        clearable
                    />

                    <Group justify="flex-end" mt="md">
                        <Button variant="subtle" onClick={close}>
                            {t('common.cancel')}
                        </Button>
                        <Button onClick={handleSubmit} loading={creating}>
                            {editingProject ? t('common.save') : t('common.create')}
                        </Button>
                    </Group>
                </Stack>
            </Modal>
            </Stack>
        </Container>
    );
}
