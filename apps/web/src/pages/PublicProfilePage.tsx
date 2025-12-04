import { useParams, Link } from 'react-router-dom';
import {
    Container,
    Title,
    Text,
    Card,
    Badge,
    Group,
    Stack,
    SimpleGrid,
    ThemeIcon,
    Paper,
    RingProgress,
    Skeleton,
    Button,
} from '@mantine/core';
import {
    IconTrophy,
    IconStar,
    IconCoin,
    IconArrowLeft,
    IconFlame,
    IconCheck,
    IconCalendar,
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
    IconLock,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useRequest } from '../hooks';
import type { AchievementPublic } from '@ycmm/core';

interface XpProgress {
    current: number;
    required: number;
    percentage: number;
}

interface PublicProfileData {
    displayName: string;
    level: number;
    xp: number;
    xpProgress: XpProgress;
    achievements: AchievementPublic[];
    stats: {
        totalAchievements: number;
        totalXpFromAchievements: number;
        rareAchievements: number;
        legendaryAchievements: number;
    };
}

const iconMap: Record<string, React.ElementType> = {
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
    'flame': IconFlame,
    'fire': IconFlame,
    'medal': IconMedal,
    'infinity': IconInfinity,
    'check': IconCheck,
    'check-double': IconCheckbox,
    'target': IconTarget,
    'sparkles': IconSparkles,
    'sun': IconSun,
    'calendar-event': IconCalendarEvent,
    'calendar-stats': IconCalendarStats,
    'confetti': IconConfetti,
    'sunrise': IconSunrise,
    'repeat': IconRepeat,
    'list-check': IconListCheck,
    'stack': IconStack,
    'pig-money': IconPigMoney,
    'cash': IconCash,
    'bank': IconBuildingBank,
    'briefcase': IconBriefcase,
    'send': IconSend,
    'run': IconRun,
    'rocket': IconRocket,
    'calendar': IconCalendar,
    'users': IconUsers,
    'coin': IconCoin,
    'coins': IconCoins,
    'wallet': IconWallet,
    'chart-line': IconChartLine,
    'chart-bar': IconChartBar,
    'report-money': IconReportMoney,
    'piggy-bank': IconPigMoney,
    'pig': IconPig,
    'note': IconNote,
    'notes': IconNotes,
    'pencil': IconPencil,
    'book': IconBook,
    'books': IconBooks,
    'library': IconLibrary,
    'diary': IconNotebook,
    'list': IconList,
    'checkbox': IconCheckbox,
    'checks': IconChecks,
    'shopping-cart': IconShoppingCart,
    'robot': IconRobot,
    'folder': IconFolder,
    'folders': IconFolders,
    'flag-checkered': IconFlag,
    'box': IconBox,
    'boxes': IconBoxMultiple,
    'warehouse': IconBuildingWarehouse,
    'building': IconBuilding,
    'castle': IconBuildingCastle,
    'hand-move': IconHandMove,
    'search': IconSearch,
    'device-tv': IconDeviceTv,
    'movie': IconMovie,
    'popcorn': IconMovie,
    'player-play': IconPlayerPlay,
    'player-stop': IconPlayerStop,
    'star-half': IconStarHalf,
    'chef-hat': IconChefHat,
    'salad': IconSalad,
    'meat': IconMeat,
    'grill': IconGrill,
    'heart': IconHeart,
    'gift': IconGift,
    'heart-handshake': IconHeartHandshake,
    'gift-card': IconGiftCard,
    'cake': IconCake,
    'bolt': IconBolt,
    'calendar-week': IconCalendarWeek,
    'calendar-month': IconCalendarMonth,
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

export default function PublicProfilePage() {
    const { t } = useTranslation();
    const { slug } = useParams<{ slug: string }>();

    const { data, isLoading, error } = useRequest<PublicProfileData>(
        `/public/profile/${slug}`
    );

    if (isLoading) {
        return (
            <Container size="lg" py="xl">
                <Stack gap="xl">
                    <Skeleton height={200} radius="md" />
                    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} height={100} radius="md" />
                        ))}
                    </SimpleGrid>
                    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                        {[...Array(6)].map((_, i) => (
                            <Skeleton key={i} height={140} radius="md" />
                        ))}
                    </SimpleGrid>
                </Stack>
            </Container>
        );
    }

    if (error || !data) {
        return (
            <Container size="sm" py={100}>
                <Paper withBorder p="xl" radius="md" ta="center">
                    <ThemeIcon size={80} radius="xl" variant="light" color="gray" mx="auto" mb="md">
                        <IconLock size={40} />
                    </ThemeIcon>
                    <Title order={2} mb="sm">
                        {t('wishlists.public.notFound')}
                    </Title>
                    <Text c="dimmed" mb="xl">
                        {t('wishlists.public.notFoundDesc')}
                    </Text>
                    <Button component={Link} to="/" leftSection={<IconArrowLeft size={16} />}>
                        {t('wishlists.public.backHome')}
                    </Button>
                </Paper>
            </Container>
        );
    }

    return (
        <Container size="lg" py="xl">
            <Stack gap="xl">
                {/* Header */}
                <Paper withBorder p="xl" radius="md">
                    <Group justify="space-between" align="flex-start" wrap="wrap">
                        <Group gap="lg">
                            <RingProgress
                                size={100}
                                thickness={8}
                                roundCaps
                                sections={[{ value: data.xpProgress.percentage, color: 'violet' }]}
                                label={
                                    <Text ta="center" size="xl" fw={700}>
                                        {data.level}
                                    </Text>
                                }
                            />
                            <div>
                                <Title order={2}>{data.displayName}</Title>
                                <Text c="dimmed">Level {data.level}</Text>
                                <Text size="sm" c="dimmed" mt="xs">
                                    {data.xpProgress.current} / {data.xpProgress.required} XP
                                </Text>
                            </div>
                        </Group>
                        <Badge
                            size="lg"
                            variant="gradient"
                            gradient={{ from: 'grape', to: 'pink' }}
                            leftSection={<IconTrophy size={14} />}
                        >
                            {data.achievements.length} Achievements
                        </Badge>
                    </Group>
                </Paper>

                {/* Stats */}
                <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
                    <Card withBorder padding="lg" radius="md" ta="center">
                        <ThemeIcon size={40} variant="light" color="violet" radius="xl" mx="auto">
                            <IconStar size={20} />
                        </ThemeIcon>
                        <Text size="xl" fw={700} mt="sm">
                            {data.level}
                        </Text>
                        <Text size="sm" c="dimmed">
                            Level
                        </Text>
                    </Card>

                    <Card withBorder padding="lg" radius="md" ta="center">
                        <ThemeIcon size={40} variant="light" color="yellow" radius="xl" mx="auto">
                            <IconCoin size={20} />
                        </ThemeIcon>
                        <Text size="xl" fw={700} mt="sm">
                            {data.xp.toLocaleString()}
                        </Text>
                        <Text size="sm" c="dimmed">
                            XP
                        </Text>
                    </Card>

                    <Card withBorder padding="lg" radius="md" ta="center">
                        <ThemeIcon size={40} variant="light" color="teal" radius="xl" mx="auto">
                            <IconTrophy size={20} />
                        </ThemeIcon>
                        <Text size="xl" fw={700} mt="sm">
                            {data.stats.totalAchievements}
                        </Text>
                        <Text size="sm" c="dimmed">
                            Achievements
                        </Text>
                    </Card>

                    <Card withBorder padding="lg" radius="md" ta="center">
                        <ThemeIcon size={40} variant="light" color="orange" radius="xl" mx="auto">
                            <IconDiamond size={20} />
                        </ThemeIcon>
                        <Text size="xl" fw={700} mt="sm">
                            {data.stats.rareAchievements}
                        </Text>
                        <Text size="sm" c="dimmed">
                            Seltene
                        </Text>
                    </Card>
                </SimpleGrid>

                {/* Achievements */}
                <Title order={3}>Achievements</Title>
                {data.achievements.length === 0 ? (
                    <Paper withBorder p="xl" ta="center">
                        <ThemeIcon size={64} variant="light" color="gray" radius="xl" mx="auto">
                            <IconTrophy size={32} />
                        </ThemeIcon>
                        <Text mt="md" c="dimmed">
                            {t('achievements.noAchievements')}
                        </Text>
                    </Paper>
                ) : (
                    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                        {data.achievements.map(achievement => {
                            const IconComponent = iconMap[achievement.icon] || IconTrophy;
                            return (
                                <Card
                                    key={achievement.id}
                                    withBorder
                                    padding="lg"
                                    style={{
                                        borderColor: `var(--mantine-color-${categoryColors[achievement.category]}-5)`,
                                    }}
                                >
                                    <Group justify="space-between" align="flex-start">
                                        <Group gap="md">
                                            <ThemeIcon
                                                size={48}
                                                variant="filled"
                                                color={categoryColors[achievement.category]}
                                                radius="xl"
                                            >
                                                <IconComponent size={24} />
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
                                        <Badge variant="light" color={categoryColors[achievement.category]}>
                                            {achievement.category}
                                        </Badge>
                                        <Badge variant="filled" color="yellow" leftSection={<IconCoin size={12} />}>
                                            +{achievement.xpReward} XP
                                        </Badge>
                                    </Group>

                                    {achievement.unlockedAt && (
                                        <Text size="xs" c="dimmed" mt="sm">
                                            {new Date(achievement.unlockedAt).toLocaleDateString('de-DE')}
                                        </Text>
                                    )}
                                </Card>
                            );
                        })}
                    </SimpleGrid>
                )}

                {/* Footer */}
                <Paper withBorder p="lg" radius="md" ta="center">
                    <Text size="sm" c="dimmed">
                        Powered by{' '}
                        <Text component={Link} to="/" c="blue" inherit>
                            Your Chaos, My Mission
                        </Text>
                    </Text>
                </Paper>
            </Stack>
        </Container>
    );
}
