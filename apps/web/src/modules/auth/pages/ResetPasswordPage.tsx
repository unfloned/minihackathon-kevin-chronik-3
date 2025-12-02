import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Title,
    Text,
    PasswordInput,
    Button,
    Stack,
    Alert,
    Anchor,
    Center,
    Loader,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useRequest, useMutation } from '../../../hooks';

interface ValidateTokenResponse {
    valid: boolean;
    email?: string;
}

interface ResetPasswordResponse {
    success: boolean;
    message: string;
}

export function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token') || '';

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [validationError, setValidationError] = useState('');

    const { data: tokenData, isLoading: isValidating, error: tokenError } = useRequest<ValidateTokenResponse>(
        `/auth/validate-reset-token?token=${encodeURIComponent(token)}`,
        { immediate: !!token, auth: false }
    );

    const { mutate, isLoading: isResetting, error: resetError } = useMutation<ResetPasswordResponse, { token: string; password: string }>(
        '/auth/reset-password',
        {
            auth: false,
            onSuccess: () => {
                notifications.show({
                    title: 'Passwort zurückgesetzt',
                    message: 'Du kannst dich jetzt mit deinem neuen Passwort anmelden.',
                    color: 'green',
                });
                navigate('/auth');
            },
        }
    );

    useEffect(() => {
        if (!token) {
            setValidationError('Kein Token angegeben');
        }
    }, [token]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError('');

        if (password.length < 8) {
            setValidationError('Das Passwort muss mindestens 8 Zeichen lang sein');
            return;
        }

        if (password !== confirmPassword) {
            setValidationError('Die Passwörter stimmen nicht überein');
            return;
        }

        mutate({ token, password });
    };

    // Loading state
    if (isValidating) {
        return (
            <Container size={420} my={40}>
                <Paper withBorder shadow="md" p={30} radius="md">
                    <Center>
                        <Stack align="center">
                            <Loader size="lg" />
                            <Text>Link wird überprüft...</Text>
                        </Stack>
                    </Center>
                </Paper>
            </Container>
        );
    }

    // Invalid or missing token
    if (!token || tokenError || (tokenData && !tokenData.valid)) {
        return (
            <Container size={420} my={40}>
                <Paper withBorder shadow="md" p={30} radius="md">
                    <Stack>
                        <Alert color="red" title="Ungültiger Link">
                            Dieser Link ist ungültig oder abgelaufen. Bitte fordere einen neuen
                            Link zum Zurücksetzen des Passworts an.
                        </Alert>
                        <Button component={Link} to="/forgot-password" fullWidth>
                            Neuen Link anfordern
                        </Button>
                        <Center>
                            <Anchor component={Link} to="/auth" size="sm">
                                Zurück zur Anmeldung
                            </Anchor>
                        </Center>
                    </Stack>
                </Paper>
            </Container>
        );
    }

    return (
        <Container size={420} my={40}>
            <Title ta="center" order={2}>
                Neues Passwort setzen
            </Title>
            {tokenData?.email && (
                <Text c="dimmed" size="sm" ta="center" mt={5}>
                    Für: {tokenData.email}
                </Text>
            )}

            <Paper withBorder shadow="md" p={30} mt={30} radius="md">
                <form onSubmit={handleSubmit}>
                    <Stack>
                        {(validationError || resetError) && (
                            <Alert color="red" title="Fehler">
                                {validationError || resetError}
                            </Alert>
                        )}

                        <PasswordInput
                            label="Neues Passwort"
                            placeholder="Mindestens 8 Zeichen"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <PasswordInput
                            label="Passwort bestätigen"
                            placeholder="Passwort wiederholen"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />

                        <Button type="submit" fullWidth loading={isResetting}>
                            Passwort ändern
                        </Button>

                        <Center>
                            <Anchor component={Link} to="/auth" size="sm">
                                Zurück zur Anmeldung
                            </Anchor>
                        </Center>
                    </Stack>
                </form>
            </Paper>
        </Container>
    );
}
