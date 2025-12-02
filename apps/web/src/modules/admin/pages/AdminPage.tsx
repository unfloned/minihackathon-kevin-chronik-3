import { useState } from 'react';
import {
    Container,
    Title,
    Text,
    Card,
    Group,
    Stack,
    Button,
    Table,
    Badge,
    ActionIcon,
    SimpleGrid,
    ThemeIcon,
    Paper,
    Loader,
    Alert,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import {
    IconUsers,
    IconRefresh,
    IconTrash,
    IconShield,
    IconShieldOff,
    IconAlertCircle,
    IconCheck,
    IconUserCog,
    IconDatabase,
} from '@tabler/icons-react';
import { useRequest, useMutation } from '../../../hooks';
import { useAuth } from '../../../contexts/AuthContext';
import type { UserPublic } from '@ycmm/core';

interface AdminStats {
    totalUsers: number;
    demoUsers: number;
    adminUsers: number;
    regularUsers: number;
}

export default function AdminPage() {
    const { user } = useAuth();
    const [isResetting, setIsResetting] = useState(false);

    const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useRequest<AdminStats>('/admin/stats');
    const { data: users, isLoading: usersLoading, refetch: refetchUsers } = useRequest<UserPublic[]>('/admin/users');

    const { mutate: setAdmin } = useMutation<UserPublic, { userId: string; isAdmin: boolean }>(
        '/admin/users/set-admin',
        {
            method: 'POST',
            onSuccess: () => {
                refetchUsers();
                refetchStats();
                notifications.show({
                    title: 'Erfolgreich',
                    message: 'Admin-Status wurde geändert',
                    color: 'green',
                });
            },
        }
    );

    const { mutate: deleteUserData } = useMutation<void, { userId: string }>(
        (vars) => `/admin/users/${vars.userId}/data`,
        {
            method: 'DELETE',
            onSuccess: () => {
                refetchUsers();
                notifications.show({
                    title: 'Erfolgreich',
                    message: 'Benutzerdaten wurden gelöscht',
                    color: 'green',
                });
            },
        }
    );

    const { mutate: resetDemo } = useMutation<void, void>(
        '/admin/demo/reset',
        {
            method: 'POST',
            onSuccess: () => {
                setIsResetting(false);
                notifications.show({
                    title: 'Demo zurückgesetzt',
                    message: 'Die Demo-Daten wurden erfolgreich zurückgesetzt',
                    color: 'green',
                    icon: <IconCheck size={16} />,
                });
            },
            onError: () => {
                setIsResetting(false);
            },
        }
    );

    const handleResetDemo = () => {
        modals.openConfirmModal({
            title: 'Demo-Daten zurücksetzen?',
            children: (
                <Text size="sm">
                    Alle bestehenden Demo-Daten werden gelöscht und durch frische Beispieldaten ersetzt.
                    Diese Aktion kann nicht rückgängig gemacht werden.
                </Text>
            ),
            labels: { confirm: 'Zurücksetzen', cancel: 'Abbrechen' },
            confirmProps: { color: 'red' },
            onConfirm: () => {
                setIsResetting(true);
                resetDemo();
            },
        });
    };

    const handleToggleAdmin = (targetUser: UserPublic) => {
        const action = targetUser.isAdmin ? 'entfernen' : 'erteilen';
        modals.openConfirmModal({
            title: `Admin-Rechte ${action}?`,
            children: (
                <Text size="sm">
                    Möchtest du {targetUser.displayName} ({targetUser.email}) die Admin-Rechte {action}?
                </Text>
            ),
            labels: { confirm: 'Bestätigen', cancel: 'Abbrechen' },
            onConfirm: () => {
                setAdmin({ userId: targetUser.id, isAdmin: !targetUser.isAdmin });
            },
        });
    };

    const handleDeleteUserData = (targetUser: UserPublic) => {
        modals.openConfirmModal({
            title: 'Benutzerdaten löschen?',
            children: (
                <Text size="sm">
                    Alle Daten von {targetUser.displayName} ({targetUser.email}) werden unwiderruflich gelöscht.
                    Der Account selbst bleibt bestehen.
                </Text>
            ),
            labels: { confirm: 'Löschen', cancel: 'Abbrechen' },
            confirmProps: { color: 'red' },
            onConfirm: () => {
                deleteUserData({ userId: targetUser.id });
            },
        });
    };

    // Check if current user is admin
    if (!user?.isAdmin) {
        return (
            <Container size="md" py="xl">
                <Alert
                    icon={<IconAlertCircle size={16} />}
                    title="Zugriff verweigert"
                    color="red"
                >
                    Du hast keine Berechtigung, diese Seite zu sehen.
                    Nur Administratoren können auf das Admin-Dashboard zugreifen.
                </Alert>
            </Container>
        );
    }

    return (
        <Container size="xl" py="xl">
            <Stack gap="lg">
                {/* Header */}
                <Group justify="space-between">
                    <div>
                        <Title order={2}>Admin Dashboard</Title>
                        <Text c="dimmed">Benutzer- und Demo-Verwaltung</Text>
                    </div>
                    <Button
                        leftSection={<IconRefresh size={16} />}
                        variant="light"
                        onClick={() => {
                            refetchStats();
                            refetchUsers();
                        }}
                    >
                        Aktualisieren
                    </Button>
                </Group>

                {/* Stats */}
                <SimpleGrid cols={{ base: 2, md: 4 }}>
                    <Paper withBorder p="md" radius="md">
                        <Group>
                            <ThemeIcon size="lg" variant="light" color="blue">
                                <IconUsers size={20} />
                            </ThemeIcon>
                            <div>
                                <Text size="xs" c="dimmed">Gesamt</Text>
                                <Text size="xl" fw={700}>
                                    {statsLoading ? <Loader size="xs" /> : stats?.totalUsers ?? 0}
                                </Text>
                            </div>
                        </Group>
                    </Paper>
                    <Paper withBorder p="md" radius="md">
                        <Group>
                            <ThemeIcon size="lg" variant="light" color="orange">
                                <IconUserCog size={20} />
                            </ThemeIcon>
                            <div>
                                <Text size="xs" c="dimmed">Demo</Text>
                                <Text size="xl" fw={700}>
                                    {statsLoading ? <Loader size="xs" /> : stats?.demoUsers ?? 0}
                                </Text>
                            </div>
                        </Group>
                    </Paper>
                    <Paper withBorder p="md" radius="md">
                        <Group>
                            <ThemeIcon size="lg" variant="light" color="red">
                                <IconShield size={20} />
                            </ThemeIcon>
                            <div>
                                <Text size="xs" c="dimmed">Admins</Text>
                                <Text size="xl" fw={700}>
                                    {statsLoading ? <Loader size="xs" /> : stats?.adminUsers ?? 0}
                                </Text>
                            </div>
                        </Group>
                    </Paper>
                    <Paper withBorder p="md" radius="md">
                        <Group>
                            <ThemeIcon size="lg" variant="light" color="green">
                                <IconUsers size={20} />
                            </ThemeIcon>
                            <div>
                                <Text size="xs" c="dimmed">Regular</Text>
                                <Text size="xl" fw={700}>
                                    {statsLoading ? <Loader size="xs" /> : stats?.regularUsers ?? 0}
                                </Text>
                            </div>
                        </Group>
                    </Paper>
                </SimpleGrid>

                {/* Demo Management */}
                <Card withBorder>
                    <Group justify="space-between" mb="md">
                        <Group>
                            <ThemeIcon size="lg" variant="light" color="violet">
                                <IconDatabase size={20} />
                            </ThemeIcon>
                            <div>
                                <Text fw={500}>Demo-Verwaltung</Text>
                                <Text size="sm" c="dimmed">Demo-Daten zurücksetzen für Live-Präsentationen</Text>
                            </div>
                        </Group>
                        <Button
                            color="red"
                            variant="light"
                            leftSection={<IconRefresh size={16} />}
                            onClick={handleResetDemo}
                            loading={isResetting}
                        >
                            Demo zurücksetzen
                        </Button>
                    </Group>
                    <Text size="sm" c="dimmed">
                        Der Demo-Account (demo@ycmm.app) enthält vorbereitete Beispieldaten für alle Module.
                        Beim Zurücksetzen werden alle Demo-Daten gelöscht und durch frische Beispieldaten ersetzt.
                    </Text>
                </Card>

                {/* User Table */}
                <Card withBorder>
                    <Title order={4} mb="md">Benutzer</Title>
                    {usersLoading ? (
                        <Group justify="center" py="xl">
                            <Loader />
                        </Group>
                    ) : (
                        <Table striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Name</Table.Th>
                                    <Table.Th>Email</Table.Th>
                                    <Table.Th>Level</Table.Th>
                                    <Table.Th>Status</Table.Th>
                                    <Table.Th>Registriert</Table.Th>
                                    <Table.Th>Aktionen</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {users?.map((u) => (
                                    <Table.Tr key={u.id}>
                                        <Table.Td>
                                            <Text fw={500}>{u.displayName}</Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="sm" c="dimmed">{u.email}</Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Badge variant="light">Lvl {u.level}</Badge>
                                        </Table.Td>
                                        <Table.Td>
                                            <Group gap="xs">
                                                {u.isDemo && <Badge color="orange" size="sm">Demo</Badge>}
                                                {u.isAdmin && <Badge color="red" size="sm">Admin</Badge>}
                                                {!u.isDemo && !u.isAdmin && <Badge color="gray" size="sm">User</Badge>}
                                            </Group>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="sm">
                                                {new Date(u.createdAt).toLocaleDateString('de-DE')}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Group gap="xs">
                                                <ActionIcon
                                                    variant="light"
                                                    color={u.isAdmin ? 'red' : 'blue'}
                                                    onClick={() => handleToggleAdmin(u)}
                                                    disabled={u.id === user?.id}
                                                    title={u.isAdmin ? 'Admin entfernen' : 'Zum Admin machen'}
                                                >
                                                    {u.isAdmin ? <IconShieldOff size={16} /> : <IconShield size={16} />}
                                                </ActionIcon>
                                                <ActionIcon
                                                    variant="light"
                                                    color="red"
                                                    onClick={() => handleDeleteUserData(u)}
                                                    title="Daten löschen"
                                                >
                                                    <IconTrash size={16} />
                                                </ActionIcon>
                                            </Group>
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    )}
                </Card>
            </Stack>
        </Container>
    );
}
