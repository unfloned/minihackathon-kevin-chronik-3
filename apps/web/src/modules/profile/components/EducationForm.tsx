import { Stack, Group, TextInput, Button, Paper, ActionIcon } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

interface Education {
    id: string;
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate?: string;
}

interface EducationFormProps {
    education: Education[];
    onChange: (education: Education[]) => void;
}

export function EducationForm({ education, onChange }: EducationFormProps) {
    const { t } = useTranslation();

    const addEntry = () => {
        onChange([
            ...education,
            {
                id: crypto.randomUUID(),
                institution: '',
                degree: '',
                field: '',
                startDate: '',
                endDate: undefined,
            },
        ]);
    };

    const updateEntry = (index: number, field: keyof Education, value: string | undefined) => {
        const updated = [...education];
        updated[index] = { ...updated[index], [field]: value };
        onChange(updated);
    };

    const removeEntry = (index: number) => {
        onChange(education.filter((_, i) => i !== index));
    };

    return (
        <Stack gap="sm">
            {education.map((edu, index) => (
                <Paper key={edu.id} withBorder p="sm">
                    <Stack gap="xs">
                        <Group justify="space-between">
                            <TextInput
                                label={t('profile.institution')}
                                placeholder={t('profile.institutionPlaceholder')}
                                value={edu.institution}
                                onChange={(e) => updateEntry(index, 'institution', e.currentTarget.value)}
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
                                label={t('profile.degree')}
                                placeholder={t('profile.degreePlaceholder')}
                                value={edu.degree}
                                onChange={(e) => updateEntry(index, 'degree', e.currentTarget.value)}
                            />
                            <TextInput
                                label={t('profile.field')}
                                placeholder={t('profile.fieldPlaceholder')}
                                value={edu.field}
                                onChange={(e) => updateEntry(index, 'field', e.currentTarget.value)}
                            />
                        </Group>
                        <Group grow>
                            <DateInput
                                label={t('profile.startDate')}
                                value={edu.startDate || null}
                                onChange={(value) => updateEntry(index, 'startDate', value || '')}
                            />
                            <DateInput
                                label={t('profile.endDate')}
                                placeholder={t('profile.current')}
                                value={edu.endDate || null}
                                onChange={(value) => updateEntry(index, 'endDate', value || undefined)}
                                clearable
                            />
                        </Group>
                    </Stack>
                </Paper>
            ))}
            <Button variant="light" onClick={addEntry}>
                {t('profile.addEducation')}
            </Button>
        </Stack>
    );
}
