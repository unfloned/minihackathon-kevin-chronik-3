import { useNavigate } from 'react-router-dom';
import {
    Container,
    Title,
    Text,
    SimpleGrid,
    Card,
    Group,
    RingProgress,
    Stack,
    Badge,
    ThemeIcon,
    Paper,
    Button,
    Progress,
    Skeleton,
    Tooltip,
    Anchor,
    ActionIcon,
} from '@mantine/core';
import {
    IconTrophy,
    IconFlame,
    IconArrowUp,
    IconArrowDown,
    IconMinus,
    IconBriefcase,
    IconCheck,
    IconCoin,
    IconCalendar,
    IconStar,
    IconCode,
    IconChartBar,
    IconInfoCircle,
} from '@tabler/icons-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useRequest } from '../../../hooks';
import { ExpenseChart } from '../../../components/ExpenseChart';
import { StreakVisualization } from '../../../components/StreakVisualization';
import type { DashboardStats } from '@ycmm/core';

// For Chaos: down = good (green), up = bad (red)
function getChaosTrendIcon(trend: number) {
    if (trend > 0) return <IconArrowUp size={14} color="var(--mantine-color-red-6)" />;
    if (trend < 0) return <IconArrowDown size={14} color="var(--mantine-color-green-6)" />;
    return <IconMinus size={14} color="var(--mantine-color-gray-6)" />;
}

function getChaosTrendColor(trend: number) {
    if (trend > 0) return 'red';    // More chaos = bad
    if (trend < 0) return 'green';  // Less chaos = good
    return 'gray';
}

// Chaos Score: 100% = bad (red), 0% = good (green)
function getChaosColor(chaos: number) {
    if (chaos <= 20) return 'green';   // Very organized
    if (chaos <= 40) return 'teal';    // Well organized
    if (chaos <= 60) return 'yellow';  // Needs attention
    if (chaos <= 80) return 'orange';  // Chaotic
    return 'red';                       // Total chaos
}


export default function DashboardPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { data: stats, isLoading } = useRequest<DashboardStats>('/dashboard/stats');

    const handleRegister = async () => {
        await logout();
        navigate('/auth');
    };

    return (
        <Container size="xl" py="xl">
            <Stack gap="lg">
                {/* Header */}
                <div>
                    <Title order={2}>Dashboard</Title>
                    <Text c="dimmed">
                        Willkommen zurück, {user?.displayName}!
                    </Text>
                </div>

            {/* Demo Banner */}
            {user?.isDemo && (
                <Paper withBorder p="md">
                    <Group justify="space-between">
                        <div>
                            <Text fw={500}>Du nutzt einen Demo-Account</Text>
                            <Text size="sm">
                                Registriere dich um deine Daten zu speichern.
                            </Text>
                        </div>
                        <Button variant="filled" size="sm" onClick={handleRegister}>
                            Jetzt registrieren
                        </Button>
                    </Group>
                </Paper>
            )}

            {/* Top Stats */}
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
                {/* Chaos Score */}
                <Card withBorder padding="lg" className="stats-card">
                    <Group justify="space-between" align="flex-start">
                        <div>
                            <Group gap={4}>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                                    Chaos Score
                                </Text>
                                <Tooltip
                                    label="Der Chaos Score zeigt wie organisiert du bist. 0% = perfekt organisiert, 100% = totales Chaos. Er basiert auf offenen Aufgaben, verpassten Deadlines, unerledigten Habits und mehr."
                                    multiline
                                    w={280}
                                    withArrow
                                    position="top"
                                >
                                    <ActionIcon variant="subtle" size="xs" color="dimmed">
                                        <IconInfoCircle size={14} />
                                    </ActionIcon>
                                </Tooltip>
                            </Group>
                            {isLoading ? (
                                <Skeleton height={32} width={60} mt="xs" />
                            ) : (
                                <>
                                    <Text size="xl" fw={700} mt="xs">
                                        {stats?.chaosScore ?? 0}%
                                    </Text>
                                    <Group gap={4} mt={4}>
                                        {getChaosTrendIcon(stats?.chaosScoreTrend ?? 0)}
                                        <Text size="xs" c={getChaosTrendColor(stats?.chaosScoreTrend ?? 0)}>
                                            {stats?.chaosScoreTrend ?? 0 > 0 ? '+' : ''}
                                            {stats?.chaosScoreTrend ?? 0}% diese Woche
                                        </Text>
                                    </Group>
                                </>
                            )}
                        </div>
                        {isLoading ? (
                            <Skeleton height={80} width={80} radius="xl" />
                        ) : (
                            <RingProgress
                                size={80}
                                thickness={8}
                                roundCaps
                                sections={[
                                    {
                                        value: stats?.chaosScore ?? 0,
                                        color: getChaosColor(stats?.chaosScore ?? 100),
                                    },
                                ]}
                            />
                        )}
                    </Group>
                </Card>

                {/* Level & XP */}
                <Card withBorder padding="lg" className="stats-card">
                    <Group justify="space-between" align="flex-start">
                        <div style={{ flex: 1 }}>
                            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                                Level
                            </Text>
                            {isLoading ? (
                                <Skeleton height={32} width={40} mt="xs" />
                            ) : (
                                <>
                                    <Text size="xl" fw={700} mt="xs">
                                        {stats?.level ?? 1}
                                    </Text>
                                    <Tooltip
                                        label={`${stats?.xpProgress?.current ?? 0} / ${stats?.xpProgress?.required ?? 100} XP`}
                                    >
                                        <Progress
                                            value={stats?.xpProgress?.percentage ?? 0}
                                            size="sm"
                                            mt="xs"
                                            color="violet"
                                        />
                                    </Tooltip>
                                    <Text size="xs" c="dimmed" mt={4}>
                                        {stats?.xp ?? 0} XP gesamt
                                    </Text>
                                </>
                            )}
                        </div>
                        <ThemeIcon size={48} radius="md" variant="light" color="violet">
                            <IconTrophy size={28} />
                        </ThemeIcon>
                    </Group>
                </Card>

                {/* Streak */}
                <Card withBorder padding="lg" className="stats-card">
                    <Group justify="space-between" align="flex-start">
                        <div>
                            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                                Streak
                            </Text>
                            {isLoading ? (
                                <Skeleton height={32} width={80} mt="xs" />
                            ) : (
                                <>
                                    <Text size="xl" fw={700} mt="xs">
                                        {stats?.streak ?? 0} Tage
                                    </Text>
                                    <Text size="xs" c="dimmed" mt={4}>
                                        {(stats?.streak ?? 0) > 0 ? 'Weiter so!' : 'Starte deine Streak!'}
                                    </Text>
                                </>
                            )}
                        </div>
                        <ThemeIcon size={48} radius="md" variant="light" color="orange">
                            <IconFlame size={28} />
                        </ThemeIcon>
                    </Group>
                </Card>
            </SimpleGrid>

            {/* Module Panels */}
            <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md">
                {/* Habits Today */}
                <Card withBorder padding="lg">
                    <Group justify="space-between" mb="md">
                        <Group gap="xs">
                            <ThemeIcon size="sm" variant="light" color="green">
                                <IconCheck size={14} />
                            </ThemeIcon>
                            <Text fw={500}>Heute's Habits</Text>
                        </Group>
                        {isLoading ? (
                            <Skeleton height={20} width={40} />
                        ) : (
                            <Badge>
                                {stats?.todayHabits?.completed ?? 0}/{stats?.todayHabits?.total ?? 0}
                            </Badge>
                        )}
                    </Group>
                    {(stats?.todayHabits?.total ?? 0) === 0 ? (
                        <Text c="dimmed" size="sm">
                            Noch keine Habits eingerichtet.
                        </Text>
                    ) : (
                        <Progress
                            value={((stats?.todayHabits?.completed ?? 0) / (stats?.todayHabits?.total ?? 1)) * 100}
                            color="green"
                        />
                    )}
                </Card>

                {/* Upcoming Deadlines */}
                <Card withBorder padding="lg">
                    <Group justify="space-between" mb="md">
                        <Group gap="xs">
                            <ThemeIcon size="sm" variant="light" color="red">
                                <IconCalendar size={14} />
                            </ThemeIcon>
                            <Text fw={500}>Nächste Fristen</Text>
                        </Group>
                        {isLoading ? (
                            <Skeleton height={20} width={30} />
                        ) : (
                            <Badge color={(stats?.upcomingDeadlines ?? 0) > 0 ? 'red' : 'gray'}>
                                {stats?.upcomingDeadlines ?? 0}
                            </Badge>
                        )}
                    </Group>
                    <Text c="dimmed" size="sm">
                        {(stats?.upcomingDeadlines ?? 0) === 0
                            ? 'Keine anstehenden Fristen.'
                            : `${stats?.upcomingDeadlines} Frist${(stats?.upcomingDeadlines ?? 0) > 1 ? 'en' : ''} diese Woche.`}
                    </Text>
                </Card>

                {/* Active Applications */}
                <Card withBorder padding="lg">
                    <Group justify="space-between" mb="md">
                        <Group gap="xs">
                            <ThemeIcon size="sm" variant="light" color="blue">
                                <IconBriefcase size={14} />
                            </ThemeIcon>
                            <Text fw={500}>Bewerbungen</Text>
                        </Group>
                        {isLoading ? (
                            <Skeleton height={20} width={30} />
                        ) : (
                            <Badge color="blue">{stats?.activeApplications ?? 0}</Badge>
                        )}
                    </Group>
                    <Text c="dimmed" size="sm">
                        {(stats?.activeApplications ?? 0) === 0
                            ? 'Keine aktiven Bewerbungen.'
                            : `${stats?.activeApplications} aktive Bewerbung${(stats?.activeApplications ?? 0) > 1 ? 'en' : ''}.`}
                    </Text>
                </Card>

                {/* Expenses This Month */}
                <Card withBorder padding="lg">
                    <Group justify="space-between" mb="md">
                        <Group gap="xs">
                            <ThemeIcon size="sm" variant="light" color="yellow">
                                <IconCoin size={14} />
                            </ThemeIcon>
                            <Text fw={500}>Ausgaben diesen Monat</Text>
                        </Group>
                    </Group>
                    {isLoading ? (
                        <Skeleton height={32} width={100} />
                    ) : (
                        <Text size="xl" fw={700}>
                            {(stats?.monthlyExpenses ?? 0).toLocaleString('de-DE', {
                                style: 'currency',
                                currency: 'EUR',
                            })}
                        </Text>
                    )}
                    <Text c="dimmed" size="sm">
                        {(stats?.monthlyExpenses ?? 0) === 0
                            ? 'Noch keine Ausgaben getrackt.'
                            : 'Diesen Monat ausgegeben.'}
                    </Text>
                </Card>

                {/* Recent Achievements */}
                <Card withBorder padding="lg">
                    <Group justify="space-between" mb="md">
                        <Group gap="xs">
                            <ThemeIcon size="sm" variant="light" color="violet">
                                <IconStar size={14} />
                            </ThemeIcon>
                            <Text fw={500}>Achievements</Text>
                        </Group>
                    </Group>
                    {isLoading ? (
                        <Stack gap="xs">
                            <Skeleton height={24} />
                            <Skeleton height={24} />
                        </Stack>
                    ) : (stats?.recentAchievements?.length ?? 0) === 0 ? (
                        <Text c="dimmed" size="sm">
                            Schalte dein erstes Achievement frei!
                        </Text>
                    ) : (
                        <Stack gap="xs">
                            {stats?.recentAchievements?.map((achievement) => (
                                <Group key={achievement.id} gap="xs">
                                    <Badge size="sm" variant="light" color="violet">
                                        +{achievement.xpReward} XP
                                    </Badge>
                                    <Text size="sm">{achievement.name}</Text>
                                </Group>
                            ))}
                        </Stack>
                    )}
                </Card>

                {/* Current Media */}
                <Card withBorder padding="lg">
                    <Group justify="space-between" mb="md">
                        <Text fw={500}>Aktuell am Schauen</Text>
                    </Group>
                    <Text c="dimmed" size="sm">
                        Keine Medien getrackt.
                    </Text>
                </Card>
            </SimpleGrid>

            {/* Expense Charts and Streak Section */}
            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
                <div>
                    <Group gap="xs" mb="md">
                        <ThemeIcon size="sm" variant="light" color="blue">
                            <IconChartBar size={14} />
                        </ThemeIcon>
                        <Text fw={500}>Ausgaben-Übersicht</Text>
                    </Group>
                    <ExpenseChart
                        isLoading={isLoading}
                        data={stats?.expenseChart}
                    />
                </div>
                <div>
                    <Group gap="xs" mb="md">
                        <ThemeIcon size="sm" variant="light" color="orange">
                            <IconFlame size={14} />
                        </ThemeIcon>
                        <Text fw={500}>Habit Streak</Text>
                    </Group>
                    <StreakVisualization
                        currentStreak={stats?.streak ?? 0}
                        longestStreak={stats?.longestStreak ?? 0}
                        completionHistory={stats?.habitHistory}
                    />
                </div>
            </SimpleGrid>

            {/* MiniHackathon Attribution */}
            <Paper withBorder p="sm" radius="md">
                <Group justify="center" gap="xs">
                    <ThemeIcon size="sm" variant="light" color="blue">
                        <IconCode size={14} />
                    </ThemeIcon>
                    <Text size="xs" c="dimmed">
                        Ein Projekt des{' '}
                        <Anchor
                            href="https://minihackathon.de/"
                            target="_blank"
                            rel="noopener noreferrer"
                            size="xs"
                        >
                            MiniHackathon 3.0
                        </Anchor>
                    </Text>
                </Group>
            </Paper>
            </Stack>
        </Container>
    );
}
