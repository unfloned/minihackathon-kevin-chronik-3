import { useNavigate } from 'react-router-dom';
import {
    Title,
    Text,
    Group,
    Button,
    ActionIcon,
    ThemeIcon,
    Menu,
} from '@mantine/core';
import {
    IconArrowLeft,
    IconEdit,
    IconTrash,
    IconArchive,
    IconDotsVertical,
    IconTarget,
    IconFlag,
} from '@tabler/icons-react';
import type { Project } from '../types';

interface ProjectHeaderProps {
    project: Project;
    onEdit: () => void;
    onArchive: () => void;
    onDelete: () => void;
}

export function ProjectHeader({ project, onEdit, onArchive, onDelete }: ProjectHeaderProps) {
    const navigate = useNavigate();

    return (
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
                        <Menu.Item leftSection={<IconEdit size={16} />} onClick={onEdit}>
                            Bearbeiten
                        </Menu.Item>
                        <Menu.Item leftSection={<IconArchive size={16} />} onClick={onArchive}>
                            Archivieren
                        </Menu.Item>
                        <Menu.Divider />
                        <Menu.Item leftSection={<IconTrash size={16} />} color="red" onClick={onDelete}>
                            Löschen
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </Group>
        </Group>
    );
}
