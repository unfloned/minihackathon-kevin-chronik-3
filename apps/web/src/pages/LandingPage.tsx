import { Link } from 'react-router-dom';
import {
    Container,
    Title,
    Text,
    Button,
    Group,
    SimpleGrid,
    Card,
    ThemeIcon,
    Stack,
    Badge,
    Anchor,
    Paper,
    Divider,
} from '@mantine/core';
import {
    IconBriefcase,
    IconCheck,
    IconCoin,
    IconCalendar,
    IconDeviceTv,
    IconBox,
    IconNote,
    IconList,
    IconTarget,
    IconToolsKitchen2,
    IconGift,
    IconCreditCard,
    IconTrophy,
    IconArrowRight,
    IconCode,
    IconMicrophone,
    IconSparkles,
    IconShare,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Particles } from '../components/Particles';

const featureIcons = [
    { icon: IconBriefcase, key: 'applications', color: 'blue' },
    { icon: IconCheck, key: 'habits', color: 'green' },
    { icon: IconCoin, key: 'expenses', color: 'yellow' },
    { icon: IconCalendar, key: 'deadlines', color: 'red' },
    { icon: IconCreditCard, key: 'subscriptions', color: 'violet' },
    { icon: IconDeviceTv, key: 'media', color: 'pink' },
    { icon: IconBox, key: 'inventory', color: 'orange' },
    { icon: IconNote, key: 'notes', color: 'teal' },
    { icon: IconList, key: 'lists', color: 'cyan' },
    { icon: IconTarget, key: 'projects', color: 'indigo' },
    { icon: IconToolsKitchen2, key: 'meals', color: 'lime' },
    { icon: IconGift, key: 'wishlists', color: 'grape' },
];

export default function LandingPage() {
    const { t } = useTranslation();
    const { isAuthenticated } = useAuth();

    const features = featureIcons.map((f) => ({
        icon: f.icon,
        title: t(`landing.featureList.${f.key}.title`),
        description: t(`landing.featureList.${f.key}.description`),
        color: f.color,
    }));

    return (
        <>
            {/* Background Particles */}
            <Particles count={30} />

            {/* Hero Section */}
            <Container size="lg" py={80}>
                <Stack align="center" gap="xl">
                    <Badge size="lg" variant="light" color="blue">
                        {t('landing.badge')}
                    </Badge>

                    <Title
                        ta="center"
                        style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
                    >
                        {t('landing.heroYour')}{' '}
                        <Text
                            component="span"
                            inherit
                            style={{
                                color: '#ff4444',
                                textShadow: '0 0 20px rgba(255, 68, 68, 0.5), 0 0 40px rgba(255, 68, 68, 0.3)',
                            }}
                        >
                            {t('landing.heroChaos')}
                        </Text>
                        , {t('landing.heroMy')}{' '}
                        <Text
                            component="span"
                            variant="gradient"
                            gradient={{ from: 'cyan', to: 'teal', deg: 90 }}
                            inherit
                        >
                            {t('landing.heroMission')}
                        </Text>
                    </Title>

                    <Text
                        ta="center"
                        size="xl"
                        c="dimmed"
                        maw={600}
                    >
                        {t('landing.heroDescription')}
                    </Text>

                    <Group mt="md">
                        {isAuthenticated ? (
                            <Button
                                component={Link}
                                to="/app"
                                size="lg"
                                rightSection={<IconArrowRight size={18} />}
                            >
                                {t('landing.toApp')}
                            </Button>
                        ) : (
                            <>
                                <Button
                                    component={Link}
                                    to="/auth"
                                    size="lg"
                                    rightSection={<IconArrowRight size={18} />}
                                >
                                    {t('landing.getStarted')}
                                </Button>
                                <Button
                                    component={Link}
                                    to="/auth?demo=true"
                                    size="lg"
                                    variant="light"
                                >
                                    {t('landing.tryDemo')}
                                </Button>
                            </>
                        )}
                    </Group>

                    {/* Gamification Badge */}
                    <Group gap="xs" mt="xl">
                        <ThemeIcon size="lg" variant="light" color="yellow">
                            <IconTrophy size={20} />
                        </ThemeIcon>
                        <Text size="sm" c="dimmed">
                            {t('landing.gamification')}
                        </Text>
                    </Group>
                </Stack>
            </Container>

            {/* Voice Notes Hot Feature */}
            <Container size="md" py={40}>
                <Paper
                    withBorder
                    p="xl"
                    radius="lg"
                    style={{
                        background: 'linear-gradient(135deg, rgba(250, 82, 82, 0.1) 0%, rgba(190, 75, 219, 0.1) 100%)',
                        borderColor: 'var(--mantine-color-red-4)',
                    }}
                >
                    <Group justify="space-between" wrap="wrap" gap="lg">
                        <Group gap="md">
                            <ThemeIcon
                                size={60}
                                radius="xl"
                                variant="gradient"
                                gradient={{ from: 'red', to: 'grape', deg: 135 }}
                            >
                                <IconMicrophone size={30} />
                            </ThemeIcon>
                            <Stack gap={4}>
                                <Group gap="xs">
                                    <Badge
                                        size="sm"
                                        variant="gradient"
                                        gradient={{ from: 'red', to: 'grape' }}
                                        leftSection={<IconSparkles size={12} />}
                                    >
                                        {t('landing.hotFeature.badge')}
                                    </Badge>
                                </Group>
                                <Title order={3}>{t('landing.hotFeature.voiceNotes.title')}</Title>
                                <Text c="dimmed" size="sm" maw={400}>
                                    {t('landing.hotFeature.voiceNotes.description')}
                                </Text>
                            </Stack>
                        </Group>
                        <Stack gap="xs" align="flex-end">
                            <Group gap="xs">
                                <Badge variant="light" color="green">{t('landing.hotFeature.voiceNotes.feature1')}</Badge>
                                <Badge variant="light" color="blue">{t('landing.hotFeature.voiceNotes.feature2')}</Badge>
                            </Group>
                            <Group gap="xs">
                                <Badge variant="light" color="grape">{t('landing.hotFeature.voiceNotes.feature3')}</Badge>
                            </Group>
                        </Stack>
                    </Group>
                </Paper>

                {/* Wishlist Sharing Hot Feature */}
                <Paper
                    withBorder
                    p="xl"
                    radius="lg"
                    mt="lg"
                    style={{
                        background: 'linear-gradient(135deg, rgba(190, 75, 219, 0.1) 0%, rgba(250, 82, 82, 0.1) 100%)',
                        borderColor: 'var(--mantine-color-grape-4)',
                    }}
                >
                    <Group justify="space-between" wrap="wrap" gap="lg">
                        <Group gap="md">
                            <ThemeIcon
                                size={60}
                                radius="xl"
                                variant="gradient"
                                gradient={{ from: 'grape', to: 'pink', deg: 135 }}
                            >
                                <IconShare size={30} />
                            </ThemeIcon>
                            <Stack gap={4}>
                                <Group gap="xs">
                                    <Badge
                                        size="sm"
                                        variant="gradient"
                                        gradient={{ from: 'grape', to: 'pink' }}
                                        leftSection={<IconSparkles size={12} />}
                                    >
                                        {t('landing.hotFeature.badge')}
                                    </Badge>
                                </Group>
                                <Title order={3}>{t('landing.hotFeature.wishlistSharing.title')}</Title>
                                <Text c="dimmed" size="sm" maw={400}>
                                    {t('landing.hotFeature.wishlistSharing.description')}
                                </Text>
                            </Stack>
                        </Group>
                        <Stack gap="xs" align="flex-end">
                            <Group gap="xs">
                                <Badge variant="light" color="grape">{t('landing.hotFeature.wishlistSharing.feature1')}</Badge>
                                <Badge variant="light" color="pink">{t('landing.hotFeature.wishlistSharing.feature2')}</Badge>
                            </Group>
                            <Group gap="xs">
                                <Badge variant="light" color="violet">{t('landing.hotFeature.wishlistSharing.feature3')}</Badge>
                            </Group>
                        </Stack>
                    </Group>
                </Paper>
            </Container>

            {/* Features Section */}
            <Container size="xl" py={60}>
                <Stack gap="xl">
                    <Title order={2} ta="center">
                        {t('landing.everythingYouNeed')}
                    </Title>
                    <Text ta="center" c="dimmed" maw={600} mx="auto">
                        {t('landing.modulesDescription')}
                    </Text>

                    <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="lg">
                        {features.map((feature) => (
                            <Card key={feature.title} shadow="sm" padding="lg" radius="md" withBorder>
                                <ThemeIcon size="xl" radius="md" variant="light" color={feature.color}>
                                    <feature.icon size={24} />
                                </ThemeIcon>
                                <Text fw={500} mt="md">
                                    {feature.title}
                                </Text>
                                <Text size="sm" c="dimmed" mt="xs">
                                    {feature.description}
                                </Text>
                            </Card>
                        ))}
                    </SimpleGrid>
                </Stack>
            </Container>

            {/* MiniHackathon Attribution */}
            <Divider my="xl" />
            <Container size="lg" py="xl">
                <Paper
                    withBorder
                    p="xl"
                    radius="md"
                    style={{
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
                    }}
                >
                    <Group justify="center" gap="md">
                        <ThemeIcon size="xl" radius="xl" variant="gradient" gradient={{ from: 'blue', to: 'teal' }}>
                            <IconCode size={24} />
                        </ThemeIcon>
                        <Text fw={600} size="lg">
                            {t('dashboard.projectOf')}{' '}
                            <Anchor
                                href="https://minihackathon.de/"
                                target="_blank"
                                rel="noopener noreferrer"
                                fw={600}
                            >
                                MiniHackathon 3.0
                            </Anchor>
                        </Text>
                    </Group>
                </Paper>
            </Container>
        </>
    );
}
