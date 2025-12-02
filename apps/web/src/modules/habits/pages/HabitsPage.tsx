import { useState, useEffect } from 'react';
import {
    Card,
    Group,
    Stack,
    Button,
    ActionIcon,
    Progress,
    Badge,
    ThemeIcon,
    Modal,
    TextInput,
    Select,
    Textarea,
    ColorInput,
    NumberInput,
    SimpleGrid,
    RingProgress,
    Skeleton,
    Menu,
    Paper,
    Text,
} from '@mantine/core';
import { PageLayout } from '../../../components/PageLayout';
import { useDisclosure } from '@mantine/hooks';
import {
    IconCheck,
    IconFlame,
    IconDotsVertical,
    IconEdit,
    IconTrash,
    IconTarget,
    IconTrendingUp,
} from '@tabler/icons-react';
import { useRequest, useMutation, useConfetti } from '../../../hooks';
import { notifications } from '@mantine/notifications';


interface Habit {
    id: string;
    name: string;
    description?: string;
    icon: string;
    color: string;
    type: 'boolean' | 'quantity' | 'duration';
    targetValue?: number;
    unit?: string;
    frequency: 'daily' | 'weekly' | 'custom';
    currentStreak: number;
    longestStreak: number;
    totalCompletions: number;
    completedToday?: boolean;
    todayValue?: number;
}

interface HabitStats {
    totalHabits: number;
    activeHabits: number;
    completedToday: number;
    totalToday: number;
    currentStreak: number;
    longestStreak: number;
    weeklyCompletion: number[];
}

interface CreateHabitForm {
    name: string;
    description: string;
    icon: string;
    color: string;
    type: 'boolean' | 'quantity' | 'duration';
    targetValue: number;
    unit: string;
    frequency: 'daily' | 'weekly' | 'custom';
}

export default function HabitsPage() {
    const [opened, { open, close }] = useDisclosure(false);
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
    const confetti = useConfetti();

