import { Outlet, Link, useLocation } from 'react-router-dom';
import {
    AppShell,
    Burger,
    Group,
    NavLink,
    Text,
    ActionIcon,
    useMantineColorScheme,
    Avatar,
    Menu,
    UnstyledButton,
    Stack,
    Badge,
    Kbd,
    Paper,
} from '@mantine/core';
import { useDisclosure, useOs } from '@mantine/hooks';
import { spotlight } from '@mantine/spotlight';
import {
    IconLayoutDashboard,
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
    IconSun,
    IconMoon,
    IconSettings,
    IconLogout,
    IconChevronDown,
    IconTrophy,
    IconSearch,
    IconShield,
    IconPlus,
} from '@tabler/icons-react';
import { useAuth } from '../contexts/AuthContext';
import { useQuickCreate } from '../contexts/QuickCreateContext';
import { LanguageSelector } from '../components/LanguageSelector';
import { NotificationDropdown } from '../components/NotificationDropdown';
import { PageTransition } from '../components/PageTransition';

const navItems = [
    { icon: IconLayoutDashboard, label: 'Dashboard', path: '/app', tourId: 'nav-dashboard' },
    { icon: IconTrophy, label: 'Achievements', path: '/app/achievements', tourId: 'nav-achievements' },
    { icon: IconBriefcase, label: 'Bewerbungen', path: '/app/applications', tourId: 'nav-applications' },
    { icon: IconCheck, label: 'Habits', path: '/app/habits', tourId: 'nav-habits' },
    { icon: IconCoin, label: 'Ausgaben', path: '/app/expenses', tourId: 'nav-expenses' },
    { icon: IconCalendar, label: 'Fristen', path: '/app/deadlines', tourId: 'nav-deadlines' },
    { icon: IconCreditCard, label: 'Abos', path: '/app/subscriptions', tourId: 'nav-subscriptions' },
    { icon: IconDeviceTv, label: 'Medien', path: '/app/media', tourId: 'nav-media' },
    { icon: IconBox, label: 'Inventar', path: '/app/inventory', tourId: 'nav-inventory' },
    { icon: IconNote, label: 'Notizen', path: '/app/notes', tourId: 'nav-notes' },
    { icon: IconList, label: 'Listen', path: '/app/lists', tourId: 'nav-lists' },
    { icon: IconTarget, label: 'Projekte', path: '/app/projects', tourId: 'nav-projects' },
    { icon: IconToolsKitchen2, label: 'Meals', path: '/app/meals', tourId: 'nav-meals' },
    { icon: IconGift, label: 'Wunschlisten', path: '/app/wishlists', tourId: 'nav-wishlists' },
];

export default function AppLayout() {
    const [opened, { toggle }] = useDisclosure();
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const { user, logout } = useAuth();
    const { openSpotlight: openQuickCreate } = useQuickCreate();
    const location = useLocation();
    const os = useOs();
    const isMac = os === 'macos';

    const handleLogout = async () => {
        await logout();
    };

    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{
                width: 250,
                breakpoint: 'sm',
                collapsed: { mobile: !opened },
            }}
            padding="md"
        >
            <AppShell.Header>
                <Group h="100%" px="md" justify="space-between">
                    <Group>
                        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
                        <Link to="/app" style={{ textDecoration: 'none' }}>
                            <Group gap="xs">
                                <IconTarget size={28} color="var(--mantine-color-blue-6)" />
                                <Text
                                    size="lg"
                                    fw={700}
                                    variant="gradient"
                                    gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
                                    visibleFrom="sm"
                                >
                                    YCMM
                                </Text>
                            </Group>
                        </Link>

                        {/* Spotlight Hint */}
                        <Paper
                            withBorder
                            px="sm"
                            py={6}
                            radius="md"
                            style={{ cursor: 'pointer' }}
                            onClick={() => spotlight.open()}
                            visibleFrom="sm"
                            data-tour="spotlight"
                        >
                            <Group gap="xs">
                                <IconSearch size={16} style={{ opacity: 0.6 }} />
                                <Text size="sm" c="dimmed">Suchen...</Text>
                                <Group gap={4}>
                                    <Kbd size="xs">{isMac ? '⌘' : 'Strg'}</Kbd>
                                    <Kbd size="xs">K</Kbd>
                                </Group>
                            </Group>
                        </Paper>

                        {/* Quick Create Hint */}
                        <Paper
                            withBorder
                            px="sm"
                            py={6}
                            radius="md"
                            style={{ cursor: 'pointer' }}
                            onClick={openQuickCreate}
                            visibleFrom="md"
                        >
                            <Group gap="xs">
                                <IconPlus size={16} style={{ opacity: 0.6 }} />
                                <Text size="sm" c="dimmed">Neu...</Text>
                                <Group gap={4}>
                                    <Kbd size="xs">{isMac ? '⌘' : 'Strg'}</Kbd>
                                    <Kbd size="xs">J</Kbd>
                                </Group>
                            </Group>
                        </Paper>
                    </Group>

                    <Group>
                        <LanguageSelector />

                        <ActionIcon
                            variant="subtle"
                            size="lg"
                            onClick={() => toggleColorScheme()}
                            data-tour="theme-toggle"
                        >
                            {colorScheme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
                        </ActionIcon>

                        <NotificationDropdown />

                        <Menu shadow="md" width={200}>
                            <Menu.Target>
                                <UnstyledButton>
                                    <Group gap="xs">
                                        <Avatar
                                            alt={user?.displayName}
                                            radius="xl"
                                            size="sm"
                                            color="blue"
                                        >
                                            {user?.displayName?.charAt(0).toUpperCase()}
                                        </Avatar>
                                        <Stack gap={0} visibleFrom="sm">
                                            <Text size="sm" fw={500}>
                                                {user?.displayName}
                                            </Text>
                                            <Group gap={4}>
                                                <Text size="xs" c="dimmed">
                                                    Level {user?.level || 1}
                                                </Text>
                                                {user?.isDemo && (
                                                    <Badge size="xs" color="orange">
                                                        Demo
                                                    </Badge>
                                                )}
                                            </Group>
                                        </Stack>
                                        <IconChevronDown size={14} />
                                    </Group>
                                </UnstyledButton>
                            </Menu.Target>

                            <Menu.Dropdown>
                                <Menu.Label>Account</Menu.Label>
                                <Menu.Item
                                    leftSection={<IconSettings size={16} />}
                                    component={Link}
                                    to="/app/settings"
                                >
                                    Einstellungen
                                </Menu.Item>
                                <Menu.Divider />
                                <Menu.Item
                                    leftSection={<IconLogout size={16} />}
                                    color="red"
                                    onClick={handleLogout}
                                >
                                    Abmelden
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </Group>
                </Group>
            </AppShell.Header>

            <AppShell.Navbar p="xs">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        component={Link}
                        to={item.path}
                        label={item.label}
                        leftSection={<item.icon size={18} />}
                        active={location.pathname === item.path}
                        mb={4}
                        data-tour={item.tourId}
                    />
                ))}
                {user?.isAdmin && (
                    <NavLink
                        component={Link}
                        to="/app/admin"
                        label="Admin"
                        leftSection={<IconShield size={18} />}
                        active={location.pathname === '/app/admin'}
                        mb={4}
                        color="red"
                        variant="filled"
                    />
                )}
            </AppShell.Navbar>

            <AppShell.Main>
                <PageTransition>
                    <Outlet />
                </PageTransition>
            </AppShell.Main>
        </AppShell>
    );
}
