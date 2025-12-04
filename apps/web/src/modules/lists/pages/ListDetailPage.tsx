import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Card,
    Text,
    Button,
    Group,
    Stack,
    TextInput,
    Checkbox,
    ActionIcon,
    Badge,
    NumberInput,
    Select,
    Paper,
    Skeleton,
    Progress,
    ThemeIcon,
    useMantineColorScheme,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
    IconArrowLeft,
    IconPlus,
    IconTrash,
    IconCheck,
    IconAlertCircle,
    IconList,
    IconShoppingCart,
    IconChecklist,
    IconBriefcase,
    IconClipboardList,
    IconCheckbox,
} from '@tabler/icons-react';
import { useRequest, useMutation, useConfetti } from '../../../hooks';
import { PageTitle } from '../../../components/PageTitle';
import type { ListSimple, ListItem } from '@ycmm/core';

type List = ListSimple;

const listTypeOptions = [
    { value: 'shopping', label: 'Einkaufsliste' },
    { value: 'todo', label: 'To-Do Liste' },
    { value: 'packing', label: 'Packliste' },
    { value: 'checklist', label: 'Checkliste' },
    { value: 'custom', label: 'Benutzerdefiniert' },
];

const listTypeIcons: Record<string, typeof IconList> = {
    shopping: IconShoppingCart,
    todo: IconChecklist,
    packing: IconBriefcase,
    checklist: IconCheckbox,
    custom: IconClipboardList,
};

export default function ListDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { colorScheme } = useMantineColorScheme();
    const confetti = useConfetti();
    const [newItem, setNewItem] = useState({ text: '', quantity: 1, priority: 'medium' as 'low' | 'medium' | 'high' });
    const previousCompletedRef = useRef<boolean | null>(null);

    const { data: list, isLoading, refetch } = useRequest<List>(`/lists/${id}`);

    // Confetti effect when all items are completed
    useEffect(() => {
        if (!list || list.items.length === 0) return;

        const allCompleted = list.items.every(item => item.completed);
        const wasNotAllCompleted = previousCompletedRef.current === false;

        if (allCompleted && wasNotAllCompleted) {
            confetti.celebration();
        }

        previousCompletedRef.current = allCompleted;
    }, [list, confetti]);

    const { mutate: addItem, isLoading: addingItem } = useMutation<ListItem, any>(
        `/lists/${id}/items`,
        {
            method: 'POST',
            onSuccess: () => {
                notifications.show({
                    title: 'Erfolg',
                    message: 'Eintrag hinzugefügt',
                    color: 'green',
                    icon: <IconCheck size={16} />,
                });
                setNewItem({ text: '', quantity: 1, priority: 'medium' });
                refetch();
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

    const { mutate: toggleItem } = useMutation<void, { itemId: string }>(
        (vars) => `/lists/${id}/items/${vars.itemId}/toggle`,
        {
            method: 'POST',
            onSuccess: () => {
                refetch();
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

    const { mutate: deleteItem } = useMutation<void, { itemId: string }>(
        (vars) => `/lists/${id}/items/${vars.itemId}`,
        {
            method: 'DELETE',
            onSuccess: () => {
                notifications.show({
                    title: 'Erfolg',
                    message: 'Eintrag gelöscht',
                    color: 'green',
                    icon: <IconCheck size={16} />,
                });
                refetch();
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

    const handleAddItem = () => {
        if (!newItem.text.trim()) return;
        addItem({
            text: newItem.text,
            quantity: newItem.quantity,
            priority: newItem.priority,
        });
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && newItem.text.trim()) {
            handleAddItem();
        }
    };

    if (isLoading) {
        return (
            <Container size="xl" py="xl">
                <Stack gap="lg">
                    <Skeleton height={40} width={200} />
                    <Skeleton height={100} />
                    <Skeleton height={300} />
                </Stack>
            </Container>
        );
    }

    if (!list) {
        return (
            <Container size="xl" py="xl">
                <Paper p="xl" withBorder>
                    <Stack align="center" gap="md">
                        <ThemeIcon size={64} variant="light" color="gray" radius="xl">
                            <IconList size={32} />
                        </ThemeIcon>
                        <Text c="dimmed">Liste nicht gefunden</Text>
                        <Button onClick={() => navigate('/app/lists')}>
                            Zurück zu Listen
                        </Button>
                    </Stack>
                </Paper>
            </Container>
        );
    }

    const Icon = listTypeIcons[list.type] || IconList;
    const completedCount = list.items.filter(i => i.completed).length;
    const progress = list.items.length > 0
        ? (completedCount / list.items.length) * 100
        : 0;

    const sortedItems = [...list.items].sort((a, b) => {
        // Completed items at bottom
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        // Sort by priority
        const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
        return (priorityOrder[a.priority || 'medium'] || 1) - (priorityOrder[b.priority || 'medium'] || 1);
    });

    return (
        <Container size="xl" py="xl">
            <Stack gap="lg">
                {/* Header */}
                <Group justify="space-between">
                    <Group>
                        <ActionIcon variant="subtle" size="lg" onClick={() => navigate('/app/lists')}>
                            <IconArrowLeft size={20} />
                        </ActionIcon>
                        <ThemeIcon size="xl" radius="md" color={list.color} variant="light">
                            <Icon size={24} />
                        </ThemeIcon>
                        <div>
                            <PageTitle title={list.name} subtitle={list.description || listTypeOptions.find(o => o.value === list.type)?.label} />
                        </div>
                    </Group>
                    <Badge color={list.color} size="lg">
                        {completedCount}/{list.items.length} erledigt
                    </Badge>
                </Group>

                {/* Progress */}
                {list.items.length > 0 && (
                    <Paper p="md" withBorder radius="md">
                        <Group justify="space-between" mb="xs">
                            <Text size="sm" fw={500}>Fortschritt</Text>
                            <Text size="sm" c="dimmed">{Math.round(progress)}%</Text>
                        </Group>
                        <Progress value={progress} color={list.color} size="lg" radius="xl" />
                    </Paper>
                )}

                {/* Add Item Form */}
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Stack gap="md">
                        <Text fw={600}>Neuen Eintrag hinzufügen</Text>
                        <Group align="flex-end">
                            <TextInput
                                placeholder="Was möchtest du hinzufügen?"
                                value={newItem.text}
                                onChange={(e) => setNewItem({ ...newItem, text: e.currentTarget.value })}
                                onKeyPress={handleKeyPress}
                                style={{ flex: 1 }}
                            />
                            <NumberInput
                                placeholder="Menge"
                                min={1}
                                value={newItem.quantity}
                                onChange={(value) => setNewItem({ ...newItem, quantity: Number(value) || 1 })}
                                style={{ width: 80 }}
                            />
                            <Select
                                placeholder="Priorität"
                                value={newItem.priority}
                                onChange={(value) => setNewItem({ ...newItem, priority: value as 'low' | 'medium' | 'high' })}
                                data={[
                                    { value: 'low', label: 'Niedrig' },
                                    { value: 'medium', label: 'Mittel' },
                                    { value: 'high', label: 'Hoch' },
                                ]}
                                style={{ width: 120 }}
                            />
                            <Button
                                leftSection={<IconPlus size={16} />}
                                onClick={handleAddItem}
                                loading={addingItem}
                                disabled={!newItem.text.trim()}
                            >
                                Hinzufügen
                            </Button>
                        </Group>
                    </Stack>
                </Card>

                {/* Items List */}
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Stack gap="md">
                        <Text fw={600}>Einträge ({list.items.length})</Text>

                        {list.items.length === 0 ? (
                            <Paper p="xl" withBorder radius="md" bg="gray.0">
                                <Stack align="center" gap="md">
                                    <ThemeIcon size={48} variant="light" color="gray" radius="xl">
                                        <IconClipboardList size={24} />
                                    </ThemeIcon>
                                    <Text c="dimmed" ta="center">
                                        Diese Liste ist noch leer. Füge deinen ersten Eintrag hinzu!
                                    </Text>
                                </Stack>
                            </Paper>
                        ) : (
                            <Stack gap="xs">
                                {sortedItems.map((item) => (
                                    <Paper
                                        key={item.id}
                                        p="sm"
                                        withBorder
                                        radius="md"
                                        style={{
                                            opacity: item.completed ? 0.6 : 1,
                                            backgroundColor: item.completed
                                                ? colorScheme === 'dark'
                                                    ? 'var(--mantine-color-dark-6)'
                                                    : 'var(--mantine-color-gray-0)'
                                                : undefined,
                                        }}
                                    >
                                        <Group justify="space-between" wrap="nowrap">
                                            <Group gap="sm" style={{ flex: 1 }}>
                                                <Checkbox
                                                    checked={item.completed}
                                                    onChange={() => toggleItem({ itemId: item.id })}
                                                    color={list.color}
                                                    size="md"
                                                />
                                                <div style={{ flex: 1 }}>
                                                    <Text
                                                        size="sm"
                                                        fw={500}
                                                        style={{
                                                            textDecoration: item.completed ? 'line-through' : 'none',
                                                        }}
                                                    >
                                                        {item.text}
                                                    </Text>
                                                </div>
                                                {item.quantity && item.quantity > 1 && (
                                                    <Badge size="sm" variant="light" color={list.color}>
                                                        {item.quantity}x
                                                    </Badge>
                                                )}
                                                <Badge
                                                    size="sm"
                                                    variant="light"
                                                    color={
                                                        item.priority === 'high' ? 'red' :
                                                        item.priority === 'medium' ? 'yellow' : 'gray'
                                                    }
                                                >
                                                    {item.priority === 'high' ? 'Hoch' :
                                                     item.priority === 'medium' ? 'Mittel' : 'Niedrig'}
                                                </Badge>
                                            </Group>
                                            <ActionIcon
                                                color="red"
                                                variant="subtle"
                                                onClick={() => deleteItem({ itemId: item.id })}
                                            >
                                                <IconTrash size={16} />
                                            </ActionIcon>
                                        </Group>
                                    </Paper>
                                ))}
                            </Stack>
                        )}
                    </Stack>
                </Card>
            </Stack>
        </Container>
    );
}
