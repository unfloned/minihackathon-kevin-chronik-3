import { useState } from 'react';
import {
    Text,
    Group,
    Stack,
    Badge,
    Card,
    Paper,
    Checkbox,
    TextInput,
    Select,
    ThemeIcon,
    ActionIcon,
} from '@mantine/core';
import {
    IconChecklist,
    IconPlus,
    IconTrash,
} from '@tabler/icons-react';
import type { ProjectTask, TaskPriority } from '../types';
import { priorityOptions } from '../types';

interface TaskListProps {
    tasks: ProjectTask[];
    onAddTask: (title: string, priority: TaskPriority) => Promise<void>;
    onToggleTask: (taskId: string) => Promise<void>;
    onDeleteTask: (taskId: string) => Promise<void>;
}

export function TaskList({ tasks, onAddTask, onToggleTask, onDeleteTask }: TaskListProps) {
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('medium');

    const completedTasks = tasks.filter(t => t.completed).length;

    const handleAddTask = async () => {
        if (!newTaskTitle.trim()) return;
        await onAddTask(newTaskTitle, newTaskPriority);
        setNewTaskTitle('');
        setNewTaskPriority('medium');
    };

    return (
        <Card withBorder padding="lg">
            <Group justify="space-between" mb="lg">
                <Group gap="xs">
                    <ThemeIcon size="sm" variant="light" color="blue">
                        <IconChecklist size={14} />
                    </ThemeIcon>
                    <Text fw={600}>Aufgaben</Text>
                </Group>
                <Badge variant="light">{completedTasks}/{tasks.length}</Badge>
            </Group>

            {/* Add Task */}
            <Paper withBorder p="sm" mb="md">
                <Group>
                    <TextInput
                        placeholder="Neue Aufgabe..."
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.currentTarget.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                        style={{ flex: 1 }}
                        size="sm"
                    />
                    <Select
                        data={priorityOptions}
                        value={newTaskPriority}
                        onChange={(v) => setNewTaskPriority((v as TaskPriority) || 'medium')}
                        size="sm"
                        w={100}
                    />
                    <ActionIcon
                        variant="filled"
                        color="blue"
                        onClick={handleAddTask}
                        disabled={!newTaskTitle.trim()}
                    >
                        <IconPlus size={16} />
                    </ActionIcon>
                </Group>
            </Paper>

            {/* Task List */}
            <Stack gap="xs" style={{ maxHeight: 400, overflowY: 'auto' }}>
                {tasks.length === 0 ? (
                    <Text c="dimmed" ta="center" py="xl" size="sm">
                        Noch keine Aufgaben vorhanden
                    </Text>
                ) : (
                    tasks
                        .sort((a, b) => {
                            if (a.completed !== b.completed) return a.completed ? 1 : -1;
                            return a.order - b.order;
                        })
                        .map(task => (
                            <Paper key={task.id} withBorder p="sm">
                                <Group justify="space-between" wrap="nowrap">
                                    <Checkbox
                                        checked={task.completed}
                                        onChange={() => onToggleTask(task.id)}
                                        label={
                                            <Text
                                                size="sm"
                                                td={task.completed ? 'line-through' : undefined}
                                                c={task.completed ? 'dimmed' : undefined}
                                            >
                                                {task.title}
                                            </Text>
                                        }
                                    />
                                    <Group gap="xs">
                                        <Badge
                                            size="xs"
                                            variant="dot"
                                            color={priorityOptions.find(p => p.value === task.priority)?.color}
                                        >
                                            {priorityOptions.find(p => p.value === task.priority)?.label}
                                        </Badge>
                                        <ActionIcon
                                            variant="subtle"
                                            color="red"
                                            size="sm"
                                            onClick={() => onDeleteTask(task.id)}
                                        >
                                            <IconTrash size={14} />
                                        </ActionIcon>
                                    </Group>
                                </Group>
                            </Paper>
                        ))
                )}
            </Stack>
        </Card>
    );
}
