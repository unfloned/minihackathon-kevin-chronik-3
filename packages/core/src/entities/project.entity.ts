import { entity, PrimaryKey, Index } from '@deepkit/type';

export type ProjectType = 'project' | 'goal';
export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface ProjectTask {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    dueDate?: Date;
    priority: TaskPriority;
    order: number;
}

export interface Milestone {
    id: string;
    title: string;
    description?: string;
    targetDate: Date;
    completed: boolean;
    completedAt?: Date;
}

@entity.name('projects')
export class Project {
    id: string & PrimaryKey = '';
    userId: string & Index = '';
    name: string = '';
    description: string = '';

    // Type
    type: ProjectType = 'project';

    // Status
    status: ProjectStatus = 'planning';
    progress: number = 0; // 0-100

    // Timeline
    startDate?: Date;
    targetDate?: Date;
    completedAt?: Date;

    // Tasks
    tasks: ProjectTask[] = [];

    // Milestones (for goals)
    milestones: Milestone[] = [];

    // Categorization
    category: string = '';
    tags: string[] = [];
    color: string = '#228be6';
    icon: string = '';

    // Meta
    isArchived: boolean = false;
    createdAt: Date = new Date();
    updatedAt: Date = new Date();
}
