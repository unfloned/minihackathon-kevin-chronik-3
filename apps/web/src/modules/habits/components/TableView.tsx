import {
    Paper,
    Table,
    Group,
    ThemeIcon,
    Text,
    Badge,
    Progress,
    ActionIcon,
    Button,
    Menu,
} from '@mantine/core';
import {
    IconTarget,
    IconFlame,
    IconCheck,
    IconPlayerPlay,
    IconPlayerStop,
    IconDotsVertical,
    IconEdit,
    IconTrash,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { Habit } from '../types';

interface TableViewProps {
    habits: Habit[];
    onEdit: (habit: Habit) => void;
    onDelete: (id: string) => void;
    onLog: (habit: Habit, value?: number) => void;
    onStartTimer: (habit: Habit) => void;
    onStopTimer: (habit: Habit) => void;
    hasActiveTimer: boolean;
}

export function TableView({
    habits,
    onEdit,
    onDelete,
    onLog,
    onStartTimer,
    onStopTimer,
    hasActiveTimer,
}: TableViewProps) {
    const { t } = useTranslation();

    const formatUnit = (unit?: string): string => {
        switch (unit) {
            case 'seconds': return t('habits.units.secondsShort');
            case 'minutes': return t('habits.units.minutesShort');
            case 'hours': return t('habits.units.hoursShort');
            default: return unit || '';
        }
    };

    return (
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
                    {habits.map((habit) => {
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
                                                onClick={() => onLog(habit)}
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
                                                onClick={() => onLog(habit, (habit.todayValue || 0) + 1)}
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
                                                        onClick={() => onStopTimer(habit)}
                                                    >
                                                        <IconPlayerStop size={14} />
                                                    </ActionIcon>
                                                ) : (
                                                    <ActionIcon
                                                        size="sm"
                                                        color={habit.color}
                                                        variant="filled"
                                                        onClick={() => onStartTimer(habit)}
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
                                                    onClick={() => onEdit(habit)}
                                                >
                                                    Bearbeiten
                                                </Menu.Item>
                                                <Menu.Divider />
                                                <Menu.Item
                                                    leftSection={<IconTrash size={14} />}
                                                    color="red"
                                                    onClick={() => onDelete(habit.id)}
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
    );
}
