import { useNavigate } from 'react-router-dom';
import {
    Container,
    Text,
    SimpleGrid,
    Card,
    Group,
    Stack,
    Badge,
    ThemeIcon,
    Paper,
    Button,
    Progress,
    Skeleton,
    Anchor,
    Alert,
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
} from '@tabler/icons-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useRequest } from '../../../hooks';
import { PageTitle } from '../../../components/PageTitle';
import { CardStatistic } from '../../../components/CardStatistic';
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
                <PageTitle title="Dashboard" subtitle={`Willkommen zurück, ${user?.displayName}!`} />

            {/* Demo Banner */}
            {user?.isDemo && (
                <Alert variant="light" color="blue" title="Du nutzt einen Demo-Account mit Beispieldaten">
                    <Group justify="space-between" align="center">
                        <Text size="sm">
                            Registriere dich für deinen eigenen Account mit deinen persönlichen Daten.
                        </Text>
                        <Button variant="filled" size="sm" onClick={handleRegister}>
                            Jetzt registrieren
                        </Button>
                    </Group>
                </Alert>
            )}

            {/* Top Stats */}
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
                <CardStatistic
                    type="circular"
                    title="Chaos Score"
                    value={`${stats?.chaosScore ?? 0}%`}
                    progress={stats?.chaosScore ?? 0}
                    color={getChaosColor(stats?.chaosScore ?? 100)}
                    ringSize={80}
                    ringThickness={8}
                    tooltip="Der Chaos Score zeigt wie organisiert du bist. 0% = perfekt organisiert, 100% = totales Chaos. Er basiert auf offenen Aufgaben, verpassten Deadlines, unerledigten Habits und mehr."
                    trend={{
                        value: stats?.chaosScoreTrend ?? 0,
                        label: `${(stats?.chaosScoreTrend ?? 0) > 0 ? '+' : ''}${stats?.chaosScoreTrend ?? 0}% diese Woche`,
                        icon: getChaosTrendIcon(stats?.chaosScoreTrend ?? 0),
                        color: getChaosTrendColor(stats?.chaosScoreTrend ?? 0),
                    }}
                    isLoading={isLoading}
                />

                <CardStatistic
                    type="extended"
                    title="Level"
                    value={stats?.level ?? 1}
                    icon={IconTrophy}
                    color="violet"
                    progress={stats?.xpProgress?.percentage ?? 0}
                    progressTooltip={`${stats?.xpProgress?.current ?? 0} / ${stats?.xpProgress?.required ?? 100} XP`}
                    subtitle={`${stats?.xp ?? 0} XP gesamt`}
                    isLoading={isLoading}
                />

                <CardStatistic
                    type="icon"
                    title="Streak"
                    value={`${stats?.streak ?? 0} Tage`}
                    icon={IconFlame}
                    color="orange"
                    subtitle={(stats?.streak ?? 0) > 0 ? 'Weiter so!' : 'Starte deine Streak!'}
                    isLoading={isLoading}
                />
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
