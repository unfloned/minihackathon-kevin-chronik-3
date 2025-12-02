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
    NumberInput,
    Select,
    SimpleGrid,
    Table,
    Skeleton,
    Menu,
    Paper,
    Progress,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
    IconPlus,
    IconCreditCard,
    IconDotsVertical,
    IconEdit,
    IconTrash,
    IconPlayerPause,
    IconPlayerPlay,
    IconX,
    IconCalendarDue,
    IconCoin,
    IconReceipt,
} from '@tabler/icons-react';
import { useRequest, useMutation } from '../../../hooks';
import { notifications } from '@mantine/notifications';


type SubscriptionBillingCycle = 'weekly' | 'monthly' | 'quarterly' | 'yearly';
type SubscriptionStatus = 'active' | 'paused' | 'cancelled';

interface Subscription {
    id: string;
    name: string;
    description?: string;
    amount: number;
    currency: string;
    billingCycle: SubscriptionBillingCycle;
    billingDay: number;
    nextBillingDate: string;
    category?: string;
    color: string;
    icon?: string;
    website?: string;
    status: SubscriptionStatus;
    reminderEnabled: boolean;
    reminderDaysBefore: number;
    startDate: string;
}

interface SubscriptionStats {
    totalMonthly: number;
    totalYearly: number;
    activeCount: number;
    pausedCount: number;
    byCategory: { category: string; amount: number; count: number }[];
    upcomingBillings: { subscription: Subscription; daysUntil: number }[];
}

interface CreateSubscriptionForm {
    name: string;
    description: string;
    amount: number;
    billingCycle: SubscriptionBillingCycle;
    billingDay: number;
    category: string;
    website: string;
}

const billingCycleLabels: Record<SubscriptionBillingCycle, string> = {
    weekly: 'Wöchentlich',
    monthly: 'Monatlich',
    quarterly: 'Vierteljährlich',
    yearly: 'Jährlich',
};

const statusColors: Record<SubscriptionStatus, string> = {
    active: 'green',
    paused: 'yellow',
    cancelled: 'gray',
};

const statusLabels: Record<SubscriptionStatus, string> = {
    active: 'Aktiv',
    paused: 'Pausiert',
    cancelled: 'Gekündigt',
};

const categoryOptions = [
    { value: 'entertainment', label: 'Unterhaltung' },
    { value: 'productivity', label: 'Produktivität' },
    { value: 'utilities', label: 'Versorgung' },
    { value: 'health', label: 'Gesundheit' },
    { value: 'education', label: 'Bildung' },
    { value: 'finance', label: 'Finanzen' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'other', label: 'Sonstiges' },
];

const categoryLabels: Record<string, string> = {
    entertainment: 'Unterhaltung',
    productivity: 'Produktivität',
    utilities: 'Versorgung',
    health: 'Gesundheit',
    education: 'Bildung',
    finance: 'Finanzen',
    shopping: 'Shopping',
    other: 'Sonstiges',
};

export default function SubscriptionsPage() {
    const [opened, { open, close }] = useDisclosure(false);
    const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

