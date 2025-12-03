import { Project, ProjectTask, Milestone, ProjectType, ProjectStatus, TaskPriority, User } from '@ycmm/core';
import { AppDatabase } from '../../app/database';
import crypto from 'crypto';

export interface CreateProjectDto {
    name: string;
    description?: string;
    type: ProjectType;
    category?: string;
    tags?: string[];
    color?: string;
    startDate?: Date;
    targetDate?: Date;
}

export interface UpdateProjectDto {
    name?: string;
    description?: string;
    type?: ProjectType;
    status?: ProjectStatus;
    category?: string;
    tags?: string[];
    color?: string;
    startDate?: Date;
    targetDate?: Date;
}

export interface AddTaskDto {
    title: string;
    description?: string;
    dueDate?: string; // ISO date string
    priority?: TaskPriority;
}

export interface UpdateTaskDto {
    title?: string;
    description?: string;
    completed?: boolean;
    dueDate?: string; // ISO date string
    priority?: TaskPriority;
    order?: number;
}

export interface AddMilestoneDto {
    title: string;
    description?: string;
    targetDate?: string; // ISO date string
}

export interface UpdateMilestoneDto {
    title?: string;
    description?: string;
    targetDate?: string; // ISO date string
    completed?: boolean;
}

export class ProjectService {
    constructor(private database: AppDatabase) {}

    private calculateProgress(project: Project): number {
        if (project.type === 'goal' && project.milestones.length > 0) {
            const completed = project.milestones.filter(m => m.completed).length;
            return Math.round((completed / project.milestones.length) * 100);
        } else if (project.tasks.length > 0) {
            const completed = project.tasks.filter(t => t.completed).length;
            return Math.round((completed / project.tasks.length) * 100);
        }
        return 0;
    }

    async getAll(userId: string): Promise<Project[]> {
        return this.database.query(Project)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .filter({ isArchived: false })
            .orderBy('createdAt', 'desc')
            .find();
    }

    async getArchived(userId: string): Promise<Project[]> {
        return this.database.query(Project)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .filter({ isArchived: true })
            .orderBy('updatedAt', 'desc')
            .find();
    }

    async getByStatus(userId: string, status: ProjectStatus): Promise<Project[]> {
        return this.database.query(Project)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .filter({ status, isArchived: false })
            .orderBy('createdAt', 'desc')
            .find();
    }

    async getByType(userId: string, type: ProjectType): Promise<Project[]> {
        return this.database.query(Project)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .filter({ type, isArchived: false })
            .orderBy('createdAt', 'desc')
            .find();
    }

    async getById(id: string, userId: string): Promise<Project | undefined> {
        return this.database.query(Project)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .filter({ id })
            .findOneOrUndefined();
    }

    async create(userId: string, dto: CreateProjectDto): Promise<Project> {
        const project = new Project();
        project.user = this.database.getReference(User, userId);
        project.name = dto.name;
        project.description = dto.description || '';
        project.type = dto.type;
        project.category = dto.category || '';
        project.tags = dto.tags || [];
        project.color = dto.color || '#228be6';
        project.startDate = dto.startDate;
        project.targetDate = dto.targetDate;
        project.status = 'planning';
        project.tasks = [];
        project.milestones = [];
        project.createdAt = new Date();
        project.updatedAt = new Date();

        await this.database.persist(project);
        return project;
    }

    async update(id: string, userId: string, dto: UpdateProjectDto): Promise<Project | null> {
        const project = await this.getById(id, userId);
        if (!project) return null;

        if (dto.name !== undefined) project.name = dto.name;
        if (dto.description !== undefined) project.description = dto.description;
        if (dto.type !== undefined) project.type = dto.type;
        if (dto.status !== undefined) {
            project.status = dto.status;
            if (dto.status === 'completed' && !project.completedAt) {
                project.completedAt = new Date();
            }
        }
        if (dto.category !== undefined) project.category = dto.category;
        if (dto.tags !== undefined) project.tags = dto.tags;
        if (dto.color !== undefined) project.color = dto.color;
        if (dto.startDate !== undefined) project.startDate = dto.startDate;
        if (dto.targetDate !== undefined) project.targetDate = dto.targetDate;
        project.updatedAt = new Date();

        await this.database.persist(project);
        return project;
    }

    async delete(id: string, userId: string): Promise<boolean> {
        const project = await this.getById(id, userId);
        if (!project) return false;

        await this.database.remove(project);
        return true;
    }

    async archive(id: string, userId: string): Promise<Project | null> {
        const project = await this.getById(id, userId);
        if (!project) return null;

        project.isArchived = true;
        project.updatedAt = new Date();

        await this.database.persist(project);
        return project;
    }

    async unarchive(id: string, userId: string): Promise<Project | null> {
        const project = await this.getById(id, userId);
        if (!project) return null;

        project.isArchived = false;
        project.updatedAt = new Date();

        await this.database.persist(project);
        return project;
    }

    // Task operations
    async addTask(id: string, userId: string, dto: AddTaskDto): Promise<Project | null> {
        const project = await this.getById(id, userId);
        if (!project) return null;

        const newTask: ProjectTask = {
            id: crypto.randomUUID(),
            title: dto.title,
            description: dto.description,
            completed: false,
            dueDate: dto.dueDate,
            priority: dto.priority || 'medium',
            order: project.tasks.length,
        };

        project.tasks.push(newTask);
        project.progress = this.calculateProgress(project);
        project.updatedAt = new Date();

        await this.database.persist(project);
        return project;
    }

    async updateTask(projectId: string, userId: string, taskId: string, dto: UpdateTaskDto): Promise<Project | null> {
        const project = await this.getById(projectId, userId);
        if (!project) return null;

        const taskIndex = project.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return null;

        const task = project.tasks[taskIndex];
        if (dto.title !== undefined) task.title = dto.title;
        if (dto.description !== undefined) task.description = dto.description;
        if (dto.completed !== undefined) task.completed = dto.completed;
        if (dto.dueDate !== undefined) task.dueDate = dto.dueDate;
        if (dto.priority !== undefined) task.priority = dto.priority;
        if (dto.order !== undefined) task.order = dto.order;

        project.progress = this.calculateProgress(project);
        project.updatedAt = new Date();

        await this.database.persist(project);
        return project;
    }

    async deleteTask(projectId: string, userId: string, taskId: string): Promise<Project | null> {
        const project = await this.getById(projectId, userId);
        if (!project) return null;

        const taskIndex = project.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return null;

        project.tasks.splice(taskIndex, 1);
        project.tasks.forEach((task, index) => {
            task.order = index;
        });
        project.progress = this.calculateProgress(project);
        project.updatedAt = new Date();

        await this.database.persist(project);
        return project;
    }

    async toggleTask(projectId: string, userId: string, taskId: string): Promise<Project | null> {
        const project = await this.getById(projectId, userId);
        if (!project) return null;

        const task = project.tasks.find(t => t.id === taskId);
        if (!task) return null;

        task.completed = !task.completed;
        project.progress = this.calculateProgress(project);
        project.updatedAt = new Date();

        await this.database.persist(project);
        return project;
    }

    // Milestone operations
    async addMilestone(id: string, userId: string, dto: AddMilestoneDto): Promise<Project | null> {
        const project = await this.getById(id, userId);
        if (!project) return null;

        const newMilestone: Milestone = {
            id: crypto.randomUUID(),
            title: dto.title,
            description: dto.description,
            targetDate: dto.targetDate,
            completed: false,
        };

        project.milestones.push(newMilestone);
        project.progress = this.calculateProgress(project);
        project.updatedAt = new Date();

        await this.database.persist(project);
        return project;
    }

    async updateMilestone(projectId: string, userId: string, milestoneId: string, dto: UpdateMilestoneDto): Promise<Project | null> {
        const project = await this.getById(projectId, userId);
        if (!project) return null;

        const milestone = project.milestones.find(m => m.id === milestoneId);
        if (!milestone) return null;

        if (dto.title !== undefined) milestone.title = dto.title;
        if (dto.description !== undefined) milestone.description = dto.description;
        if (dto.targetDate !== undefined) milestone.targetDate = dto.targetDate;
        if (dto.completed !== undefined) {
            milestone.completed = dto.completed;
            milestone.completedAt = dto.completed ? new Date().toISOString() : undefined;
        }

        project.progress = this.calculateProgress(project);
        project.updatedAt = new Date();

        await this.database.persist(project);
        return project;
    }

    async deleteMilestone(projectId: string, userId: string, milestoneId: string): Promise<Project | null> {
        const project = await this.getById(projectId, userId);
        if (!project) return null;

        const milestoneIndex = project.milestones.findIndex(m => m.id === milestoneId);
        if (milestoneIndex === -1) return null;

        project.milestones.splice(milestoneIndex, 1);
        project.progress = this.calculateProgress(project);
        project.updatedAt = new Date();

        await this.database.persist(project);
        return project;
    }

    async toggleMilestone(projectId: string, userId: string, milestoneId: string): Promise<Project | null> {
        const project = await this.getById(projectId, userId);
        if (!project) return null;

        const milestone = project.milestones.find(m => m.id === milestoneId);
        if (!milestone) return null;

        milestone.completed = !milestone.completed;
        milestone.completedAt = milestone.completed ? new Date().toISOString() : undefined;
        project.progress = this.calculateProgress(project);
        project.updatedAt = new Date();

        await this.database.persist(project);
        return project;
    }

    async getStats(userId: string): Promise<{
        total: number;
        active: number;
        completed: number;
        projects: number;
        goals: number;
    }> {
        const all = await this.database.query(Project)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .filter({ isArchived: false })
            .find();

        return {
            total: all.length,
            active: all.filter(p => p.status === 'active').length,
            completed: all.filter(p => p.status === 'completed').length,
            projects: all.filter(p => p.type === 'project').length,
            goals: all.filter(p => p.type === 'goal').length,
        };
    }
}
