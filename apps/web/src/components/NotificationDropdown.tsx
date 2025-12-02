import { useState } from 'react';
import {
    ActionIcon,
    Indicator,
    Menu,
    Text,
    Group,
    Stack,
    Badge,
    ScrollArea,
    Loader,
    Center,
    Button,
    ThemeIcon,
} from '@mantine/core';
import {
    IconBell,
    IconCheck,
    IconInfoCircle,
    IconAlertTriangle,
    IconX,
    IconTrophy,
    IconClock,
    IconChecks,
} from '@tabler/icons-react';
import { useRequest, useMutation } from '../hooks';

interface NotificationPublic {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'achievement' | 'reminder';
    title: string;
    message: string;
    link?: string;
    isRead: boolean;
    createdAt: Date;
}

const typeIcons = {
    info: IconInfoCircle,
    success: IconCheck,
    warning: IconAlertTriangle,
    error: IconX,
    achievement: IconTrophy,
    reminder: IconClock,
};

const typeColors = {
    info: 'blue',
    success: 'green',
    warning: 'yellow',
    error: 'red',
    achievement: 'violet',
    reminder: 'orange',
};

export function NotificationDropdown() {
    const [opened, setOpened] = useState(false);

    const { data: notifications, isLoading, refetch } = useRequest<NotificationPublic[]>(
        '/notifications',
        { immediate: opened }
    );

    const { data: unreadCount, refetch: refetchCount } = useRequest<number>(
        '/notifications/unread-count'
    );

    const { mutate: markAsRead } = useMutation<void, { id: string }>(
        (vars) => `/notifications/${vars.id}/read`,
        { method: 'PATCH' }
    );

    const { mutate: markAllAsRead, isLoading: markingAll } = useMutation<number>(
        '/notifications/read-all',
        {
            method: 'POST',
            onSuccess: () => {
                // Refetch after successful mutation
                refetch();
                refetchCount();
            },
        }
    );

    const handleMarkAsRead = async (id: string) => {
        await markAsRead({ id });
        // Wait a bit for DB to commit, then refetch
        setTimeout(() => {
            refetch();
            refetchCount();
        }, 100);
    };

    const handleMarkAllAsRead = async () => {
        await markAllAsRead();
        // Also do a delayed refetch as backup
        setTimeout(() => {
            refetchCount();
        }, 200);
    };

    const unreadCountValue = unreadCount ?? 0;

    const formatDate = (date: Date) => {
        const d = new Date(date);
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Gerade eben';
        if (diffMins < 60) return `Vor ${diffMins} Min.`;
        if (diffHours < 24) return `Vor ${diffHours} Std.`;
        if (diffDays < 7) return `Vor ${diffDays} Tagen`;
        return d.toLocaleDateString('de-DE');
    };

    return (
        <Menu
            shadow="md"
            width={360}
            opened={opened}
            onChange={setOpened}
            position="bottom-end"
        >
            <Menu.Target>
                <Indicator
                    label={unreadCountValue > 9 ? '9+' : unreadCountValue}
                    size={16}
                    color="red"
                    disabled={unreadCountValue === 0}
                >
                    <ActionIcon variant="subtle" size="lg">
                        <IconBell size={20} />
                    </ActionIcon>
                </Indicator>
            </Menu.Target>

            <Menu.Dropdown>
                <Group justify="space-between" p="xs">
                    <Text fw={600}>Benachrichtigungen</Text>
                    {unreadCountValue > 0 && (
                        <Button
                            variant="subtle"
                            size="compact-xs"
                            leftSection={<IconChecks size={14} />}
                            onClick={handleMarkAllAsRead}
                            loading={markingAll}
                        >
                            Alle gelesen
                        </Button>
                    )}
                </Group>

                <Menu.Divider />

                <ScrollArea.Autosize mah={400}>
                    {isLoading ? (
                        <Center py="xl">
                            <Loader size="sm" />
                        </Center>
                    ) : notifications && notifications.length > 0 ? (
                        <Stack gap={0}>
                            {notifications.map((notification) => {
                                const Icon = typeIcons[notification.type];
                                const color = typeColors[notification.type];

                                return (
                                    <Menu.Item
                                        key={notification.id}
                                        onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                                        style={{
                                            backgroundColor: notification.isRead
                                                ? undefined
                                                : 'var(--mantine-color-blue-light)',
                                        }}
                                    >
                                        <Group gap="sm" wrap="nowrap" align="flex-start">
                                            <ThemeIcon
                                                variant="light"
                                                color={color}
                                                size="md"
                                                mt={2}
                                            >
                                                <Icon size={16} />
                                            </ThemeIcon>
                                            <Stack gap={2} style={{ flex: 1 }}>
                                                <Group justify="space-between" wrap="nowrap">
                                                    <Text size="sm" fw={500} lineClamp={1}>
                                                        {notification.title}
                                                    </Text>
                                                    {!notification.isRead && (
                                                        <Badge size="xs" color="blue" variant="filled">
                                                            Neu
                                                        </Badge>
                                                    )}
                                                </Group>
                                                <Text size="xs" c="dimmed" lineClamp={2}>
                                                    {notification.message}
                                                </Text>
                                                <Text size="xs" c="dimmed">
                                                    {formatDate(notification.createdAt)}
                                                </Text>
                                            </Stack>
                                        </Group>
                                    </Menu.Item>
                                );
                            })}
                        </Stack>
                    ) : (
                        <Center py="xl">
                            <Stack align="center" gap="xs">
                                <IconBell size={32} color="var(--mantine-color-dimmed)" />
                                <Text size="sm" c="dimmed">
                                    Keine Benachrichtigungen
                                </Text>
                            </Stack>
                        </Center>
                    )}
                </ScrollArea.Autosize>
            </Menu.Dropdown>
        </Menu>
    );
}
