import { useState, useEffect } from 'react';
import {
    Container,
    Title,
    Text,
    Card,
    Group,
    Stack,
    Button,
    ActionIcon,
    Badge,
    ThemeIcon,
    Modal,
    TextInput,
    Textarea,
    Select,
    SimpleGrid,
    Table,
    Skeleton,
    Menu,
    Paper,
    RingProgress,
    Tabs,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import {
    IconPlus,
    IconCalendarDue,
    IconDotsVertical,
    IconEdit,
    IconTrash,
    IconCheck,
    IconAlertTriangle,
    IconClock,
    IconCalendarEvent,
    IconFlag,
} from '@tabler/icons-react';
import { useRequest, useMutation } from '../../../hooks';
import { notifications } from '@mantine/notifications';


type DeadlinePriority = 'low' | 'medium' | 'high' | 'urgent';
type DeadlineStatus = 'pending' | 'completed' | 'overdue' | 'cancelled';

interface Deadline {
    id: string;
    title: string;
    description?: string;
    dueDate: string;
    dueTime?: string;
    priority: DeadlinePriority;
    status: DeadlineStatus;
    category?: string;
    color: string;
    reminderEnabled: boolean;
    reminderDaysBefore?: number;
    completedAt?: string;
}

interface DeadlineStats {
    total: number;
    pending: number;
    completed: number;
    overdue: number;
    completedThisMonth: number;
    byPriority: { priority: DeadlinePriority; count: number }[];
    byCategory: { category: string; count: number }[];
    upcomingThisWeek: Deadline[];
}

interface CreateDeadlineForm {
    title: string;
    description: string;
    dueDate: Date;
    priority: DeadlinePriority;
    category: string;
}

const priorityColors: Record<DeadlinePriority, string> = {
    low: 'gray',
    medium: 'blue',
    high: 'orange',
    urgent: 'red',
};

const priorityLabels: Record<DeadlinePriority, string> = {
    low: 'Niedrig',
    medium: 'Mittel',
    high: 'Hoch',
    urgent: 'Dringend',
};

const statusColors: Record<DeadlineStatus, string> = {
    pending: 'blue',
    completed: 'green',
    overdue: 'red',
    cancelled: 'gray',
};

const statusLabels: Record<DeadlineStatus, string> = {
    pending: 'Offen',
    completed: 'Erledigt',
    overdue: 'Überfällig',
    cancelled: 'Abgebrochen',
};

const categoryOptions = [
    { value: 'work', label: 'Arbeit' },
    { value: 'personal', label: 'Persönlich' },
    { value: 'study', label: 'Studium' },
    { value: 'finance', label: 'Finanzen' },
    { value: 'health', label: 'Gesundheit' },
    { value: 'other', label: 'Sonstiges' },
];

export default function DeadlinesPage() {
    const [opened, { open, close }] = useDisclosure(false);
    const [editingDeadline, setEditingDeadline] = useState<Deadline | null>(null);
    const [activeTab, setActiveTab] = useState<string | null>('upcoming');

