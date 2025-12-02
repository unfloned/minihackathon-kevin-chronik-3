import { useState, useEffect } from 'react';
import {
    Container,
    Title,
    Text,
    Card,
    Group,
    Stack,
    Button,
    ActionIcon,
    Badge,
    ThemeIcon,
    Modal,
    TextInput,
    NumberInput,
    Select,
    SimpleGrid,
    Table,
    Skeleton,
    Menu,
    Paper,
    Progress,
    SegmentedControl,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import {
    IconPlus,
    IconCoin,
    IconDotsVertical,
    IconEdit,
    IconTrash,
    IconTrendingUp,
    IconTrendingDown,
    IconChartPie,
    IconReceipt,
} from '@tabler/icons-react';
import { useRequest, useMutation } from '../../../hooks';
import { notifications } from '@mantine/notifications';


interface ExpenseCategory {
    id: string;
    name: string;
    icon: string;
    color: string;
    budget?: number;
}

interface Expense {
    id: string;
    amount: number;
    description: string;
    categoryId: string;
    categoryName?: string;
    categoryIcon?: string;
    categoryColor?: string;
    date: string;
}

interface MonthlyStats {
    total: number;
    byCategory: {
        categoryId: string;
        name: string;
        icon: string;
        color: string;
        amount: number;
        budget?: number;
    }[];
    comparedToLastMonth: number;
}

interface CreateExpenseForm {
    amount: number;
    description: string;
    categoryId: string;
    date: Date;
}

export default function ExpensesPage() {
    const [opened, { open, close }] = useDisclosure(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [view, setView] = useState<'list' | 'stats'>('list');

