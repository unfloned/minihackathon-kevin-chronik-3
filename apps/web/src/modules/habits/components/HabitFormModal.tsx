import {
    Modal,
    Stack,
    TextInput,
    Textarea,
    Select,
    ColorInput,
    NumberInput,
    Group,
    Button,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { CreateHabitForm, Habit } from '../types';
import { DURATION_UNIT_KEYS, COLOR_SWATCHES } from '../types';

interface HabitFormModalProps {
    opened: boolean;
    onClose: () => void;
    form: CreateHabitForm;
    setForm: (form: CreateHabitForm) => void;
    editingHabit: Habit | null;
    onSubmit: () => void;
    isLoading: boolean;
}

export function HabitFormModal({
    opened,
    onClose,
    form,
    setForm,
    editingHabit,
    onSubmit,
    isLoading,
}: HabitFormModalProps) {
    const { t } = useTranslation();

    // Duration unit options with translations
    const DURATION_UNITS = DURATION_UNIT_KEYS.map(key => ({
        value: key,
        label: t(`habits.units.${key}`)
    }));

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={editingHabit ? t('habits.editHabit') : t('habits.newHabit')}
            size="md"
        >
            <Stack>
                <TextInput
                    label={t('common.name')}
                    placeholder={t('habits.placeholder')}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.currentTarget.value })}
                    required
                />

                <Textarea
                    label={t('common.description')}
                    placeholder={t('common.optional')}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.currentTarget.value })}
                />

                <Select
                    label={t('common.type')}
                    data={[
                        { value: 'boolean', label: `${t('habits.types.boolean')} (${t('habits.types.booleanDesc')})` },
                        { value: 'quantity', label: `${t('habits.types.quantity')} (${t('habits.types.quantityDesc')})` },
                        { value: 'duration', label: `${t('habits.types.duration')} (${t('habits.types.durationDesc')})` },
                    ]}
                    value={form.type}
                    onChange={(value) => {
                        const newType = (value as CreateHabitForm['type']) || 'boolean';
                        setForm({
                            ...form,
                            type: newType,
                            unit: newType === 'duration' ? 'minutes' : '',
                        });
                    }}
                />

                {form.type === 'quantity' && (
                    <Group grow>
                        <NumberInput
                            label={t('habits.targetValue')}
                            min={1}
                            value={form.targetValue}
                            onChange={(value) => setForm({ ...form, targetValue: Number(value) || 1 })}
                        />
                        <TextInput
                            label={t('habits.unit')}
                            placeholder={t('habits.unitPlaceholder')}
                            value={form.unit}
                            onChange={(e) => setForm({ ...form, unit: e.currentTarget.value })}
                        />
                    </Group>
                )}

                {form.type === 'duration' && (
                    <Group grow>
                        <NumberInput
                            label={t('habits.targetValue')}
                            min={1}
                            value={form.targetValue}
                            onChange={(value) => setForm({ ...form, targetValue: Number(value) || 1 })}
                        />
                        <Select
                            label={t('habits.unit')}
                            data={DURATION_UNITS}
                            value={form.unit || 'minutes'}
                            onChange={(value) => setForm({ ...form, unit: value || 'minutes' })}
                        />
                    </Group>
                )}

                <Select
                    label={t('habits.frequency.daily').replace('Täglich', 'Frequenz')}
                    data={[
                        { value: 'daily', label: t('habits.frequency.daily') },
                        { value: 'weekly', label: t('habits.frequency.weekly') },
                    ]}
                    value={form.frequency}
                    onChange={(value) => setForm({ ...form, frequency: (value as CreateHabitForm['frequency']) || 'daily' })}
                />

                <ColorInput
                    label={t('common.color')}
                    value={form.color}
                    onChange={(color) => setForm({ ...form, color })}
                    swatches={COLOR_SWATCHES}
                />

                <Button
                    onClick={onSubmit}
                    loading={isLoading}
                    fullWidth
                    mt="md"
                >
                    {editingHabit ? t('common.save') : t('common.create')}
                </Button>
            </Stack>
        </Modal>
    );
}
