import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Container,
    Paper,
    Title,
    Text,
    TextInput,
    Button,
    Stack,
    Alert,
    Anchor,
    Center,
} from '@mantine/core';
import { useMutation } from '../../../hooks';

interface ForgotPasswordResponse {
    success: boolean;
    message: string;
}

export function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const { mutate, isLoading, error } = useMutation<ForgotPasswordResponse, { email: string }>(
        '/auth/forgot-password',
        {
            auth: false,
            onSuccess: () => setSubmitted(true),
        }
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email.trim()) {
            mutate({ email: email.trim() });
        }
    };

    if (submitted) {
        return (
            <Container size={420} my={40}>
                <Paper withBorder shadow="md" p={30} radius="md">
                    <Stack>
                        <Alert color="green" title="E-Mail gesendet">
                            Falls ein Account mit dieser E-Mail existiert, wurde ein Link zum
                            Zurücksetzen des Passworts gesendet. Bitte überprüfe deinen Posteingang.
                        </Alert>
                        <Text size="sm" c="dimmed" ta="center">
                            Der Link ist 1 Stunde gültig.
                        </Text>
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
                Passwort vergessen?
            </Title>
            <Text c="dimmed" size="sm" ta="center" mt={5}>
                Gib deine E-Mail-Adresse ein und wir senden dir einen Link zum Zurücksetzen.
            </Text>

            <Paper withBorder shadow="md" p={30} mt={30} radius="md">
                <form onSubmit={handleSubmit}>
                    <Stack>
                        {error && (
                            <Alert color="red" title="Fehler">
                                {error}
                            </Alert>
                        )}

                        <TextInput
                            label="E-Mail"
                            placeholder="deine@email.de"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                        />

                        <Button type="submit" fullWidth loading={isLoading}>
                            Link senden
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
