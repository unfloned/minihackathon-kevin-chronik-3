import {
    Card,
    Badge,
    Text,
    Group,
    Stack,
    ActionIcon,
    Menu,
    Image,
    Paper,
    ThemeIcon,
    Progress,
} from '@mantine/core';
import {
    IconMovie,
    IconEdit,
    IconTrash,
    IconDotsVertical,
    IconStarFilled,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { MediaItem, statusColors } from '../types';

interface MediaCardProps {
    item: MediaItem;
    onEdit: (item: MediaItem) => void;
    onDelete: (id: string) => void;
    mediaTypes: Array<{ value: string; label: string; icon: typeof IconMovie }>;
}

export function MediaCard({ item, onEdit, onDelete, mediaTypes }: MediaCardProps) {
    const { t } = useTranslation();
    const typeConfig = mediaTypes.find(t => t.value === item.type);
    const Icon = typeConfig?.icon || IconMovie;

    // Calculate progress percentage
    const progressPercent = item.progress?.total && item.progress.total > 0
        ? (item.progress.current / item.progress.total) * 100
        : 0;

    const getStatusBadge = (status: typeof item.status) => {
        const statusKey = status === 'in_progress' ? 'inProgress' : status === 'on_hold' ? 'onHold' : status;
        return (
            <Badge color={statusColors[status] || 'gray'} size="sm">
                {t(`media.status.${statusKey}`)}
            </Badge>
        );
    };

    return (
        <Card shadow="sm" withBorder padding="lg" radius="md" style={{ height: '100%' }}>
            <Card.Section>
                {item.coverUrl ? (
                    <Image src={item.coverUrl} height={200} alt={item.title} fit="cover" />
                ) : (
                    <Paper bg="gray.1" h={200} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ThemeIcon size={60} variant="light" color="gray">
                            <Icon size={40} />
                        </ThemeIcon>
                    </Paper>
                )}
            </Card.Section>

            <Stack gap="sm" mt="md">
                <Group justify="space-between" align="flex-start">
                    <div style={{ flex: 1 }}>
                        <Group gap="xs" mb={4}>
                            <ThemeIcon size="sm" variant="light" color="blue">
                                <Icon size={14} />
                            </ThemeIcon>
                            <Text size="xs" c="dimmed">
                                {typeConfig?.label}
                            </Text>
                        </Group>
                        <Text fw={600} lineClamp={2}>
                            {item.title}
                        </Text>
                        {item.creator && (
                            <Text size="sm" c="dimmed" lineClamp={1}>
                                {item.creator}
                            </Text>
                        )}
                        {item.year && (
                            <Text size="xs" c="dimmed">
                                {item.year}
                            </Text>
                        )}
                    </div>
                    <Menu shadow="md" position="bottom-end">
                        <Menu.Target>
                            <ActionIcon variant="subtle" size="sm">
                                <IconDotsVertical size={16} />
                            </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Item
                                leftSection={<IconEdit size={16} />}
                                onClick={() => onEdit(item)}
                            >
                                {t('common.edit')}
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item
                                leftSection={<IconTrash size={16} />}
                                color="red"
                                onClick={() => onDelete(item.id)}
                            >
                                {t('common.delete')}
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </Group>

                {item.description && (
                    <Text size="sm" c="dimmed" lineClamp={3}>
                        {item.description}
                    </Text>
                )}

                <Group gap="xs">
                    {getStatusBadge(item.status)}
                    {item.rating && (
                        <Group gap={4}>
                            <IconStarFilled size={14} style={{ color: 'gold' }} />
                            <Text size="sm" fw={500}>
                                {item.rating}/10
                            </Text>
                        </Group>
                    )}
                </Group>

                {item.progress && item.progress.total > 0 && (
                    <div>
                        <Group justify="space-between" mb={4}>
                            <Text size="xs" c="dimmed">
                                {t('media.progress')}
                            </Text>
                            <Text size="xs" c="dimmed">
                                {item.progress.current}/{item.progress.total} {item.progress.unit}
                            </Text>
                        </Group>
                        <Progress value={progressPercent} size="sm" />
                    </div>
                )}

                {item.genre && item.genre.length > 0 && (
                    <Group gap={4}>
                        {item.genre.slice(0, 3).map((g) => (
                            <Badge key={g} size="xs" variant="dot">
                                {g}
                            </Badge>
                        ))}
                        {item.genre.length > 3 && (
                            <Text size="xs" c="dimmed">
                                +{item.genre.length - 3}
                            </Text>
                        )}
                    </Group>
                )}
            </Stack>
        </Card>
    );
}
