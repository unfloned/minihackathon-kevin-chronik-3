import {
    Modal,
    Stack,
    Select,
    TextInput,
    Textarea,
    Button,
    Group,
} from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { DatePickerInput } from '@mantine/dates';
import { useTranslation } from 'react-i18next';
import type { MealWithDetails } from '@ycmm/core';
import { mealTypeOptions, type MealPlanFormValues } from '../types';

interface MealPlanModalProps {
    opened: boolean;
    onClose: () => void;
    form: UseFormReturnType<MealPlanFormValues>;
    onSubmit: (values: MealPlanFormValues) => void;
    meals: MealWithDetails[] | undefined;
}

export function MealPlanModal({ opened, onClose, form, onSubmit, meals }: MealPlanModalProps) {
    const { t } = useTranslation();

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={t('meals.planner.planMealModal')}
            size="md"
        >
            <form onSubmit={form.onSubmit(onSubmit)}>
                <Stack gap="md">
                    <DatePickerInput
                        label={t('meals.planner.date')}
                        placeholder={t('meals.planner.selectDate')}
                        valueFormat="DD.MM.YYYY"
                        locale="de"
                        required
                        {...form.getInputProps('date')}
                    />

                    <Select
                        label={t('meals.planner.mealType')}
                        placeholder={t('meals.planner.selectMealType')}
                        data={mealTypeOptions.map(opt => ({ value: opt.value, label: t(opt.label) }))}
                        required
                        {...form.getInputProps('mealType')}
                    />

                    <Select
                        label={t('meals.planner.recipe')}
                        placeholder={t('meals.planner.selectRecipe')}
                        data={meals?.map(meal => ({ value: meal.id, label: meal.name })) || []}
                        searchable
                        clearable
                        {...form.getInputProps('mealId')}
                    />

                    <TextInput
                        label={t('meals.planner.customMeal')}
                        placeholder={t('meals.planner.customMealPlaceholder')}
                        disabled={!!form.values.mealId}
                        {...form.getInputProps('customMealName')}
                    />

                    <Textarea
                        label={t('meals.planner.notes')}
                        placeholder={t('meals.planner.notesPlaceholder')}
                        rows={3}
                        {...form.getInputProps('notes')}
                    />

                    <Group justify="flex-end" mt="md">
                        <Button variant="subtle" onClick={onClose}>
                            {t('meals.cancel')}
                        </Button>
                        <Button type="submit">
                            {t('meals.planner.plan')}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
