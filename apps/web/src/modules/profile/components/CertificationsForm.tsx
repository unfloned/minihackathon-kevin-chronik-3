import { Stack, Group, TextInput, Button, Paper, ActionIcon } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

interface CvCertification {
    id: string;
    name: string;
    issuer: string;
    date?: string;
    url?: string;
}

interface CertificationsFormProps {
    certifications: CvCertification[];
    onChange: (certifications: CvCertification[]) => void;
}

export function CertificationsForm({ certifications, onChange }: CertificationsFormProps) {
    const { t } = useTranslation();

    const addEntry = () => {
        onChange([
            ...certifications,
            {
                id: crypto.randomUUID(),
                name: '',
                issuer: '',
                date: undefined,
                url: undefined,
            },
        ]);
    };

    const updateEntry = (index: number, field: keyof CvCertification, value: string | undefined) => {
        const updated = [...certifications];
        updated[index] = { ...updated[index], [field]: value };
        onChange(updated);
    };

    const removeEntry = (index: number) => {
        onChange(certifications.filter((_, i) => i !== index));
    };

    return (
        <Stack gap="sm">
            {certifications.map((cert, index) => (
                <Paper key={cert.id} withBorder p="sm">
                    <Stack gap="xs">
                        <Group justify="space-between">
                            <TextInput
                                label={t('cvGenerator.certName')}
                                value={cert.name}
                                onChange={(e) => updateEntry(index, 'name', e.currentTarget.value)}
                                style={{ flex: 1 }}
                            />
                            <ActionIcon
                                variant="subtle"
                                color="red"
                                mt="lg"
                                onClick={() => removeEntry(index)}
                            >
                                <IconTrash size={16} />
                            </ActionIcon>
                        </Group>
                        <Group grow>
                            <TextInput
                                label={t('cvGenerator.certIssuer')}
                                value={cert.issuer}
                                onChange={(e) => updateEntry(index, 'issuer', e.currentTarget.value)}
                            />
                            <DateInput
                                label={t('cvGenerator.certDate')}
                                value={cert.date || null}
                                onChange={(value) => updateEntry(index, 'date', value || undefined)}
                                clearable
                            />
                        </Group>
                        <TextInput
                            label={t('cvGenerator.certUrl')}
                            value={cert.url || ''}
                            onChange={(e) => updateEntry(index, 'url', e.currentTarget.value || undefined)}
                        />
                    </Stack>
                </Paper>
            ))}
            <Button variant="light" onClick={addEntry}>
                {t('cvGenerator.addCertification')}
            </Button>
        </Stack>
    );
}
