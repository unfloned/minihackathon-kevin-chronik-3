import { useState } from 'react';
import {
    Container,
    Group,
    Stack,
    Button,
    SimpleGrid,
    Loader,
    Paper,
    SegmentedControl,
    Text,
    ThemeIcon,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
    IconPlus,
    IconReceipt,
    IconCategory,
    IconChartPie,
    IconLayoutGrid,
    IconList,
} from '@tabler/icons-react';
import { useRequest, useMutation, useViewMode } from '../../../hooks';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { PageTitle } from '../../../components/PageTitle';
import { CardStatistic } from '../../../components/CardStatistic';
import type { Expense, ExpenseCategory, ExpenseFormData, ExpenseStats } from '../types';
import { defaultFormData } from '../types';
import {
    GridView,
    TableView,
    ExpenseFormModal,
    CategoryBreakdown,
} from '../components';

export default function ExpensesPage() {
    const { t } = useTranslation();
    const [opened, { open, close }] = useDisclosure(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [globalViewMode, setViewMode] = useViewMode();
    // Fallback to 'grid' if global viewMode is not supported by this page
    const viewMode = ['grid', 'list'].includes(globalViewMode) ? globalViewMode : 'grid';

    // Current month and year
    const currentDate = new Date();
    const [selectedYear] = useState(currentDate.getFullYear());
    const [selectedMonth] = useState(currentDate.getMonth() + 1);

    // Form state
    const [formData, setFormData] = useState<ExpenseFormData>(defaultFormData);

    // Fetch categories - CORRECT pattern: string endpoint
    const { data: categories, isLoading: categoriesLoading } = useRequest<ExpenseCategory[]>(
        '/expenses/categories'
    );

    // Fetch expenses for current month - CORRECT pattern: string endpoint
    const {
        data: expenses,
        isLoading: expensesLoading,
        refetch: refetchExpenses,
    } = useRequest<Expense[]>(`/expenses/month/${selectedYear}/${selectedMonth}`);

    // Fetch stats for current month - CORRECT pattern: string endpoint
    const {
        data: stats,
        isLoading: statsLoading,
        refetch: refetchStats,
    } = useRequest<ExpenseStats>(`/expenses/stats/${selectedYear}/${selectedMonth}`);

    // Create expense mutation - CORRECT pattern: string endpoint, options object
    const { mutate: createExpense, isLoading: createLoading } = useMutation<
        Expense,
        {
            amount: number;
            description: string;
            categoryId: string;
            date: string;
        }
    >('/expenses', {
        method: 'POST',
        onSuccess: () => {
            notifications.show({
                title: t('notifications.success'),
                message: t('expenses.expenseCreated'),
                color: 'green',
            });
            refetchExpenses();
            refetchStats();
            handleCloseModal();
        },
        onError: () => {
            notifications.show({
                title: t('notifications.error'),
                message: t('errors.generic'),
                color: 'red',
            });
        },
    });

    // Update expense mutation - CORRECT pattern: function endpoint, options object
    const { mutate: updateExpense, isLoading: updateLoading } = useMutation<
        Expense,
        {
            amount: number;
            description: string;
            categoryId: string;
            date: string;
        }
    >((_vars) => `/expenses/${editingExpense?.id}`, {
        method: 'PATCH',
        onSuccess: () => {
            notifications.show({
                title: t('notifications.success'),
                message: t('expenses.expenseUpdated'),
                color: 'green',
            });
            refetchExpenses();
            refetchStats();
            handleCloseModal();
        },
        onError: () => {
            notifications.show({
                title: t('notifications.error'),
                message: t('errors.generic'),
                color: 'red',
            });
        },
    });

    // Delete expense mutation - CORRECT pattern: function endpoint, options object
    const { mutate: deleteExpense, isLoading: _deleteLoading } = useMutation<void, { id: string }>(
        (vars) => `/expenses/${vars.id}`,
        {
            method: 'DELETE',
            onSuccess: () => {
                notifications.show({
                    title: t('notifications.success'),
                    message: t('expenses.expenseDeleted'),
                    color: 'green',
                });
                refetchExpenses();
                refetchStats();
            },
            onError: () => {
                notifications.show({
                    title: t('notifications.error'),
                    message: t('errors.generic'),
                    color: 'red',
                });
            },
        }
    );

    const handleOpenModal = (expense?: Expense) => {
        if (expense) {
            setEditingExpense(expense);
            setFormData({
                amount: expense.amount,
                description: expense.description,
                categoryId: expense.categoryId,
                date: new Date(expense.date),
            });
        } else {
            setEditingExpense(null);
            setFormData(defaultFormData);
        }
        open();
    };

    const handleCloseModal = () => {
        setEditingExpense(null);
        setFormData(defaultFormData);
        close();
    };

    const handleSubmit = async () => {
        if (!formData.amount || !formData.description || !formData.categoryId || !formData.date) {
            notifications.show({
                title: t('notifications.error'),
                message: t('errors.validation'),
                color: 'red',
            });
            return;
        }

        const payload = {
            amount: typeof formData.amount === 'string' ? parseFloat(formData.amount) : formData.amount,
            description: formData.description,
            categoryId: formData.categoryId,
            date: formData.date.toISOString(),
        };

        if (editingExpense) {
            await updateExpense(payload);
        } else {
            await createExpense(payload);
        }
    };

    const handleDelete = async (expenseId: string) => {
        if (window.confirm(t('expenses.deleteConfirm'))) {
            await deleteExpense({ id: expenseId });
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const getMonthName = () => {
        return new Date(selectedYear, selectedMonth - 1).toLocaleDateString('de-DE', {
            month: 'long',
            year: 'numeric',
        });
    };

    if (categoriesLoading || expensesLoading || statsLoading) {
        return (
            <Container size="xl" py="xl">
                <Group justify="center" mt="xl">
                    <Loader size="lg" />
                </Group>
            </Container>
        );
    }

    return (
        <Container size="xl" py="xl">
            <Stack gap="xl">
                {/* Header */}
                <Group justify="space-between" align="center">
                    <PageTitle title={t('expenses.title')} subtitle={getMonthName()} />
                    <Button
                        leftSection={<IconPlus size={18} />}
                        onClick={() => handleOpenModal()}
                    >
                        {t('expenses.newExpense')}
                    </Button>
                </Group>

                {/* Stats Cards */}
                <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
                    <CardStatistic
                        type="icon"
                        title={t('expenses.stats.totalExpenses')}
                        value={formatCurrency(stats?.total || 0)}
                        icon={IconReceipt}
                        color="blue"
                        subtitle={t('expenses.transactions', { count: expenses?.length || 0 })}
                    />

                    <CardStatistic
                        type="icon"
                        title={t('expenses.categories')}
                        value={stats?.byCategory?.length || 0}
                        icon={IconCategory}
                        color="grape"
                        subtitle={t('expenses.differentCategories')}
                    />

                    <CardStatistic
                        type="icon"
                        title={t('expenses.average')}
                        value={formatCurrency(
                            expenses && expenses.length > 0
                                ? (stats?.total || 0) / expenses.length
                                : 0
                        )}
                        icon={IconChartPie}
                        color="teal"
                        subtitle={t('expenses.perTransaction')}
                    />
                </SimpleGrid>

                {/* Category Breakdown */}
                <CategoryBreakdown stats={stats} formatCurrency={formatCurrency} />

                {/* View Toggle */}
                <Paper shadow="sm" withBorder p="md" radius="md">
                    <Group justify="space-between">
                        <Text fw={500}>{t('expenses.allExpenses')}</Text>
                        <SegmentedControl
                            value={viewMode}
                            onChange={(value) => setViewMode(value as 'grid' | 'list')}
                            data={[
                                { value: 'grid', label: <IconLayoutGrid size={16} /> },
                                { value: 'list', label: <IconList size={16} /> },
                            ]}
                        />
                    </Group>
                </Paper>

                {/* Expenses Grid/List */}
                {!expenses || expenses.length === 0 ? (
                    <Paper shadow="sm" withBorder p="xl" radius="md" ta="center">
                        <ThemeIcon size={64} variant="light" color="gray" radius="xl" mx="auto">
                            <IconReceipt size={32} />
                        </ThemeIcon>
                        <Text mt="md" c="dimmed">
                            {t('expenses.emptyState')}
                        </Text>
                        <Button mt="md" onClick={() => handleOpenModal()}>
                            {t('expenses.createFirst')}
                        </Button>
                    </Paper>
                ) : viewMode === 'grid' ? (
                    <GridView
                        expenses={expenses}
                        onEdit={handleOpenModal}
                        onDelete={handleDelete}
                        formatCurrency={formatCurrency}
                        formatDate={formatDate}
                    />
                ) : (
                    <TableView
                        expenses={expenses}
                        onEdit={handleOpenModal}
                        onDelete={handleDelete}
                        formatCurrency={formatCurrency}
                        formatDate={formatDate}
                    />
                )}
            </Stack>

            {/* Create/Edit Modal */}
            <ExpenseFormModal
                opened={opened}
                isEditing={!!editingExpense}
                formData={formData}
                categories={categories}
                loading={createLoading || updateLoading}
                onClose={handleCloseModal}
                onSubmit={handleSubmit}
                onFormChange={(data) => setFormData({ ...formData, ...data })}
            />
        </Container>
    );
}
