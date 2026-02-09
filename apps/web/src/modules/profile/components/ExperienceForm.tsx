import { Stack, Group, TextInput, Textarea, Button, Paper, ActionIcon } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

interface WorkExperience {
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    description: string;
}

interface ExperienceFormProps {
    experience: WorkExperience[];
    onChange: (experience: WorkExperience[]) => void;
}

export function ExperienceForm({ experience, onChange }: ExperienceFormProps) {
    const { t } = useTranslation();

    const addEntry = () => {
        onChange([
            ...experience,
            {
                id: crypto.randomUUID(),
                company: '',
                position: '',
                startDate: '',
                endDate: undefined,
                description: '',
            },
        ]);
    };

    const updateEntry = (index: number, field: keyof WorkExperience, value: string | undefined) => {
        const updated = [...experience];
        updated[index] = { ...updated[index], [field]: value };
        onChange(updated);
    };

    const removeEntry = (index: number) => {
        onChange(experience.filter((_, i) => i !== index));
    };

    return (
        <Stack gap="sm">
            {experience.map((exp, index) => (
                <Paper key={exp.id} withBorder p="sm">
                    <Stack gap="xs">
                        <Group justify="space-between">
                            <TextInput
                                label={t('profile.position')}
                                placeholder={t('profile.positionPlaceholder')}
                                value={exp.position}
                                onChange={(e) => updateEntry(index, 'position', e.currentTarget.value)}
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
                        <TextInput
                            label={t('profile.company')}
                            placeholder={t('profile.companyPlaceholder')}
                            value={exp.company}
                            onChange={(e) => updateEntry(index, 'company', e.currentTarget.value)}
                        />
                        <Group grow>
                            <DateInput
                                label={t('profile.startDate')}
                                value={exp.startDate || null}
                                onChange={(value) => updateEntry(index, 'startDate', value || '')}
                            />
                            <DateInput
                                label={t('profile.endDate')}
                                placeholder={t('profile.current')}
                                value={exp.endDate || null}
                                onChange={(value) => updateEntry(index, 'endDate', value || undefined)}
                                clearable
                            />
                        </Group>
                        <Textarea
                            label={t('common.description')}
                            placeholder={t('profile.descriptionPlaceholder')}
                            minRows={2}
                            value={exp.description}
                            onChange={(e) => updateEntry(index, 'description', e.currentTarget.value)}
                        />
                    </Stack>
                </Paper>
            ))}
            <Button variant="light" onClick={addEntry}>
                {t('profile.addExperience')}
            </Button>
        </Stack>
    );
}
