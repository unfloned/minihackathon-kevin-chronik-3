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
    MultiSelect,
    Skeleton,
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
    IconCalendarStar,
    IconAward,
    IconCompass,
    IconStars,
    IconDiamond,
    IconMedal,
    IconInfinity,
    IconTarget,
    IconSparkles,
    IconSun,
    IconSunrise,
    IconStack,
    IconCash,
    IconBuildingBank,
    IconRun,
    IconRocket,
    IconUsers,
    IconWallet,
    IconChartBar,
    IconReportMoney,
    IconPig,
    IconNote,
    IconNotes,
    IconPencil,
    IconBook,
    IconBooks,
    IconLibrary,
    IconNotebook,
    IconList,
    IconChecks,
    IconShoppingCart,
    IconRobot,
    IconFolder,
    IconFolders,
    IconFlag,
    IconBox,
    IconBoxMultiple,
    IconBuildingWarehouse,
    IconBuilding,
    IconBuildingCastle,
    IconHandMove,
    IconSearch,
    IconDeviceTv,
    IconMovie,
    IconPlayerPlay,
    IconPlayerStop,
    IconStarHalf,
    IconChefHat,
    IconSalad,
    IconMeat,
    IconGrill,
    IconHeart,
    IconGift,
    IconHeartHandshake,
    IconGiftCard,
    IconCake,
    IconBolt,
    IconCalendarWeek,
    IconCalendarMonth,
} from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { useRequest, useConfetti } from '../../../hooks';
import type { AchievementPublic, GamificationStats } from '@ycmm/core';
import { PageTitle } from '../../../components/PageTitle';
import { CardStatistic } from '../../../components/CardStatistic';

// Achievement interface extends AchievementPublic with additional fields for display
interface Achievement extends AchievementPublic {
    requirement?: number;
    isHidden?: boolean;
}

const iconMap: Record<string, React.ElementType> = {
    // General
    'door': IconDoor,
    'user-check': IconUserCheck,
    'calendar-star': IconCalendarStar,
    'calendar-check': IconCalendarCheck,
    'award': IconAward,
    'compass': IconCompass,
    'star': IconStar,
    'stars': IconStars,
    'crown': IconCrown,
    'diamond': IconDiamond,
    'trophy': IconTrophy,

    // Streaks
    'flame': IconFlame,
    'fire': IconFlame,
    'medal': IconMedal,
    'infinity': IconInfinity,

    // Habits
    'check': IconCheck,
    'check-double': IconCheckbox,
    'target': IconTarget,
    'sparkles': IconSparkles,
    'sun': IconSun,

    // Deadlines
    'calendar-event': IconCalendarEvent,
    'calendar-stats': IconCalendarStats,
    'confetti': IconConfetti,
    'sunrise': IconSunrise,

    // Subscriptions
    'repeat': IconRepeat,
    'list-check': IconListCheck,
    'stack': IconStack,
    'pig-money': IconPigMoney,
    'cash': IconCash,
    'bank': IconBuildingBank,

    // Applications
    'briefcase': IconBriefcase,
    'send': IconSend,
    'run': IconRun,
    'rocket': IconRocket,
    'calendar': IconCalendar,
    'users': IconUsers,

    // Expenses
    'coin': IconCoin,
    'coins': IconCoins,
    'wallet': IconWallet,
    'chart-line': IconChartLine,
    'chart-bar': IconChartBar,
    'report-money': IconReportMoney,
    'piggy-bank': IconPigMoney,
    'pig': IconPig,

    // Notes
    'note': IconNote,
    'notes': IconNotes,
    'pencil': IconPencil,
    'book': IconBook,
    'books': IconBooks,
    'library': IconLibrary,
    'diary': IconNotebook,

    // Lists
    'list': IconList,
    'checkbox': IconCheckbox,
    'checks': IconChecks,
    'shopping-cart': IconShoppingCart,
    'robot': IconRobot,

    // Projects
    'folder': IconFolder,
    'folders': IconFolders,
    'flag-checkered': IconFlag,

    // Inventory
    'box': IconBox,
    'boxes': IconBoxMultiple,
    'warehouse': IconBuildingWarehouse,
    'building': IconBuilding,
    'castle': IconBuildingCastle,
    'hand-move': IconHandMove,
    'search': IconSearch,

    // Media
    'device-tv': IconDeviceTv,
    'movie': IconMovie,
    'popcorn': IconMovie,
    'player-play': IconPlayerPlay,
    'player-stop': IconPlayerStop,
    'star-half': IconStarHalf,

    // Meals
    'chef-hat': IconChefHat,
    'salad': IconSalad,
    'meat': IconMeat,
    'grill': IconGrill,
    'heart': IconHeart,

    // Wishlists
    'gift': IconGift,
    'heart-handshake': IconHeartHandshake,
    'gift-card': IconGiftCard,

    // Legendary & General Dynamic
    'cake': IconCake,
    'bolt': IconBolt,
    'calendar-week': IconCalendarWeek,
    'calendar-month': IconCalendarMonth,
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
    notes: 'Notizen',
    lists: 'Listen',
    projects: 'Projekte',
    inventory: 'Inventar',
    media: 'Medien',
    meals: 'Mahlzeiten',
    wishlists: 'Wünsche',
    legendary: 'Legendär',
};

const categoryColors: Record<string, string> = {
    general: 'blue',
    streaks: 'orange',
    habits: 'green',
    deadlines: 'red',
    subscriptions: 'violet',
    applications: 'cyan',
    expenses: 'yellow',
    notes: 'gray',
    lists: 'teal',
    projects: 'indigo',
    inventory: 'lime',
    media: 'pink',
    meals: 'grape',
    wishlists: 'rose',
    legendary: 'gold',
};

export default function AchievementsPage() {
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
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
        a => selectedCategories.length === 0 || selectedCategories.includes(a.category)
    ) || [];

    const categories = [...new Set(allAchievements?.map(a => a.category) || [])];

    const totalAchievements = allAchievements?.length || 0;
    const unlockedCount = userAchievements?.length || 0;
    const completionPercentage = totalAchievements > 0
        ? Math.round((unlockedCount / totalAchievements) * 100)
        : 0;

    return (
        <Container size="xl" py="xl">
            <Stack gap="xl">
                {/* Header */}
                <PageTitle title="Achievements" subtitle="Schalte Achievements frei und sammle XP!" />

                {/* Stats Overview */}
                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
                    <CardStatistic
                        type="progress"
                        title="Level"
                        value={stats?.level ?? 1}
                        icon={IconStar}
                        color="violet"
                        progress={stats?.xpProgress?.percentage ?? 0}
                        progressTooltip={`${stats?.xpProgress?.current ?? 0} / ${stats?.xpProgress?.required ?? 100} XP`}
                        isLoading={isLoading}
                    />

                    <CardStatistic
                        type="icon"
                        title="Gesamt XP"
                        value={stats?.xp?.toLocaleString() ?? 0}
                        icon={IconCoin}
                        color="yellow"
                        isLoading={isLoading}
                    />

                    <CardStatistic
                        type="circular"
                        title="Achievements"
                        value={`${unlockedCount} / ${totalAchievements}`}
                        progress={completionPercentage}
                        progressLabel={
                            <Text ta="center" size="xs" fw={700}>
                                {completionPercentage}%
                            </Text>
                        }
                        color="teal"
                        isLoading={isLoading}
                    />
                </SimpleGrid>

                {/* Category Filter */}
                <MultiSelect
                    placeholder="Alle Kategorien"
                    value={selectedCategories}
                    onChange={setSelectedCategories}
                    data={categories.map(cat => ({
                        label: categoryLabels[cat] || cat,
                        value: cat,
                    }))}
                    clearable
                    searchable
                />

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
