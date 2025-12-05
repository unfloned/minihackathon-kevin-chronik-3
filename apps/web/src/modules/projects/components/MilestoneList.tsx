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
    ThemeIcon,
    ActionIcon,
} from '@mantine/core';
import { DateInput, DateValue } from '@mantine/dates';
import {
    IconTarget,
    IconPlus,
    IconTrash,
    IconCalendar,
    IconClock,
} from '@tabler/icons-react';
import type { Milestone } from '../types';

// Helper to convert Mantine v8 DateValue to Date
const toDateOrNull = (value: DateValue): Date | null => {
    if (!value) return null;
    if (value instanceof Date) return value;
    return new Date(value);
};

interface MilestoneListProps {
    milestones: Milestone[];
    onAddMilestone: (title: string, targetDate: string) => Promise<void>;
    onToggleMilestone: (milestoneId: string) => Promise<void>;
    onDeleteMilestone: (milestoneId: string) => Promise<void>;
}

export function MilestoneList({ milestones, onAddMilestone, onToggleMilestone, onDeleteMilestone }: MilestoneListProps) {
    const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
    const [newMilestoneDate, setNewMilestoneDate] = useState<Date | null>(null);

    const completedMilestones = milestones.filter(m => m.completed).length;

    const handleAddMilestone = async () => {
        if (!newMilestoneTitle.trim() || !newMilestoneDate) return;
        await onAddMilestone(newMilestoneTitle, newMilestoneDate.toISOString());
        setNewMilestoneTitle('');
        setNewMilestoneDate(null);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('de-DE', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    return (
        <Card withBorder padding="lg">
            <Group justify="space-between" mb="lg">
                <Group gap="xs">
                    <ThemeIcon size="sm" variant="light" color="orange">
                        <IconTarget size={14} />
                    </ThemeIcon>
                    <Text fw={600}>Meilensteine</Text>
                </Group>
                <Badge variant="light" color="orange">{completedMilestones}/{milestones.length}</Badge>
            </Group>

            {/* Add Milestone */}
            <Paper withBorder p="sm" mb="md">
                <Stack gap="xs">
                    <TextInput
                        placeholder="Neuer Meilenstein..."
                        value={newMilestoneTitle}
                        onChange={(e) => setNewMilestoneTitle(e.currentTarget.value)}
                        size="sm"
                    />
                    <Group>
                        <DateInput
                            placeholder="Zieldatum"
                            value={newMilestoneDate}
                            onChange={(v) => setNewMilestoneDate(toDateOrNull(v))}
                            size="sm"
                            style={{ flex: 1 }}
                            leftSection={<IconCalendar size={14} />}
                        />
                        <ActionIcon
                            variant="filled"
                            color="orange"
                            onClick={handleAddMilestone}
                            disabled={!newMilestoneTitle.trim() || !newMilestoneDate}
                        >
                            <IconPlus size={16} />
                        </ActionIcon>
                    </Group>
                </Stack>
            </Paper>

            {/* Milestone List */}
            <Stack gap="xs" style={{ maxHeight: 400, overflowY: 'auto' }}>
                {milestones.length === 0 ? (
                    <Text c="dimmed" ta="center" py="xl" size="sm">
                        Noch keine Meilensteine vorhanden
                    </Text>
                ) : (
                    milestones
                        .sort((a, b) => {
                            if (!a.targetDate) return 1;
                            if (!b.targetDate) return -1;
                            return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
                        })
                        .map(milestone => {
                            const isOverdue = !milestone.completed && milestone.targetDate && new Date(milestone.targetDate) < new Date();
                            return (
                                <Paper key={milestone.id} withBorder p="sm">
                                    <Group justify="space-between" wrap="nowrap">
                                        <Checkbox
                                            checked={milestone.completed}
                                            onChange={() => onToggleMilestone(milestone.id)}
                                            label={
                                                <Stack gap={0}>
                                                    <Text
                                                        size="sm"
                                                        td={milestone.completed ? 'line-through' : undefined}
                                                        c={milestone.completed ? 'dimmed' : undefined}
                                                    >
                                                        {milestone.title}
                                                    </Text>
                                                    {milestone.targetDate && (
                                                        <Group gap={4}>
                                                            <IconClock size={12} />
                                                            <Text
                                                                size="xs"
                                                                c={isOverdue ? 'red' : 'dimmed'}
                                                                fw={isOverdue ? 500 : undefined}
                                                            >
                                                                {formatDate(milestone.targetDate)}
                                                            </Text>
                                                        </Group>
                                                    )}
                                                </Stack>
                                            }
                                        />
                                        <ActionIcon
                                            variant="subtle"
                                            color="red"
                                            size="sm"
                                            onClick={() => onDeleteMilestone(milestone.id)}
                                        >
                                            <IconTrash size={14} />
                                        </ActionIcon>
                                    </Group>
                                </Paper>
                            );
                        })
                )}
            </Stack>
        </Card>
    );
}
