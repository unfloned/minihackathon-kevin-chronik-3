import {
    Table,
    Paper,
    Badge,
    Text,
    Group,
    Image,
    ThemeIcon,
    ActionIcon,
    Menu,
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

interface TableViewProps {
    items: MediaItem[];
    onEdit: (item: MediaItem) => void;
    onDelete: (id: string) => void;
    mediaTypes: Array<{ value: string; label: string; icon: typeof IconMovie }>;
}

export function TableView({ items, onEdit, onDelete, mediaTypes }: TableViewProps) {
    const { t } = useTranslation();

    const getStatusBadge = (status: typeof items[0]['status']) => {
        const statusKey = status === 'in_progress' ? 'inProgress' : status === 'on_hold' ? 'onHold' : status;
        return (
            <Badge color={statusColors[status] || 'gray'} size="sm">
                {t(`media.status.${statusKey}`)}
            </Badge>
        );
    };

    return (
        <Paper shadow="sm" withBorder radius="md">
            <Table striped highlightOnHover>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>{t('media.table.title')}</Table.Th>
                        <Table.Th>{t('media.table.type')}</Table.Th>
                        <Table.Th>{t('media.table.year')}</Table.Th>
                        <Table.Th>{t('media.table.status')}</Table.Th>
                        <Table.Th>{t('media.table.rating')}</Table.Th>
                        <Table.Th>{t('media.table.progress')}</Table.Th>
                        <Table.Th>{t('media.table.actions')}</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {items.map((item) => {
                        const typeConfig = mediaTypes.find(t => t.value === item.type);
                        const progressPercent = item.progress?.total && item.progress.total > 0
                            ? (item.progress.current / item.progress.total) * 100
                            : 0;
                        return (
                            <Table.Tr key={item.id}>
                                <Table.Td>
                                    <Group gap="sm">
                                        {item.coverUrl ? (
                                            <Image src={item.coverUrl} width={40} height={56} radius="sm" fit="cover" />
                                        ) : (
                                            <ThemeIcon size={40} variant="light" color="gray">
                                                {typeConfig?.icon ? <typeConfig.icon size={20} /> : <IconMovie size={20} />}
                                            </ThemeIcon>
                                        )}
                                        <div>
                                            <Text fw={500} size="sm">{item.title}</Text>
                                            {item.creator && <Text size="xs" c="dimmed">{item.creator}</Text>}
                                        </div>
                                    </Group>
                                </Table.Td>
                                <Table.Td>
                                    <Badge variant="light" size="sm">
                                        {typeConfig?.label || item.type}
                                    </Badge>
                                </Table.Td>
                                <Table.Td>{item.year || '-'}</Table.Td>
                                <Table.Td>{getStatusBadge(item.status)}</Table.Td>
                                <Table.Td>
                                    {item.rating ? (
                                        <Group gap={4}>
                                            <IconStarFilled size={14} style={{ color: 'gold' }} />
                                            <Text size="sm">{item.rating}/10</Text>
                                        </Group>
                                    ) : '-'}
                                </Table.Td>
                                <Table.Td>
                                    {item.progress && item.progress.total > 0 ? (
                                        <Group gap="xs">
                                            <Progress value={progressPercent} size="sm" style={{ width: 60 }} />
                                            <Text size="xs" c="dimmed">
                                                {item.progress.current}/{item.progress.total}
                                            </Text>
                                        </Group>
                                    ) : '-'}
                                </Table.Td>
                                <Table.Td>
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
                                </Table.Td>
                            </Table.Tr>
                        );
                    })}
                </Table.Tbody>
            </Table>
        </Paper>
    );
}
