import { memo } from 'react';
import {
    Card,
    Group,
    Button,
    ActionIcon,
    Progress,
    Badge,
    ThemeIcon,
    Menu,
    Text,
} from '@mantine/core';
import {
    IconCheck,
    IconFlame,
    IconDotsVertical,
    IconEdit,
    IconTrash,
    IconTarget,
    IconPlayerPlay,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { Habit } from '../types';
import { TimerDisplay } from './TimerDisplay';

interface HabitCardProps {
    habit: Habit;
    onEdit: (habit: Habit) => void;
    onDelete: (id: string) => void;
    onLog: (habit: Habit, value?: number) => void;
    onStartTimer: (habit: Habit) => void;
    onStopTimer: (habit: Habit) => void;
    hasActiveTimer: boolean;
}

export const HabitCard = memo(function HabitCard({
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
