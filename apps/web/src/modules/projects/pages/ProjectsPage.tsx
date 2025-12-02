import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    ColorInput,
    Menu,
    Paper,
    Skeleton,
    Progress,
    ThemeIcon,
    SegmentedControl,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import {
    IconPlus,
    IconSearch,
    IconDotsVertical,
    IconEdit,
    IconTrash,
    IconArchive,
    IconArchiveOff,
    IconTarget,
    IconFlag,
    IconCalendar,
    IconPlayerPlay,
    IconPlayerPause,
    IconCheck,
    IconX,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useRequest, useMutation } from '../../../hooks';


type ProjectType = 'project' | 'goal';
type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';

interface ProjectTask {
    id: string;
    title: string;
    completed: boolean;
}

interface Milestone {
    id: string;
    title: string;
    completed: boolean;
}

interface Project {
    id: string;
    name: string;
    description: string;
    type: ProjectType;
    status: ProjectStatus;
    progress: number;
    targetDate?: string;
    tasks: ProjectTask[];
    milestones: Milestone[];
    color: string;
    isArchived: boolean;
    createdAt: string;
}

interface CreateProjectForm {
    name: string;
    description: string;
    type: ProjectType;
    color: string;
    targetDate?: Date;
}

const defaultForm: CreateProjectForm = {
    name: '',
    description: '',
    type: 'project',
    color: '#228be6',
};

const projectTypeOptions = [
    { value: 'project', label: 'Projekt' },
    { value: 'goal', label: 'Ziel' },
];

const statusOptions = [
    { value: 'planning', label: 'Planung' },
    { value: 'active', label: 'Aktiv' },
    { value: 'on_hold', label: 'Pausiert' },
    { value: 'completed', label: 'Abgeschlossen' },
    { value: 'cancelled', label: 'Abgebrochen' },
];

const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
        case 'planning': return 'gray';
        case 'active': return 'blue';
        case 'on_hold': return 'yellow';
        case 'completed': return 'green';
        case 'cancelled': return 'red';
    }
};

const getStatusIcon = (status: ProjectStatus) => {
    switch (status) {
        case 'planning': return IconCalendar;
        case 'active': return IconPlayerPlay;
        case 'on_hold': return IconPlayerPause;
        case 'completed': return IconCheck;
        case 'cancelled': return IconX;
    }
};

export default function ProjectsPage() {
    const navigate = useNavigate();
    const [opened, { open, close }] = useDisclosure(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [form, setForm] = useState<CreateProjectForm>(defaultForm);
    const [searchQuery, setSearchQuery] = useState('');
    const [view, setView] = useState<'active' | 'archived'>('active');
    const [filterType, setFilterType] = useState<ProjectType | 'all'>('all');

    const { data: projects, isLoading, refetch } = useRequest<Project[]>('/projects');
    const { data: archivedProjects, refetch: refetchArchived } = useRequest<Project[]>('/projects/archived');

    const { mutate: createProject, isLoading: creating } = useMutation<Project, CreateProjectForm>(
        '/projects',
        { method: 'POST' }
    );

    const { mutate: updateProject } = useMutation<Project, { id: string; data: Partial<Project> }>(
        (vars) => `/projects/${vars.id}`,
        { method: 'PATCH' }
    );

    const { mutate: deleteProject } = useMutation<void, { id: string }>(
        (vars) => `/projects/${vars.id}`,
        { method: 'DELETE' }
    );

    const { mutate: archiveProject } = useMutation<Project, { id: string }>(
        (vars) => `/projects/${vars.id}/archive`,
        { method: 'POST' }
    );

    const { mutate: unarchiveProject } = useMutation<Project, { id: string }>(
        (vars) => `/projects/${vars.id}/unarchive`,
        { method: 'POST' }
    );

    const handleOpenCreate = () => {
        setEditingProject(null);
        setForm(defaultForm);
        open();
    };


