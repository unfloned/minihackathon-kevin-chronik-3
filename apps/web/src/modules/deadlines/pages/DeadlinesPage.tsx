import { useState } from 'react';
import {
  Container,
  Title,
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
  Grid,
  Paper,
  Loader,
  Center,
  Menu,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
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

const priorityLabels: Record<Deadline['priority'], string> = {
  low: 'Niedrig',
  medium: 'Mittel',
  high: 'Hoch',
  urgent: 'Dringend',
};

function DeadlinesPage() {
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
          title: 'Erfolg',
          message: 'Frist wurde erfolgreich erstellt',
          color: 'green',
        });
        refetchAll();
        refetchUpcoming();
        refetchOverdue();
        handleCloseModal();
      },
      onError: () => {
        notifications.show({
          title: 'Fehler',
          message: 'Frist konnte nicht erstellt werden',
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
          title: 'Erfolg',
          message: 'Frist wurde erfolgreich aktualisiert',
          color: 'green',
        });
        refetchAll();
        refetchUpcoming();
        refetchOverdue();
        handleCloseModal();
      },
      onError: () => {
        notifications.show({
          title: 'Fehler',
          message: 'Frist konnte nicht aktualisiert werden',
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
          title: 'Erfolg',
          message: 'Frist wurde als erledigt markiert',
          color: 'green',
        });
        refetchAll();
        refetchUpcoming();
        refetchOverdue();
      },
      onError: () => {
        notifications.show({
          title: 'Fehler',
          message: 'Frist konnte nicht als erledigt markiert werden',
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
          title: 'Erfolg',
          message: 'Frist wurde erfolgreich gelöscht',
          color: 'green',
        });
        refetchAll();
        refetchUpcoming();
        refetchOverdue();
      },
      onError: () => {
        notifications.show({
          title: 'Fehler',
          message: 'Frist konnte nicht gelöscht werden',
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
        title: 'Fehler',
        message: 'Bitte füllen Sie alle Pflichtfelder aus',
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
    if (window.confirm('Möchten Sie diese Frist wirklich löschen?')) {
      deleteDeadline({ id });
    }
  };

  const renderStats = () => {
    if (statsLoading) {
      return (
        <Center>
          <Loader />
        </Center>
      );
    }

    if (!stats) return null;

    return (
      <Grid mb="xl">
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Paper shadow="sm" p="md" radius="md" withBorder>
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  Gesamt
                </Text>
                <Text size="xl" fw={700}>
                  {stats.total}
                </Text>
              </div>
              <IconCalendar size={32} style={{ opacity: 0.5 }} />
            </Group>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Paper shadow="sm" p="md" radius="md" withBorder>
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  Anstehend
                </Text>
                <Text size="xl" fw={700} c="blue">
                  {stats.upcoming}
                </Text>
              </div>
              <IconClock size={32} style={{ opacity: 0.5 }} color="var(--mantine-color-blue-6)" />
            </Group>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Paper shadow="sm" p="md" radius="md" withBorder>
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  Überfällig
                </Text>
                <Text size="xl" fw={700} c="red">
                  {stats.overdue}
                </Text>
              </div>
              <IconAlertTriangle size={32} style={{ opacity: 0.5 }} color="var(--mantine-color-red-6)" />
            </Group>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Paper shadow="sm" p="md" radius="md" withBorder>
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  Erledigt
                </Text>
                <Text size="xl" fw={700} c="green">
                  {stats.completed}
                </Text>
              </div>
              <IconCircleCheck size={32} style={{ opacity: 0.5 }} color="var(--mantine-color-green-6)" />
            </Group>
          </Paper>
        </Grid.Col>
      </Grid>
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
                Überfällig
              </Badge>
            )}
            {deadline.isCompleted && (
              <Badge color="green" variant="filled" leftSection={<IconCheck size={12} />}>
                Erledigt
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
                  Als erledigt markieren
                </Menu.Item>
              )}
              <Menu.Item
                leftSection={<IconEdit size={16} />}
                onClick={() => handleOpenModal(deadline)}
              >
                Bearbeiten
              </Menu.Item>
              <Menu.Item
                leftSection={<IconTrash size={16} />}
                color="red"
                onClick={() => handleDelete(deadline.id)}
              >
                Löschen
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
            Fällig am: {dueDate.toLocaleDateString('de-DE', {
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
              Erledigt am: {new Date(deadline.completedAt).toLocaleDateString('de-DE', {
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
          <Text c="dimmed">Keine Fristen gefunden</Text>
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
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="xl">
        <Title order={1}>Fristen</Title>
        <Button leftSection={<IconPlus size={18} />} onClick={() => handleOpenModal()}>
          Neue Frist
        </Button>
      </Group>

      {renderStats()}

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="upcoming" leftSection={<IconClock size={16} />}>
            Anstehend ({stats?.upcoming || 0})
          </Tabs.Tab>
          <Tabs.Tab value="overdue" leftSection={<IconAlertTriangle size={16} />}>
            Überfällig ({stats?.overdue || 0})
          </Tabs.Tab>
          <Tabs.Tab value="completed" leftSection={<IconCircleCheck size={16} />}>
            Erledigt ({stats?.completed || 0})
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
        title={editingDeadline ? 'Frist bearbeiten' : 'Neue Frist'}
        size="md"
      >
        <Stack gap="md">
          <TextInput
            label="Titel"
            placeholder="Titel der Frist"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

          <Textarea
            label="Beschreibung"
            placeholder="Beschreibung der Frist"
            minRows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <DateInput
            label="Fällig am"
            placeholder="Wählen Sie ein Datum"
            required
            value={formData.dueDate}
            onChange={(date) => setFormData({ ...formData, dueDate: date })}
            locale="de"
          />

          <Select
            label="Priorität"
            required
            value={formData.priority}
            onChange={(value) => setFormData({ ...formData, priority: value as Deadline['priority'] })}
            data={[
              { value: 'low', label: 'Niedrig' },
              { value: 'medium', label: 'Mittel' },
              { value: 'high', label: 'Hoch' },
              { value: 'urgent', label: 'Dringend' },
            ]}
          />

          <TextInput
            label="Kategorie"
            placeholder="z.B. Arbeit, Privat, Studium"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={handleCloseModal}>
              Abbrechen
            </Button>
            <Button
              onClick={handleSubmit}
              loading={createLoading || updateLoading}
            >
              {editingDeadline ? 'Aktualisieren' : 'Erstellen'}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}

export default DeadlinesPage;
