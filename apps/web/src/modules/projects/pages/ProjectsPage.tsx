import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Text,
    Group,
    Stack,
    Button,
    TextInput,
    Paper,
    Skeleton,
    ThemeIcon,
    SegmentedControl,
    Container,
    SimpleGrid,
} from '@mantine/core';
import {
    IconPlus,
    IconSearch,
    IconTarget,
    IconLayoutGrid,
    IconList,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useRequest, useMutation, useViewMode } from '../../../hooks';
import { PageTitle } from '../../../components/PageTitle';
import { Project, CreateProjectForm, defaultForm, ProjectType } from '../types';
import { GridView, ListView, ProjectFormModal } from '../components';

export default function ProjectsPage() {
    const { t } = useTranslation();
    const [opened, { open, close }] = useDisclosure(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [form, setForm] = useState<CreateProjectForm>(defaultForm);
    const [searchQuery, setSearchQuery] = useState('');
    const [view, setView] = useState<'active' | 'archived'>('active');
    const [filterType, setFilterType] = useState<ProjectType | 'all'>('all');
    const [globalViewMode, setViewMode] = useViewMode();
    const viewMode = globalViewMode === 'list' || globalViewMode === 'table' ? 'list' : 'grid';

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
                    <GridView
                        projects={filteredProjects}
                        view={view}
                        statusOptions={statusOptions}
                        onEdit={handleOpenEdit}
                        onArchive={handleArchive}
                        onUnarchive={handleUnarchive}
                        onDelete={handleDelete}
                    />
                ) : (
                    <ListView
                        projects={filteredProjects}
                        view={view}
                        statusOptions={statusOptions}
                        onEdit={handleOpenEdit}
                        onArchive={handleArchive}
                        onUnarchive={handleUnarchive}
                        onDelete={handleDelete}
                    />
                )}

                <ProjectFormModal
                    opened={opened}
                    onClose={close}
                    form={form}
                    setForm={setForm}
                    onSubmit={handleSubmit}
                    isEditing={!!editingProject}
                    isLoading={creating}
                />
            </Stack>
        </Container>
    );
}
