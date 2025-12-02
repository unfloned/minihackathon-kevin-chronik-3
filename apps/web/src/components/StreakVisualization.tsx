import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Paper,
    Text,
    Group,
    Stack,
    ThemeIcon,
    Tooltip,
    Box,
} from '@mantine/core';
import { IconFlame, IconTrophy, IconStar } from '@tabler/icons-react';
import { useMantineColorScheme } from '@mantine/core';

interface StreakVisualizationProps {
    currentStreak: number;
    longestStreak: number;
    completionHistory?: { date: string; completed: boolean }[];
}

// Animated flame component
function AnimatedFlame({ size = 48, intensity = 1 }: { size?: number; intensity?: number }) {
    const flameColor = intensity >= 0.8 ? '#EF4444' : intensity >= 0.5 ? '#F97316' : '#FBBF24';

    return (
        <motion.div
            style={{
                display: 'inline-flex',
                filter: `drop-shadow(0 0 ${8 * intensity}px ${flameColor})`,
            }}
            animate={{
                scale: [1, 1.1, 1],
                y: [0, -2, 0],
            }}
            transition={{
                duration: 0.8,
                repeat: Infinity,
                ease: 'easeInOut',
            }}
        >
            <IconFlame size={size} color={flameColor} fill={flameColor} />
        </motion.div>
    );
}

// Calendar heatmap for habit completion
function CalendarHeatmap({
    data,
    isDark
}: {
    data: { date: string; completed: boolean }[];
    isDark: boolean;
}) {
    const today = new Date();
    const weeks = useMemo(() => {
        const result: { date: Date; completed: boolean | null }[][] = [];
        const dataMap = new Map(data.map(d => [d.date, d.completed]));

        // Generate last 12 weeks (84 days)
        for (let w = 11; w >= 0; w--) {
            const week: { date: Date; completed: boolean | null }[] = [];
            for (let d = 0; d < 7; d++) {
                const date = new Date(today);
                date.setDate(today.getDate() - (w * 7 + (6 - d)));
                const dateStr = date.toISOString().split('T')[0];
                week.push({
                    date,
                    completed: date > today ? null : (dataMap.get(dateStr) ?? false),
                });
            }
            result.push(week);
        }
        return result;
    }, [data]);

    const getColor = (completed: boolean | null) => {
        if (completed === null) return isDark ? '#1A1B1E' : '#F1F3F5';
        if (completed) return '#22C55E';
        return isDark ? '#2C2E33' : '#E9ECEF';
    };

    const dayLabels = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

    return (
        <Box>
            <Group gap={2} mb={4}>
                <Box w={20} />
                {dayLabels.map((label) => (
                    <Text key={label} size="xs" c="dimmed" w={14} ta="center">
                        {label}
                    </Text>
                ))}
            </Group>
            <Group gap={2} align="flex-start">
                {weeks.map((week, weekIndex) => (
                    <Stack key={weekIndex} gap={2}>
                        {week.map((day, dayIndex) => (
                            <Tooltip
                                key={dayIndex}
                                label={day.completed === null
                                    ? 'Zukunft'
                                    : `${day.date.toLocaleDateString('de-DE')} - ${day.completed ? 'Erledigt' : 'Verpasst'}`
                                }
                                withArrow
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{
                                        delay: weekIndex * 0.02 + dayIndex * 0.01,
                                        type: 'spring',
                                        stiffness: 200,
                                    }}
                                    style={{
                                        width: 14,
                                        height: 14,
                                        borderRadius: 3,
                                        backgroundColor: getColor(day.completed),
                                        cursor: 'pointer',
                                    }}
                                    whileHover={{ scale: 1.2 }}
                                />
                            </Tooltip>
                        ))}
                    </Stack>
                ))}
            </Group>
        </Box>
    );
}

// Streak milestones display
function StreakMilestones({ currentStreak }: { currentStreak: number }) {
    const milestones = [
        { days: 7, label: '1 Woche', icon: IconStar, color: 'yellow' },
        { days: 14, label: '2 Wochen', icon: IconStar, color: 'orange' },
        { days: 30, label: '1 Monat', icon: IconTrophy, color: 'blue' },
        { days: 60, label: '2 Monate', icon: IconTrophy, color: 'violet' },
        { days: 100, label: '100 Tage', icon: IconTrophy, color: 'pink' },
        { days: 365, label: '1 Jahr', icon: IconFlame, color: 'red' },
    ];

    return (
        <Group gap="xs" wrap="wrap">
            {milestones.map((milestone) => {
                const achieved = currentStreak >= milestone.days;
                return (
                    <Tooltip
                        key={milestone.days}
                        label={achieved
                            ? `${milestone.label} erreicht!`
                            : `Noch ${milestone.days - currentStreak} Tage bis ${milestone.label}`
                        }
                        withArrow
                    >
                        <motion.div
                            animate={achieved ? { scale: [1, 1.1, 1] } : {}}
                            transition={{ duration: 0.3 }}
                        >
                            <ThemeIcon
                                size="md"
                                variant={achieved ? 'filled' : 'light'}
                                color={achieved ? milestone.color : 'gray'}
                                style={{
                                    opacity: achieved ? 1 : 0.4,
                                    filter: achieved ? `drop-shadow(0 0 4px var(--mantine-color-${milestone.color}-5))` : 'none',
                                }}
                            >
                                <milestone.icon size={14} />
                            </ThemeIcon>
                        </motion.div>
                    </Tooltip>
                );
            })}
        </Group>
    );
}

export function StreakVisualization({
    currentStreak,
    longestStreak,
    completionHistory = []
}: StreakVisualizationProps) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    // Calculate streak intensity (0-1) for visual effects
    const intensity = Math.min(currentStreak / 30, 1);

    // Check if we have any real habit data
    const hasHabitData = completionHistory.length > 0 && completionHistory.some(h => h.completed);
    const noHabitsYet = currentStreak === 0 && longestStreak === 0 && !hasHabitData;

    if (noHabitsYet) {
        return (
            <Paper withBorder p="md" radius="md">
                <Stack align="center" justify="center" h={250}>
                    <IconFlame size={48} color="var(--mantine-color-gray-5)" />
                    <Text c="dimmed" ta="center">
                        Noch keine Habits erfasst.
                    </Text>
                    <Text c="dimmed" size="xs" ta="center">
                        Erstelle Habits um deine Streak zu starten!
                    </Text>
                </Stack>
            </Paper>
        );
    }

    return (
        <Paper withBorder p="md" radius="md">
            <Stack gap="lg">
                {/* Streak Counter with Flame */}
                <Group justify="space-between" align="flex-start">
                    <Stack gap="xs">
                        <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                            Aktuelle Streak
                        </Text>
                        <Group gap="md" align="center">
                            <AnimatedFlame
                                size={currentStreak > 0 ? 48 + Math.min(currentStreak, 30) : 48}
                                intensity={intensity}
                            />
                            <div>
                                <motion.div
                                    key={currentStreak}
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: 'spring', stiffness: 200 }}
                                >
                                    <Text
                                        size="3rem"
                                        fw={900}
                                        style={{
                                            background: currentStreak > 0
                                                ? 'linear-gradient(135deg, #F97316 0%, #EF4444 100%)'
                                                : 'var(--mantine-color-dimmed)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            lineHeight: 1,
                                        }}
                                    >
                                        {currentStreak}
                                    </Text>
                                </motion.div>
                                <Text size="sm" c="dimmed">
                                    {currentStreak === 1 ? 'Tag' : 'Tage'}
                                </Text>
                            </div>
                        </Group>
                    </Stack>

                    <Stack gap={4} align="flex-end">
                        <Text size="xs" c="dimmed">Längste Streak</Text>
                        <Group gap="xs">
                            <IconTrophy size={16} color="var(--mantine-color-yellow-5)" />
                            <Text fw={600}>{longestStreak} Tage</Text>
                        </Group>
                    </Stack>
                </Group>

                {/* Milestones */}
                <div>
                    <Text size="sm" fw={500} mb="xs">Meilensteine</Text>
                    <StreakMilestones currentStreak={currentStreak} />
                </div>

                {/* Calendar Heatmap */}
                <div>
                    <Text size="sm" fw={500} mb="xs">Letzte 12 Wochen</Text>
                    <CalendarHeatmap data={completionHistory} isDark={isDark} />
                    <Group justify="flex-end" gap="xs" mt="xs">
                        <Text size="xs" c="dimmed">Weniger</Text>
                        <Group gap={2}>
                            {[
                                isDark ? '#2C2E33' : '#E9ECEF',
                                '#86EFAC',
                                '#4ADE80',
                                '#22C55E',
                            ].map((color, i) => (
                                <Box
                                    key={i}
                                    w={12}
                                    h={12}
                                    style={{ backgroundColor: color, borderRadius: 2 }}
                                />
                            ))}
                        </Group>
                        <Text size="xs" c="dimmed">Mehr</Text>
                    </Group>
                </div>
            </Stack>
        </Paper>
    );
}

export default StreakVisualization;
