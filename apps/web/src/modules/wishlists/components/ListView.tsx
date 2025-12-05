import {
    Paper,
    Table,
    Group,
    Image,
    ThemeIcon,
    Text,
    Badge,
    ActionIcon,
    Menu,
} from '@mantine/core';
import {
    IconDots,
    IconEdit,
    IconTrash,
    IconGift,
    IconCheck,
    IconExternalLink,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { WishlistItem, WishlistCategory, WishlistPriority } from '../types';
import { categoryOptions, priorityOptions, formatPrice } from '../types';

interface ListViewProps {
    items: WishlistItem[];
    onEdit: (item: WishlistItem) => void;
    onDelete: (id: string) => void;
    onPurchase: (id: string) => void;
}

export function ListView({ items, onEdit, onDelete, onPurchase }: ListViewProps) {
    const { t } = useTranslation();

    const getCategoryIcon = (category: WishlistCategory) => {
        const config = categoryOptions.find(c => c.value === category);
        const Icon = config?.icon || IconDots;
        return <Icon size={16} />;
    };

    const getPriorityBadge = (priority: WishlistPriority) => {
        const config = priorityOptions.find(p => p.value === priority);
        return (
            <Badge size="xs" color={config?.color || 'gray'}>
                {t(config?.label || priority)}
            </Badge>
        );
    };

    return (
        <Paper shadow="sm" withBorder radius="md">
            <Table striped highlightOnHover>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>{t('wishlists.table.item')}</Table.Th>
                        <Table.Th>{t('wishlists.table.category')}</Table.Th>
                        <Table.Th>{t('wishlists.table.priority')}</Table.Th>
                        <Table.Th>{t('wishlists.table.price')}</Table.Th>
                        <Table.Th>{t('wishlists.table.shop')}</Table.Th>
                        <Table.Th>{t('wishlists.table.actions')}</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {items.map((item) => (
                        <Table.Tr key={item.id}>
                            <Table.Td>
                                <Group gap="sm">
                                    {item.imageUrl ? (
                                        <Image src={item.imageUrl} width={40} height={40} radius="sm" fit="cover" />
                                    ) : (
                                        <ThemeIcon size={40} variant="light" radius="sm">
                                            {getCategoryIcon(item.category)}
                                        </ThemeIcon>
                                    )}
                                    <div>
                                        <Text fw={500} size="sm">{item.name}</Text>
                                        {item.isGiftIdea && (
                                            <Badge size="xs" color="pink" leftSection={<IconGift size={10} />}>
                                                Geschenk
                                            </Badge>
                                        )}
                                    </div>
                                </Group>
                            </Table.Td>
                            <Table.Td>
                                <Badge size="xs" variant="light" leftSection={getCategoryIcon(item.category)}>
                                    {t(categoryOptions.find(c => c.value === item.category)?.label || '')}
                                </Badge>
                            </Table.Td>
                            <Table.Td>{getPriorityBadge(item.priority)}</Table.Td>
                            <Table.Td>{item.price ? formatPrice(item.price) : '-'}</Table.Td>
                            <Table.Td>{item.store || '-'}</Table.Td>
                            <Table.Td>
                                <Group gap="xs">
                                    <ActionIcon
                                        variant="light"
                                        color="green"
                                        size="sm"
                                        onClick={() => onPurchase(item.id)}
                                    >
                                        <IconCheck size={14} />
                                    </ActionIcon>
                                    <Menu shadow="md" position="bottom-end">
                                        <Menu.Target>
                                            <ActionIcon variant="subtle" size="sm">
                                                <IconDots size={16} />
                                            </ActionIcon>
                                        </Menu.Target>
                                        <Menu.Dropdown>
                                            {item.productUrl && (
                                                <Menu.Item
                                                    leftSection={<IconExternalLink size={14} />}
                                                    component="a"
                                                    href={item.productUrl}
                                                    target="_blank"
                                                >
                                                    {t('wishlists.actions.toProduct')}
                                                </Menu.Item>
                                            )}
                                            <Menu.Item
                                                leftSection={<IconEdit size={14} />}
                                                onClick={() => onEdit(item)}
                                            >
                                                Bearbeiten
                                            </Menu.Item>
                                            <Menu.Item
                                                leftSection={<IconTrash size={14} />}
                                                color="red"
                                                onClick={() => onDelete(item.id)}
                                            >
                                                Löschen
                                            </Menu.Item>
                                        </Menu.Dropdown>
                                    </Menu>
                                </Group>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
        </Paper>
    );
}
