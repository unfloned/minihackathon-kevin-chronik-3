import { useState, useEffect } from 'react';
import {
    Container,
    Title,
    Text,
    SimpleGrid,
    Card,
    Group,
    Stack,
    Button,
    ActionIcon,
    Badge,
    Modal,
    TextInput,
    Textarea,
    Select,
    Menu,
    Paper,
    Skeleton,
    ThemeIcon,
    Tabs,
    ScrollArea,
    NumberInput,
    Divider,
    Avatar,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
    IconPlus,
    IconSearch,
    IconDotsVertical,
    IconEdit,
    IconTrash,
    IconBriefcase,
    IconBuilding,
    IconMapPin,
    IconCurrencyEuro,
    IconExternalLink,
    IconMail,
    IconUser,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useRequest, useMutation } from '../../../hooks';


type ApplicationStatus =
    | 'draft'
    | 'applied'
    | 'in_review'
    | 'interview_scheduled'
    | 'interviewed'
    | 'offer_received'
    | 'accepted'
    | 'rejected'
    | 'withdrawn';

type RemoteType = 'onsite' | 'hybrid' | 'remote';

interface SalaryRange {
    min?: number;
    max?: number;
    currency: string;
}

interface Interview {
    id: string;
    type: 'phone' | 'video' | 'onsite' | 'technical' | 'hr';
    scheduledAt: string;
    duration?: number;
    location?: string;
    interviewers?: string[];
    notes?: string;
    completed: boolean;
    feedback?: string;
}

interface Application {
    id: string;
    companyName: string;
    companyWebsite: string;
    companyLogo: string;
    jobTitle: string;
    jobUrl: string;
    jobDescription: string;
    salary?: SalaryRange;
    location: string;
    remote: RemoteType;
    status: ApplicationStatus;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    notes: string;
    interviews: Interview[];
    appliedAt?: string;
    source: string;
    createdAt: string;
    updatedAt: string;
}

interface CreateApplicationForm {
    companyName: string;
    jobTitle: string;
    companyWebsite: string;
    jobUrl: string;
    jobDescription: string;
    location: string;
    remote: RemoteType;
    salaryMin?: number;
    salaryMax?: number;
    contactName: string;
    contactEmail: string;
    notes: string;
    source: string;
}

const defaultForm: CreateApplicationForm = {
    companyName: '',
    jobTitle: '',
    companyWebsite: '',
    jobUrl: '',
    jobDescription: '',
    location: '',
    remote: 'onsite',
    contactName: '',
    contactEmail: '',
    notes: '',
    source: '',
};

const statusLabels: Record<ApplicationStatus, string> = {
    draft: 'Entwurf',
    applied: 'Beworben',
    in_review: 'In Prüfung',
    interview_scheduled: 'Interview geplant',
    interviewed: 'Interview absolviert',
    offer_received: 'Angebot erhalten',
    accepted: 'Angenommen',
    rejected: 'Abgelehnt',
    withdrawn: 'Zurückgezogen',
};

const statusColors: Record<ApplicationStatus, string> = {
    draft: 'gray',
    applied: 'blue',
    in_review: 'cyan',
    interview_scheduled: 'violet',
    interviewed: 'indigo',
    offer_received: 'green',
    accepted: 'teal',
    rejected: 'red',
    withdrawn: 'orange',
};

const remoteLabels: Record<RemoteType, string> = {
    onsite: 'Vor Ort',
    hybrid: 'Hybrid',
    remote: 'Remote',
};

const sourceOptions = [
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'indeed', label: 'Indeed' },
    { value: 'xing', label: 'XING' },
    { value: 'stepstone', label: 'StepStone' },
    { value: 'direct', label: 'Direkt' },
    { value: 'referral', label: 'Empfehlung' },
    { value: 'other', label: 'Sonstige' },
];

const kanbanColumns: { status: ApplicationStatus; label: string }[] = [
    { status: 'draft', label: 'Entwürfe' },
    { status: 'applied', label: 'Beworben' },
    { status: 'interview_scheduled', label: 'Interviews' },
    { status: 'offer_received', label: 'Angebote' },
    { status: 'rejected', label: 'Abgelehnt' },
];

export default function ApplicationsPage() {
    const [opened, { open, close }] = useDisclosure(false);
    const [detailOpened, { open: openDetail, close: closeDetail }] = useDisclosure(false);
    const [editingApp, setEditingApp] = useState<Application | null>(null);
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);
    const [form, setForm] = useState<CreateApplicationForm>(defaultForm);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

    const { data: applications, isLoading, refetch } = useRequest<Application[]>('/applications');
    const { data: stats } = useRequest<{
        total: number;
        byStatus: { status: ApplicationStatus; count: number }[];
        responseRate: number;
        interviewRate: number;
        offerRate: number;
        averageResponseDays: number | null;
    }>('/applications/stats');

    const { mutate: createApp, isLoading: creating } = useMutation<Application, CreateApplicationForm & { salary?: SalaryRange }>(
        '/applications',
        { method: 'POST' }
    );

    const { mutate: updateApp } = useMutation<Application, { id: string; data: Partial<CreateApplicationForm> }>(
        (vars) => `/applications/${vars.id}`,
        { method: 'PATCH' }
    );

    const { mutate: deleteApp } = useMutation<void, { id: string }>(
        (vars) => `/applications/${vars.id}`,
        { method: 'DELETE' }
    );

    const { mutate: updateStatus } = useMutation<Application, { id: string; status: ApplicationStatus; note?: string }>(
        (vars) => `/applications/${vars.id}/status`,
        { method: 'POST' }
    );

    const handleOpenCreate = () => {
        setEditingApp(null);
        setForm(defaultForm);
        open();
    };


