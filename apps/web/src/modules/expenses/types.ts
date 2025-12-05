import type { ExpenseWithCategory, ExpenseStats, ExpenseCategorySimple } from '@ycmm/core';

// Alias for component usage
export type Expense = ExpenseWithCategory;
export type ExpenseCategory = ExpenseCategorySimple;

export interface ExpenseFormData {
    amount: number | string;
    description: string;
    categoryId: string;
    date: Date | null;
}

export { ExpenseStats };

export const defaultFormData: ExpenseFormData = {
    amount: '',
    description: '',
    categoryId: '',
    date: new Date(),
};

// Helper to convert Mantine v8 DateValue to Date
import { DateValue } from '@mantine/dates';
export const toDateOrNull = (value: DateValue): Date | null => {
    if (!value) return null;
    if (value instanceof Date) return value;
    return new Date(value);
};
