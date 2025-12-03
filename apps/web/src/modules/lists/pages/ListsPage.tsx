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
  ColorInput,
  Checkbox,
  SegmentedControl,
  ActionIcon,
  Badge,
  NumberInput,
  Menu,
  Paper,
  Divider,
  Loader,
  Center,
  Alert,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconPlus,
  IconTrash,
  IconEdit,
  IconArchive,
  IconArchiveOff,
  IconDots,
  IconCheck,
  IconAlertCircle,
} from '@tabler/icons-react';
import { useRequest } from '../../../hooks';
import { useMutation } from '../../../hooks';

type ListType = 'shopping' | 'todo' | 'packing' | 'checklist' | 'custom';

interface ListItem {
  id: string;
  text: string;
  completed: boolean;
  quantity?: number;
  priority: 'low' | 'medium' | 'high';
}

interface List {
  id: string;
  name: string;
  description: string;
  type: ListType;
  color: string;
  items: ListItem[];
  isArchived: boolean;
  createdAt: string;
}

const listTypeOptions = [
  { value: 'shopping', label: 'Einkaufsliste' },
  { value: 'todo', label: 'To-Do Liste' },
  { value: 'packing', label: 'Packliste' },
  { value: 'checklist', label: 'Checkliste' },
  { value: 'custom', label: 'Benutzerdefiniert' },
];

const priorityColors = {
  low: 'green',
  medium: 'yellow',
  high: 'red',
};

const priorityLabels = {
  low: 'Niedrig',
  medium: 'Mittel',
  high: 'Hoch',
};

function ListsPage() {
  const [view, setView] = useState<'active' | 'archived'>('active');
  const [selectedList, setSelectedList] = useState<List | null>(null);
  const [editingList, setEditingList] = useState<List | null>(null);
  const [newItem, setNewItem] = useState({ text: '', quantity: 1, priority: 'medium' as 'low' | 'medium' | 'high' });

  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] = useDisclosure(false);
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
  const [itemModalOpened, { open: openItemModal, close: closeItemModal }] = useDisclosure(false);

  const [newListData, setNewListData] = useState({
    name: '',
    description: '',
    type: 'todo' as ListType,
    color: '#228be6',
  });

  // Fetch lists
  const {
    data: activeLists,
    isLoading: loadingActive,
    error: errorActive,
    refetch: refetchActive,
  } = useRequest<List[]>('/lists');

  const {
    data: archivedLists,
    isLoading: loadingArchived,
    error: errorArchived,
    refetch: refetchArchived,
  } = useRequest<List[]>('/lists/archived');

  // Mutations
  const { mutate: createList, isLoading: creatingList } = useMutation<List, typeof newListData>(
    '/lists',
    {
      method: 'POST',
      onSuccess: () => {
        notifications.show({
          title: 'Erfolg',
          message: 'Liste erfolgreich erstellt',
          color: 'green',
          icon: <IconCheck size={16} />,
        });
        closeCreateModal();
        setNewListData({ name: '', description: '', type: 'todo', color: '#228be6' });
        refetchActive();
      },
      onError: (error: string) => {
        notifications.show({
          title: 'Fehler',
          message: error || 'Liste konnte nicht erstellt werden',
          color: 'red',
          icon: <IconAlertCircle size={16} />,
        });
      },
    }
  );

  const { mutate: updateList, isLoading: updatingList } = useMutation<List, any>(
    (vars) => `/lists/${vars.id}`,
    {
      method: 'PATCH',
      onSuccess: () => {
        notifications.show({
          title: 'Erfolg',
          message: 'Liste erfolgreich aktualisiert',
          color: 'green',
          icon: <IconCheck size={16} />,
        });
        closeEditModal();
        setEditingList(null);
        refetchActive();
        refetchArchived();
      },
      onError: (error: string) => {
        notifications.show({
          title: 'Fehler',
          message: error || 'Liste konnte nicht aktualisiert werden',
          color: 'red',
          icon: <IconAlertCircle size={16} />,
        });
      },
    }
  );

  const { mutate: deleteList, isLoading: _deletingList } = useMutation<void, { id: string }>(
    (vars) => `/lists/${vars.id}`,
    {
      method: 'DELETE',
      onSuccess: () => {
        notifications.show({
          title: 'Erfolg',
          message: 'Liste erfolgreich gelöscht',
          color: 'green',
          icon: <IconCheck size={16} />,
        });
        setSelectedList(null);
        refetchActive();
        refetchArchived();
      },
      onError: (error: string) => {
        notifications.show({
          title: 'Fehler',
          message: error || 'Liste konnte nicht gelöscht werden',
          color: 'red',
          icon: <IconAlertCircle size={16} />,
        });
      },
    }
  );

  const { mutate: archiveList, isLoading: _archivingList } = useMutation<void, { id: string }>(
    (vars) => `/lists/${vars.id}/archive`,
    {
      method: 'POST',
      onSuccess: () => {
        notifications.show({
          title: 'Erfolg',
          message: 'Liste erfolgreich archiviert',
          color: 'green',
          icon: <IconCheck size={16} />,
        });
        setSelectedList(null);
        refetchActive();
      },
      onError: (error: string) => {
        notifications.show({
          title: 'Fehler',
          message: error || 'Liste konnte nicht archiviert werden',
          color: 'red',
          icon: <IconAlertCircle size={16} />,
        });
      },
    }
  );

  const { mutate: unarchiveList, isLoading: _unarchivingList } = useMutation<void, { id: string }>(
    (vars) => `/lists/${vars.id}/unarchive`,
    {
      method: 'POST',
      onSuccess: () => {
        notifications.show({
          title: 'Erfolg',
          message: 'Liste erfolgreich wiederhergestellt',
          color: 'green',
          icon: <IconCheck size={16} />,
        });
        setSelectedList(null);
        refetchArchived();
      },
      onError: (error: string) => {
        notifications.show({
          title: 'Fehler',
          message: error || 'Liste konnte nicht wiederhergestellt werden',
          color: 'red',
          icon: <IconAlertCircle size={16} />,
        });
      },
    }
  );

  const { mutate: addItem, isLoading: addingItem } = useMutation<ListItem, any>(
    (vars) => `/lists/${vars.listId}/items`,
    {
      method: 'POST',
      onSuccess: () => {
        notifications.show({
          title: 'Erfolg',
          message: 'Eintrag erfolgreich hinzugefügt',
          color: 'green',
          icon: <IconCheck size={16} />,
        });
        setNewItem({ text: '', quantity: 1, priority: 'medium' });
        closeItemModal();
        refetchActive();
        refetchArchived();
      },
      onError: (error: string) => {
        notifications.show({
          title: 'Fehler',
          message: error || 'Eintrag konnte nicht hinzugefügt werden',
          color: 'red',
          icon: <IconAlertCircle size={16} />,
        });
      },
    }
  );

  const { mutate: toggleItem, isLoading: _togglingItem } = useMutation<void, { listId: string; itemId: string }>(
    (vars) => `/lists/${vars.listId}/items/${vars.itemId}/toggle`,
    {
      method: 'POST',
      onSuccess: () => {
        refetchActive();
        refetchArchived();
      },
      onError: (error: string) => {
        notifications.show({
          title: 'Fehler',
          message: error || 'Status konnte nicht geändert werden',
          color: 'red',
          icon: <IconAlertCircle size={16} />,
        });
      },
    }
  );

  const { mutate: deleteItem, isLoading: _deletingItem } = useMutation<void, { listId: string; itemId: string }>(
    (vars) => `/lists/${vars.listId}/items/${vars.itemId}`,
    {
      method: 'DELETE',
      onSuccess: () => {
        notifications.show({
          title: 'Erfolg',
          message: 'Eintrag erfolgreich gelöscht',
          color: 'green',
          icon: <IconCheck size={16} />,
        });
        refetchActive();
        refetchArchived();
      },
      onError: (error: string) => {
        notifications.show({
          title: 'Fehler',
          message: error || 'Eintrag konnte nicht gelöscht werden',
          color: 'red',
          icon: <IconAlertCircle size={16} />,
        });
      },
    }
  );

  const handleCreateList = () => {
    createList(newListData);
  };

  const handleUpdateList = () => {
    if (!editingList) return;
    updateList({
      id: editingList.id,
      name: editingList.name,
      description: editingList.description,
      type: editingList.type,
      color: editingList.color,
    });
  };

  const handleDeleteList = (listId: string) => {
    if (confirm('Möchten Sie diese Liste wirklich löschen?')) {
      deleteList({ id: listId });
    }
  };

  const handleArchiveList = (listId: string) => {
    archiveList({ id: listId });
  };

  const handleUnarchiveList = (listId: string) => {
    unarchiveList({ id: listId });
  };

  const handleAddItem = () => {
    if (!selectedList || !newItem.text.trim()) return;
    addItem({
      listId: selectedList.id,
      text: newItem.text,
      quantity: newItem.quantity,
      priority: newItem.priority,
    });
  };

  const handleToggleItem = (listId: string, itemId: string) => {
    toggleItem({ listId, itemId });
  };

  const handleDeleteItem = (listId: string, itemId: string) => {
    deleteItem({ listId, itemId });
  };

  const openEditListModal = (list: List) => {
    setEditingList({ ...list });
    openEditModal();
  };

  const openAddItemModal = (list: List) => {
    setSelectedList(list);
    openItemModal();
  };

  const lists = view === 'active' ? activeLists : archivedLists;
  const isLoading = view === 'active' ? loadingActive : loadingArchived;
  const error = view === 'active' ? errorActive : errorArchived;

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Title order={1}>Listen</Title>
          <Button leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
            Neue Liste
          </Button>
        </Group>

        <SegmentedControl
          value={view}
          onChange={(value) => setView(value as 'active' | 'archived')}
          data={[
            { label: 'Aktive Listen', value: 'active' },
            { label: 'Archivierte Listen', value: 'archived' },
          ]}
        />

        {isLoading && (
          <Center py="xl">
            <Loader size="lg" />
          </Center>
        )}

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} title="Fehler" color="red">
            {error || 'Listen konnten nicht geladen werden'}
          </Alert>
        )}

        {!isLoading && !error && lists && lists.length === 0 && (
          <Paper p="xl" withBorder>
            <Center>
              <Text c="dimmed">
                {view === 'active' ? 'Keine aktiven Listen vorhanden' : 'Keine archivierten Listen vorhanden'}
              </Text>
            </Center>
          </Paper>
        )}

        {!isLoading && !error && lists && lists.length > 0 && (
          <Stack gap="md">
            {lists.map((list) => (
              <Card key={list.id} shadow="sm" padding="lg" radius="md" withBorder>
                <Stack gap="md">
                  <Group justify="space-between">
                    <Group gap="sm">
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: 4,
                          backgroundColor: list.color,
                        }}
                      />
                      <div>
                        <Text fw={500} size="lg">
                          {list.name}
                        </Text>
                        {list.description && (
                          <Text size="sm" c="dimmed">
                            {list.description}
                          </Text>
                        )}
                      </div>
                    </Group>
                    <Group gap="xs">
                      <Badge color="gray" variant="light">
                        {listTypeOptions.find((opt) => opt.value === list.type)?.label}
                      </Badge>
                      <Menu shadow="md" width={200}>
                        <Menu.Target>
                          <ActionIcon variant="subtle" color="gray">
                            <IconDots size={16} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item
                            leftSection={<IconEdit size={14} />}
                            onClick={() => openEditListModal(list)}
                          >
                            Bearbeiten
                          </Menu.Item>
                          <Menu.Item
                            leftSection={<IconPlus size={14} />}
                            onClick={() => openAddItemModal(list)}
                          >
                            Eintrag hinzufügen
                          </Menu.Item>
                          {!list.isArchived ? (
                            <Menu.Item
                              leftSection={<IconArchive size={14} />}
                              onClick={() => handleArchiveList(list.id)}
                            >
                              Archivieren
                            </Menu.Item>
                          ) : (
                            <Menu.Item
                              leftSection={<IconArchiveOff size={14} />}
                              onClick={() => handleUnarchiveList(list.id)}
                            >
                              Wiederherstellen
                            </Menu.Item>
                          )}
                          <Menu.Divider />
                          <Menu.Item
                            color="red"
                            leftSection={<IconTrash size={14} />}
                            onClick={() => handleDeleteList(list.id)}
                          >
                            Löschen
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Group>
                  </Group>

                  {list.items.length > 0 && (
                    <>
                      <Divider />
                      <Stack gap="xs">
                        {list.items.map((item) => (
                          <Group key={item.id} justify="space-between" wrap="nowrap">
                            <Group gap="sm" style={{ flex: 1 }}>
                              <Checkbox
                                checked={item.completed}
                                onChange={() => handleToggleItem(list.id, item.id)}
                              />
                              <Text
                                style={{
                                  textDecoration: item.completed ? 'line-through' : 'none',
                                  opacity: item.completed ? 0.6 : 1,
                                }}
                              >
                                {item.text}
                              </Text>
                              {item.quantity && item.quantity > 1 && (
                                <Badge size="sm" variant="light">
                                  {item.quantity}x
                                </Badge>
                              )}
                              <Badge size="sm" color={priorityColors[item.priority]} variant="dot">
                                {priorityLabels[item.priority]}
                              </Badge>
                            </Group>
                            <ActionIcon
                              color="red"
                              variant="subtle"
                              onClick={() => handleDeleteItem(list.id, item.id)}
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Group>
                        ))}
                      </Stack>
                    </>
                  )}

                  {list.items.length === 0 && (
                    <Text size="sm" c="dimmed" ta="center">
                      Keine Einträge vorhanden
                    </Text>
                  )}

                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">
                      {list.items.filter((item) => item.completed).length} von {list.items.length} erledigt
                    </Text>
                    <Text size="xs" c="dimmed">
                      Erstellt: {new Date(list.createdAt).toLocaleDateString('de-DE')}
                    </Text>
                  </Group>
                </Stack>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>

      {/* Create List Modal */}
      <Modal opened={createModalOpened} onClose={closeCreateModal} title="Neue Liste erstellen" size="md">
        <Stack gap="md">
          <TextInput
            label="Name"
            placeholder="Listenname"
            required
            value={newListData.name}
            onChange={(e) => setNewListData({ ...newListData, name: e.currentTarget.value })}
          />
          <Textarea
            label="Beschreibung"
            placeholder="Beschreibung (optional)"
            value={newListData.description}
            onChange={(e) => setNewListData({ ...newListData, description: e.currentTarget.value })}
            minRows={3}
          />
          <Select
            label="Typ"
            placeholder="Listentyp auswählen"
            required
            value={newListData.type}
            onChange={(value) => setNewListData({ ...newListData, type: value as ListType })}
            data={listTypeOptions}
          />
          <ColorInput
            label="Farbe"
            placeholder="Farbe auswählen"
            value={newListData.color}
            onChange={(value) => setNewListData({ ...newListData, color: value })}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={closeCreateModal}>
              Abbrechen
            </Button>
            <Button
              onClick={handleCreateList}
              loading={creatingList}
              disabled={!newListData.name.trim()}
            >
              Erstellen
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Edit List Modal */}
      <Modal opened={editModalOpened} onClose={closeEditModal} title="Liste bearbeiten" size="md">
        {editingList && (
          <Stack gap="md">
            <TextInput
              label="Name"
              placeholder="Listenname"
              required
              value={editingList.name}
              onChange={(e) => setEditingList({ ...editingList, name: e.currentTarget.value })}
            />
            <Textarea
              label="Beschreibung"
              placeholder="Beschreibung (optional)"
              value={editingList.description}
              onChange={(e) => setEditingList({ ...editingList, description: e.currentTarget.value })}
              minRows={3}
            />
            <Select
              label="Typ"
              placeholder="Listentyp auswählen"
              required
              value={editingList.type}
              onChange={(value) => setEditingList({ ...editingList, type: value as ListType })}
              data={listTypeOptions}
            />
            <ColorInput
              label="Farbe"
              placeholder="Farbe auswählen"
              value={editingList.color}
              onChange={(value) => setEditingList({ ...editingList, color: value })}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={closeEditModal}>
                Abbrechen
              </Button>
              <Button
                onClick={handleUpdateList}
                loading={updatingList}
                disabled={!editingList.name.trim()}
              >
                Speichern
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* Add Item Modal */}
      <Modal opened={itemModalOpened} onClose={closeItemModal} title="Eintrag hinzufügen" size="md">
        <Stack gap="md">
          <TextInput
            label="Text"
            placeholder="Eintrag beschreiben"
            required
            value={newItem.text}
            onChange={(e) => setNewItem({ ...newItem, text: e.currentTarget.value })}
          />
          <NumberInput
            label="Menge"
            placeholder="Anzahl"
            min={1}
            value={newItem.quantity}
            onChange={(value) => setNewItem({ ...newItem, quantity: Number(value) || 1 })}
          />
          <Select
            label="Priorität"
            placeholder="Priorität auswählen"
            value={newItem.priority}
            onChange={(value) => setNewItem({ ...newItem, priority: value as 'low' | 'medium' | 'high' })}
            data={[
              { value: 'low', label: 'Niedrig' },
              { value: 'medium', label: 'Mittel' },
              { value: 'high', label: 'Hoch' },
            ]}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={closeItemModal}>
              Abbrechen
            </Button>
            <Button
              onClick={handleAddItem}
              loading={addingItem}
              disabled={!newItem.text.trim()}
            >
              Hinzufügen
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}

export default ListsPage;
