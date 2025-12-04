import { useState, useEffect, memo, useCallback } from 'react';
import {
    Card,
    Group,
    Stack,
    Button,
    ActionIcon,
    Progress,
    Badge,
    ThemeIcon,
    Modal,
    TextInput,
    Select,
    Textarea,
    ColorInput,
    NumberInput,
    SimpleGrid,
    Skeleton,
    Menu,
    Paper,
    Text,
    Table,
    SegmentedControl,
} from '@mantine/core';
import { PageLayout } from '../../../components/PageLayout';
import { useDisclosure } from '@mantine/hooks';
import {
    IconCheck,
    IconFlame,
    IconDotsVertical,
    IconEdit,
    IconTrash,
    IconTarget,
    IconTrendingUp,
    IconPlus,
    IconPlayerPlay,
    IconPlayerStop,
    IconLayoutGrid,
    IconList,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useRequest, useMutation, useConfetti, useViewMode } from '../../../hooks';
import { notifications } from '@mantine/notifications';
import { CardStatistic } from '../../../components/CardStatistic';
import type { HabitStats, HabitWithStatus, HabitType, HabitFrequency } from '@ycmm/core';

// Alias for component usage
type Habit = HabitWithStatus;

interface CreateHabitForm {
    name: string;
    description: string;
    icon: string;
    color: string;
    type: HabitType;
    targetValue: number;
    unit: string;
    frequency: HabitFrequency;
}

// Duration unit keys for translation
const DURATION_UNIT_KEYS = ['seconds', 'minutes', 'hours'] as const;

// Calculate elapsed seconds from server start time
const calculateElapsedSeconds = (timerStartedAt?: string): number => {
    if (!timerStartedAt) return 0;
    const startTime = new Date(timerStartedAt).getTime();
    const now = Date.now();
    return Math.floor((now - startTime) / 1000);
};

// Format seconds to display string
const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
        return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Timer display component - updates every second
const TimerDisplay = memo(function TimerDisplay({
    timerStartedAt,
    targetValue,
    unit,
    color,
    onStop,
}: {
    timerStartedAt: string;
    targetValue: number;
    unit?: string;
    color: string;
    onStop: () => void;
}) {
    const { t } = useTranslation();
    const [elapsedSeconds, setElapsedSeconds] = useState(() => calculateElapsedSeconds(timerStartedAt));

    const formatUnitShort = (u?: string): string => {
        switch (u) {
            case 'seconds': return t('habits.units.secondsShort');
            case 'minutes': return t('habits.units.minutesShort');
            case 'hours': return t('habits.units.hoursShort');
            default: return u || '';
        }
    };

    useEffect(() => {
        // Update elapsed seconds every second
        const interval = setInterval(() => {
            setElapsedSeconds(calculateElapsedSeconds(timerStartedAt));
        }, 1000);

        return () => clearInterval(interval);
    }, [timerStartedAt]);

    return (
        <Group gap="xs">
            <Badge size="lg" variant="light" color={color} style={{ fontFamily: 'monospace' }}>
                {formatTime(elapsedSeconds)} / {targetValue} {formatUnitShort(unit)}
            </Badge>
            <ActionIcon size="sm" color="red" variant="filled" onClick={onStop}>
                <IconPlayerStop size={14} />
            </ActionIcon>
        </Group>
    );
});

// HabitCard component - memoized to prevent re-renders
interface HabitCardProps {
    habit: Habit;
    onEdit: (habit: Habit) => void;
    onDelete: (id: string) => void;
    onLog: (habit: Habit, value?: number) => void;
    onStartTimer: (habit: Habit) => void;
    onStopTimer: (habit: Habit) => void;
    hasActiveTimer: boolean;
}

const HabitCard = memo(function HabitCard({
    habit,
    onEdit,
    onDelete,
    onLog,
    onStartTimer,
    onStopTimer,
    hasActiveTimer,
}: HabitCardProps) {
    const { t } = useTranslation();
    const isCompleted = habit.completedToday;
    const progress = habit.type === 'boolean'
        ? (isCompleted ? 100 : 0)
        : ((habit.todayValue || 0) / (habit.targetValue || 1)) * 100;

    const formatUnitShort = (u?: string): string => {
        switch (u) {
            case 'seconds': return t('habits.units.secondsShort');
            case 'minutes': return t('habits.units.minutesShort');
            case 'hours': return t('habits.units.hoursShort');
            default: return u || '';
        }
    };

    return (
        <Card shadow="sm" withBorder padding="lg" radius="md" style={{ borderColor: isCompleted ? habit.color : undefined }}>
            <Group justify="space-between" align="flex-start" mb="sm">
                <Group gap="sm">
                    <ThemeIcon size="lg" radius="md" color={habit.color} variant={isCompleted ? 'filled' : 'light'}>
                        <IconTarget size={20} />
                    </ThemeIcon>
                    <div>
                        <Text fw={600}>{habit.name}</Text>
                        {habit.description && (
                            <Text size="sm" c="dimmed" lineClamp={1}>
                                {habit.description}
                            </Text>
                        )}
                    </div>
                </Group>
                <Menu shadow="md" position="bottom-end">
                    <Menu.Target>
                        <ActionIcon variant="subtle" size="sm">
                            <IconDotsVertical size={16} />
                        </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Item
                            leftSection={<IconEdit size={16} />}
                            onClick={() => onEdit(habit)}
                        >
                            {t('common.edit')}
                        </Menu.Item>
                        <Menu.Divider />
                        <Menu.Item
                            leftSection={<IconTrash size={16} />}
                            color="red"
                            onClick={() => onDelete(habit.id)}
                        >
                            {t('common.delete')}
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </Group>

            <Progress value={progress} color={habit.color} size="sm" mb="sm" />

            <Group justify="space-between" align="center">
                <Group gap="xs">
                    <Badge size="sm" variant="light" color="orange" leftSection={<IconFlame size={12} />}>
                        {t('habits.streak', { count: habit.currentStreak })}
                    </Badge>
                    {habit.type !== 'boolean' && (
                        <Text size="xs" c="dimmed">
                            {habit.todayValue || 0} / {habit.targetValue} {formatUnitShort(habit.unit)}
                        </Text>
                    )}
                </Group>

                {/* Boolean habit button */}
                {!isCompleted && habit.type === 'boolean' && (
                    <Button
                        size="xs"
                        color={habit.color}
                        leftSection={<IconCheck size={14} />}
                        onClick={() => onLog(habit)}
                    >
                        {t('common.done')}
                    </Button>
                )}

                {/* Quantity habit button */}
                {!isCompleted && habit.type === 'quantity' && (
                    <Button
                        size="xs"
                        color={habit.color}
                        leftSection={<IconCheck size={14} />}
                        onClick={() => onLog(habit, (habit.todayValue || 0) + 1)}
                    >
                        +1
                    </Button>
                )}

                {/* Duration habit timer controls */}
                {!isCompleted && habit.type === 'duration' && (
                    <>
                        {habit.timerRunning && habit.timerStartedAt ? (
                            <TimerDisplay
                                timerStartedAt={habit.timerStartedAt}
                                targetValue={habit.targetValue || 0}
                                unit={habit.unit}
                                color={habit.color}
                                onStop={() => onStopTimer(habit)}
                            />
                        ) : (
                            <Button
                                size="xs"
                                color={habit.color}
                                leftSection={<IconPlayerPlay size={14} />}
                                onClick={() => onStartTimer(habit)}
                                disabled={hasActiveTimer}
                            >
                                {t('habits.timer.start')}
                            </Button>
                        )}
                    </>
                )}

                {isCompleted && (
                    <Badge color="green" variant="filled">
                        {t('common.done')}
                    </Badge>
                )}
            </Group>
        </Card>
    );
});

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

    // Duration unit options with translations
    const DURATION_UNITS = DURATION_UNIT_KEYS.map(key => ({
        value: key,
        label: t(`habits.units.${key}`)
    }));

    const [form, setForm] = useState<CreateHabitForm>({
        name: '',
        description: '',
        icon: 'check',
        color: '#228be6',
        type: 'boolean',
        targetValue: 1,
        unit: '',
        frequency: 'daily',
    });

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
        setForm({
            name: '',
            description: '',
            icon: 'check',
            color: '#228be6',
            type: 'boolean',
            targetValue: 1,
            unit: '',
            frequency: 'daily',
        });
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
                <Paper shadow="sm" withBorder radius="md">
                    <Table striped highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>{t('common.name')}</Table.Th>
                                <Table.Th>{t('common.type')}</Table.Th>
                                <Table.Th>{t('common.progress')}</Table.Th>
                                <Table.Th>Streak</Table.Th>
                                <Table.Th>{t('common.status')}</Table.Th>
                                <Table.Th>{t('common.actions')}</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {habits?.map((habit) => {
                                const isCompleted = habit.completedToday;
                                const progress = habit.type === 'boolean'
                                    ? (isCompleted ? 100 : 0)
                                    : ((habit.todayValue || 0) / (habit.targetValue || 1)) * 100;

                                return (
                                    <Table.Tr key={habit.id}>
                                        <Table.Td>
                                            <Group gap="xs">
                                                <ThemeIcon size={24} radius="md" color={habit.color} variant={isCompleted ? 'filled' : 'light'}>
                                                    <IconTarget size={14} />
                                                </ThemeIcon>
                                                <div>
                                                    <Text size="sm" fw={500}>{habit.name}</Text>
                                                    {habit.description && (
                                                        <Text size="xs" c="dimmed" lineClamp={1}>{habit.description}</Text>
                                                    )}
                                                </div>
                                            </Group>
                                        </Table.Td>
                                        <Table.Td>
                                            <Badge variant="light" size="sm">
                                                {habit.type === 'boolean' ? 'Ja/Nein' : habit.type === 'quantity' ? 'Menge' : 'Dauer'}
                                            </Badge>
                                        </Table.Td>
                                        <Table.Td>
                                            <Group gap="xs">
                                                <Progress value={progress} color={habit.color} size="sm" style={{ width: 80 }} />
                                                {habit.type !== 'boolean' && (
                                                    <Text size="xs" c="dimmed">
                                                        {habit.todayValue || 0}/{habit.targetValue} {formatUnit(habit.unit)}
                                                    </Text>
                                                )}
                                            </Group>
                                        </Table.Td>
                                        <Table.Td>
                                            <Badge size="sm" variant="light" color="orange" leftSection={<IconFlame size={10} />}>
                                                {habit.currentStreak} Tage
                                            </Badge>
                                        </Table.Td>
                                        <Table.Td>
                                            {isCompleted ? (
                                                <Badge color="green" variant="filled" size="sm">Erledigt</Badge>
                                            ) : (
                                                <Badge color="gray" variant="light" size="sm">Offen</Badge>
                                            )}
                                        </Table.Td>
                                        <Table.Td>
                                            <Group gap="xs">
                                                {/* Boolean habit button */}
                                                {!isCompleted && habit.type === 'boolean' && (
                                                    <ActionIcon
                                                        size="sm"
                                                        color={habit.color}
                                                        variant="filled"
                                                        onClick={() => handleLog(habit)}
                                                    >
                                                        <IconCheck size={14} />
                                                    </ActionIcon>
                                                )}

                                                {/* Quantity habit button */}
                                                {!isCompleted && habit.type === 'quantity' && (
                                                    <Button
                                                        size="xs"
                                                        color={habit.color}
                                                        variant="filled"
                                                        onClick={() => handleLog(habit, (habit.todayValue || 0) + 1)}
                                                    >
                                                        +1
                                                    </Button>
                                                )}

                                                {/* Duration habit timer controls */}
                                                {!isCompleted && habit.type === 'duration' && (
                                                    <>
                                                        {habit.timerRunning && habit.timerStartedAt ? (
                                                            <ActionIcon
                                                                size="sm"
                                                                color="red"
                                                                variant="filled"
                                                                onClick={() => stopTimer(habit)}
                                                            >
                                                                <IconPlayerStop size={14} />
                                                            </ActionIcon>
                                                        ) : (
                                                            <ActionIcon
                                                                size="sm"
                                                                color={habit.color}
                                                                variant="filled"
                                                                onClick={() => startTimer(habit)}
                                                                disabled={hasActiveTimer}
                                                            >
                                                                <IconPlayerPlay size={14} />
                                                            </ActionIcon>
                                                        )}
                                                    </>
                                                )}

                                                <Menu shadow="md">
                                                    <Menu.Target>
                                                        <ActionIcon variant="subtle" size="sm">
                                                            <IconDotsVertical size={14} />
                                                        </ActionIcon>
                                                    </Menu.Target>
                                                    <Menu.Dropdown>
                                                        <Menu.Item
                                                            leftSection={<IconEdit size={14} />}
                                                            onClick={() => handleOpenEdit(habit)}
                                                        >
                                                            Bearbeiten
                                                        </Menu.Item>
                                                        <Menu.Divider />
                                                        <Menu.Item
                                                            leftSection={<IconTrash size={14} />}
                                                            color="red"
                                                            onClick={() => handleDelete(habit.id)}
                                                        >
                                                            Löschen
                                                        </Menu.Item>
                                                    </Menu.Dropdown>
                                                </Menu>
                                            </Group>
                                        </Table.Td>
                                    </Table.Tr>
                                );
                            })}
                        </Table.Tbody>
                    </Table>
                </Paper>
            ) : (
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
                    {habits?.map((habit) => (
                        <HabitCard
                            key={habit.id}
                            habit={habit}
                            onEdit={handleOpenEdit}
                            onDelete={handleDelete}
                            onLog={handleLog}
                            onStartTimer={startTimer}
                            onStopTimer={stopTimer}
                            hasActiveTimer={hasActiveTimer}
                        />
                    ))}
                </SimpleGrid>
            )}

            {/* Create/Edit Modal */}
            <Modal
                opened={opened}
                onClose={handleClose}
                title={editingHabit ? t('habits.editHabit') : t('habits.newHabit')}
                size="md"
            >
                <Stack>
                    <TextInput
                        label={t('common.name')}
                        placeholder={t('habits.placeholder')}
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.currentTarget.value })}
                        required
                    />

                    <Textarea
                        label={t('common.description')}
                        placeholder={t('common.optional')}
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.currentTarget.value })}
                    />

                    <Select
                        label={t('common.type')}
                        data={[
                            { value: 'boolean', label: `${t('habits.types.boolean')} (${t('habits.types.booleanDesc')})` },
                            { value: 'quantity', label: `${t('habits.types.quantity')} (${t('habits.types.quantityDesc')})` },
                            { value: 'duration', label: `${t('habits.types.duration')} (${t('habits.types.durationDesc')})` },
                        ]}
                        value={form.type}
                        onChange={(value) => {
                            const newType = (value as CreateHabitForm['type']) || 'boolean';
                            setForm({
                                ...form,
                                type: newType,
                                unit: newType === 'duration' ? 'minutes' : '',
                            });
                        }}
                    />

                    {form.type === 'quantity' && (
                        <Group grow>
                            <NumberInput
                                label={t('habits.targetValue')}
                                min={1}
                                value={form.targetValue}
                                onChange={(value) => setForm({ ...form, targetValue: Number(value) || 1 })}
                            />
                            <TextInput
                                label={t('habits.unit')}
                                placeholder={t('habits.unitPlaceholder')}
                                value={form.unit}
                                onChange={(e) => setForm({ ...form, unit: e.currentTarget.value })}
                            />
                        </Group>
                    )}

                    {form.type === 'duration' && (
                        <Group grow>
                            <NumberInput
                                label={t('habits.targetValue')}
                                min={1}
                                value={form.targetValue}
                                onChange={(value) => setForm({ ...form, targetValue: Number(value) || 1 })}
                            />
                            <Select
                                label={t('habits.unit')}
                                data={DURATION_UNITS}
                                value={form.unit || 'minutes'}
                                onChange={(value) => setForm({ ...form, unit: value || 'minutes' })}
                            />
                        </Group>
                    )}

                    <Select
                        label={t('habits.frequency.daily').replace('Täglich', 'Frequenz')}
                        data={[
                            { value: 'daily', label: t('habits.frequency.daily') },
                            { value: 'weekly', label: t('habits.frequency.weekly') },
                        ]}
                        value={form.frequency}
                        onChange={(value) => setForm({ ...form, frequency: (value as CreateHabitForm['frequency']) || 'daily' })}
                    />

                    <ColorInput
                        label={t('common.color')}
                        value={form.color}
                        onChange={(color) => setForm({ ...form, color })}
                        swatches={[
                            '#228be6', '#40c057', '#fab005', '#fd7e14',
                            '#fa5252', '#be4bdb', '#7950f2', '#15aabf',
                        ]}
                    />

                    <Button
                        onClick={editingHabit ? handleUpdate : handleCreate}
                        loading={creating}
                        fullWidth
                        mt="md"
                    >
                        {editingHabit ? t('common.save') : t('common.create')}
                    </Button>
                </Stack>
            </Modal>
        </PageLayout>
    );
}
