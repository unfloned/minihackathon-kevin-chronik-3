import { useState } from 'react';
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
    Loader,
    Menu,
    Paper,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import {
    IconPlus,
    IconDotsVertical,
    IconEdit,
    IconTrash,
    IconChartPie,
    IconReceipt,
    IconCategory,
} from '@tabler/icons-react';
import { useRequest, useMutation } from '../../../hooks';
import { notifications } from '@mantine/notifications';

interface Expense {
    id: string;
    amount: number;
    description: string;
    categoryId: string;
    category?: { id: string; name: string; color: string; icon: string };
    date: string;
    createdAt: string;
}

interface ExpenseCategory {
    id: string;
    name: string;
    color: string;
    icon: string;
}

interface ExpenseStats {
    total: number;
    byCategory: {
        categoryId: string;
        categoryName: string;
        categoryColor: string;
        categoryIcon: string;
        amount: number;
        count: number;
    }[];
}

interface ExpenseFormData {
    amount: number | string;
    description: string;
    categoryId: string;
    date: Date | null;
}

export default function ExpensesPage() {
    const [opened, { open, close }] = useDisclosure(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

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
                title: 'Erfolg',
                message: 'Ausgabe erfolgreich erstellt',
                color: 'green',
            });
            refetchExpenses();
            refetchStats();
            handleCloseModal();
        },
        onError: () => {
            notifications.show({
                title: 'Fehler',
                message: 'Ausgabe konnte nicht erstellt werden',
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
                title: 'Erfolg',
                message: 'Ausgabe erfolgreich aktualisiert',
                color: 'green',
            });
            refetchExpenses();
            refetchStats();
            handleCloseModal();
        },
        onError: () => {
            notifications.show({
                title: 'Fehler',
                message: 'Ausgabe konnte nicht aktualisiert werden',
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
                    title: 'Erfolg',
                    message: 'Ausgabe erfolgreich gelöscht',
                    color: 'green',
                });
                refetchExpenses();
                refetchStats();
            },
            onError: () => {
                notifications.show({
                    title: 'Fehler',
                    message: 'Ausgabe konnte nicht gelöscht werden',
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
                title: 'Fehler',
                message: 'Bitte alle Felder ausfüllen',
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
        if (window.confirm('Möchten Sie diese Ausgabe wirklich löschen?')) {
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
                    <div>
                        <Title order={1}>Ausgaben</Title>
                        <Text c="dimmed" size="sm" mt="xs">
                            {getMonthName()}
                        </Text>
                    </div>
                    <Button
                        leftSection={<IconPlus size={18} />}
                        onClick={() => handleOpenModal()}
                    >
                        Neue Ausgabe
                    </Button>
                </Group>

                {/* Stats Cards */}
                <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
                    <Card shadow="sm" padding="lg" radius="md" withBorder>
                        <Group justify="space-between" mb="md">
                            <Text size="sm" c="dimmed" fw={500}>
                                Gesamt Ausgaben
                            </Text>
                            <ThemeIcon color="blue" variant="light" size="lg" radius="md">
                                <IconReceipt size={20} />
                            </ThemeIcon>
                        </Group>
                        <Text size="xl" fw={700}>
                            {formatCurrency(stats?.total || 0)}
                        </Text>
                        <Text size="xs" c="dimmed" mt="xs">
                            {expenses?.length || 0} Transaktionen
                        </Text>
                    </Card>

                    <Card shadow="sm" padding="lg" radius="md" withBorder>
                        <Group justify="space-between" mb="md">
                            <Text size="sm" c="dimmed" fw={500}>
                                Kategorien
                            </Text>
                            <ThemeIcon color="grape" variant="light" size="lg" radius="md">
                                <IconCategory size={20} />
                            </ThemeIcon>
                        </Group>
                        <Text size="xl" fw={700}>
                            {stats?.byCategory?.length || 0}
                        </Text>
                        <Text size="xs" c="dimmed" mt="xs">
                            Verschiedene Kategorien
                        </Text>
                    </Card>

                    <Card shadow="sm" padding="lg" radius="md" withBorder>
                        <Group justify="space-between" mb="md">
                            <Text size="sm" c="dimmed" fw={500}>
                                Durchschnitt
                            </Text>
                            <ThemeIcon color="teal" variant="light" size="lg" radius="md">
                                <IconChartPie size={20} />
                            </ThemeIcon>
                        </Group>
                        <Text size="xl" fw={700}>
                            {formatCurrency(
                                expenses && expenses.length > 0
                                    ? (stats?.total || 0) / expenses.length
                                    : 0
                            )}
                        </Text>
                        <Text size="xs" c="dimmed" mt="xs">
                            Pro Transaktion
                        </Text>
                    </Card>
                </SimpleGrid>

                {/* Category Breakdown */}
                {stats?.byCategory && stats.byCategory.length > 0 && (
                    <Card shadow="sm" padding="lg" radius="md" withBorder>
                        <Text size="lg" fw={600} mb="md">
                            Ausgaben nach Kategorie
                        </Text>
                        <Stack gap="md">
                            {stats.byCategory.map((cat) => (
                                <Paper key={cat.categoryId} p="sm" withBorder>
                                    <Group justify="space-between" mb="xs">
                                        <Group gap="xs">
                                            <Badge color={cat.categoryColor} variant="light">
                                                {cat.categoryIcon}
                                            </Badge>
                                            <Text fw={500}>{cat.categoryName}</Text>
                                        </Group>
                                        <Text fw={700}>{formatCurrency(cat.amount)}</Text>
                                    </Group>
                                    <Group gap="xs">
                                        <Text size="xs" c="dimmed">
                                            {cat.count} {cat.count === 1 ? 'Transaktion' : 'Transaktionen'}
                                        </Text>
                                        <Text size="xs" c="dimmed">
                                            •
                                        </Text>
                                        <Text size="xs" c="dimmed">
                                            {((cat.amount / (stats.total || 1)) * 100).toFixed(1)}%
                                        </Text>
                                    </Group>
                                </Paper>
                            ))}
                        </Stack>
                    </Card>
                )}

                {/* Expenses List */}
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Text size="lg" fw={600} mb="md">
                        Alle Ausgaben
                    </Text>
                    {!expenses || expenses.length === 0 ? (
                        <Text c="dimmed" ta="center" py="xl">
                            Keine Ausgaben für diesen Monat vorhanden
                        </Text>
                    ) : (
                        <Table striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Datum</Table.Th>
                                    <Table.Th>Beschreibung</Table.Th>
                                    <Table.Th>Kategorie</Table.Th>
                                    <Table.Th style={{ textAlign: 'right' }}>Betrag</Table.Th>
                                    <Table.Th style={{ textAlign: 'right' }}>Aktionen</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {expenses.map((expense) => (
                                    <Table.Tr key={expense.id}>
                                        <Table.Td>{formatDate(expense.date)}</Table.Td>
                                        <Table.Td>{expense.description}</Table.Td>
                                        <Table.Td>
                                            {expense.category ? (
                                                <Badge
                                                    color={expense.category.color}
                                                    variant="light"
                                                    leftSection={<span>{expense.category.icon}</span>}
                                                >
                                                    {expense.category.name}
                                                </Badge>
                                            ) : (
                                                <Text size="sm" c="dimmed">
                                                    Keine Kategorie
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
                                                        Bearbeiten
                                                    </Menu.Item>
                                                    <Menu.Divider />
                                                    <Menu.Item
                                                        color="red"
                                                        leftSection={<IconTrash size={16} />}
                                                        onClick={() => handleDelete(expense.id)}
                                                    >
                                                        Löschen
                                                    </Menu.Item>
                                                </Menu.Dropdown>
                                            </Menu>
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    )}
                </Card>
            </Stack>

            {/* Create/Edit Modal */}
            <Modal
                opened={opened}
                onClose={handleCloseModal}
                title={editingExpense ? 'Ausgabe bearbeiten' : 'Neue Ausgabe'}
                size="md"
            >
                <Stack gap="md">
                    <NumberInput
                        label="Betrag"
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
                        label="Beschreibung"
                        placeholder="z.B. Einkauf bei Edeka"
                        required
                        value={formData.description}
                        onChange={(e) =>
                            setFormData({ ...formData, description: e.currentTarget.value })
                        }
                    />

                    <Select
                        label="Kategorie"
                        placeholder="Kategorie auswählen"
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
                        label="Datum"
                        placeholder="Datum auswählen"
                        required
                        value={formData.date}
                        onChange={(value) => setFormData({ ...formData, date: value })}
                        valueFormat="DD.MM.YYYY"
                        locale="de"
                    />

                    <Group justify="flex-end" mt="md">
                        <Button variant="subtle" onClick={handleCloseModal}>
                            Abbrechen
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            loading={createLoading || updateLoading}
                        >
                            {editingExpense ? 'Speichern' : 'Erstellen'}
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </Container>
    );
}
