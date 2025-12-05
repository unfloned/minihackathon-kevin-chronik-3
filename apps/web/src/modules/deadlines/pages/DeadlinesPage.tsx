import { useState } from 'react';
import {
  Container,
  Button,
  Group,
  Tabs,
  SimpleGrid,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconPlus,
  IconClock,
  IconAlertTriangle,
  IconCircleCheck,
  IconCalendar,
} from '@tabler/icons-react';
import { useRequest, useMutation } from '../../../hooks';
import { useTranslation } from 'react-i18next';
import { PageTitle } from '../../../components/PageTitle';
import { CardStatistic } from '../../../components/CardStatistic';
import type { DeadlineStats } from '@ycmm/core';
import type { Deadline, DeadlineFormData } from '../types';
import { defaultFormData } from '../types';
import { DeadlinesList, DeadlineFormModal } from '../components';

function DeadlinesPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string | null>('upcoming');
  const [opened, { open, close }] = useDisclosure(false);
  const [editingDeadline, setEditingDeadline] = useState<Deadline | null>(null);
  const [formData, setFormData] = useState<DeadlineFormData>(defaultFormData);

  // Data fetching
  const { data: stats, isLoading: statsLoading } = useRequest<DeadlineStats>('/deadlines/stats');
  const { data: upcomingDeadlines, isLoading: upcomingLoading, refetch: refetchUpcoming } = useRequest<Deadline[]>('/deadlines/upcoming');
  const { data: overdueDeadlines, isLoading: overdueLoading, refetch: refetchOverdue } = useRequest<Deadline[]>('/deadlines/overdue');
  const { data: allDeadlines, isLoading: allLoading, refetch: refetchAll } = useRequest<Deadline[]>('/deadlines');

  // Mutations
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
      setFormData(defaultFormData);
    }
    open();
  };

  const handleCloseModal = () => {
    close();
    setEditingDeadline(null);
    setFormData(defaultFormData);
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
          <DeadlinesList
            deadlines={upcomingDeadlines}
            loading={upcomingLoading}
            onComplete={handleComplete}
            onEdit={handleOpenModal}
            onDelete={handleDelete}
          />
        </Tabs.Panel>

        <Tabs.Panel value="overdue" pt="md">
          <DeadlinesList
            deadlines={overdueDeadlines}
            loading={overdueLoading}
            onComplete={handleComplete}
            onEdit={handleOpenModal}
            onDelete={handleDelete}
          />
        </Tabs.Panel>

        <Tabs.Panel value="completed" pt="md">
          <DeadlinesList
            deadlines={completedDeadlines}
            loading={allLoading}
            onComplete={handleComplete}
            onEdit={handleOpenModal}
            onDelete={handleDelete}
          />
        </Tabs.Panel>
      </Tabs>

      <DeadlineFormModal
        opened={opened}
        onClose={handleCloseModal}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isEditing={!!editingDeadline}
        isLoading={createLoading || updateLoading}
      />
    </Container>
  );
}

export default DeadlinesPage;
