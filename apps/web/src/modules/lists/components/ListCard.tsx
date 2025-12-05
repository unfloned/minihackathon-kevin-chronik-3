import { Card, Text, Group, Stack, Badge, Progress, ThemeIcon, Menu, ActionIcon } from '@mantine/core';
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

interface ListCardProps {
    list: List;
    listTypeOptions: ListTypeOption[];
    onNavigate: (listId: string) => void;
    onEdit: (list: List) => void;
    onArchive: (listId: string) => void;
    onUnarchive: (listId: string) => void;
    onDelete: (listId: string) => void;
}

export function ListCard({
    list,
    listTypeOptions,
    onNavigate,
    onEdit,
    onArchive,
    onUnarchive,
    onDelete,
}: ListCardProps) {
    const { t } = useTranslation();
    const Icon = listTypeIcons[list.type] || IconList;

    const getListProgress = (list: List) => {
        if (list.items.length === 0) return 0;
        return (list.items.filter(i => i.completed).length / list.items.length) * 100;
    };

    const progress = getListProgress(list);
    const completedCount = list.items.filter(i => i.completed).length;

    return (
        <Card
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            style={{ cursor: 'pointer' }}
            onClick={() => onNavigate(list.id)}
        >
            <Stack gap="md">
                <Group justify="space-between">
                    <Group gap="sm">
                        <ThemeIcon size="lg" radius="md" color={list.color} variant="light">
                            <Icon size={20} />
                        </ThemeIcon>
                        <div>
                            <Text fw={600} size="lg">{list.name}</Text>
                            {list.description && (
                                <Text size="sm" c="dimmed" lineClamp={1}>{list.description}</Text>
                            )}
                        </div>
                    </Group>
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
                                {t('common.edit')}
                            </Menu.Item>
                            {!list.isArchived ? (
                                <Menu.Item
                                    leftSection={<IconArchive size={14} />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onArchive(list.id);
                                    }}
                                >
                                    {t('common.archive')}
                                </Menu.Item>
                            ) : (
                                <Menu.Item
                                    leftSection={<IconArchiveOff size={14} />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onUnarchive(list.id);
                                    }}
                                >
                                    {t('common.unarchive')}
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
                                {t('common.delete')}
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </Group>

                <Group gap="xs">
                    <Badge color="gray" variant="light" size="sm">
                        {listTypeOptions.find((opt) => opt.value === list.type)?.label}
                    </Badge>
                    <Badge color={progress === 100 ? 'green' : 'blue'} variant="light" size="sm">
                        {completedCount}/{list.items.length} {t('common.completed').toLowerCase()}
                    </Badge>
                </Group>

                {list.items.length > 0 && (
                    <Progress value={progress} color={list.color} size="sm" radius="xl" />
                )}

                {list.items.length === 0 && (
                    <Text size="sm" c="dimmed" ta="center">
                        {t('lists.emptyListState')}
                    </Text>
                )}
            </Stack>
        </Card>
    );
}
