import { Outlet, Link } from 'react-router-dom';
import {
    AppShell,
    Group,
    Button,
    Text,
    ActionIcon,
    useMantineColorScheme,
    Container,
    Anchor,
    Stack,
} from '@mantine/core';
import { IconSun, IconMoon, IconTarget } from '@tabler/icons-react';
import { useAuth } from '../contexts/AuthContext';
import { LanguageSelector } from '../components/LanguageSelector';

export default function PublicLayout() {
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const { isAuthenticated } = useAuth();

    return (
        <AppShell header={{ height: 60 }}>
            <AppShell.Header>
                <Container size="xl" h="100%">
                    <Group h="100%" justify="space-between">
                        <Link to="/" style={{ textDecoration: 'none' }}>
                            <Group gap="xs">
                                <IconTarget size={28} color="var(--mantine-color-blue-6)" />
                                <Text size="lg" fw={700}>
                                    <Text component="span" c="dimmed" inherit>Your </Text>
                                    <Text
                                        component="span"
                                        inherit
                                        style={{
                                            color: '#ff4444',
                                            textShadow: '0 0 10px rgba(255, 68, 68, 0.5), 0 0 20px rgba(255, 68, 68, 0.3)',
                                        }}
                                    >
                                        Chaos
                                    </Text>
                                    <Text component="span" c="dimmed" inherit>, My </Text>
                                    <Text
                                        component="span"
                                        variant="gradient"
                                        gradient={{ from: 'cyan', to: 'teal', deg: 90 }}
                                        inherit
                                    >
                                        Mission
                                    </Text>
                                </Text>
                            </Group>
                        </Link>

                        <Group>
                            <LanguageSelector />

                            <ActionIcon
                                variant="subtle"
                                size="lg"
                                onClick={() => toggleColorScheme()}
                                aria-label="Toggle color scheme"
                            >
                                {colorScheme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
                            </ActionIcon>

                            {isAuthenticated ? (
                                <Button component={Link} to="/app" variant="filled">
                                    Zur App
                                </Button>
                            ) : (
                                <Button component={Link} to="/auth" variant="filled">
                                    Jetzt Loslegen
                                </Button>
                            )}
                        </Group>
                    </Group>
                </Container>
            </AppShell.Header>

            <AppShell.Main>
                <Outlet />
            </AppShell.Main>

            {/* Footer */}
            <Container size="xl" py="xl">
                <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                        © {new Date().getFullYear()}{' '}
                        <Anchor
                            href="https://florian-chiorean.de"
                            target="_blank"
                            rel="noopener noreferrer"
                            c="dimmed"
                            fw={500}
                        >
                            Florian Chiorean
                        </Anchor>
                    </Text>
                    <Stack gap={4} align="flex-end">
                        <Anchor component={Link} to="/changelog" size="sm" c="dimmed">
                            Changelog
                        </Anchor>
                    </Stack>
                </Group>
            </Container>
        </AppShell>
    );
}
