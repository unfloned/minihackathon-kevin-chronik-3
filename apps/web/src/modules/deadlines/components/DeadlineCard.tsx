import {
  Card,
  Text,
  Badge,
  Group,
  Menu,
  ActionIcon,
} from '@mantine/core';
import {
  IconCalendar,
  IconCheck,
  IconTrash,
  IconEdit,
  IconDots,
  IconCircleCheck,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { Deadline } from '../types';
import { priorityColors } from '../types';

interface DeadlineCardProps {
  deadline: Deadline;
  onComplete: (id: string) => void;
  onEdit: (deadline: Deadline) => void;
  onDelete: (id: string) => void;
}

export function DeadlineCard({ deadline, onComplete, onEdit, onDelete }: DeadlineCardProps) {
  const { t } = useTranslation();

  const priorityLabels: Record<Deadline['priority'], string> = {
    low: t('deadlines.priority.low'),
    medium: t('deadlines.priority.medium'),
    high: t('deadlines.priority.high'),
    urgent: t('deadlines.priority.urgent'),
  };

  const dueDate = new Date(deadline.dueDate);
  const isOverdue = !deadline.isCompleted && dueDate < new Date();

  return (
    <Card key={deadline.id} shadow="sm" withBorder radius="md" mb="md" p="md">
      <Group justify="space-between" mb="xs">
        <Group>
          <Text fw={500} size="lg">
            {deadline.title}
          </Text>
          <Badge color={priorityColors[deadline.priority]} variant="light">
            {priorityLabels[deadline.priority]}
          </Badge>
          {deadline.category && (
            <Badge color="gray" variant="outline">
              {deadline.category}
            </Badge>
          )}
          {isOverdue && (
            <Badge color="red" variant="filled">
              {t('deadlines.status.overdue')}
            </Badge>
          )}
          {deadline.isCompleted && (
            <Badge color="green" variant="filled" leftSection={<IconCheck size={12} />}>
              {t('deadlines.status.completed')}
            </Badge>
          )}
        </Group>

        <Menu shadow="md" width={200}>
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray">
              <IconDots size={18} />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            {!deadline.isCompleted && (
              <Menu.Item
                leftSection={<IconCheck size={16} />}
                onClick={() => onComplete(deadline.id)}
              >
                {t('deadlines.markComplete')}
              </Menu.Item>
            )}
            <Menu.Item
              leftSection={<IconEdit size={16} />}
              onClick={() => onEdit(deadline)}
            >
              {t('common.edit')}
            </Menu.Item>
            <Menu.Item
              leftSection={<IconTrash size={16} />}
              color="red"
              onClick={() => onDelete(deadline.id)}
            >
              {t('common.delete')}
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>

      {deadline.description && (
        <Text size="sm" c="dimmed" mb="xs">
          {deadline.description}
        </Text>
      )}

      <Group gap="xs">
        <IconCalendar size={16} style={{ opacity: 0.5 }} />
        <Text size="sm" c={isOverdue ? 'red' : 'dimmed'}>
          {t('deadlines.dueOn')}: {dueDate.toLocaleDateString('de-DE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </Group>

      {deadline.completedAt && (
        <Group gap="xs" mt="xs">
          <IconCircleCheck size={16} style={{ opacity: 0.5 }} />
          <Text size="sm" c="green">
            {t('deadlines.completedOn')}: {new Date(deadline.completedAt).toLocaleDateString('de-DE', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </Group>
      )}
    </Card>
  );
}
