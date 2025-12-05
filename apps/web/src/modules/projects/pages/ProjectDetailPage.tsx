import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Text,
    Stack,
    Button,
    Paper,
    Skeleton,
    SimpleGrid,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useRequest, useMutation, useConfetti } from '../../../hooks';
import type {
    Project,
    ProjectStatus,
    TaskPriority,
    EditProjectForm,
} from '../types';
import { statusOptions, defaultEditForm } from '../types';
import {
    ProjectHeader,
    ProjectStatsCards,
    TaskList,
    MilestoneList,
    ProjectEditModal,
} from '../components';

export default function ProjectDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const confetti = useConfetti();
    const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);

    const [editForm, setEditForm] = useState<EditProjectForm>(defaultEditForm);

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

    const handleAddTask = async (title: string, priority: TaskPriority) => {
        await addTask({ title, priority });
        refetch();
    };

    const handleToggleTask = async (taskId: string) => {
        const task = project?.tasks.find(t => t.id === taskId);
        const isCompleting = task && !task.completed;

        await toggleTask({ taskId });

        if (isCompleting) {
            confetti.fire();
        }

        refetch();
    };

    const handleDeleteTask = async (taskId: string) => {
        await deleteTask({ taskId });
        refetch();
    };

    const handleAddMilestone = async (title: string, targetDate: string) => {
        await addMilestone({ title, targetDate });
        refetch();
    };

    const handleToggleMilestone = async (milestoneId: string) => {
        const milestone = project?.milestones.find(m => m.id === milestoneId);
        const isCompleting = milestone && !milestone.completed;

        await toggleMilestone({ milestoneId });

        if (isCompleting) {
            confetti.achievementUnlock();
        }

        refetch();
    };

    const handleDeleteMilestone = async (milestoneId: string) => {
        await deleteMilestone({ milestoneId });
        refetch();
    };

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

    return (
        <Container size="lg" py="xl">
            <Stack gap="xl">
                <ProjectHeader
                    project={project}
                    onEdit={openEditModal}
                    onArchive={handleArchive}
                    onDelete={handleDelete}
                />

                <ProjectStatsCards
                    project={project}
                    onStatusChange={handleStatusChange}
                />

                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
                    <TaskList
                        tasks={project.tasks}
                        onAddTask={handleAddTask}
                        onToggleTask={handleToggleTask}
                        onDeleteTask={handleDeleteTask}
                    />

                    <MilestoneList
                        milestones={project.milestones}
                        onAddMilestone={handleAddMilestone}
                        onToggleMilestone={handleToggleMilestone}
                        onDeleteMilestone={handleDeleteMilestone}
                    />
                </SimpleGrid>
            </Stack>

            <ProjectEditModal
                opened={editModalOpened}
                onClose={closeEditModal}
                form={editForm}
                onFormChange={setEditForm}
                onSubmit={handleSaveEdit}
            />
        </Container>
    );
}
