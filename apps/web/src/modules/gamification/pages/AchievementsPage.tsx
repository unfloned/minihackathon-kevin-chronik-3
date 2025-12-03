import {
    Container,
    Title,
    Text,
    SimpleGrid,
    Card,
    Group,
    Stack,
    Badge,
    ThemeIcon,
    Progress,
    Paper,
    SegmentedControl,
    Skeleton,
    Tooltip,
    RingProgress,
} from '@mantine/core';
import {
    IconTrophy,
    IconLock,
    IconCheck,
    IconFlame,
    IconStar,
    IconCalendar,
    IconCoin,
    IconBriefcase,
    IconRepeat,
    IconDoor,
    IconUserCheck,
    IconCheckbox,
    IconCrown,
    IconCalendarCheck,
    IconConfetti,
    IconPigMoney,
    IconSend,
    IconChartLine,
    IconCoins,
    IconCalendarEvent,
    IconCalendarStats,
    IconListCheck,
} from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { useRequest, useConfetti } from '../../../hooks';
import type { AchievementPublic, GamificationStats } from '@ycmm/core';

// Achievement interface extends AchievementPublic with additional fields for display
interface Achievement extends AchievementPublic {
    requirement?: number;
    isHidden?: boolean;
}

const iconMap: Record<string, React.ElementType> = {
    'door': IconDoor,
    'user-check': IconUserCheck,
    'flame': IconFlame,
    'crown': IconCrown,
    'check': IconCheck,
    'check-double': IconCheckbox,
    'trophy': IconTrophy,
    'calendar-event': IconCalendarEvent,
    'calendar-check': IconCalendarCheck,
    'calendar-stats': IconCalendarStats,
    'confetti': IconConfetti,
    'repeat': IconRepeat,
    'list-check': IconListCheck,
    'pig-money': IconPigMoney,
    'briefcase': IconBriefcase,
    'send': IconSend,
    'calendar': IconCalendar,
    'star': IconStar,
    'coin': IconCoin,
    'coins': IconCoins,
    'chart-line': IconChartLine,
    'piggy-bank': IconPigMoney,
};

const categoryLabels: Record<string, string> = {
    all: 'Alle',
    general: 'Allgemein',
    streaks: 'Streaks',
    habits: 'Habits',
    deadlines: 'Fristen',
    subscriptions: 'Abos',
    applications: 'Bewerbungen',
    expenses: 'Ausgaben',
};

const categoryColors: Record<string, string> = {
    general: 'blue',
    streaks: 'orange',
    habits: 'green',
    deadlines: 'red',
    subscriptions: 'violet',
    applications: 'cyan',
    expenses: 'yellow',
};

export default function AchievementsPage() {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const confetti = useConfetti();

    const { data: allAchievements, isLoading: loadingAll } = useRequest<Achievement[]>(
        '/gamification/achievements'
    );
    const { data: userAchievements, isLoading: loadingUser } = useRequest<AchievementPublic[]>(
        '/gamification/user-achievements'
    );
    const { data: stats, isLoading: loadingStats } = useRequest<GamificationStats>(
        '/gamification/stats'
    );

    const isLoading = loadingAll || loadingUser || loadingStats;
    const unlockedIds = new Set(userAchievements?.map(a => a.id) || []);

    // Trigger confetti only once per session when new achievements are unlocked
    useEffect(() => {
        const currentCount = userAchievements?.length ?? 0;
        const sessionKey = 'achievements_celebrated_count';
        const celebratedCount = parseInt(sessionStorage.getItem(sessionKey) || '0', 10);

        // Only celebrate if we have new achievements since last celebration
        if (currentCount > celebratedCount && currentCount > 0) {
            confetti.achievementUnlock();
            sessionStorage.setItem(sessionKey, currentCount.toString());
        }
    }, [userAchievements?.length, confetti]);

    const filteredAchievements = allAchievements?.filter(
        a => selectedCategory === 'all' || a.category === selectedCategory
    ) || [];

    const categories = ['all', ...new Set(allAchievements?.map(a => a.category) || [])];

    const totalAchievements = allAchievements?.length || 0;
    const unlockedCount = userAchievements?.length || 0;
    const completionPercentage = totalAchievements > 0
        ? Math.round((unlockedCount / totalAchievements) * 100)
        : 0;

    return (
        <Container size="xl" py="xl">
            <Stack gap="xl">
                {/* Header */}
                <div>
                    <Title order={2}>Achievements</Title>
                    <Text c="dimmed">
                        Schalte Achievements frei und sammle XP!
                    </Text>
                </div>

                {/* Stats Overview */}
                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
                    {/* Level Card */}
                    <Card withBorder padding="lg" className="stats-card">
                        <Group justify="space-between">
                            <div>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                                    Level
                                </Text>
                                {isLoading ? (
                                    <Skeleton height={36} width={60} mt="xs" />
                                ) : (
                                    <Text size="2rem" fw={700} mt="xs">
                                        {stats?.level ?? 1}
                                    </Text>
                                )}
                            </div>
                            <ThemeIcon size={56} variant="light" color="violet" radius="xl">
                                <IconStar size={28} />
                            </ThemeIcon>
                        </Group>
                        {!isLoading && (
                            <Tooltip label={`${stats?.xpProgress?.current ?? 0} / ${stats?.xpProgress?.required ?? 100} XP`}>
                                <Progress
                                    value={stats?.xpProgress?.percentage ?? 0}
                                    size="md"
                                    mt="md"
                                    color="violet"
                                    radius="xl"
                                />
                            </Tooltip>
                        )}
                    </Card>

                    {/* XP Card */}
                    <Card withBorder padding="lg" className="stats-card">
                        <Group justify="space-between">
                            <div>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                                    Gesamt XP
                                </Text>
                                {isLoading ? (
                                    <Skeleton height={36} width={80} mt="xs" />
                                ) : (
                                    <Text size="2rem" fw={700} mt="xs">
                                        {stats?.xp?.toLocaleString() ?? 0}
                                    </Text>
                                )}
                            </div>
                            <ThemeIcon size={56} variant="light" color="yellow" radius="xl">
                                <IconCoin size={28} />
                            </ThemeIcon>
                        </Group>
                    </Card>

                    {/* Achievements Progress Card */}
                    <Card withBorder padding="lg" className="stats-card">
                        <Group justify="space-between">
                            <div>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                                    Achievements
                                </Text>
                                {isLoading ? (
                                    <Skeleton height={36} width={80} mt="xs" />
                                ) : (
                                    <Text size="2rem" fw={700} mt="xs">
                                        {unlockedCount} / {totalAchievements}
                                    </Text>
                                )}
                            </div>
                            <RingProgress
                                size={56}
                                thickness={6}
                                roundCaps
                                sections={[{ value: completionPercentage, color: 'teal' }]}
                                label={
                                    <Text ta="center" size="xs" fw={700}>
                                        {completionPercentage}%
                                    </Text>
                                }
                            />
                        </Group>
                    </Card>
                </SimpleGrid>

                {/* Category Filter */}
                <Paper withBorder p="md">
                    <SegmentedControl
                        value={selectedCategory}
                        onChange={setSelectedCategory}
                        data={categories.map(cat => ({
                            label: categoryLabels[cat] || cat,
                            value: cat,
                        }))}
                        fullWidth
                    />
                </Paper>

                {/* Achievements Grid */}
                {isLoading ? (
                    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                        {[...Array(6)].map((_, i) => (
                            <Skeleton key={i} height={140} radius="md" />
                        ))}
                    </SimpleGrid>
                ) : (
                    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                        {filteredAchievements.map(achievement => {
                            const isUnlocked = unlockedIds.has(achievement.id);
                            const IconComponent = iconMap[achievement.icon] || IconTrophy;
                            const userAchievement = userAchievements?.find(a => a.id === achievement.id);

                            return (
                                <Card
                                    key={achievement.id}
                                    withBorder
                                    padding="lg"
                                    style={{
                                        opacity: isUnlocked ? 1 : 0.6,
                                        borderColor: isUnlocked
                                            ? `var(--mantine-color-${categoryColors[achievement.category]}-5)`
                                            : undefined,
                                        transition: 'transform 0.2s ease, opacity 0.2s ease',
                                    }}
                                >
                                    <Group justify="space-between" align="flex-start">
                                        <Group gap="md">
                                            <ThemeIcon
                                                size={48}
                                                variant={isUnlocked ? 'filled' : 'light'}
                                                color={isUnlocked ? categoryColors[achievement.category] : 'gray'}
                                                radius="xl"
                                            >
                                                {isUnlocked ? (
                                                    <IconComponent size={24} />
                                                ) : (
                                                    <IconLock size={24} />
                                                )}
                                            </ThemeIcon>
                                            <div>
                                                <Text fw={600}>{achievement.name}</Text>
                                                <Text size="sm" c="dimmed">
                                                    {achievement.description}
                                                </Text>
                                            </div>
                                        </Group>
                                    </Group>

                                    <Group justify="space-between" mt="md">
                                        <Badge
                                            variant="light"
                                            color={categoryColors[achievement.category]}
                                        >
                                            {categoryLabels[achievement.category]}
                                        </Badge>
                                        <Badge
                                            variant={isUnlocked ? 'filled' : 'outline'}
                                            color="yellow"
                                            leftSection={<IconCoin size={12} />}
                                        >
                                            +{achievement.xpReward} XP
                                        </Badge>
                                    </Group>

                                    {isUnlocked && userAchievement?.unlockedAt && (
                                        <Text size="xs" c="dimmed" mt="sm">
                                            Freigeschaltet am {new Date(userAchievement.unlockedAt).toLocaleDateString('de-DE')}
                                        </Text>
                                    )}
                                </Card>
                            );
                        })}
                    </SimpleGrid>
                )}

                {filteredAchievements.length === 0 && !isLoading && (
                    <Paper withBorder p="xl" ta="center">
                        <ThemeIcon size={64} variant="light" color="gray" radius="xl" mx="auto">
                            <IconTrophy size={32} />
                        </ThemeIcon>
                        <Text mt="md" c="dimmed">
                            Keine Achievements in dieser Kategorie gefunden.
                        </Text>
                    </Paper>
                )}
            </Stack>
        </Container>
    );
}
