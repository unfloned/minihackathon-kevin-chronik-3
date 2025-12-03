import { entity, PrimaryKey, Reference, uuid, UUID } from '@deepkit/type';
import { User } from './user.entity.js';

export type ProjectType = 'project' | 'goal';
export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface ProjectTask {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    dueDate?: string;
    priority: TaskPriority;
    order: number;
}

export interface Milestone {
    id: string;
    title: string;
    description?: string;
    targetDate?: string;
    completed: boolean;
    completedAt?: string;
}

@entity.name('projects')
export class Project {
    id: UUID & PrimaryKey = uuid();
    user!: User & Reference;

    name: string = '';
    description: string = '';

    type: ProjectType = 'project';
    status: ProjectStatus = 'planning';
    progress: number = 0;

    startDate?: Date;
    targetDate?: Date;
    completedAt?: Date;

    tasks: ProjectTask[] = [];
    milestones: Milestone[] = [];

    category: string = '';
    tags: string[] = [];
    color: string = '#228be6';
    icon: string = '';

    isArchived: boolean = false;
    createdAt: Date = new Date();
    updatedAt: Date = new Date();
}

export type ProjectFrontend = Readonly<Project>;
