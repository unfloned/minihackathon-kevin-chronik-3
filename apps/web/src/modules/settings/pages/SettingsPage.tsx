import { useState } from 'react';
import {
    Container,
    Title,
    Text,
    Stack,
    Card,
    Group,
    TextInput,
    PasswordInput,
    Button,
    Avatar,
    Switch,
    Select,
    Alert,
    Badge,
    useMantineColorScheme,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import {
    IconUser,
    IconLock,
    IconBell,
    IconPalette,
    IconLanguage,
    IconTrash,
    IconInfoCircle,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import { useMutation } from '../../../hooks';

export default function SettingsPage() {
    const { t, i18n } = useTranslation();
    const { user, refreshUser } = useAuth();
    const { colorScheme, setColorScheme } = useMantineColorScheme();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    const profileForm = useForm({
        initialValues: {
            displayName: user?.displayName || '',
        },
        validate: {
            displayName: (value) =>
                value.length >= 2 ? null : t('auth.nameMinLength', { count: 2 }),
        },
    });

    const passwordForm = useForm({
        initialValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
        validate: {
            currentPassword: (value) =>
                value.length >= 1 ? null : t('errors.required'),
            newPassword: (value) =>
                value.length >= 8 ? null : t('auth.passwordMinLength', { count: 8 }),
            confirmPassword: (value, values) =>
                value === values.newPassword ? null : t('auth.passwordsNoMatch'),
        },
    });

    const { mutate: updateProfile, isLoading: isUpdatingProfile } = useMutation(
        '/auth/profile',
        {
            method: 'PATCH',
            onSuccess: () => {
                notifications.show({
                    title: t('settings.profile') + ' ' + t('common.success'),
                    message: t('notifications.success'),
                    color: 'green',
                });
                refreshUser();
            },
            onError: (error) => {
                notifications.show({
                    title: t('common.error'),
                    message: error,
                    color: 'red',
                });
            },
        }
    );

    const { mutate: changePassword, isLoading: isChangingPassword } = useMutation(
        '/auth/change-password',
        {
            method: 'POST',
            onSuccess: () => {
                notifications.show({
                    title: t('settings.changePassword'),
                    message: t('notifications.success'),
                    color: 'green',
                });
                passwordForm.reset();
            },
            onError: (error) => {
                notifications.show({
                    title: t('common.error'),
                    message: error,
                    color: 'red',
                });
            },
        }
    );

    const handleLanguageChange = (value: string | null) => {
        if (value) {
            i18n.changeLanguage(value);
            localStorage.setItem('language', value);
        }
    };

    const handleThemeChange = (value: string | null) => {
        if (value) {
            setColorScheme(value as 'light' | 'dark' | 'auto');
        }
    };

    const openDeleteModal = () => {
        modals.openConfirmModal({
            title: t('settings.deleteAccount'),
            children: (
                <Text size="sm">
                    {t('settings.deleteAccountWarning')}
                </Text>
            ),
            labels: { confirm: t('settings.deleteAccount'), cancel: t('common.cancel') },
            confirmProps: { color: 'red' },
            onConfirm: () => {
                // TODO: Implement account deletion
                notifications.show({
                    title: t('notifications.info'),
                    message: 'Account-Löschung wird bald verfügbar sein.',
                    color: 'yellow',
                });
            },
        });
    };

    return (
        <Container size="xl" py="xl">
            <Stack gap="lg">
                <div>
                    <Title order={2}>{t('settings.title')}</Title>
                    <Text c="dimmed">{t('settings.profile')} und {t('settings.account')}</Text>
                </div>

            {/* Demo Account Warning */}
            {user?.isDemo && (
                <Alert icon={<IconInfoCircle size={16} />} color="blue">
                    {t('dashboard.demoAccount')}. {t('dashboard.demoRegisterPrompt')}
                </Alert>
            )}

            {/* Profile Settings */}
            <Card withBorder padding="lg">
                <Group gap="xs" mb="md">
                    <IconUser size={20} />
                    <Title order={4}>{t('settings.profile')}</Title>
                </Group>

                <Group align="flex-start" mb="lg">
                    <Avatar size="xl" color="blue" radius="xl">
                        {user?.displayName?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Stack gap="xs">
                        <Text fw={500}>{user?.displayName}</Text>
                        <Text size="sm" c="dimmed">{user?.email}</Text>
                        <Group gap="xs">
                            <Badge color="violet">Level {user?.level}</Badge>
                            <Badge color="blue">{user?.xp} XP</Badge>
                            {user?.isDemo && <Badge color="orange">Demo</Badge>}
                        </Group>
                    </Stack>
                </Group>

                <form onSubmit={profileForm.onSubmit((values) => updateProfile(values))}>
                    <Stack gap="sm">
                        <TextInput
                            label={t('settings.displayName')}
                            placeholder={t('auth.namePlaceholder')}
                            {...profileForm.getInputProps('displayName')}
                            disabled={user?.isDemo}
                        />
                        <TextInput
                            label={t('auth.email')}
                            value={user?.email || ''}
                            disabled
                        />
                        <Button
                            type="submit"
                            loading={isUpdatingProfile}
                            disabled={user?.isDemo}
                        >
                            {t('settings.profile')} {t('common.save')}
                        </Button>
                    </Stack>
                </form>
            </Card>

            {/* Security Settings */}
            {!user?.isDemo && (
                <Card withBorder padding="lg">
                    <Group gap="xs" mb="md">
                        <IconLock size={20} />
                        <Title order={4}>{t('settings.security')}</Title>
                    </Group>

                    <form onSubmit={passwordForm.onSubmit((values) => changePassword(values))}>
                        <Stack gap="sm">
                            <PasswordInput
                                label={t('auth.password')}
                                placeholder={t('auth.passwordPlaceholder')}
                                {...passwordForm.getInputProps('currentPassword')}
                            />
                            <PasswordInput
                                label={t('auth.newPassword')}
                                placeholder={t('auth.passwordMinLength', { count: 8 })}
                                {...passwordForm.getInputProps('newPassword')}
                            />
                            <PasswordInput
                                label={t('auth.confirmPassword')}
                                placeholder={t('auth.confirmPassword')}
                                {...passwordForm.getInputProps('confirmPassword')}
                            />
                            <Button type="submit" loading={isChangingPassword}>
                                {t('settings.changePassword')}
                            </Button>
                        </Stack>
                    </form>
                </Card>
            )}

            {/* Appearance Settings */}
            <Card withBorder padding="lg">
                <Group gap="xs" mb="md">
                    <IconPalette size={20} />
                    <Title order={4}>{t('settings.theme')}</Title>
                </Group>

                <Stack gap="md">
                    <Select
                        label={t('settings.theme')}
                        value={colorScheme}
                        onChange={handleThemeChange}
                        data={[
                            { value: 'light', label: t('settings.lightMode') },
                            { value: 'dark', label: t('settings.darkMode') },
                            { value: 'auto', label: t('settings.systemTheme') },
                        ]}
                    />
                </Stack>
            </Card>

            {/* Language Settings */}
            <Card withBorder padding="lg">
                <Group gap="xs" mb="md">
                    <IconLanguage size={20} />
                    <Title order={4}>{t('settings.language')}</Title>
                </Group>

                <Select
                    label={t('settings.language')}
                    value={i18n.language}
                    onChange={handleLanguageChange}
                    data={[
                        { value: 'de', label: 'Deutsch' },
                        { value: 'en', label: 'English' },
                    ]}
                />
            </Card>

            {/* Notification Settings */}
            <Card withBorder padding="lg">
                <Group gap="xs" mb="md">
                    <IconBell size={20} />
                    <Title order={4}>{t('settings.notifications')}</Title>
                </Group>

                <Stack gap="md">
                    <Switch
                        label={t('settings.notifications')}
                        description={`${t('deadlines.title')}, ${t('deadlines.reminder')} und mehr`}
                        checked={notificationsEnabled}
                        onChange={(e) => setNotificationsEnabled(e.currentTarget.checked)}
                    />
                </Stack>
            </Card>

            {/* Danger Zone */}
            {!user?.isDemo && (
                <Card withBorder padding="lg" style={{ borderColor: 'var(--mantine-color-red-6)' }}>
                    <Group gap="xs" mb="md">
                        <IconTrash size={20} color="var(--mantine-color-red-6)" />
                        <Title order={4} c="red">{t('settings.deleteAccount')}</Title>
                    </Group>

                    <Text size="sm" c="dimmed" mb="md">
                        {t('settings.deleteAccountWarning')}
                    </Text>

                    <Button color="red" variant="outline" onClick={openDeleteModal}>
                        {t('settings.deleteAccount')}
                    </Button>
                </Card>
            )}
            </Stack>
        </Container>
    );
}
