import {
    Modal,
    Stack,
    Button,
    TextInput,
    Textarea,
    ColorInput,
} from '@mantine/core';
import { DateInput, DateValue } from '@mantine/dates';
import type { EditProjectForm } from '../types';

// Helper to convert Mantine v8 DateValue to Date
const toDateOrNull = (value: DateValue): Date | null => {
    if (!value) return null;
    if (value instanceof Date) return value;
    return new Date(value);
};

interface ProjectEditModalProps {
    opened: boolean;
    onClose: () => void;
    form: EditProjectForm;
    onFormChange: (form: EditProjectForm) => void;
    onSubmit: () => void;
}

export function ProjectEditModal({ opened, onClose, form, onFormChange, onSubmit }: ProjectEditModalProps) {
    return (
        <Modal opened={opened} onClose={onClose} title="Projekt bearbeiten" size="md">
            <Stack>
                <TextInput
                    label="Name"
                    value={form.name}
                    onChange={(e) => onFormChange({ ...form, name: e.currentTarget.value })}
                    required
                />
                <Textarea
                    label="Beschreibung"
                    value={form.description}
                    onChange={(e) => onFormChange({ ...form, description: e.currentTarget.value })}
                    minRows={2}
                />
                <DateInput
                    label="Zieldatum"
                    value={form.targetDate}
                    onChange={(date) => onFormChange({ ...form, targetDate: toDateOrNull(date) })}
                    clearable
                />
                <ColorInput
                    label="Farbe"
                    value={form.color}
                    onChange={(color) => onFormChange({ ...form, color })}
                    swatches={['#228be6', '#40c057', '#fab005', '#fd7e14', '#fa5252', '#be4bdb', '#7950f2', '#15aabf']}
                />
                <Button onClick={onSubmit} fullWidth mt="md">
                    Speichern
                </Button>
            </Stack>
        </Modal>
    );
}
