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
    RingProgress,
    Skeleton,
    Menu,
    Paper,
    Text,
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
} from '@tabler/icons-react';
import { useRequest, useMutation, useConfetti } from '../../../hooks';
import { notifications } from '@mantine/notifications';
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

// Duration unit options
const DURATION_UNITS = [
    { value: 'seconds', label: 'Sekunden' },
    { value: 'minutes', label: 'Minuten' },
    { value: 'hours', label: 'Stunden' },
];

// Helper to format unit for display
const formatUnit = (unit?: string): string => {
    switch (unit) {
        case 'seconds': return 'Sek';
        case 'minutes': return 'Min';
        case 'hours': return 'Std';
        default: return unit || '';
    }
};

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
    const [elapsedSeconds, setElapsedSeconds] = useState(() => calculateElapsedSeconds(timerStartedAt));

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
                {formatTime(elapsedSeconds)} / {targetValue} {formatUnit(unit)}
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
    const isCompleted = habit.completedToday;
    const progress = habit.type === 'boolean'
        ? (isCompleted ? 100 : 0)
        : ((habit.todayValue || 0) / (habit.targetValue || 1)) * 100;

    return (
        <Card withBorder padding="lg" style={{ borderColor: isCompleted ? habit.color : undefined }}>
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
                            Bearbeiten
                        </Menu.Item>
                        <Menu.Divider />
                        <Menu.Item
                            leftSection={<IconTrash size={16} />}
                            color="red"
                            onClick={() => onDelete(habit.id)}
                        >
                            Löschen
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </Group>

            <Progress value={progress} color={habit.color} size="sm" mb="sm" />

            <Group justify="space-between" align="center">
                <Group gap="xs">
                    <Badge size="sm" variant="light" color="orange" leftSection={<IconFlame size={12} />}>
                        {habit.currentStreak} Tage
                    </Badge>
                    {habit.type !== 'boolean' && (
                        <Text size="xs" c="dimmed">
                            {habit.todayValue || 0} / {habit.targetValue} {formatUnit(habit.unit)}
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
                        Erledigt
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
                                Timer starten
                            </Button>
                        )}
                    </>
                )}

                {isCompleted && (
                    <Badge color="green" variant="filled">
                        Erledigt
                    </Badge>
                )}
            </Group>
        </Card>
    );
});

export default function HabitsPage() {
    const [opened, { open, close }] = useDisclosure(false);
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
    const confetti = useConfetti();

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
                title: 'Fehler',
                message: 'Bitte gib einen Namen ein',
                color: 'red',
            });
            return;
        }

        await createHabit(form);
        notifications.show({
            title: 'Erfolg',
            message: 'Habit erstellt',
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
            title: 'Erfolg',
            message: 'Habit aktualisiert',
            color: 'green',
        });
        handleClose();
        refetch();
    };

    const handleDelete = useCallback(async (id: string) => {
        await deleteHabit({ id });
        notifications.show({
            title: 'Erfolg',
            message: 'Habit gelöscht',
            color: 'green',
        });
        refetch();
        refetchStats();
    }, [deleteHabit, refetch, refetchStats]);

    const handleLog = useCallback(async (habit: Habit, value?: number) => {
        await logHabit({ id: habit.id, value });

        const willBeCompleted = habit.type === 'boolean'
            || (value !== undefined && habit.targetValue && value >= habit.targetValue);

        if (willBeCompleted) {
            confetti.fire();
            notifications.show({
                title: 'Super!',
                message: `${habit.name} erledigt!`,
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
    }, [logHabit, confetti, refetch, refetchStats]);

    const startTimer = useCallback(async (habit: Habit) => {
        await startTimerApi({ id: habit.id });
        notifications.show({
            title: 'Timer gestartet',
            message: `${habit.name} - Timer läuft`,
            color: habit.color,
        });
        await refetch();
    }, [startTimerApi, refetch]);

    const stopTimer = useCallback(async (habit: Habit) => {
        const result = await stopTimerApi({ id: habit.id });

        if (result && result.xpAwarded > 0) {
            confetti.fire();
            notifications.show({
                title: 'Super!',
                message: `${habit.name} erledigt! +${result.xpAwarded} XP`,
                color: 'green',
            });
        } else {
            notifications.show({
                title: 'Timer gestoppt',
                message: `${habit.name} - Fortschritt gespeichert`,
                color: habit.color,
            });
        }

        refetch();
        refetchStats();
    }, [stopTimerApi, confetti, refetch, refetchStats]);

    return (
        <PageLayout
            header={{
                title: "Habits",
                subtitle: "Baue positive Gewohnheiten auf",
                actionLabel: "Neues Habit",
                actionIcon: <IconPlus size={18} />,
                onAction: handleOpenCreate,
            }}
        >
            {/* Stats */}
            {stats && (
                <SimpleGrid cols={{ base: 2, sm: 4 }} mb="lg">
                    <Paper withBorder p="md" ta="center">
                        <RingProgress
                            size={60}
                            thickness={6}
                            roundCaps
                            sections={[
                                { value: stats.totalToday > 0 ? (stats.completedToday / stats.totalToday) * 100 : 0, color: 'green' },
                            ]}
                            mx="auto"
                            mb="xs"
                        />
                        <Text size="sm" c="dimmed">Heute</Text>
                        <Text fw={700}>{stats.completedToday}/{stats.totalToday}</Text>
                    </Paper>
                    <Paper withBorder p="md" ta="center">
                        <ThemeIcon size={40} radius="xl" color="orange" variant="light" mx="auto" mb="xs">
                            <IconFlame size={24} />
                        </ThemeIcon>
                        <Text size="sm" c="dimmed">Aktuelle Streak</Text>
                        <Text fw={700}>{stats.currentStreak} Tage</Text>
                    </Paper>
                    <Paper withBorder p="md" ta="center">
                        <ThemeIcon size={40} radius="xl" color="violet" variant="light" mx="auto" mb="xs">
                            <IconTrendingUp size={24} />
                        </ThemeIcon>
                        <Text size="sm" c="dimmed">Längste Streak</Text>
                        <Text fw={700}>{stats.longestStreak} Tage</Text>
                    </Paper>
                    <Paper withBorder p="md" ta="center">
                        <ThemeIcon size={40} radius="xl" color="blue" variant="light" mx="auto" mb="xs">
                            <IconTarget size={24} />
                        </ThemeIcon>
                        <Text size="sm" c="dimmed">Aktive Habits</Text>
                        <Text fw={700}>{stats.activeHabits}</Text>
                    </Paper>
                </SimpleGrid>
            )}

            {/* Habits Grid */}
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
                        Noch keine Habits vorhanden
                    </Text>
                    <Button mt="md" onClick={handleOpenCreate}>
                        Erstes Habit erstellen
                    </Button>
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
                title={editingHabit ? 'Habit bearbeiten' : 'Neues Habit'}
                size="md"
            >
                <Stack>
                    <TextInput
                        label="Name"
                        placeholder="z.B. Wasser trinken"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.currentTarget.value })}
                        required
                    />

                    <Textarea
                        label="Beschreibung"
                        placeholder="Optional"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.currentTarget.value })}
                    />

                    <Select
                        label="Typ"
                        data={[
                            { value: 'boolean', label: 'Ja/Nein (einmal täglich)' },
                            { value: 'quantity', label: 'Menge (z.B. 8 Gläser)' },
                            { value: 'duration', label: 'Dauer (z.B. 30 Minuten)' },
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
                                label="Zielwert"
                                min={1}
                                value={form.targetValue}
                                onChange={(value) => setForm({ ...form, targetValue: Number(value) || 1 })}
                            />
                            <TextInput
                                label="Einheit"
                                placeholder="z.B. Gläser, Stück"
                                value={form.unit}
                                onChange={(e) => setForm({ ...form, unit: e.currentTarget.value })}
                            />
                        </Group>
                    )}

                    {form.type === 'duration' && (
                        <Group grow>
                            <NumberInput
                                label="Zielwert"
                                min={1}
                                value={form.targetValue}
                                onChange={(value) => setForm({ ...form, targetValue: Number(value) || 1 })}
                            />
                            <Select
                                label="Einheit"
                                data={DURATION_UNITS}
                                value={form.unit || 'minutes'}
                                onChange={(value) => setForm({ ...form, unit: value || 'minutes' })}
                            />
                        </Group>
                    )}

                    <Select
                        label="Frequenz"
                        data={[
                            { value: 'daily', label: 'Täglich' },
                            { value: 'weekly', label: 'Wöchentlich' },
                        ]}
                        value={form.frequency}
                        onChange={(value) => setForm({ ...form, frequency: (value as CreateHabitForm['frequency']) || 'daily' })}
                    />

                    <ColorInput
                        label="Farbe"
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
                        {editingHabit ? 'Speichern' : 'Erstellen'}
                    </Button>
                </Stack>
            </Modal>
        </PageLayout>
    );
}
