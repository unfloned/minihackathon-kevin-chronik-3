import { Modal, Stack, TextInput, Textarea, Select, ColorInput, Group, Button } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { ListType } from '@ycmm/core';
import { colorSwatches, type NewListData, type ListTypeOption, type List } from '../types';

type ListFormModalProps = {
    opened: boolean;
    onClose: () => void;
    onSubmit: () => void;
    isLoading: boolean;
    listTypeOptions: ListTypeOption[];
} & (
    | {
        mode: 'create';
        listData: NewListData;
        setListData: (data: NewListData) => void;
    }
    | {
        mode: 'edit';
        listData: List;
        setListData: (data: List) => void;
    }
);

export function ListFormModal({
    opened,
    onClose,
    mode,
    listData,
    setListData,
    onSubmit,
    isLoading,
    listTypeOptions,
}: ListFormModalProps) {
    const { t } = useTranslation();

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={mode === 'create' ? t('lists.newList') : t('lists.editList')}
            size="md"
        >
            <Stack gap="md">
                <TextInput
                    label={t('common.name')}
                    placeholder={t('common.name')}
                    required
                    value={listData.name}
                    onChange={(e) => setListData({ ...listData, name: e.currentTarget.value } as any)}
                />
                <Textarea
                    label={t('common.description')}
                    placeholder={`${t('common.description')} (${t('common.optional').toLowerCase()})`}
                    value={listData.description}
                    onChange={(e) => setListData({ ...listData, description: e.currentTarget.value } as any)}
                    minRows={3}
                />
                <Select
                    label={t('common.type')}
                    placeholder={t('common.type')}
                    required
                    value={listData.type}
                    onChange={(value) => setListData({ ...listData, type: value as ListType } as any)}
                    data={listTypeOptions}
                />
                <ColorInput
                    label={t('common.color')}
                    placeholder={t('common.color')}
                    value={listData.color}
                    onChange={(value) => setListData({ ...listData, color: value } as any)}
                    swatches={colorSwatches}
                />
                <Group justify="flex-end" mt="md">
                    <Button variant="subtle" onClick={onClose}>
                        {t('common.cancel')}
                    </Button>
                    <Button
                        onClick={onSubmit}
                        loading={isLoading}
                        disabled={!listData.name.trim()}
                    >
                        {mode === 'create' ? t('common.create') : t('common.save')}
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}
