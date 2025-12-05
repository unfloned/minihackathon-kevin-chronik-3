import { Card, Group, ThemeIcon, Text, Menu, ActionIcon } from '@mantine/core';
import { IconDotsVertical, IconEdit, IconTrash, IconCalendar } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { Expense } from '../types';

interface ExpenseCardProps {
    expense: Expense;
    onEdit: (expense: Expense) => void;
    onDelete: (expenseId: string) => void;
    formatCurrency: (amount: number) => string;
    formatDate: (dateString: string) => string;
}

export function ExpenseCard({
    expense,
    onEdit,
    onDelete,
    formatCurrency,
    formatDate,
}: ExpenseCardProps) {
    const { t } = useTranslation();

    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="sm">
                <Group gap="sm">
                    <ThemeIcon
                        size={40}
                        variant="light"
                        color={expense.categoryColor || 'gray'}
                        radius="md"
                    >
                        <Text size="lg">{expense.categoryIcon || '📦'}</Text>
                    </ThemeIcon>
                    <div>
                        <Text fw={500} lineClamp={1}>{expense.description}</Text>
                        <Text size="xs" c="dimmed">{expense.categoryName || 'Keine Kategorie'}</Text>
                    </div>
                </Group>
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
            </Group>
            <Group justify="space-between" mt="md">
                <Group gap="xs">
                    <IconCalendar size={14} color="var(--mantine-color-dimmed)" />
                    <Text size="sm" c="dimmed">{formatDate(expense.date)}</Text>
                </Group>
                <Text fw={700} size="lg" c="blue">{formatCurrency(expense.amount)}</Text>
            </Group>
        </Card>
    );
}
