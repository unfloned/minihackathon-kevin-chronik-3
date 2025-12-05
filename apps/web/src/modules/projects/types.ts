import type { ProjectSimple, ProjectType, ProjectStatus } from '@ycmm/core';
import { IconCalendar, IconPlayerPlay, IconPlayerPause, IconCheck, IconX } from '@tabler/icons-react';

// Alias for component usage
export type Project = ProjectSimple;

export interface CreateProjectForm {
    name: string;
    description: string;
    type: ProjectType;
    color: string;
    targetDate?: Date;
}

export const defaultForm: CreateProjectForm = {
    name: '',
    description: '',
    type: 'project',
    color: '#228be6',
};

export const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
        case 'planning': return 'gray';
        case 'active': return 'blue';
        case 'on_hold': return 'yellow';
        case 'completed': return 'green';
        case 'cancelled': return 'red';
    }
};

export const getStatusIcon = (status: ProjectStatus) => {
    switch (status) {
        case 'planning': return IconCalendar;
        case 'active': return IconPlayerPlay;
        case 'on_hold': return IconPlayerPause;
        case 'completed': return IconCheck;
        case 'cancelled': return IconX;
    }
};

export const projectTypeOptions = [
    { value: 'project', label: 'Projekt' },
    { value: 'goal', label: 'Ziel' },
];

// Re-export types
export type { ProjectType, ProjectStatus, ProjectTask, Milestone, TaskPriority } from '@ycmm/core';

// Detail page specific types
export interface EditProjectForm {
    name: string;
    description: string;
    color: string;
    targetDate: Date | null;
}

export const defaultEditForm: EditProjectForm = {
    name: '',
    description: '',
    color: '#228be6',
    targetDate: null,
};

export const statusOptions = [
    { value: 'planning', label: 'Planung', icon: IconCalendar, color: 'gray' },
    { value: 'active', label: 'Aktiv', icon: IconPlayerPlay, color: 'blue' },
    { value: 'on_hold', label: 'Pausiert', icon: IconPlayerPause, color: 'yellow' },
    { value: 'completed', label: 'Abgeschlossen', icon: IconCheck, color: 'green' },
    { value: 'cancelled', label: 'Abgebrochen', icon: IconX, color: 'red' },
];

export const priorityOptions = [
    { value: 'low', label: 'Niedrig', color: 'gray' },
    { value: 'medium', label: 'Mittel', color: 'yellow' },
    { value: 'high', label: 'Hoch', color: 'red' },
];
