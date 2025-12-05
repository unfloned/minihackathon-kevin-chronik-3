import { Paper, Table, Text, Group, Badge, Progress, ThemeIcon, Menu, ActionIcon } from '@mantine/core';
import {
    IconDotsVertical,
    IconEdit,
    IconArchive,
    IconArchiveOff,
    IconTrash,
    IconList,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { listTypeIcons, type List, type ListTypeOption } from '../types';

interface TableViewProps {
    lists: List[];
    listTypeOptions: ListTypeOption[];
    onNavigate: (listId: string) => void;
    onEdit: (list: List) => void;
    onArchive: (listId: string) => void;
    onUnarchive: (listId: string) => void;
    onDelete: (listId: string) => void;
}

export function TableView({
    lists,
    listTypeOptions,
    onNavigate,
    onEdit,
    onArchive,
    onUnarchive,
    onDelete,
}: TableViewProps) {
    const { t } = useTranslation();

    const getListProgress = (list: List) => {
        if (list.items.length === 0) return 0;
        return (list.items.filter(i => i.completed).length / list.items.length) * 100;
    };

    return (
        <Paper shadow="sm" withBorder radius="md">
            <Table striped highlightOnHover>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>{t('common.list')}</Table.Th>
                        <Table.Th>{t('common.type')}</Table.Th>
                        <Table.Th>{t('common.progress')}</Table.Th>
                        <Table.Th>{t('lists.items')}</Table.Th>
                        <Table.Th>{t('common.date')}</Table.Th>
                        <Table.Th>{t('common.actions')}</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {lists.map((list) => {
                        const Icon = listTypeIcons[list.type] || IconList;
                        const progress = getListProgress(list);
                        const completedCount = list.items.filter(i => i.completed).length;

                        return (
                            <Table.Tr
                                key={list.id}
                                style={{ cursor: 'pointer' }}
                                onClick={() => onNavigate(list.id)}
                            >
                                <Table.Td>
                                    <Group gap="sm">
                                        <ThemeIcon size="sm" radius="md" color={list.color} variant="light">
                                            <Icon size={14} />
                                        </ThemeIcon>
                                        <div>
                                            <Text size="sm" fw={500}>{list.name}</Text>
                                            {list.description && (
                                                <Text size="xs" c="dimmed" lineClamp={1}>{list.description}</Text>
                                            )}
                                        </div>
                                    </Group>
                                </Table.Td>
                                <Table.Td>
                                    <Badge size="sm" variant="light">
                                        {listTypeOptions.find((opt) => opt.value === list.type)?.label}
                                    </Badge>
                                </Table.Td>
                                <Table.Td>
                                    <Group gap="xs">
                                        <Progress value={progress} color={list.color} size="sm" style={{ width: 60 }} />
                                        <Text size="xs" c="dimmed">{Math.round(progress)}%</Text>
                                    </Group>
                                </Table.Td>
                                <Table.Td>
                                    <Text size="sm">{completedCount}/{list.items.length}</Text>
                                </Table.Td>
                                <Table.Td>
                                    <Text size="sm">{new Date(list.createdAt).toLocaleDateString('de-DE')}</Text>
                                </Table.Td>
                                <Table.Td>
                                    <Menu shadow="md" width={200}>
                                        <Menu.Target>
                                            <ActionIcon variant="subtle" color="gray" onClick={(e) => e.stopPropagation()}>
                                                <IconDotsVertical size={16} />
                                            </ActionIcon>
                                        </Menu.Target>
                                        <Menu.Dropdown>
                                            <Menu.Item
                                                leftSection={<IconEdit size={14} />}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEdit(list);
                                                }}
                                            >
                                                Bearbeiten
                                            </Menu.Item>
                                            {!list.isArchived ? (
                                                <Menu.Item
                                                    leftSection={<IconArchive size={14} />}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onArchive(list.id);
                                                    }}
                                                >
                                                    Archivieren
                                                </Menu.Item>
                                            ) : (
                                                <Menu.Item
                                                    leftSection={<IconArchiveOff size={14} />}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onUnarchive(list.id);
                                                    }}
                                                >
                                                    Wiederherstellen
                                                </Menu.Item>
                                            )}
                                            <Menu.Divider />
                                            <Menu.Item
                                                color="red"
                                                leftSection={<IconTrash size={14} />}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete(list.id);
                                                }}
                                            >
                                                Löschen
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
