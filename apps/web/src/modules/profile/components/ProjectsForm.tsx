import { Stack, Group, TextInput, Textarea, Button, Paper, ActionIcon, TagsInput } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

interface CvProject {
    id: string;
    title: string;
    description: string;
    url?: string;
    technologies?: string[];
}

interface ProjectsFormProps {
    projects: CvProject[];
    onChange: (projects: CvProject[]) => void;
}

export function ProjectsForm({ projects, onChange }: ProjectsFormProps) {
    const { t } = useTranslation();

    const addEntry = () => {
        onChange([
            ...projects,
            {
                id: crypto.randomUUID(),
                title: '',
                description: '',
                url: undefined,
                technologies: [],
            },
        ]);
    };

    const updateEntry = (index: number, field: keyof CvProject, value: any) => {
        const updated = [...projects];
        updated[index] = { ...updated[index], [field]: value };
        onChange(updated);
    };

    const removeEntry = (index: number) => {
        onChange(projects.filter((_, i) => i !== index));
    };

    return (
        <Stack gap="sm">
            {projects.map((proj, index) => (
                <Paper key={proj.id} withBorder p="sm">
                    <Stack gap="xs">
                        <Group justify="space-between">
                            <TextInput
                                label={t('cvGenerator.projectTitle')}
                                value={proj.title}
                                onChange={(e) => updateEntry(index, 'title', e.currentTarget.value)}
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
                        <Textarea
                            label={t('cvGenerator.projectDescription')}
                            minRows={2}
                            value={proj.description}
                            onChange={(e) => updateEntry(index, 'description', e.currentTarget.value)}
                        />
                        <TextInput
                            label={t('cvGenerator.projectUrl')}
                            value={proj.url || ''}
                            onChange={(e) => updateEntry(index, 'url', e.currentTarget.value || undefined)}
                        />
                        <TagsInput
                            label={t('cvGenerator.projectTechnologies')}
                            value={proj.technologies || []}
                            onChange={(value) => updateEntry(index, 'technologies', value)}
                        />
                    </Stack>
                </Paper>
            ))}
            <Button variant="light" onClick={addEntry}>
                {t('cvGenerator.addProject')}
            </Button>
        </Stack>
    );
}
