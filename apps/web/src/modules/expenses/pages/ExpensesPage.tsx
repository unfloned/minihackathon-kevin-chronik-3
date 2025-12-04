import { useState } from 'react';
import {
    Container,
    Text,
    Card,
    Group,
    Stack,
    Button,
    ActionIcon,
    Badge,
    Modal,
    TextInput,
    NumberInput,
    Select,
    SimpleGrid,
    Table,
    Loader,
    Menu,
    Paper,
    SegmentedControl,
    ThemeIcon,
    Progress,
} from '@mantine/core';
import { DateInput, DateValue } from '@mantine/dates';

// Helper to convert Mantine v8 DateValue to Date
const toDateOrNull = (value: DateValue): Date | null => {
    if (!value) return null;
    if (value instanceof Date) return value;
    return new Date(value);
};
import { useDisclosure } from '@mantine/hooks';
import {
    IconPlus,
    IconDotsVertical,
    IconEdit,
    IconTrash,
    IconChartPie,
    IconReceipt,
    IconCategory,
    IconLayoutGrid,
    IconList,
    IconCalendar,
} from '@tabler/icons-react';
import { useRequest, useMutation, useViewMode } from '../../../hooks';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { PageTitle } from '../../../components/PageTitle';
import { CardStatistic } from '../../../components/CardStatistic';
import type { ExpenseWithCategory, ExpenseStats, ExpenseCategorySimple } from '@ycmm/core';

// Alias for component usage
type Expense = ExpenseWithCategory;
type ExpenseCategory = ExpenseCategorySimple;

interface ExpenseFormData {
    amount: number | string;
    description: string;
    categoryId: string;
    date: Date | null;
}

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
    const [formData, setFormData] = useState<ExpenseFormData>({
        amount: '',
        description: '',
        categoryId: '',
        date: new Date(),
    });

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
            setFormData({
                amount: '',
                description: '',
                categoryId: '',
                date: new Date(),
            });
        }
        open();
    };

    const handleCloseModal = () => {
        setEditingExpense(null);
        setFormData({
            amount: '',
            description: '',
            categoryId: '',
            date: new Date(),
        });
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
                {stats?.byCategory && stats.byCategory.length > 0 && (
                    <Card shadow="sm" padding="lg" radius="md" withBorder>
                        <Text size="lg" fw={600} mb="md">
                            {t('expenses.byCategory')}
                        </Text>
                        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                            {stats.byCategory.map((cat) => {
                                const percentage = ((cat.amount / (stats.total || 1)) * 100);
                                return (
                                    <Paper key={cat.categoryId} p="md" withBorder radius="md">
                                        <Group justify="space-between" mb="sm">
                                            <Group gap="sm">
                                                <ThemeIcon size={36} variant="light" color={cat.categoryColor || 'gray'} radius="md">
                                                    <Text size="lg">{cat.categoryIcon}</Text>
                                                </ThemeIcon>
                                                <div>
                                                    <Text fw={500} size="sm">{cat.categoryName}</Text>
                                                    <Text size="xs" c="dimmed">
                                                        {t('expenses.transactions', { count: cat.count })}
                                                    </Text>
                                                </div>
                                            </Group>
                                            <Text fw={700} size="lg">{formatCurrency(cat.amount)}</Text>
                                        </Group>
                                        <Progress
                                            value={percentage}
                                            color={cat.categoryColor || 'blue'}
                                            size="sm"
                                            radius="xl"
                                        />
                                        <Text size="xs" c="dimmed" ta="right" mt={4}>
                                            {t('expenses.percentOfTotal', { percent: percentage.toFixed(1) })}
                                        </Text>
                                    </Paper>
                                );
                            })}
                        </SimpleGrid>
                    </Card>
                )}

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
                    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                        {expenses.map((expense) => (
                            <Card key={expense.id} shadow="sm" padding="lg" radius="md" withBorder>
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
                                                onClick={() => handleOpenModal(expense)}
                                            >
                                                {t('common.edit')}
                                            </Menu.Item>
                                            <Menu.Divider />
                                            <Menu.Item
                                                color="red"
                                                leftSection={<IconTrash size={16} />}
                                                onClick={() => handleDelete(expense.id)}
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
                        ))}
                    </SimpleGrid>
                ) : (
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
                                                        onClick={() => handleOpenModal(expense)}
                                                    >
                                                        {t('common.edit')}
                                                    </Menu.Item>
                                                    <Menu.Divider />
                                                    <Menu.Item
                                                        color="red"
                                                        leftSection={<IconTrash size={16} />}
                                                        onClick={() => handleDelete(expense.id)}
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
                )}
            </Stack>

            {/* Create/Edit Modal */}
            <Modal
                opened={opened}
                onClose={handleCloseModal}
                title={editingExpense ? t('expenses.editExpense') : t('expenses.newExpense')}
                size="md"
            >
                <Stack gap="md">
                    <NumberInput
                        label={t('expenses.amount')}
                        placeholder="0.00"
                        required
                        min={0}
                        step={0.01}
                        decimalScale={2}
                        fixedDecimalScale
                        prefix="€ "
                        value={formData.amount}
                        onChange={(value) => setFormData({ ...formData, amount: value })}
                    />

                    <TextInput
                        label={t('common.description')}
                        placeholder={t('expenses.descriptionPlaceholder')}
                        required
                        value={formData.description}
                        onChange={(e) =>
                            setFormData({ ...formData, description: e.currentTarget.value })
                        }
                    />

                    <Select
                        label={t('common.category')}
                        placeholder={t('expenses.selectCategory')}
                        required
                        data={
                            categories?.map((cat) => ({
                                value: cat.id,
                                label: `${cat.icon} ${cat.name}`,
                            })) || []
                        }
                        value={formData.categoryId}
                        onChange={(value) =>
                            setFormData({ ...formData, categoryId: value || '' })
                        }
                    />

                    <DateInput
                        label={t('common.date')}
                        placeholder={t('expenses.selectDate')}
                        required
                        value={formData.date}
                        onChange={(value) => setFormData({ ...formData, date: toDateOrNull(value) })}
                        valueFormat="DD.MM.YYYY"
                        locale="de"
                    />

                    <Group justify="flex-end" mt="md">
                        <Button variant="subtle" onClick={handleCloseModal}>
                            {t('common.cancel')}
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            loading={createLoading || updateLoading}
                        >
                            {editingExpense ? t('common.save') : t('common.create')}
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </Container>
    );
}
