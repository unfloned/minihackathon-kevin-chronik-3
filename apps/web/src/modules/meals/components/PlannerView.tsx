import {
    Stack,
    Group,
    Text,
    Button,
    SimpleGrid,
    Paper,
    ActionIcon,
} from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { MealWithDetails, MealPlanWithDetails, MealType } from '@ycmm/core';
import { mealTypeOptions } from '../types';

interface PlannerViewProps {
    weekStart: Date;
    weekEnd: Date;
    weekDays: Date[];
    mealPlans: MealPlanWithDetails[] | undefined;
    meals: MealWithDetails[] | undefined;
    onPlanMeal: (date?: Date, mealType?: MealType) => void;
    onDeletePlan: (id: string) => void;
}

export function PlannerView({
    weekStart,
    weekEnd,
    weekDays,
    mealPlans,
    meals,
    onPlanMeal,
    onDeletePlan,
}: PlannerViewProps) {
    const { t } = useTranslation();

    const getPlansByDate = (date: Date) => {
        if (!mealPlans) return [];
        const dateStr = date.toISOString().split('T')[0];
        return mealPlans.filter(plan => plan.date.split('T')[0] === dateStr);
    };

    const getMealForPlan = (mealId?: string) => {
        if (!mealId || !meals) return null;
        return meals.find(m => m.id === mealId);
    };

    const getMealTypeIcon = (type: MealType) => {
        const config = mealTypeOptions.find(t => t.value === type);
        const Icon = config?.icon;
        return Icon ? <Icon size={16} /> : null;
    };

    return (
        <Stack gap="lg">
            <Group justify="space-between">
                <Text size="lg" fw={500}>
                    {t('meals.planner.weekOf', {
                        start: weekStart.toLocaleDateString('de-DE'),
                        end: weekEnd.toLocaleDateString('de-DE')
                    })}
                </Text>
                <Button
                    leftSection={<IconPlus size={16} />}
                    onClick={() => onPlanMeal()}
                >
                    {t('meals.planner.planMeal')}
                </Button>
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 7 }} spacing="md">
                {weekDays.map(date => {
                    const plans = getPlansByDate(date);
                    const isToday = date.toDateString() === new Date().toDateString();

                    return (
                        <Paper
                            key={date.toISOString()}
                            shadow="sm"
                            p="md"
                            radius="md"
                            withBorder
                            style={{
                                background: isToday ? 'var(--mantine-color-blue-0)' : undefined
                            }}
                        >
                            <Stack gap="sm">
                                <div>
                                    <Text size="xs" c="dimmed">
                                        {date.toLocaleDateString('de-DE', { weekday: 'short' })}
                                    </Text>
                                    <Text fw={500}>
                                        {date.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}
                                    </Text>
                                </div>

                                <Stack gap="xs">
                                    {mealTypeOptions.map(mealTypeOpt => {
                                        const plan = plans.find(p => p.mealType === mealTypeOpt.value);
                                        const meal = plan?.meal || (plan ? getMealForPlan(plan.meal?.id) : null);

                                        return (
                                            <Paper
                                                key={mealTypeOpt.value}
                                                p="xs"
                                                withBorder
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => !plan && onPlanMeal(date, mealTypeOpt.value)}
                                            >
                                                {plan ? (
                                                    <Group justify="space-between" gap="xs">
                                                        <Stack gap={2} style={{ flex: 1 }}>
                                                            <Group gap={5}>
                                                                {getMealTypeIcon(mealTypeOpt.value)}
                                                                <Text size="xs" c="dimmed">
                                                                    {t(mealTypeOpt.label)}
                                                                </Text>
                                                            </Group>
                                                            <Text size="sm" lineClamp={2}>
                                                                {meal?.name || plan.customMealName || t('meals.planner.planned')}
                                                            </Text>
                                                        </Stack>
                                                        <ActionIcon
                                                            size="sm"
                                                            variant="subtle"
                                                            color="red"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onDeletePlan(plan.id);
                                                            }}
                                                        >
                                                            <IconTrash size={14} />
                                                        </ActionIcon>
                                                    </Group>
                                                ) : (
                                                    <Group gap={5}>
                                                        {getMealTypeIcon(mealTypeOpt.value)}
                                                        <Text size="xs" c="dimmed">
                                                            {t(mealTypeOpt.label)}
                                                        </Text>
                                                    </Group>
                                                )}
                                            </Paper>
                                        );
                                    })}
                                </Stack>
                            </Stack>
                        </Paper>
                    );
                })}
            </SimpleGrid>
        </Stack>
    );
}
