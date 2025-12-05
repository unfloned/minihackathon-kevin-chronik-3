import {
    Text,
    Group,
    Stack,
    Badge,
    Card,
    Progress,
    Select,
    SimpleGrid,
} from '@mantine/core';
import {
    IconChecklist,
    IconTarget,
} from '@tabler/icons-react';
import type { Project, ProjectStatus } from '../types';
import { statusOptions } from '../types';

interface ProjectStatsCardsProps {
    project: Project;
    onStatusChange: (status: ProjectStatus) => void;
}

export function ProjectStatsCards({ project, onStatusChange }: ProjectStatsCardsProps) {
    const currentStatus = statusOptions.find(s => s.value === project.status);
    const StatusIcon = currentStatus?.icon || IconTarget;
    const completedTasks = project.tasks.filter(t => t.completed).length;
    const completedMilestones = project.milestones.filter(m => m.completed).length;

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('de-DE', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    return (
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
                    onChange={(value) => value && onStatusChange(value as ProjectStatus)}
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
                    {project.endDate && (
                        <Group justify="space-between">
                            <Text size="sm" c="dimmed">Abgeschlossen</Text>
                            <Text size="sm" c="green">{formatDate(project.endDate)}</Text>
                        </Group>
                    )}
                </Stack>
            </Card>
        </SimpleGrid>
    );
}
