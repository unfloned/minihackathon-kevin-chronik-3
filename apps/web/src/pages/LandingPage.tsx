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
} from '@tabler/icons-react';
import { useAuth } from '../contexts/AuthContext';

const features = [
    {
        icon: IconBriefcase,
        title: 'Bewerbungstracker',
        description: 'Behalte den Überblick über alle deine Bewerbungen',
        color: 'blue',
    },
    {
        icon: IconCheck,
        title: 'Habit Tracker',
        description: 'Baue gute Gewohnheiten auf und tracke deinen Fortschritt',
        color: 'green',
    },
    {
        icon: IconCoin,
        title: 'Ausgaben Tracker',
        description: 'Wisse immer wohin dein Geld geht',
        color: 'yellow',
    },
    {
        icon: IconCalendar,
        title: 'Fristen & Deadlines',
        description: 'Verpasse nie wieder wichtige Termine',
        color: 'red',
    },
    {
        icon: IconCreditCard,
        title: 'Abo-Tracker',
        description: 'Alle Abonnements auf einen Blick',
        color: 'violet',
    },
    {
        icon: IconDeviceTv,
        title: 'Medien-Tracker',
        description: 'Filme, Serien, Bücher - alles getrackt',
        color: 'pink',
    },
    {
        icon: IconBox,
        title: 'Inventar',
        description: 'Finde alles wieder was du besitzt',
        color: 'orange',
    },
    {
        icon: IconNote,
        title: 'Notizen',
        description: 'Deine Gedanken sicher festgehalten',
        color: 'teal',
    },
    {
        icon: IconList,
        title: 'Listen',
        description: 'Einkaufslisten, TODOs und mehr',
        color: 'cyan',
    },
    {
        icon: IconTarget,
        title: 'Projekte & Ziele',
        description: 'Große Vorhaben in kleine Schritte aufteilen',
        color: 'indigo',
    },
    {
        icon: IconToolsKitchen2,
        title: 'Meal Planning',
        description: 'Wochenplan für Mahlzeiten erstellen',
        color: 'lime',
    },
    {
        icon: IconGift,
        title: 'Wunschlisten',
        description: 'Teile deine Wünsche mit anderen',
        color: 'grape',
    },
];

export default function LandingPage() {
    const { isAuthenticated } = useAuth();

    return (
        <>
            {/* Hero Section */}
            <Container size="lg" py={80}>
                <Stack align="center" gap="xl">
                    <Badge size="lg" variant="light" color="blue">
                        Dein persönlicher Organisator
                    </Badge>

                    <Title
                        ta="center"
                        style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
                    >
                        Dein{' '}
                        <Text
                            component="span"
                            variant="gradient"
                            gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
                            inherit
                        >
                            Chaos
                        </Text>
                        , meine{' '}
                        <Text
                            component="span"
                            variant="gradient"
                            gradient={{ from: 'cyan', to: 'teal', deg: 90 }}
                            inherit
                        >
                            Mission
                        </Text>
                    </Title>

                    <Text
                        ta="center"
                        size="xl"
                        c="dimmed"
                        maw={600}
                    >
                        Eine App für alles. Bewerbungen, Gewohnheiten, Ausgaben, Medien
                        und vieles mehr - organisiert und gamifiziert.
                    </Text>

                    <Group mt="md">
                        {isAuthenticated ? (
                            <Button
                                component={Link}
                                to="/app"
                                size="lg"
                                rightSection={<IconArrowRight size={18} />}
                            >
                                Zur App
                            </Button>
                        ) : (
                            <>
                                <Button
                                    component={Link}
                                    to="/auth"
                                    size="lg"
                                    rightSection={<IconArrowRight size={18} />}
                                >
                                    Jetzt Loslegen
                                </Button>
                                <Button
                                    component={Link}
                                    to="/auth?demo=true"
                                    size="lg"
                                    variant="light"
                                >
                                    Demo ausprobieren
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
                            Sammle XP, steige Level auf und schalte Achievements frei!
                        </Text>
                    </Group>
                </Stack>
            </Container>

            {/* Features Section */}
            <Container size="xl" py={60}>
                <Stack gap="xl">
                    <Title order={2} ta="center">
                        Alles was du brauchst
                    </Title>
                    <Text ta="center" c="dimmed" maw={600} mx="auto">
                        12+ Module um dein Leben zu organisieren - alles an einem Ort
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
                            Ein Projekt des{' '}
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
