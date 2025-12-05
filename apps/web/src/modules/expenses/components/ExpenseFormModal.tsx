import { Modal, Stack, NumberInput, TextInput, Select, Group, Button } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useTranslation } from 'react-i18next';
import type { ExpenseFormData, ExpenseCategory } from '../types';
import { toDateOrNull } from '../types';

interface ExpenseFormModalProps {
    opened: boolean;
    isEditing: boolean;
    formData: ExpenseFormData;
    categories: ExpenseCategory[] | undefined | null;
    loading: boolean;
    onClose: () => void;
    onSubmit: () => void;
    onFormChange: (data: Partial<ExpenseFormData>) => void;
}

export function ExpenseFormModal({
    opened,
    isEditing,
    formData,
    categories,
    loading,
    onClose,
    onSubmit,
    onFormChange,
}: ExpenseFormModalProps) {
    const { t } = useTranslation();

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={isEditing ? t('expenses.editExpense') : t('expenses.newExpense')}
            size="md"
        >
            <Stack gap="md">
                <NumberInput
                    label={t('expenses.amount')}
                    placeholder="0.00"
                    required
                    min={0}
                    step={0.01}
                    decimalScale={2}
                    fixedDecimalScale
                    prefix="€ "
                    value={formData.amount}
                    onChange={(value) => onFormChange({ amount: value })}
                />

                <TextInput
                    label={t('common.description')}
                    placeholder={t('expenses.descriptionPlaceholder')}
                    required
                    value={formData.description}
                    onChange={(e) => onFormChange({ description: e.currentTarget.value })}
                />

                <Select
                    label={t('common.category')}
                    placeholder={t('expenses.selectCategory')}
                    required
                    data={
                        categories?.map((cat) => ({
                            value: cat.id,
                            label: `${cat.icon} ${cat.name}`,
                        })) || []
                    }
                    value={formData.categoryId}
                    onChange={(value) => onFormChange({ categoryId: value || '' })}
                />

                <DateInput
                    label={t('common.date')}
                    placeholder={t('expenses.selectDate')}
                    required
                    value={formData.date}
                    onChange={(value) => onFormChange({ date: toDateOrNull(value) })}
                    valueFormat="DD.MM.YYYY"
                    locale="de"
                />

                <Group justify="flex-end" mt="md">
                    <Button variant="subtle" onClick={onClose}>
                        {t('common.cancel')}
                    </Button>
                    <Button onClick={onSubmit} loading={loading}>
                        {isEditing ? t('common.save') : t('common.create')}
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}
