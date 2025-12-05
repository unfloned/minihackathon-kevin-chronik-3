import { useTranslation } from 'react-i18next';
import {
    Modal,
    Stack,
    TextInput,
    Textarea,
    Select,
    ColorInput,
    Group,
    Button,
} from '@mantine/core';
import { DateInput, DateValue } from '@mantine/dates';
import { CreateProjectForm, projectTypeOptions } from '../types';
import type { ProjectType } from '@ycmm/core';

// Helper to convert Mantine v8 DateValue to Date
const toDateOrNull = (value: DateValue): Date | null => {
    if (!value) return null;
    if (value instanceof Date) return value;
    return new Date(value);
};

interface ProjectFormModalProps {
    opened: boolean;
    onClose: () => void;
    form: CreateProjectForm;
    setForm: React.Dispatch<React.SetStateAction<CreateProjectForm>>;
    onSubmit: () => void;
    isEditing: boolean;
    isLoading: boolean;
}

export function ProjectFormModal({
    opened,
    onClose,
    form,
    setForm,
    onSubmit,
    isEditing,
    isLoading,
}: ProjectFormModalProps) {
    const { t } = useTranslation();

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={isEditing ? t('projects.editProject') : t('projects.newProject')}
            size="md"
        >
            <Stack gap="md">
                <TextInput
                    label={t('common.name')}
                    placeholder={t('meals.namePlaceholder')}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                />

                <Textarea
                    label={t('common.description')}
                    placeholder={t('meals.descriptionPlaceholder')}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    minRows={3}
                />

                <Select
                    label={t('common.type')}
                    data={projectTypeOptions}
                    value={form.type}
                    onChange={(value) => setForm({ ...form, type: value as ProjectType })}
                    required
                />

                <ColorInput
                    label={t('common.color')}
                    value={form.color}
                    onChange={(value) => setForm({ ...form, color: value })}
                    format="hex"
                    swatches={[
                        '#228be6',
                        '#40c057',
                        '#fab005',
                        '#fd7e14',
                        '#fa5252',
                        '#e64980',
                        '#be4bdb',
                        '#7950f2',
                    ]}
                />

                <DateInput
                    label={t('projects.deadline')}
                    placeholder={t('deadlines.selectDate')}
                    value={form.targetDate}
                    onChange={(value) => setForm({ ...form, targetDate: toDateOrNull(value) ?? undefined })}
                    clearable
                />

                <Group justify="flex-end" mt="md">
                    <Button variant="subtle" onClick={onClose}>
                        {t('common.cancel')}
                    </Button>
                    <Button onClick={onSubmit} loading={isLoading}>
                        {isEditing ? t('common.save') : t('common.create')}
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}
