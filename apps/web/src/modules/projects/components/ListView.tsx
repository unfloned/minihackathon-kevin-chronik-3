import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Paper,
    Table,
    Group,
    Text,
    ThemeIcon,
    Badge,
    Progress,
    ActionIcon,
    Menu,
} from '@mantine/core';
import {
    IconTarget,
    IconFlag,
    IconDotsVertical,
    IconEdit,
    IconTrash,
    IconArchive,
    IconArchiveOff,
} from '@tabler/icons-react';
import { Project, getStatusColor, getStatusIcon } from '../types';

interface ListViewProps {
    projects: Project[];
    view: 'active' | 'archived';
    statusOptions: { value: string; label: string }[];
    onEdit: (project: Project) => void;
    onArchive: (id: string) => void;
    onUnarchive: (id: string) => void;
    onDelete: (id: string) => void;
}

export function ListView({
    projects,
    view,
    statusOptions,
    onEdit,
    onArchive,
    onUnarchive,
    onDelete,
}: ListViewProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
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
                    {projects.map((project) => {
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
                                </Table.Td>
                            </Table.Tr>
                        );
                    })}
                </Table.Tbody>
            </Table>
        </Paper>
    );
}
