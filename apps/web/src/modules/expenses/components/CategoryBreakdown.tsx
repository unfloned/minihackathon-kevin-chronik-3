import { Card, Text, SimpleGrid, Paper, Group, ThemeIcon, Progress } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { ExpenseStats } from '../types';

interface CategoryBreakdownProps {
    stats: ExpenseStats | undefined | null;
    formatCurrency: (amount: number) => string;
}

export function CategoryBreakdown({ stats, formatCurrency }: CategoryBreakdownProps) {
    const { t } = useTranslation();

    if (!stats?.byCategory || stats.byCategory.length === 0) {
        return null;
    }

    return (
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
    );
}
