import { Modal, Stack, TextInput, Group, Button } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useTranslation } from 'react-i18next';
import { InventoryItem, toDateOrNull } from '../types';

interface LendItemModalProps {
    opened: boolean;
    onClose: () => void;
    lendingItem: InventoryItem | null;
    lendTo: string;
    setLendTo: (value: string) => void;
    lendReturn: Date | null;
    setLendReturn: (value: Date | null) => void;
    onSubmit: () => void;
}

export function LendItemModal({
    opened,
    onClose,
    lendingItem,
    lendTo,
    setLendTo,
    lendReturn,
    setLendReturn,
    onSubmit,
}: LendItemModalProps) {
    const { t } = useTranslation();

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={`${t('inventory.lendItem')}: ${lendingItem?.name}`}
        >
            <Stack gap="md">
                <TextInput
                    label={t('inventory.lentTo')}
                    placeholder={t('inventory.lentToPlaceholder')}
                    value={lendTo}
                    onChange={(e) => setLendTo(e.currentTarget.value)}
                    required
                />

                <DateInput
                    label={t('inventory.expectedReturn')}
                    placeholder={t('inventory.selectDate')}
                    value={lendReturn}
                    onChange={(v) => setLendReturn(toDateOrNull(v))}
                    clearable
                />

                <Group justify="flex-end">
                    <Button variant="default" onClick={onClose}>
                        {t('common.cancel')}
                    </Button>
                    <Button onClick={onSubmit} disabled={!lendTo}>
                        {t('inventory.lend')}
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}
