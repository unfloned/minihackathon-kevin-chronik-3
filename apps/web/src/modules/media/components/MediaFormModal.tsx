import {
    Modal,
    Stack,
    Select,
    TextInput,
    NumberInput,
    Textarea,
    MultiSelect,
    Group,
    Button,
    Text,
} from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { useTranslation } from 'react-i18next';
import { IconMovie } from '@tabler/icons-react';
import { MediaFormValues, genreOptions } from '../types';

interface MediaFormModalProps {
    opened: boolean;
    onClose: () => void;
    form: UseFormReturnType<MediaFormValues>;
    isEditing: boolean;
    isCreating: boolean;
    onSubmit: () => void;
    mediaTypes: Array<{ value: string; label: string; icon: typeof IconMovie }>;
    statusOptions: Array<{ value: string; label: string; color: string }>;
}

export function MediaFormModal({
    opened,
    onClose,
    form,
    isEditing,
    isCreating,
    onSubmit,
    mediaTypes,
    statusOptions,
}: MediaFormModalProps) {
    const { t } = useTranslation();

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={isEditing ? t('media.editMedia') : t('media.newMedia')}
            size="lg"
        >
            <Stack>
                <Select
                    label={t('common.type')}
                    placeholder={t('media.selectType')}
                    data={mediaTypes.map(mt => ({ value: mt.value, label: mt.label }))}
                    {...form.getInputProps('type')}
                    required
                />

                <TextInput
                    label={t('media.titleField')}
                    placeholder={t('media.titlePlaceholder')}
                    {...form.getInputProps('title')}
                    required
                />

                <TextInput
                    label={t('media.originalTitle')}
                    placeholder={t('media.optional')}
                    {...form.getInputProps('originalTitle')}
                />

                <Group grow>
                    <NumberInput
                        label={t('media.year')}
                        placeholder="2010"
                        min={1900}
                        max={new Date().getFullYear() + 5}
                        {...form.getInputProps('year')}
                    />

                    <TextInput
                        label={t('media.creator')}
                        placeholder={t('media.creatorPlaceholder')}
                        {...form.getInputProps('creator')}
                    />
                </Group>

                <TextInput
                    label={t('media.coverUrl')}
                    placeholder="https://..."
                    {...form.getInputProps('coverUrl')}
                />

                <Textarea
                    label={t('media.description')}
                    placeholder={t('media.descriptionPlaceholder')}
                    minRows={3}
                    {...form.getInputProps('description')}
                />

                <Select
                    label={t('common.status')}
                    placeholder={t('media.selectStatus')}
                    data={statusOptions.map(s => ({ value: s.value, label: s.label }))}
                    {...form.getInputProps('status')}
                />

                <Group grow>
                    <NumberInput
                        label={t('media.rating')}
                        placeholder={t('media.ratingPlaceholder')}
                        min={0}
                        max={10}
                        step={0.5}
                        {...form.getInputProps('rating')}
                    />

                    <TextInput
                        label={t('media.source')}
                        placeholder={t('media.sourcePlaceholder')}
                        {...form.getInputProps('source')}
                    />
                </Group>

                <Textarea
                    label={t('media.review')}
                    placeholder={t('media.reviewPlaceholder')}
                    minRows={3}
                    {...form.getInputProps('review')}
                />

                <MultiSelect
                    label={t('media.genres')}
                    placeholder={t('media.selectGenres')}
                    data={genreOptions}
                    {...form.getInputProps('genre')}
                    searchable
                />

                <Text size="sm" fw={500} mt="md">
                    {t('media.progressOptional')}
                </Text>

                <Group grow>
                    <NumberInput
                        label={t('media.currentProgress')}
                        placeholder="0"
                        min={0}
                        {...form.getInputProps('progressCurrent')}
                    />

                    <NumberInput
                        label={t('media.totalProgress')}
                        placeholder="0"
                        min={0}
                        {...form.getInputProps('progressTotal')}
                    />

                    <TextInput
                        label={t('media.unit')}
                        placeholder={t('media.unitPlaceholder')}
                        {...form.getInputProps('progressUnit')}
                    />
                </Group>

                <Group justify="flex-end" mt="md">
                    <Button variant="subtle" onClick={onClose}>
                        {t('common.cancel')}
                    </Button>
                    <Button
                        onClick={onSubmit}
                        loading={isCreating}
                    >
                        {isEditing ? t('common.save') : t('common.create')}
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}
