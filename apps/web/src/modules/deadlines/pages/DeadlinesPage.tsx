import { useState } from 'react';
import {
  Container,
  Card,
  Text,
  Button,
  Group,
  Stack,
  Modal,
  TextInput,
  Textarea,
  Select,
  Badge,
  ActionIcon,
  Tabs,
  Loader,
  Center,
  Menu,
  SimpleGrid,
} from '@mantine/core';
import { DateInput, DateValue } from '@mantine/dates';

// Helper to convert Mantine v8 DateValue to Date
const toDateOrNull = (value: DateValue): Date | null => {
    if (!value) return null;
    if (value instanceof Date) return value;
    return new Date(value);
};
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconPlus,
  IconCalendar,
  IconCheck,
  IconTrash,
  IconEdit,
  IconDots,
  IconAlertTriangle,
  IconClock,
  IconCircleCheck,
} from '@tabler/icons-react';
import { useRequest } from '../../../hooks';
import { useMutation } from '../../../hooks';
import { useTranslation } from 'react-i18next';
import { PageTitle } from '../../../components/PageTitle';
import { CardStatistic } from '../../../components/CardStatistic';
import type { DeadlineSimple, DeadlineStats, DeadlinePriority } from '@ycmm/core';

// Alias for component usage
type Deadline = DeadlineSimple;

interface DeadlineFormData {
  title: string;
  description: string;
  dueDate: Date | null;
  priority: DeadlinePriority;
  category: string;
}

const priorityColors: Record<Deadline['priority'], string> = {
  low: 'blue',
  medium: 'yellow',
  high: 'orange',
  urgent: 'red',
};

function DeadlinesPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string | null>('upcoming');
  const [opened, { open, close }] = useDisclosure(false);
  const [editingDeadline, setEditingDeadline] = useState<Deadline | null>(null);
  const [formData, setFormData] = useState<DeadlineFormData>({
    title: '',
    description: '',
    dueDate: null,
    priority: 'medium',
    category: '',
  });

  const priorityLabels: Record<Deadline['priority'], string> = {
    low: t('deadlines.priority.low'),
    medium: t('deadlines.priority.medium'),
    high: t('deadlines.priority.high'),
    urgent: t('deadlines.priority.urgent'),
  };

  // Data fetching - using STRING endpoint
  const { data: stats, isLoading: statsLoading } = useRequest<DeadlineStats>('/deadlines/stats');

  const { data: upcomingDeadlines, isLoading: upcomingLoading, refetch: refetchUpcoming } = useRequest<Deadline[]>('/deadlines/upcoming');

  const { data: overdueDeadlines, isLoading: overdueLoading, refetch: refetchOverdue } = useRequest<Deadline[]>('/deadlines/overdue');

  const { data: allDeadlines, isLoading: allLoading, refetch: refetchAll } = useRequest<Deadline[]>('/deadlines');

  // Mutations - first param is string, second param is options
  const { mutate: createDeadline, isLoading: createLoading } = useMutation<Deadline, { title: string; description: string; dueDate: string; priority: Deadline['priority']; category: string }>(
    '/deadlines',
    {
      method: 'POST',
      onSuccess: () => {
        notifications.show({
          title: t('notifications.success'),
          message: t('deadlines.deadlineCreated'),
          color: 'green',
        });
        refetchAll();
        refetchUpcoming();
        refetchOverdue();
        handleCloseModal();
      },
      onError: () => {
        notifications.show({
          title: t('notifications.error'),
          message: t('errors.generic'),
          color: 'red',
        });
      },
    }
  );

  const { mutate: updateDeadline, isLoading: updateLoading } = useMutation<Deadline, { id: string; title: string; description: string; dueDate: string; priority: Deadline['priority']; category: string }>(
    (vars) => `/deadlines/${vars.id}`,
    {
      method: 'PATCH',
      onSuccess: () => {
        notifications.show({
          title: t('notifications.success'),
          message: t('deadlines.deadlineUpdated'),
          color: 'green',
        });
        refetchAll();
        refetchUpcoming();
        refetchOverdue();
        handleCloseModal();
      },
      onError: () => {
        notifications.show({
          title: t('notifications.error'),
          message: t('errors.generic'),
          color: 'red',
        });
      },
    }
  );

  const { mutate: completeDeadline } = useMutation<Deadline, { id: string }>(
    (vars) => `/deadlines/${vars.id}/complete`,
    {
      method: 'POST',
      onSuccess: () => {
        notifications.show({
          title: t('notifications.success'),
          message: t('deadlines.deadlineCompleted'),
          color: 'green',
        });
        refetchAll();
        refetchUpcoming();
        refetchOverdue();
      },
      onError: () => {
        notifications.show({
          title: t('notifications.error'),
          message: t('errors.generic'),
          color: 'red',
        });
      },
    }
  );

  const { mutate: deleteDeadline } = useMutation<void, { id: string }>(
    (vars) => `/deadlines/${vars.id}`,
    {
      method: 'DELETE',
      onSuccess: () => {
        notifications.show({
          title: t('notifications.success'),
          message: t('deadlines.deadlineDeleted'),
          color: 'green',
        });
        refetchAll();
        refetchUpcoming();
        refetchOverdue();
      },
      onError: () => {
        notifications.show({
          title: t('notifications.error'),
          message: t('errors.generic'),
          color: 'red',
        });
      },
    }
  );

  const handleOpenModal = (deadline?: Deadline) => {
    if (deadline) {
      setEditingDeadline(deadline);
      setFormData({
        title: deadline.title,
        description: deadline.description,
        dueDate: new Date(deadline.dueDate),
        priority: deadline.priority,
        category: deadline.category,
      });
    } else {
      setEditingDeadline(null);
      setFormData({
        title: '',
        description: '',
        dueDate: null,
        priority: 'medium',
        category: '',
      });
    }
    open();
  };

  const handleCloseModal = () => {
    close();
    setEditingDeadline(null);
    setFormData({
      title: '',
      description: '',
      dueDate: null,
      priority: 'medium',
      category: '',
    });
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.dueDate) {
      notifications.show({
        title: t('notifications.error'),
        message: t('errors.validation'),
        color: 'red',
      });
      return;
    }

    const payload = {
      title: formData.title,
      description: formData.description,
      dueDate: formData.dueDate.toISOString(),
      priority: formData.priority,
      category: formData.category,
    };

    if (editingDeadline) {
      await updateDeadline({
        id: editingDeadline.id,
        ...payload,
      });
    } else {
      await createDeadline(payload);
    }
  };

  const handleComplete = (id: string) => {
    completeDeadline({ id });
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('deadlines.deleteConfirm'))) {
      deleteDeadline({ id });
    }
  };

  const renderStats = () => {
    if (!stats && !statsLoading) return null;

    return (
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg" mb="xl">
        <CardStatistic
          type="icon"
          title={t('deadlines.stats.total')}
          value={stats?.total || 0}
          icon={IconCalendar}
          color="gray"
          subtitle={t('nav.deadlines')}
          isLoading={statsLoading}
        />
        <CardStatistic
          type="icon"
          title={t('deadlines.stats.upcoming')}
          value={stats?.upcoming || 0}
          icon={IconClock}
          color="blue"
          subtitle={t('deadlines.dueSoon')}
          isLoading={statsLoading}
        />
        <CardStatistic
          type="icon"
          title={t('deadlines.stats.overdue')}
          value={stats?.overdue || 0}
          icon={IconAlertTriangle}
          color="red"
          subtitle={t('deadlines.missed')}
          isLoading={statsLoading}
        />
        <CardStatistic
          type="icon"
          title={t('deadlines.stats.completed')}
          value={stats?.completed || 0}
          icon={IconCircleCheck}
          color="green"
          subtitle={t('common.completed')}
          isLoading={statsLoading}
        />
      </SimpleGrid>
    );
  };

  const renderDeadlineCard = (deadline: Deadline) => {
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
                  onClick={() => handleComplete(deadline.id)}
                >
                  {t('deadlines.markComplete')}
                </Menu.Item>
              )}
              <Menu.Item
                leftSection={<IconEdit size={16} />}
                onClick={() => handleOpenModal(deadline)}
              >
                {t('common.edit')}
              </Menu.Item>
              <Menu.Item
                leftSection={<IconTrash size={16} />}
                color="red"
                onClick={() => handleDelete(deadline.id)}
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
  };

  const renderDeadlinesList = (deadlines: Deadline[] | null, loading: boolean) => {
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
        {deadlines.map(renderDeadlineCard)}
      </Stack>
    );
  };

  const completedDeadlines = allDeadlines?.filter((d) => d.isCompleted) || [];

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <PageTitle title={t('deadlines.title')} subtitle={t('deadlines.subtitle')} />
        <Button leftSection={<IconPlus size={18} />} onClick={() => handleOpenModal()}>
          {t('deadlines.newDeadline')}
        </Button>
      </Group>

      {renderStats()}

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="upcoming" leftSection={<IconClock size={16} />}>
            {t('deadlines.stats.upcoming')} ({stats?.upcoming || 0})
          </Tabs.Tab>
          <Tabs.Tab value="overdue" leftSection={<IconAlertTriangle size={16} />}>
            {t('deadlines.stats.overdue')} ({stats?.overdue || 0})
          </Tabs.Tab>
          <Tabs.Tab value="completed" leftSection={<IconCircleCheck size={16} />}>
            {t('deadlines.stats.completed')} ({stats?.completed || 0})
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="upcoming" pt="md">
          {renderDeadlinesList(upcomingDeadlines, upcomingLoading)}
        </Tabs.Panel>

        <Tabs.Panel value="overdue" pt="md">
          {renderDeadlinesList(overdueDeadlines, overdueLoading)}
        </Tabs.Panel>

        <Tabs.Panel value="completed" pt="md">
          {renderDeadlinesList(completedDeadlines, allLoading)}
        </Tabs.Panel>
      </Tabs>

      <Modal
        opened={opened}
        onClose={handleCloseModal}
        title={editingDeadline ? t('deadlines.editDeadline') : t('deadlines.newDeadline')}
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
            data={[
              { value: 'low', label: t('deadlines.priority.low') },
              { value: 'medium', label: t('deadlines.priority.medium') },
              { value: 'high', label: t('deadlines.priority.high') },
              { value: 'urgent', label: t('deadlines.priority.urgent') },
            ]}
          />

          <TextInput
            label={t('common.category')}
            placeholder={t('deadlines.categoryPlaceholder')}
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={handleCloseModal}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleSubmit}
              loading={createLoading || updateLoading}
            >
              {editingDeadline ? t('common.save') : t('common.create')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}

export default DeadlinesPage;
