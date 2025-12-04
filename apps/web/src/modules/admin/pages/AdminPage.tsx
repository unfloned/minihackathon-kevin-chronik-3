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
import { useTranslation } from 'react-i18next';
import { useRequest, useMutation } from '../../../hooks';
import { useAuth } from '../../../contexts/AuthContext';
import type { UserPublic, AdminStats } from '@ycmm/core';

export default function AdminPage() {
    const { t } = useTranslation();
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
                    title: t('common.success'),
                    message: t('admin.adminStatusChanged'),
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
                    title: t('common.success'),
                    message: t('admin.userDataDeleted'),
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
                    title: t('admin.demoReset'),
                    message: t('admin.demoResetSuccess'),
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
            title: t('admin.resetDemoConfirmTitle'),
            children: (
                <Text size="sm">
                    {t('admin.resetDemoConfirmMessage')}
                </Text>
            ),
            labels: { confirm: t('admin.resetDemo'), cancel: t('common.cancel') },
            confirmProps: { color: 'red' },
            onConfirm: () => {
                setIsResetting(true);
                resetDemo();
            },
        });
    };

    const handleToggleAdmin = (targetUser: UserPublic) => {
        const action = targetUser.isAdmin ? t('admin.removeAdmin') : t('admin.makeAdmin');
        modals.openConfirmModal({
            title: t('admin.confirmAdminToggle', { action }),
            children: (
                <Text size="sm">
                    {t('admin.confirmAdminToggleMessage', {
                        name: targetUser.displayName,
                        email: targetUser.email,
                        action: action.toLowerCase()
                    })}
                </Text>
            ),
            labels: { confirm: t('common.confirm'), cancel: t('common.cancel') },
            onConfirm: () => {
                setAdmin({ userId: targetUser.id, isAdmin: !targetUser.isAdmin });
            },
        });
    };

    const handleDeleteUserData = (targetUser: UserPublic) => {
        modals.openConfirmModal({
            title: t('admin.deleteUserDataConfirmTitle'),
            children: (
                <Text size="sm">
                    {t('admin.deleteUserDataConfirmMessage', {
                        name: targetUser.displayName,
                        email: targetUser.email
                    })}
                </Text>
            ),
            labels: { confirm: t('common.delete'), cancel: t('common.cancel') },
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
                    title={t('errors.unauthorized')}
                    color="red"
                >
                    {t('admin.noPermission')}
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
                        <Title order={2}>{t('admin.title')}</Title>
                        <Text c="dimmed">{t('admin.subtitle')}</Text>
                    </div>
                    <Button
                        leftSection={<IconRefresh size={16} />}
                        variant="light"
                        onClick={() => {
                            refetchStats();
                            refetchUsers();
                        }}
                    >
                        {t('admin.refresh')}
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
                                <Text size="xs" c="dimmed">{t('common.total')}</Text>
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
                                <Text size="xs" c="dimmed">{t('admin.demoUsers')}</Text>
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
                                <Text size="xs" c="dimmed">{t('admin.admins')}</Text>
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
                                <Text size="xs" c="dimmed">{t('admin.regularUsers')}</Text>
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
                                <Text fw={500}>{t('admin.demoManagement')}</Text>
                                <Text size="sm" c="dimmed">{t('admin.demoManagementSubtitle')}</Text>
                            </div>
                        </Group>
                        <Button
                            color="red"
                            variant="light"
                            leftSection={<IconRefresh size={16} />}
                            onClick={handleResetDemo}
                            loading={isResetting}
                        >
                            {t('admin.resetDemo')}
                        </Button>
                    </Group>
                    <Text size="sm" c="dimmed">
                        {t('admin.demoManagementDescription')}
                    </Text>
                </Card>

                {/* User Table */}
                <Card withBorder>
                    <Title order={4} mb="md">{t('admin.users')}</Title>
                    {usersLoading ? (
                        <Group justify="center" py="xl">
                            <Loader />
                        </Group>
                    ) : (
                        <Table striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>{t('common.name')}</Table.Th>
                                    <Table.Th>{t('admin.email')}</Table.Th>
                                    <Table.Th>{t('admin.level')}</Table.Th>
                                    <Table.Th>{t('common.status')}</Table.Th>
                                    <Table.Th>{t('admin.registered')}</Table.Th>
                                    <Table.Th>{t('common.actions')}</Table.Th>
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
                                                {u.isDemo && <Badge color="orange" size="sm">{t('admin.demo')}</Badge>}
                                                {u.isAdmin && <Badge color="red" size="sm">{t('admin.admin')}</Badge>}
                                                {!u.isDemo && !u.isAdmin && <Badge color="gray" size="sm">{t('admin.user')}</Badge>}
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
                                                    title={u.isAdmin ? t('admin.removeAdmin') : t('admin.makeAdmin')}
                                                >
                                                    {u.isAdmin ? <IconShieldOff size={16} /> : <IconShield size={16} />}
                                                </ActionIcon>
                                                <ActionIcon
                                                    variant="light"
                                                    color="red"
                                                    onClick={() => handleDeleteUserData(u)}
                                                    title={t('admin.deleteData')}
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
