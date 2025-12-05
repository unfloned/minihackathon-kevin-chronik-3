import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Card,
    Group,
    Stack,
    ActionIcon,
    Badge,
    Menu,
    Text,
    Progress,
    ThemeIcon,
} from '@mantine/core';
import {
    IconDotsVertical,
    IconEdit,
    IconTrash,
    IconArchive,
    IconArchiveOff,
    IconTarget,
    IconFlag,
    IconCalendar,
} from '@tabler/icons-react';
import { Project, getStatusColor, getStatusIcon } from '../types';

interface ProjectCardProps {
    project: Project;
    view: 'active' | 'archived';
    statusOptions: { value: string; label: string }[];
    onEdit: (project: Project) => void;
    onArchive: (id: string) => void;
    onUnarchive: (id: string) => void;
    onDelete: (id: string) => void;
}

export function ProjectCard({
    project,
    view,
    statusOptions,
    onEdit,
    onArchive,
    onUnarchive,
    onDelete,
}: ProjectCardProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();
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
                                    onEdit(project);
                                }}
                            >
                                {t('common.edit')}
                            </Menu.Item>
                            {view === 'active' ? (
                                <Menu.Item
                                    leftSection={<IconArchive size={16} />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onArchive(project.id);
                                    }}
                                >
                                    {t('common.archive')}
                                </Menu.Item>
                            ) : (
                                <Menu.Item
                                    leftSection={<IconArchiveOff size={16} />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onUnarchive(project.id);
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
                                    onDelete(project.id);
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
}
