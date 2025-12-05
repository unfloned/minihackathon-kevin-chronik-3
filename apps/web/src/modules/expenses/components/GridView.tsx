import { SimpleGrid } from '@mantine/core';
import { ExpenseCard } from './ExpenseCard';
import type { Expense } from '../types';

interface GridViewProps {
    expenses: Expense[];
    onEdit: (expense: Expense) => void;
    onDelete: (expenseId: string) => void;
    formatCurrency: (amount: number) => string;
    formatDate: (dateString: string) => string;
}

export function GridView({
    expenses,
    onEdit,
    onDelete,
    formatCurrency,
    formatDate,
}: GridViewProps) {
    return (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
            {expenses.map((expense) => (
                <ExpenseCard
                    key={expense.id}
                    expense={expense}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                />
            ))}
        </SimpleGrid>
    );
}
