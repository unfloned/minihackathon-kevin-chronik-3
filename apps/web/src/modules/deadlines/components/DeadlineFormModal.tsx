import {
  Modal,
  Stack,
  TextInput,
  Textarea,
  Select,
  Button,
  Group,
} from '@mantine/core';
import { DateInput, DateValue } from '@mantine/dates';
import { useTranslation } from 'react-i18next';
import type { DeadlineFormData, Deadline } from '../types';
import { priorityOptions } from '../types';

// Helper to convert Mantine v8 DateValue to Date
const toDateOrNull = (value: DateValue): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return value;
  return new Date(value);
};

interface DeadlineFormModalProps {
  opened: boolean;
  onClose: () => void;
  formData: DeadlineFormData;
  setFormData: (data: DeadlineFormData) => void;
  onSubmit: () => void;
  isEditing: boolean;
  isLoading: boolean;
}

export function DeadlineFormModal({
  opened,
  onClose,
  formData,
  setFormData,
  onSubmit,
  isEditing,
  isLoading,
}: DeadlineFormModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEditing ? t('deadlines.editDeadline') : t('deadlines.newDeadline')}
      size="md"
    >
      <Stack gap="md">
        <TextInput
          label={t('common.name')}
          placeholder={t('deadlines.titlePlaceholder')}
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />

        <Textarea
          label={t('common.description')}
          placeholder={t('deadlines.descriptionPlaceholder')}
          minRows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />

        <DateInput
          label={t('deadlines.dueDate')}
          placeholder={t('deadlines.selectDate')}
          required
          value={formData.dueDate}
          onChange={(date) => setFormData({ ...formData, dueDate: toDateOrNull(date) })}
          locale="de"
        />

        <Select
          label={t('common.priority')}
          required
          value={formData.priority}
          onChange={(value) => setFormData({ ...formData, priority: value as Deadline['priority'] })}
          data={priorityOptions.map(opt => ({
            value: opt.value,
            label: t(opt.labelKey),
          }))}
        />

        <TextInput
          label={t('common.category')}
          placeholder={t('deadlines.categoryPlaceholder')}
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button onClick={onSubmit} loading={isLoading}>
            {isEditing ? t('common.save') : t('common.create')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
