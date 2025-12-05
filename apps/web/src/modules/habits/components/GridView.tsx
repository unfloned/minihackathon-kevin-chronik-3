import { SimpleGrid } from '@mantine/core';
import type { Habit } from '../types';
import { HabitCard } from './HabitCard';

interface GridViewProps {
    habits: Habit[];
    onEdit: (habit: Habit) => void;
    onDelete: (id: string) => void;
    onLog: (habit: Habit, value?: number) => void;
    onStartTimer: (habit: Habit) => void;
    onStopTimer: (habit: Habit) => void;
    hasActiveTimer: boolean;
}

export function GridView({
    habits,
    onEdit,
    onDelete,
    onLog,
    onStartTimer,
    onStopTimer,
    hasActiveTimer,
}: GridViewProps) {
    return (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
            {habits.map((habit) => (
                <HabitCard
                    key={habit.id}
                    habit={habit}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onLog={onLog}
                    onStartTimer={onStartTimer}
                    onStopTimer={onStopTimer}
                    hasActiveTimer={hasActiveTimer}
                />
            ))}
        </SimpleGrid>
    );
}
