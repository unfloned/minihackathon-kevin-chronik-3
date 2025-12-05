import { useState, useCallback } from 'react';
import {
    SimpleGrid,
    Skeleton,
    Paper,
    Text,
    Button,
    ThemeIcon,
    Group,
    SegmentedControl,
} from '@mantine/core';
import { PageLayout } from '../../../components/PageLayout';
import { useDisclosure } from '@mantine/hooks';
import {
    IconTarget,
    IconFlame,
    IconTrendingUp,
    IconPlus,
    IconLayoutGrid,
    IconList,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useRequest, useMutation, useConfetti, useViewMode } from '../../../hooks';
import { notifications } from '@mantine/notifications';
import { CardStatistic } from '../../../components/CardStatistic';
import type { HabitStats } from '@ycmm/core';
import type { Habit, CreateHabitForm } from '../types';
import { defaultForm } from '../types';
import { GridView, TableView, HabitFormModal } from '../components';

export default function HabitsPage() {
    const { t } = useTranslation();
    const [opened, { open, close }] = useDisclosure(false);
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
    const [globalViewMode, setViewMode] = useViewMode();
    // Map global viewMode to this page's supported modes (grid/list)
    const viewMode = globalViewMode === 'list' || globalViewMode === 'table' ? 'list' : 'grid';
    const confetti = useConfetti();

    // Helper to format unit for display
    const formatUnit = (unit?: string): string => {
        switch (unit) {
            case 'seconds': return t('habits.units.secondsShort');
            case 'minutes': return t('habits.units.minutesShort');
            case 'hours': return t('habits.units.hoursShort');
            default: return unit || '';
        }
    };

    const [form, setForm] = useState<CreateHabitForm>(defaultForm);

    const { data: habits, isLoading, refetch } = useRequest<Habit[]>('/habits/today');
    const { data: stats, refetch: refetchStats } = useRequest<HabitStats>('/habits/stats');

    const { mutate: createHabit, isLoading: creating } = useMutation<Habit, CreateHabitForm>(
        '/habits',
        { method: 'POST' }
    );

    const { mutate: updateHabit } = useMutation<Habit, { id: string; data: Partial<CreateHabitForm> }>(
        (vars) => `/habits/${vars.id}`,
        { method: 'PATCH' }
    );

    const { mutate: deleteHabit } = useMutation<void, { id: string }>(
        (vars) => `/habits/${vars.id}`,
        { method: 'DELETE' }
    );

    const { mutate: logHabit } = useMutation<Habit, { id: string; value?: number }>(
        (vars) => `/habits/${vars.id}/log`,
        { method: 'POST' }
    );

    const { mutate: startTimerApi } = useMutation<{ log: unknown; timerStartedAt: string }, { id: string }>(
        (vars) => `/habits/${vars.id}/timer/start`,
        { method: 'POST' }
    );

    const { mutate: stopTimerApi } = useMutation<{ log: unknown; xpAwarded: number; streakUpdated: boolean }, { id: string }>(
        (vars) => `/habits/${vars.id}/timer/stop`,
        { method: 'POST' }
    );

    // Check if any habit has an active timer
    const hasActiveTimer = habits?.some(h => h.timerRunning) || false;

    const handleOpenCreate = useCallback(() => {
        setEditingHabit(null);
        setForm(defaultForm);
        open();
    }, [open]);

    const handleOpenEdit = useCallback((habit: Habit) => {
        setEditingHabit(habit);
        setForm({
            name: habit.name,
            description: habit.description || '',
            icon: habit.icon,
            color: habit.color,
            type: habit.type,
            targetValue: habit.targetValue || 1,
            unit: habit.unit || '',
            frequency: habit.frequency,
        });
        open();
    }, [open]);

    const handleClose = useCallback(() => {
        setEditingHabit(null);
        close();
    }, [close]);

    const handleCreate = async () => {
        if (!form.name.trim()) {
            notifications.show({
                title: t('common.error'),
                message: t('habits.enterName'),
                color: 'red',
            });
            return;
        }

        await createHabit(form);
        notifications.show({
            title: t('common.success'),
            message: t('habits.habitCreated'),
            color: 'green',
        });
        handleClose();
        refetch();
        refetchStats();
    };

    const handleUpdate = async () => {
        if (!editingHabit || !form.name.trim()) return;

        await updateHabit({ id: editingHabit.id, data: form });
        notifications.show({
            title: t('common.success'),
            message: t('habits.habitUpdated'),
            color: 'green',
        });
        handleClose();
        refetch();
    };

    const handleDelete = useCallback(async (id: string) => {
        await deleteHabit({ id });
        notifications.show({
            title: t('common.success'),
            message: t('habits.habitDeleted'),
            color: 'green',
        });
        refetch();
        refetchStats();
    }, [deleteHabit, refetch, refetchStats, t]);

    const handleLog = useCallback(async (habit: Habit, value?: number) => {
        await logHabit({ id: habit.id, value });

        const willBeCompleted = habit.type === 'boolean'
            || (value !== undefined && habit.targetValue && value >= habit.targetValue);

        if (willBeCompleted) {
            confetti.fire();
            notifications.show({
                title: t('common.success'),
                message: t('habits.habitCompleted', { name: habit.name }),
                color: 'green',
            });
        } else {
            notifications.show({
                title: '+1',
                message: `${habit.name}: ${value}/${habit.targetValue} ${formatUnit(habit.unit)}`,
                color: habit.color,
            });
        }

        refetch();
        refetchStats();
    }, [logHabit, confetti, refetch, refetchStats, t, formatUnit]);

    const startTimer = useCallback(async (habit: Habit) => {
        await startTimerApi({ id: habit.id });
        notifications.show({
            title: t('habits.timer.started'),
            message: `${habit.name} - ${t('habits.timer.running')}`,
            color: habit.color,
        });
        await refetch();
    }, [startTimerApi, refetch, t]);

    const stopTimer = useCallback(async (habit: Habit) => {
        const result = await stopTimerApi({ id: habit.id });

        if (result && result.xpAwarded > 0) {
            confetti.fire();
            notifications.show({
                title: t('common.success'),
                message: t('habits.habitCompleted', { name: habit.name }) + ` +${result.xpAwarded} XP`,
                color: 'green',
            });
        } else {
            notifications.show({
                title: t('habits.timer.stopped'),
                message: `${habit.name} - ${t('habits.timer.progressSaved')}`,
                color: habit.color,
            });
        }

        refetch();
        refetchStats();
    }, [stopTimerApi, confetti, refetch, refetchStats, t]);

    const handleSubmit = editingHabit ? handleUpdate : handleCreate;

    return (
        <PageLayout
            header={{
                title: t('habits.title'),
                subtitle: t('habits.subtitle'),
                actionLabel: t('habits.newHabit'),
                actionIcon: <IconPlus size={18} />,
                onAction: handleOpenCreate,
            }}
        >
            {/* Stats */}
            {stats && (
                <SimpleGrid cols={{ base: 2, sm: 4 }} mb="lg">
                    <CardStatistic
                        type="circular"
                        title={t('habits.stats.today')}
                        value={`${stats.completedToday}/${stats.totalToday}`}
                        progress={stats.totalToday > 0 ? (stats.completedToday / stats.totalToday) * 100 : 0}
                        color="green"
                        subtitle={t('habits.stats.todayCompleted')}
                        ringSize={40}
                        ringThickness={4}
                    />
                    <CardStatistic
                        type="icon"
                        title={t('habits.stats.currentStreak')}
                        value={stats.currentStreak}
                        icon={IconFlame}
                        color="orange"
                        subtitle={t('common.days')}
                    />
                    <CardStatistic
                        type="icon"
                        title={t('habits.stats.longestStreak')}
                        value={stats.longestStreak}
                        icon={IconTrendingUp}
                        color="violet"
                        subtitle={t('common.days')}
                    />
                    <CardStatistic
                        type="icon"
                        title={t('habits.stats.activeHabits')}
                        value={stats.activeHabits}
                        icon={IconTarget}
                        color="blue"
                        subtitle={t('habits.stats.total')}
                    />
                </SimpleGrid>
            )}

            {/* View Mode Toggle */}
            <Group justify="flex-end" mb="md">
                <SegmentedControl
                    value={viewMode}
                    onChange={(value) => setViewMode(value as 'grid' | 'list')}
                    data={[
                        { value: 'grid', label: <IconLayoutGrid size={16} /> },
                        { value: 'list', label: <IconList size={16} /> },
                    ]}
                />
            </Group>

            {/* Habits Grid/Table */}
            {isLoading ? (
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} height={150} radius="md" />
                    ))}
                </SimpleGrid>
            ) : habits?.length === 0 ? (
                <Paper withBorder p="xl" ta="center">
                    <ThemeIcon size={64} variant="light" color="gray" radius="xl" mx="auto">
                        <IconTarget size={32} />
                    </ThemeIcon>
                    <Text mt="md" c="dimmed">
                        {t('habits.emptyState')}
                    </Text>
                    <Button mt="md" onClick={handleOpenCreate}>
                        {t('habits.createFirst')}
                    </Button>
                </Paper>
            ) : viewMode === 'list' ? (
                <TableView
                    habits={habits || []}
                    onEdit={handleOpenEdit}
                    onDelete={handleDelete}
                    onLog={handleLog}
                    onStartTimer={startTimer}
                    onStopTimer={stopTimer}
                    hasActiveTimer={hasActiveTimer}
                />
            ) : (
                <GridView
                    habits={habits || []}
                    onEdit={handleOpenEdit}
                    onDelete={handleDelete}
                    onLog={handleLog}
                    onStartTimer={startTimer}
                    onStopTimer={stopTimer}
                    hasActiveTimer={hasActiveTimer}
                />
            )}

            {/* Create/Edit Modal */}
            <HabitFormModal
                opened={opened}
                onClose={handleClose}
                form={form}
                setForm={setForm}
                editingHabit={editingHabit}
                onSubmit={handleSubmit}
                isLoading={creating}
            />
        </PageLayout>
    );
}
