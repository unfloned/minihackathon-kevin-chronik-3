import {
    Modal,
    Stack,
    TextInput,
    Textarea,
    NumberInput,
    Select,
    Button,
    Group,
    Box,
    Text,
    Paper,
    Checkbox,
    CloseButton,
} from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { IconPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { MealWithDetails, Ingredient } from '@ycmm/core';
import { mealTypeOptions, cuisineOptions, unitOptions, type MealFormValues } from '../types';

interface MealFormModalProps {
    opened: boolean;
    onClose: () => void;
    form: UseFormReturnType<MealFormValues>;
    onSubmit: (values: MealFormValues) => void;
    editingMeal: MealWithDetails | null;
    onAddIngredient: () => void;
    onRemoveIngredient: (index: number) => void;
    onUpdateIngredient: (index: number, field: keyof Ingredient, value: string) => void;
}

export function MealFormModal({
    opened,
    onClose,
    form,
    onSubmit,
    editingMeal,
    onAddIngredient,
    onRemoveIngredient,
    onUpdateIngredient,
}: MealFormModalProps) {
    const { t } = useTranslation();

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={editingMeal ? t('meals.editMeal') : t('meals.newMeal')}
            size="lg"
        >
            <form onSubmit={form.onSubmit(onSubmit)}>
                <Stack gap="md">
                    <TextInput
                        label={t('meals.name')}
                        placeholder={t('meals.namePlaceholder')}
                        required
                        {...form.getInputProps('name')}
                    />

                    <Textarea
                        label={t('meals.description')}
                        placeholder={t('meals.descriptionPlaceholder')}
                        rows={2}
                        {...form.getInputProps('description')}
                    />

                    <TextInput
                        label={t('meals.imageUrl')}
                        placeholder={t('meals.imageUrlPlaceholder')}
                        {...form.getInputProps('imageUrl')}
                    />

                    <Box>
                        <Group justify="space-between" mb="xs">
                            <Text size="sm" fw={500}>{t('meals.ingredients')}</Text>
                            <Button
                                size="xs"
                                variant="light"
                                leftSection={<IconPlus size={14} />}
                                onClick={onAddIngredient}
                            >
                                {t('meals.addIngredient')}
                            </Button>
                        </Group>
                        <Stack gap="xs">
                            {form.values.ingredients.length === 0 ? (
                                <Paper p="md" withBorder bg="gray.0">
                                    <Text size="sm" c="dimmed" ta="center">
                                        {t('meals.noIngredients')}
                                    </Text>
                                </Paper>
                            ) : (
                                form.values.ingredients.map((ingredient, index) => (
                                    <Group key={index} gap="xs" align="flex-end">
                                        <TextInput
                                            placeholder={t('meals.ingredientAmount')}
                                            value={ingredient.amount || ''}
                                            onChange={(e) => onUpdateIngredient(index, 'amount', e.target.value)}
                                            style={{ width: 70 }}
                                            size="sm"
                                        />
                                        <Select
                                            placeholder={t('meals.ingredientUnit')}
                                            data={unitOptions.map(opt => ({ value: opt.value, label: t(opt.label) }))}
                                            value={ingredient.unit || ''}
                                            onChange={(val) => onUpdateIngredient(index, 'unit', val || '')}
                                            style={{ width: 100 }}
                                            size="sm"
                                            clearable
                                        />
                                        <TextInput
                                            placeholder={t('meals.ingredientName')}
                                            value={ingredient.name}
                                            onChange={(e) => onUpdateIngredient(index, 'name', e.target.value)}
                                            style={{ flex: 1 }}
                                            size="sm"
                                        />
                                        <CloseButton
                                            size="sm"
                                            onClick={() => onRemoveIngredient(index)}
                                        />
                                    </Group>
                                ))
                            )}
                        </Stack>
                    </Box>

                    <Textarea
                        label={t('meals.instructions')}
                        placeholder={t('meals.instructionsPlaceholder')}
                        rows={6}
                        {...form.getInputProps('instructions')}
                    />

                    <Group grow>
                        <NumberInput
                            label={t('meals.prepTime')}
                            placeholder={t('meals.prepTimePlaceholder')}
                            min={0}
                            {...form.getInputProps('prepTime')}
                        />
                        <NumberInput
                            label={t('meals.cookTime')}
                            placeholder={t('meals.cookTimePlaceholder')}
                            min={0}
                            {...form.getInputProps('cookTime')}
                        />
                    </Group>

                    <NumberInput
                        label={t('meals.servings')}
                        placeholder={t('meals.servingsPlaceholder')}
                        min={1}
                        {...form.getInputProps('servings')}
                    />

                    <Select
                        label={t('meals.cuisine')}
                        placeholder={t('meals.selectCuisine')}
                        data={cuisineOptions.map(opt => ({ value: t(opt), label: t(opt) }))}
                        searchable
                        {...form.getInputProps('cuisine')}
                    />

                    <Stack gap="xs">
                        <Text size="sm" fw={500}>{t('meals.mealType')}</Text>
                        <Group>
                            {mealTypeOptions.map(opt => (
                                <Checkbox
                                    key={opt.value}
                                    label={t(opt.label)}
                                    checked={form.values.mealType.includes(opt.value)}
                                    onChange={(e) => {
                                        const checked = e.currentTarget.checked;
                                        const current = form.values.mealType;
                                        if (checked) {
                                            form.setFieldValue('mealType', [...current, opt.value]);
                                        } else {
                                            form.setFieldValue('mealType', current.filter(t => t !== opt.value));
                                        }
                                    }}
                                />
                            ))}
                        </Group>
                    </Stack>

                    <TextInput
                        label={t('meals.recipeUrl')}
                        placeholder={t('meals.recipeUrlPlaceholder')}
                        {...form.getInputProps('recipeUrl')}
                    />

                    <TextInput
                        label={t('meals.source')}
                        placeholder={t('meals.sourcePlaceholder')}
                        {...form.getInputProps('source')}
                    />

                    <Group justify="flex-end" mt="md">
                        <Button variant="subtle" onClick={onClose}>
                            {t('meals.cancel')}
                        </Button>
                        <Button type="submit">
                            {editingMeal ? t('meals.update') : t('meals.create')}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
