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
    IconBulb,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import { useRequest } from '../../../hooks';
import { PageTitle } from '../../../components/PageTitle';
import { CardStatistic } from '../../../components/CardStatistic';
import { ExpenseChart } from '../../../components/ExpenseChart';
import { StreakVisualization } from '../../../components/StreakVisualization';
import type { DashboardStats } from '@ycmm/core';
import { useMemo } from 'react';

// Daily tips - index is selected based on day of year
const DAILY_TIPS = [
    'tips.trackHabitsDaily',
    'tips.setDeadlinesEarly',
    'tips.reviewExpensesWeekly',
    'tips.breakdownProjects',
    'tips.celebrateAchievements',
    'tips.useKanban',
    'tips.shareWishlists',
    'tips.trackMedia',
    'tips.organizeInventory',
    'tips.createLists',
    'tips.voiceNotes',
    'tips.consistencyMatters',
    'tips.smallSteps',
    'tips.reduceChaos',
];

function getTipOfTheDay(): string {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    return DAILY_TIPS[dayOfYear % DAILY_TIPS.length];
}

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
    const { t } = useTranslation();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { data: stats, isLoading } = useRequest<DashboardStats>('/dashboard/stats');

    // Get the tip of the day
    const tipKey = useMemo(() => getTipOfTheDay(), []);

    const handleRegister = async () => {
        await logout();
        navigate('/auth');
    };

    return (
        <Container size="xl" py="xl">
            <Stack gap="lg">
                {/* Header */}
                <PageTitle title={t('dashboard.title')} subtitle={t('dashboard.welcome', { name: user?.displayName })} />

            {/* Demo Banner */}
            {user?.isDemo && (
                <Alert variant="light" color="blue" title={t('dashboard.demoAccount')}>
                    <Group justify="space-between" align="center">
                        <Text size="sm">
                            {t('dashboard.demoRegisterPrompt')}
                        </Text>
                        <Button variant="filled" size="sm" onClick={handleRegister}>
                            {t('dashboard.registerNow')}
                        </Button>
                    </Group>
                </Alert>
            )}

            {/* Tip of the Day */}
            <Card withBorder padding="md" radius="md" bg="var(--mantine-color-yellow-light)">
                <Group gap="md" wrap="nowrap">
                    <ThemeIcon size={40} variant="gradient" gradient={{ from: 'yellow', to: 'orange' }} radius="xl">
                        <IconBulb size={20} />
                    </ThemeIcon>
                    <div>
                        <Group gap="xs" mb={4}>
                            <Text fw={600} size="sm">{t('dashboard.tipOfTheDay')}</Text>
                            <Badge size="xs" variant="gradient" gradient={{ from: 'yellow', to: 'orange' }}>
                                {t('landing.hotFeature.badge')}
                            </Badge>
                        </Group>
                        <Text size="sm">{t(tipKey)}</Text>
                    </div>
                </Group>
            </Card>

            {/* Top Stats */}
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
                <CardStatistic
                    type="circular"
                    title={t('dashboard.chaosScore')}
                    value={`${stats?.chaosScore ?? 0}%`}
                    progress={stats?.chaosScore ?? 0}
                    color={getChaosColor(stats?.chaosScore ?? 100)}
                    ringSize={80}
                    ringThickness={8}
                    tooltip={t('dashboard.chaosScoreTooltip')}
                    trend={{
                        value: stats?.chaosScoreTrend ?? 0,
                        label: t('dashboard.chaosScoreTrend', { value: `${(stats?.chaosScoreTrend ?? 0) > 0 ? '+' : ''}${stats?.chaosScoreTrend ?? 0}` }),
                        icon: getChaosTrendIcon(stats?.chaosScoreTrend ?? 0),
                        color: getChaosTrendColor(stats?.chaosScoreTrend ?? 0),
                    }}
                    isLoading={isLoading}
                />

                <CardStatistic
                    type="extended"
                    title={t('dashboard.level')}
                    value={stats?.level ?? 1}
                    icon={IconTrophy}
                    color="violet"
                    progress={stats?.xpProgress?.percentage ?? 0}
                    progressTooltip={`${stats?.xpProgress?.current ?? 0} / ${stats?.xpProgress?.required ?? 100} XP`}
                    subtitle={t('dashboard.xpTotal', { xp: stats?.xp ?? 0 })}
                    isLoading={isLoading}
                />

                <CardStatistic
                    type="icon"
                    title={t('dashboard.streak')}
                    value={t('habits.streak', { count: stats?.streak ?? 0 })}
                    icon={IconFlame}
                    color="orange"
                    subtitle={(stats?.streak ?? 0) > 0 ? t('dashboard.keepGoing') : t('dashboard.startStreak')}
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
                            <Text fw={500}>{t('dashboard.todayHabits')}</Text>
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
                            {t('dashboard.noHabitsSetup')}
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
                            <Text fw={500}>{t('dashboard.upcomingDeadlines')}</Text>
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
                            ? t('dashboard.noUpcomingDeadlines')
                            : t('dashboard.deadlinesThisWeek', { count: stats?.upcomingDeadlines ?? 0 })}
                    </Text>
                </Card>

                {/* Active Applications */}
                <Card withBorder padding="lg">
                    <Group justify="space-between" mb="md">
                        <Group gap="xs">
                            <ThemeIcon size="sm" variant="light" color="blue">
                                <IconBriefcase size={14} />
                            </ThemeIcon>
                            <Text fw={500}>{t('nav.applications')}</Text>
                        </Group>
                        {isLoading ? (
                            <Skeleton height={20} width={30} />
                        ) : (
                            <Badge color="blue">{stats?.activeApplications ?? 0}</Badge>
                        )}
                    </Group>
                    <Text c="dimmed" size="sm">
                        {(stats?.activeApplications ?? 0) === 0
                            ? t('dashboard.noActiveApplications')
                            : t('dashboard.activeApplications', { count: stats?.activeApplications ?? 0 })}
                    </Text>
                </Card>

                {/* Expenses This Month */}
                <Card withBorder padding="lg">
                    <Group justify="space-between" mb="md">
                        <Group gap="xs">
                            <ThemeIcon size="sm" variant="light" color="yellow">
                                <IconCoin size={14} />
                            </ThemeIcon>
                            <Text fw={500}>{t('dashboard.expensesThisMonth')}</Text>
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
                            ? t('dashboard.noExpensesTracked')
                            : t('dashboard.spentThisMonth')}
                    </Text>
                </Card>

                {/* Recent Achievements */}
                <Card withBorder padding="lg">
                    <Group justify="space-between" mb="md">
                        <Group gap="xs">
                            <ThemeIcon size="sm" variant="light" color="violet">
                                <IconStar size={14} />
                            </ThemeIcon>
                            <Text fw={500}>{t('nav.achievements')}</Text>
                        </Group>
                    </Group>
                    {isLoading ? (
                        <Stack gap="xs">
                            <Skeleton height={24} />
                            <Skeleton height={24} />
                        </Stack>
                    ) : (stats?.recentAchievements?.length ?? 0) === 0 ? (
                        <Text c="dimmed" size="sm">
                            {t('dashboard.unlockFirstAchievement')}
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
                        <Text fw={500}>{t('dashboard.currentlyWatching')}</Text>
                    </Group>
                    <Text c="dimmed" size="sm">
                        {t('dashboard.noMediaTracked')}
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
                        <Text fw={500}>{t('dashboard.expenseOverview')}</Text>
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
                        <Text fw={500}>{t('dashboard.habitStreak')}</Text>
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
                        {t('dashboard.projectOf')}{' '}
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
