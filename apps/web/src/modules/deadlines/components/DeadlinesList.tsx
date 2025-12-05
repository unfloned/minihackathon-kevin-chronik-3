import { Stack, Loader, Center, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { DeadlineCard } from './DeadlineCard';
import type { Deadline } from '../types';

interface DeadlinesListProps {
  deadlines: Deadline[] | null;
  loading: boolean;
  onComplete: (id: string) => void;
  onEdit: (deadline: Deadline) => void;
  onDelete: (id: string) => void;
}

export function DeadlinesList({
  deadlines,
  loading,
  onComplete,
  onEdit,
  onDelete
}: DeadlinesListProps) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <Center p="xl">
        <Loader />
      </Center>
    );
  }

  if (!deadlines || deadlines.length === 0) {
    return (
      <Center p="xl">
        <Text c="dimmed">{t('deadlines.emptyState')}</Text>
      </Center>
    );
  }

  return (
    <Stack gap="md">
      {deadlines.map((deadline) => (
        <DeadlineCard
          key={deadline.id}
          deadline={deadline}
          onComplete={onComplete}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </Stack>
  );
}
