import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
    Container,
    Paper,
    Title,
    Text,
    TextInput,
    PasswordInput,
    Button,
    Group,
    Anchor,
    Stack,
    Divider,
    Progress,
    Box,
    SimpleGrid,
    ThemeIcon,
    Alert,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
    IconTarget,
    IconMail,
    IconLock,
    IconUser,
    IconRocket,
    IconCheck,
    IconInfoCircle,
} from '@tabler/icons-react';
import { useAuth } from '../../../contexts/AuthContext';
import { getErrorMessage } from '../../../config/api';

type AuthMode = 'login' | 'register';

function getPasswordStrength(password: string): number {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 10;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 20;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 20;
    return Math.min(strength, 100);
}

function getStrengthColor(strength: number): string {
    if (strength < 30) return 'red';
    if (strength < 60) return 'yellow';
    if (strength < 80) return 'blue';
    return 'green';
}

export default function AuthPage() {
    const [mode, setMode] = useState<AuthMode>('login');
    const [isLoading, setIsLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login, register, createDemoAccount, isAuthenticated } = useAuth();

    const form = useForm({
        initialValues: {
            email: '',
            password: '',
            displayName: '',
        },
        validate: {
            email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Ungültige E-Mail'),
            password: (value) =>
                value.length >= 6 ? null : 'Passwort muss mindestens 6 Zeichen haben',
            displayName: (value) =>
                mode === 'register' && value.length < 2
                    ? 'Name muss mindestens 2 Zeichen haben'
                    : null,
        },
    });

    const passwordStrength = getPasswordStrength(form.values.password);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/app');
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        if (searchParams.get('demo') === 'true') {
            handleDemoLogin();
        }
    }, [searchParams]);

    const handleSubmit = async (values: typeof form.values) => {
        setIsLoading(true);
        try {
            if (mode === 'login') {
                await login(values.email, values.password);
                notifications.show({
                    title: 'Willkommen zurück!',
                    message: 'Du bist jetzt eingeloggt.',
                    color: 'green',
                });
            } else {
                await register({
                    email: values.email,
                    password: values.password,
                    displayName: values.displayName,
                });
                notifications.show({
                    title: 'Account erstellt!',
                    message: 'Willkommen bei Your Chaos, My Mission!',
                    color: 'green',
                });
            }
            navigate('/app');
        } catch (error) {
            notifications.show({
                title: 'Fehler',
                message: getErrorMessage(error),
                color: 'red',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDemoLogin = async () => {
        setIsLoading(true);
        try {
            await createDemoAccount();
            notifications.show({
                title: 'Demo gestartet!',
                message: 'Du nutzt jetzt einen Demo-Account.',
                color: 'blue',
            });
            navigate('/app');
        } catch (error) {
            notifications.show({
                title: 'Fehler',
                message: getErrorMessage(error),
                color: 'red',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container size="lg" py={40}>
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing={60}>
                {/* Left Side - Branding */}
                <Stack justify="center" visibleFrom="md">
                    <Group gap="xs">
                        <IconTarget size={48} color="var(--mantine-color-blue-6)" />
                        <Title order={1}>
                            <Text
                                component="span"
                                variant="gradient"
                                gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
                                inherit
                            >
                                Your Chaos
                            </Text>
                        </Title>
                    </Group>
                    <Title order={1} c="dimmed">
                        My Mission
                    </Title>

                    <Text size="lg" c="dimmed" mt="xl">
                        Organisiere dein Leben mit einer App.
                        Bewerbungen, Gewohnheiten, Ausgaben und mehr -
                        alles an einem Ort.
                    </Text>

                    <Stack gap="sm" mt="xl">
                        {[
                            'Bewerbungen tracken',
                            'Gewohnheiten aufbauen',
                            'Ausgaben im Blick',
                            'XP sammeln & Level aufsteigen',
                        ].map((feature) => (
                            <Group key={feature} gap="xs">
                                <ThemeIcon size="sm" color="green" variant="light">
                                    <IconCheck size={14} />
                                </ThemeIcon>
                                <Text size="sm">{feature}</Text>
                            </Group>
                        ))}
                    </Stack>
                </Stack>

                {/* Right Side - Form */}
                <Paper radius="md" p="xl" withBorder>
                    <Title order={2} ta="center" mb="md">
                        {mode === 'login' ? 'Willkommen zurück' : 'Account erstellen'}
                    </Title>

                    <Text c="dimmed" size="sm" ta="center" mb="xl">
                        {mode === 'login'
                            ? 'Melde dich an um fortzufahren'
                            : 'Erstelle einen Account um loszulegen'}
                    </Text>

                    <form onSubmit={form.onSubmit(handleSubmit)}>
                        <Stack>
                            {mode === 'register' && (
                                <TextInput
                                    label="Name"
                                    placeholder="Dein Name"
                                    leftSection={<IconUser size={16} />}
                                    {...form.getInputProps('displayName')}
                                />
                            )}

                            <TextInput
                                label="E-Mail"
                                placeholder="deine@email.de"
                                leftSection={<IconMail size={16} />}
                                {...form.getInputProps('email')}
                            />

                            <Box>
                                <PasswordInput
                                    label="Passwort"
                                    placeholder="Dein Passwort"
                                    leftSection={<IconLock size={16} />}
                                    {...form.getInputProps('password')}
                                />
                                {mode === 'register' && form.values.password && (
                                    <Progress
                                        value={passwordStrength}
                                        color={getStrengthColor(passwordStrength)}
                                        size="xs"
                                        mt="xs"
                                    />
                                )}
                            </Box>

                            {mode === 'login' && (
                                <Anchor
                                    component={Link}
                                    to="/forgot-password"
                                    c="dimmed"
                                    size="xs"
                                    ta="right"
                                >
                                    Passwort vergessen?
                                </Anchor>
                            )}

                            <Button type="submit" fullWidth loading={isLoading}>
                                {mode === 'login' ? 'Anmelden' : 'Registrieren'}
                            </Button>
                        </Stack>
                    </form>

                    <Divider label="oder" labelPosition="center" my="lg" />

                    <Button
                        fullWidth
                        variant="light"
                        leftSection={<IconRocket size={18} />}
                        onClick={handleDemoLogin}
                        loading={isLoading}
                    >
                        Demo ausprobieren
                    </Button>

                    <Alert
                        icon={<IconInfoCircle size={16} />}
                        color="blue"
                        variant="light"
                        mt="md"
                    >
                        Mit der Demo kannst du alle Features testen ohne einen Account zu erstellen.
                    </Alert>

                    <Text ta="center" mt="xl" size="sm">
                        {mode === 'login' ? (
                            <>
                                Noch kein Account?{' '}
                                <Anchor
                                    component="button"
                                    type="button"
                                    onClick={() => setMode('register')}
                                >
                                    Registrieren
                                </Anchor>
                            </>
                        ) : (
                            <>
                                Bereits registriert?{' '}
                                <Anchor
                                    component="button"
                                    type="button"
                                    onClick={() => setMode('login')}
                                >
                                    Anmelden
                                </Anchor>
                            </>
                        )}
                    </Text>
                </Paper>
            </SimpleGrid>
        </Container>
    );
}
