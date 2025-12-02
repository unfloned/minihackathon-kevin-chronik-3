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
                value.length >= 2 ? null : 'Name muss mindestens 2 Zeichen haben',
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
                value.length >= 1 ? null : 'Aktuelles Passwort erforderlich',
            newPassword: (value) =>
                value.length >= 8 ? null : 'Mindestens 8 Zeichen',
            confirmPassword: (value, values) =>
                value === values.newPassword ? null : 'Passwörter stimmen nicht überein',
        },
    });

    const { mutate: updateProfile, isLoading: isUpdatingProfile } = useMutation(
        '/auth/profile',
        {
            method: 'PATCH',
            onSuccess: () => {
                notifications.show({
                    title: 'Profil aktualisiert',
                    message: 'Deine Änderungen wurden gespeichert.',
                    color: 'green',
                });
                refreshUser();
            },
            onError: (error) => {
                notifications.show({
                    title: 'Fehler',
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
                    title: 'Passwort geändert',
                    message: 'Dein Passwort wurde erfolgreich geändert.',
                    color: 'green',
                });
                passwordForm.reset();
            },
            onError: (error) => {
                notifications.show({
                    title: 'Fehler',
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
            title: 'Account löschen',
            children: (
                <Text size="sm">
                    Bist du sicher, dass du deinen Account löschen möchtest? Diese Aktion kann
                    nicht rückgängig gemacht werden und alle deine Daten werden unwiderruflich
                    gelöscht.
                </Text>
            ),
            labels: { confirm: 'Account löschen', cancel: 'Abbrechen' },
            confirmProps: { color: 'red' },
            onConfirm: () => {
                // TODO: Implement account deletion
                notifications.show({
                    title: 'Noch nicht implementiert',
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
                    <Text c="dimmed">Verwalte dein Profil und deine Einstellungen</Text>
                </div>

            {/* Demo Account Warning */}
            {user?.isDemo && (
                <Alert icon={<IconInfoCircle size={16} />} color="orange">
                    Du nutzt einen Demo-Account. Einstellungen können nicht gespeichert werden.
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
                            label="Anzeigename"
                            placeholder="Dein Name"
                            {...profileForm.getInputProps('displayName')}
                            disabled={user?.isDemo}
                        />
                        <TextInput
                            label="E-Mail"
                            value={user?.email || ''}
                            disabled
                        />
                        <Button
                            type="submit"
                            loading={isUpdatingProfile}
                            disabled={user?.isDemo}
                        >
                            Profil speichern
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
                                label="Aktuelles Passwort"
                                placeholder="Dein aktuelles Passwort"
                                {...passwordForm.getInputProps('currentPassword')}
                            />
                            <PasswordInput
                                label="Neues Passwort"
                                placeholder="Mindestens 8 Zeichen"
                                {...passwordForm.getInputProps('newPassword')}
                            />
                            <PasswordInput
                                label="Passwort bestätigen"
                                placeholder="Neues Passwort wiederholen"
                                {...passwordForm.getInputProps('confirmPassword')}
                            />
                            <Button type="submit" loading={isChangingPassword}>
                                Passwort ändern
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
                        label="Farbschema"
                        value={colorScheme}
                        onChange={handleThemeChange}
                        data={[
                            { value: 'light', label: 'Hell' },
                            { value: 'dark', label: 'Dunkel' },
                            { value: 'auto', label: 'System' },
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
                    label="Sprache"
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
                        label="Benachrichtigungen aktivieren"
                        description="Erhalte Benachrichtigungen über Fristen, Erinnerungen und mehr"
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
                        <Title order={4} c="red">Gefahrenzone</Title>
                    </Group>

                    <Text size="sm" c="dimmed" mb="md">
                        Wenn du deinen Account löschst, werden alle deine Daten unwiderruflich
                        entfernt. Diese Aktion kann nicht rückgängig gemacht werden.
                    </Text>

                    <Button color="red" variant="outline" onClick={openDeleteModal}>
                        Account löschen
                    </Button>
                </Card>
            )}
            </Stack>
        </Container>
    );
}
