import { Paper, Table, Text, Badge, Menu, ActionIcon } from '@mantine/core';
import { IconDotsVertical, IconEdit, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { Expense } from '../types';

interface TableViewProps {
    expenses: Expense[];
    onEdit: (expense: Expense) => void;
    onDelete: (expenseId: string) => void;
    formatCurrency: (amount: number) => string;
    formatDate: (dateString: string) => string;
}

export function TableView({
    expenses,
    onEdit,
    onDelete,
    formatCurrency,
    formatDate,
}: TableViewProps) {
    const { t } = useTranslation();

    return (
        <Paper shadow="sm" withBorder radius="md">
            <Table striped highlightOnHover>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>{t('common.date')}</Table.Th>
                        <Table.Th>{t('common.description')}</Table.Th>
                        <Table.Th>{t('common.category')}</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>{t('expenses.amount')}</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>{t('common.actions')}</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {expenses.map((expense) => (
                        <Table.Tr key={expense.id}>
                            <Table.Td>{formatDate(expense.date)}</Table.Td>
                            <Table.Td>{expense.description}</Table.Td>
                            <Table.Td>
                                {expense.categoryName ? (
                                    <Badge
                                        color={expense.categoryColor || 'gray'}
                                        variant="light"
                                        leftSection={<span>{expense.categoryIcon}</span>}
                                    >
                                        {expense.categoryName}
                                    </Badge>
                                ) : (
                                    <Text size="sm" c="dimmed">
                                        {t('expenses.uncategorized')}
                                    </Text>
                                )}
                            </Table.Td>
                            <Table.Td style={{ textAlign: 'right' }}>
                                <Text fw={600}>{formatCurrency(expense.amount)}</Text>
                            </Table.Td>
                            <Table.Td style={{ textAlign: 'right' }}>
                                <Menu shadow="md" width={200}>
                                    <Menu.Target>
                                        <ActionIcon variant="subtle" color="gray">
                                            <IconDotsVertical size={16} />
                                        </ActionIcon>
                                    </Menu.Target>
                                    <Menu.Dropdown>
                                        <Menu.Item
                                            leftSection={<IconEdit size={16} />}
                                            onClick={() => onEdit(expense)}
                                        >
                                            {t('common.edit')}
                                        </Menu.Item>
                                        <Menu.Divider />
                                        <Menu.Item
                                            color="red"
                                            leftSection={<IconTrash size={16} />}
                                            onClick={() => onDelete(expense.id)}
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
