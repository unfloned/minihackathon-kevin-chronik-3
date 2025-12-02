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
                                <Text
                                    size="lg"
                                    fw={700}
                                    variant="gradient"
                                    gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
                                >
                                    Your Chaos, My Mission
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
