import {
    Modal,
    Stack,
    TextInput,
    Textarea,
    NumberInput,
    Select,
    Group,
    Button,
    Text,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { CreateSubscriptionForm, SubscriptionBillingCycle } from '../types';

interface SubscriptionFormModalProps {
    opened: boolean;
    onClose: () => void;
    formData: CreateSubscriptionForm;
    onFormDataChange: (data: CreateSubscriptionForm) => void;
    onSubmit: () => void;
    isEditing: boolean;
    isLoading: boolean;
    billingCycleOptions: Array<{ value: string; label: string }>;
    categoryOptions: Array<{ value: string; label: string }>;
}

export function SubscriptionFormModal({
    opened,
    onClose,
    formData,
    onFormDataChange,
    onSubmit,
    isEditing,
    isLoading,
    billingCycleOptions,
    categoryOptions,
}: SubscriptionFormModalProps) {
    const { t } = useTranslation();

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={
                <Text size="lg" fw={600}>
                    {isEditing ? t('subscriptions.editSubscription') : t('subscriptions.newSubscription')}
                </Text>
            }
            size="lg"
        >
            <Stack gap="md">
                <TextInput
                    label={t('common.name')}
                    placeholder={t('subscriptions.namePlaceholder')}
                    required
                    value={formData.name}
                    onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
                />

                <Textarea
                    label={t('subscriptions.descriptionLabel')}
                    placeholder={t('subscriptions.descriptionPlaceholder')}
                    minRows={3}
                    value={formData.description}
                    onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
                />

                <NumberInput
                    label={t('subscriptions.amount')}
                    placeholder="0.00"
                    required
                    min={0}
                    decimalScale={2}
                    fixedDecimalScale
                    prefix="€ "
                    value={formData.amount}
                    onChange={(value) => onFormDataChange({ ...formData, amount: Number(value) || 0 })}
                />

                <Select
                    label={t('subscriptions.billingCycleLabel')}
                    placeholder={t('subscriptions.selectCycle')}
                    required
                    data={billingCycleOptions}
                    value={formData.billingCycle}
                    onChange={(value) =>
                        onFormDataChange({ ...formData, billingCycle: value as SubscriptionBillingCycle })
                    }
                />

                <NumberInput
                    label={t('subscriptions.billingDay')}
                    placeholder={t('subscriptions.billingDayPlaceholder')}
                    required
                    min={1}
                    max={31}
                    value={formData.billingDay}
                    onChange={(value) => onFormDataChange({ ...formData, billingDay: Number(value) || 1 })}
                />

                <Select
                    label={t('common.category')}
                    placeholder={t('subscriptions.selectCategory')}
                    required
                    data={categoryOptions}
                    value={formData.category}
                    onChange={(value) => onFormDataChange({ ...formData, category: value || 'other' })}
                />

                <TextInput
                    label={t('subscriptions.website')}
                    placeholder={t('subscriptions.websitePlaceholder')}
                    value={formData.website}
                    onChange={(e) => onFormDataChange({ ...formData, website: e.target.value })}
                />

                <Group justify="flex-end" mt="md">
                    <Button variant="subtle" onClick={onClose}>
                        {t('common.cancel')}
                    </Button>
                    <Button
                        onClick={onSubmit}
                        loading={isLoading}
                    >
                        {isEditing ? t('common.save') : t('common.create')}
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}
