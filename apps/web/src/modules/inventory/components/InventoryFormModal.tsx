import {
    Modal,
    Stack,
    TextInput,
    Textarea,
    NumberInput,
    Select,
    Group,
    Button,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { CreateItemForm, InventoryItem } from '../types';

interface InventoryFormModalProps {
    opened: boolean;
    onClose: () => void;
    editingItem: InventoryItem | null;
    form: CreateItemForm;
    setForm: (form: CreateItemForm) => void;
    onSubmit: () => void;
    creating: boolean;
    categories?: string[];
}

export function InventoryFormModal({
    opened,
    onClose,
    editingItem,
    form,
    setForm,
    onSubmit,
    creating,
    categories,
}: InventoryFormModalProps) {
    const { t } = useTranslation();

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={editingItem ? t('inventory.editItem') : t('inventory.newItem')}
            size="lg"
        >
            <Stack gap="md">
                <TextInput
                    label={t('common.name')}
                    placeholder={t('inventory.namePlaceholder')}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.currentTarget.value })}
                    required
                />

                <Textarea
                    label={t('common.description')}
                    placeholder={t('inventory.descriptionPlaceholder')}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.currentTarget.value })}
                    minRows={3}
                />

                <Select
                    label={t('common.category')}
                    placeholder={t('inventory.selectCategory')}
                    data={categories || []}
                    value={form.category}
                    onChange={(value) => setForm({ ...form, category: value || '' })}
                    searchable
                    allowDeselect={false}
                    required
                />

                <TextInput
                    label={t('inventory.locationArea')}
                    placeholder={t('inventory.locationAreaPlaceholder')}
                    value={form.location.area}
                    onChange={(e) => setForm({
                        ...form,
                        location: { ...form.location, area: e.currentTarget.value }
                    })}
                    required
                />

                <TextInput
                    label={t('inventory.locationContainer')}
                    placeholder={t('inventory.locationContainerPlaceholder')}
                    value={form.location.container || ''}
                    onChange={(e) => setForm({
                        ...form,
                        location: { ...form.location, container: e.currentTarget.value }
                    })}
                />

                <TextInput
                    label={t('inventory.locationDetail')}
                    placeholder={t('inventory.locationDetailPlaceholder')}
                    value={form.location.details || ''}
                    onChange={(e) => setForm({
                        ...form,
                        location: { ...form.location, details: e.currentTarget.value }
                    })}
                />

                <NumberInput
                    label={t('inventory.quantity')}
                    placeholder="1"
                    value={form.quantity}
                    onChange={(value) => setForm({ ...form, quantity: Number(value) || 1 })}
                    min={1}
                    required
                />

                <NumberInput
                    label={t('inventory.purchasePrice')}
                    placeholder="0.00"
                    value={form.purchasePrice}
                    onChange={(value) => setForm({ ...form, purchasePrice: Number(value) })}
                    decimalScale={2}
                    min={0}
                />

                <NumberInput
                    label={t('inventory.currentValue')}
                    placeholder="0.00"
                    value={form.currentValue}
                    onChange={(value) => setForm({ ...form, currentValue: Number(value) })}
                    decimalScale={2}
                    min={0}
                />

                <TextInput
                    label={t('inventory.serialNumber')}
                    placeholder={t('inventory.serialNumberPlaceholder')}
                    value={form.serialNumber}
                    onChange={(e) => setForm({ ...form, serialNumber: e.currentTarget.value })}
                />

                <Group justify="flex-end">
                    <Button variant="default" onClick={onClose}>
                        {t('common.cancel')}
                    </Button>
                    <Button onClick={onSubmit} loading={creating}>
                        {editingItem ? t('common.save') : t('common.create')}
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}
