import { useMemo } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import { Paper, Text, Group, Stack, SimpleGrid, Skeleton } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useTranslation } from 'react-i18next';

interface ExpenseChartProps {
    data?: {
        categories: { name: string; total: number; color: string }[];
        monthlyTrend: { month: string; amount: number }[];
    };
    isLoading?: boolean;
}

export function ExpenseChart({ data, isLoading }: ExpenseChartProps) {
    const { t } = useTranslation();
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const chartColors = useMemo(() => ({
        grid: isDark ? '#2C2E33' : '#E9ECEF',
        text: isDark ? '#909296' : '#868E96',
        area: '#228be6',
        areaGradientStart: isDark ? 'rgba(34, 139, 230, 0.3)' : 'rgba(34, 139, 230, 0.2)',
        areaGradientEnd: isDark ? 'rgba(34, 139, 230, 0.05)' : 'rgba(34, 139, 230, 0.02)',
    }), [isDark]);

    if (isLoading) {
        return (
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                <Paper withBorder p="md" radius="md">
                    <Skeleton height={200} />
                </Paper>
                <Paper withBorder p="md" radius="md">
                    <Skeleton height={200} />
                </Paper>
            </SimpleGrid>
        );
    }

    const trendData = data?.monthlyTrend ?? [];
    const categoryData = data?.categories ?? [];

    // Check if we have any real data
    const hasExpenseData = trendData.some(d => d.amount > 0) || categoryData.length > 0;

    if (!hasExpenseData) {
        return (
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                <Paper withBorder p="md" radius="md">
                    <Text fw={500} mb="md">{t('expenseChart.trend', { defaultValue: 'Expense Trend' })}</Text>
                    <Stack align="center" justify="center" h={200}>
                        <Text c="dimmed" size="sm" ta="center">
                            {t('dashboard.noExpensesTracked')}
                        </Text>
                        <Text c="dimmed" size="xs" ta="center">
                            {t('expenseChart.addExpenses', { defaultValue: 'Add expenses to see your trend.' })}
                        </Text>
                    </Stack>
                </Paper>
                <Paper withBorder p="md" radius="md">
                    <Text fw={500} mb="md">{t('expenses.byCategory')}</Text>
                    <Stack align="center" justify="center" h={200}>
                        <Text c="dimmed" size="sm" ta="center">
                            {t('expenseChart.noCategories', { defaultValue: 'No category data available.' })}
                        </Text>
                    </Stack>
                </Paper>
            </SimpleGrid>
        );
    }

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <Paper withBorder p="xs" radius="sm" shadow="sm">
                    <Text size="sm" fw={500}>{label}</Text>
                    <Text size="sm" c="blue">
                        {payload[0].value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                    </Text>
                </Paper>
            );
        }
        return null;
    };

    const PieTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <Paper withBorder p="xs" radius="sm" shadow="sm">
                    <Text size="sm" fw={500}>{payload[0].name}</Text>
                    <Text size="sm" c={payload[0].payload.color}>
                        {payload[0].value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                    </Text>
                </Paper>
            );
        }
        return null;
    };

    return (
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
            {/* Trend Chart */}
            <Paper withBorder p="md" radius="md">
                <Text fw={500} mb="md">{t('expenseChart.trend', { defaultValue: 'Expense Trend' })}</Text>
                <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={chartColors.areaGradientStart} stopOpacity={0.8}/>
                                <stop offset="95%" stopColor={chartColors.areaGradientEnd} stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                        <XAxis
                            dataKey="month"
                            tick={{ fill: chartColors.text, fontSize: 12 }}
                            axisLine={{ stroke: chartColors.grid }}
                        />
                        <YAxis
                            tick={{ fill: chartColors.text, fontSize: 12 }}
                            axisLine={{ stroke: chartColors.grid }}
                            tickFormatter={(value) => `${value}€`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="amount"
                            stroke={chartColors.area}
                            strokeWidth={2}
                            fill="url(#expenseGradient)"
                            animationDuration={1500}
                            animationEasing="ease-out"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </Paper>

            {/* Category Pie Chart */}
            <Paper withBorder p="md" radius="md">
                <Text fw={500} mb="md">{t('expenses.byCategory')}</Text>
                <Group justify="center">
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={80}
                                paddingAngle={2}
                                dataKey="total"
                                animationDuration={1500}
                                animationEasing="ease-out"
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip content={<PieTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </Group>
                <Stack gap={4} mt="sm">
                    {categoryData.slice(0, 4).map((cat) => (
                        <Group key={cat.name} justify="space-between" gap="xs">
                            <Group gap="xs">
                                <div style={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    backgroundColor: cat.color,
                                }} />
                                <Text size="xs">{cat.name}</Text>
                            </Group>
                            <Text size="xs" c="dimmed">
                                {cat.total.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                            </Text>
                        </Group>
                    ))}
                </Stack>
            </Paper>
        </SimpleGrid>
    );
}

export default ExpenseChart;
