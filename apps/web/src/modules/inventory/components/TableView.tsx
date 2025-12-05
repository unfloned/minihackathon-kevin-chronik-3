import { Paper, Table, Badge, Menu, ActionIcon } from '@mantine/core';
import {
    IconDotsVertical,
    IconEdit,
    IconTrash,
    IconUser,
    IconArrowBack,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { InventoryItem } from '../types';

interface TableViewProps {
    items: InventoryItem[];
    onEdit: (item: InventoryItem) => void;
    onDelete: (id: string) => void;
    onLend: (item: InventoryItem) => void;
    onReturn: (id: string) => void;
}

export function TableView({ items, onEdit, onDelete, onLend, onReturn }: TableViewProps) {
    const { t } = useTranslation();

    return (
        <Paper withBorder>
            <Table striped highlightOnHover>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>{t('inventory.table.name')}</Table.Th>
                        <Table.Th>{t('inventory.table.category')}</Table.Th>
                        <Table.Th>{t('inventory.table.location')}</Table.Th>
                        <Table.Th>{t('inventory.table.quantity')}</Table.Th>
                        <Table.Th>{t('inventory.table.value')}</Table.Th>
                        <Table.Th>{t('inventory.table.status')}</Table.Th>
                        <Table.Th>{t('inventory.table.actions')}</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {items.map((item) => (
                        <Table.Tr key={item.id}>
                            <Table.Td>{item.name}</Table.Td>
                            <Table.Td>{item.category}</Table.Td>
                            <Table.Td>
                                {item.location.area}
                                {item.location.container && ` / ${item.location.container}`}
                            </Table.Td>
                            <Table.Td>{item.quantity}</Table.Td>
                            <Table.Td>
                                {item.currentValue ? `${item.currentValue.toFixed(2)} EUR` : '-'}
                            </Table.Td>
                            <Table.Td>
                                {item.isLent ? (
                                    <Badge color="orange" variant="filled">
                                        {t('inventory.lentStatus.lent')}
                                    </Badge>
                                ) : (
                                    <Badge color="green" variant="light">
                                        {t('inventory.lentStatus.available')}
                                    </Badge>
                                )}
                            </Table.Td>
                            <Table.Td>
                                <Menu shadow="md" width={200}>
                                    <Menu.Target>
                                        <ActionIcon variant="subtle">
                                            <IconDotsVertical size={16} />
                                        </ActionIcon>
                                    </Menu.Target>
                                    <Menu.Dropdown>
                                        <Menu.Item
                                            leftSection={<IconEdit size={14} />}
                                            onClick={() => onEdit(item)}
                                        >
                                            {t('common.edit')}
                                        </Menu.Item>
                                        {!item.isLent ? (
                                            <Menu.Item
                                                leftSection={<IconUser size={14} />}
                                                onClick={() => onLend(item)}
                                            >
                                                {t('inventory.lend')}
                                            </Menu.Item>
                                        ) : (
                                            <Menu.Item
                                                leftSection={<IconArrowBack size={14} />}
                                                onClick={() => onReturn(item.id)}
                                            >
                                                {t('inventory.return')}
                                            </Menu.Item>
                                        )}
                                        <Menu.Divider />
                                        <Menu.Item
                                            leftSection={<IconTrash size={14} />}
                                            color="red"
                                            onClick={() => onDelete(item.id)}
                                        >
                                            {t('common.delete')}
                                        </Menu.Item>
                                    </Menu.Dropdown>
                                </Menu>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
        </Paper>
    );
}
