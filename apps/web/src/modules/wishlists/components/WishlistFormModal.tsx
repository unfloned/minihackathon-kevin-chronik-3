import {
    Modal,
    Stack,
    TextInput,
    Textarea,
    Select,
    NumberInput,
    Group,
    Button,
    Switch,
} from '@mantine/core';
import { useForm, UseFormReturnType } from '@mantine/form';
import { useTranslation } from 'react-i18next';
import type { WishlistItem, WishlistFormValues } from '../types';
import { categoryOptions, priorityOptions, defaultFormValues } from '../types';

interface WishlistFormModalProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: (values: WishlistFormValues) => void;
    editingItem: WishlistItem | null;
}

export function WishlistFormModal({ opened, onClose, onSubmit, editingItem }: WishlistFormModalProps) {
    const { t } = useTranslation();

    const form: UseFormReturnType<WishlistFormValues> = useForm({
        initialValues: editingItem ? {
            name: editingItem.name,
            description: editingItem.description || '',
            imageUrl: editingItem.imageUrl || '',
            productUrl: editingItem.productUrl || '',
            category: editingItem.category,
            priority: editingItem.priority,
            priceAmount: editingItem.price?.amount,
            priceCurrency: editingItem.price?.currency || 'EUR',
            targetPrice: editingItem.targetPrice,
            isGiftIdea: editingItem.isGiftIdea,
            giftFor: editingItem.giftFor || '',
            occasion: editingItem.occasion || '',
            notes: editingItem.notes || '',
            store: editingItem.store || '',
        } : defaultFormValues,
    });

    const handleSubmit = (values: WishlistFormValues) => {
        onSubmit(values);
        form.reset();
    };

    const handleClose = () => {
        onClose();
        form.reset();
    };

    return (
        <Modal
            opened={opened}
            onClose={handleClose}
            title={editingItem ? t('wishlists.form.editTitle') : t('wishlists.form.newTitle')}
            size="lg"
        >
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="md">
                    <TextInput
                        label={t('wishlists.form.name')}
                        placeholder={t('wishlists.form.namePlaceholder')}
                        required
                        {...form.getInputProps('name')}
                    />

                    <Textarea
                        label={t('wishlists.form.description')}
                        placeholder={t('wishlists.form.descriptionPlaceholder')}
                        minRows={3}
                        {...form.getInputProps('description')}
                    />

                    <TextInput
                        label={t('wishlists.form.imageUrl')}
                        placeholder={t('wishlists.form.imageUrlPlaceholder')}
                        {...form.getInputProps('imageUrl')}
                    />

                    <TextInput
                        label={t('wishlists.form.productUrl')}
                        placeholder={t('wishlists.form.productUrlPlaceholder')}
                        {...form.getInputProps('productUrl')}
                    />

                    <Group grow>
                        <Select
                            label={t('wishlists.form.category')}
                            data={categoryOptions.map(c => ({ value: c.value, label: t(c.label) }))}
                            {...form.getInputProps('category')}
                        />

                        <Select
                            label={t('wishlists.form.priority')}
                            data={priorityOptions.map(p => ({ value: p.value, label: t(p.label) }))}
                            {...form.getInputProps('priority')}
                        />
                    </Group>

                    <Group grow>
                        <NumberInput
                            label={t('wishlists.form.price')}
                            placeholder={t('wishlists.form.pricePlaceholder')}
                            decimalScale={2}
                            fixedDecimalScale
                            min={0}
                            {...form.getInputProps('priceAmount')}
                        />

                        <Select
                            label={t('wishlists.form.currency')}
                            data={[
                                { value: 'EUR', label: 'EUR' },
                                { value: 'USD', label: 'USD' },
                                { value: 'GBP', label: 'GBP' },
                            ]}
                            {...form.getInputProps('priceCurrency')}
                        />
                    </Group>

                    <TextInput
                        label={t('wishlists.form.store')}
                        placeholder={t('wishlists.form.storePlaceholder')}
                        {...form.getInputProps('store')}
                    />

                    <Switch
                        label={t('wishlists.form.isGiftIdea')}
                        {...form.getInputProps('isGiftIdea', { type: 'checkbox' })}
                    />

                    {form.values.isGiftIdea && (
                        <>
                            <TextInput
                                label={t('wishlists.form.giftFor')}
                                placeholder={t('wishlists.form.giftForPlaceholder')}
                                {...form.getInputProps('giftFor')}
                            />

                            <TextInput
                                label={t('wishlists.form.occasionLabel')}
                                placeholder={t('wishlists.form.occasionPlaceholder')}
                                {...form.getInputProps('occasion')}
                            />
                        </>
                    )}

                    <Textarea
                        label={t('wishlists.form.notes')}
                        placeholder={t('wishlists.form.notesPlaceholder')}
                        minRows={2}
                        {...form.getInputProps('notes')}
                    />

                    <Group justify="flex-end" mt="md">
                        <Button
                            variant="subtle"
                            onClick={handleClose}
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button type="submit">
                            {editingItem ? t('common.save') : t('common.create')}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
