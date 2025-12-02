import { http, HttpBody, HttpNotFoundError } from '@deepkit/http';
import { ProjectService, CreateProjectDto, UpdateProjectDto, AddTaskDto, UpdateTaskDto, AddMilestoneDto, UpdateMilestoneDto } from './project.service';
import { User, ProjectType, ProjectStatus } from '@ycmm/core';

@http.controller('/api/projects')
export class ProjectController {
    constructor(private projectService: ProjectService) {}

    @(http.GET('').group('auth-required'))
    async getAll(user: User) {
        return this.projectService.getAll(user.id);
    }

    @(http.GET('/archived').group('auth-required'))
    async getArchived(user: User) {
        return this.projectService.getArchived(user.id);
    }

    @(http.GET('/stats').group('auth-required'))
    async getStats(user: User) {
        return this.projectService.getStats(user.id);
    }

    @(http.GET('/status/:status').group('auth-required'))
    async getByStatus(status: ProjectStatus, user: User) {
        return this.projectService.getByStatus(user.id, status);
    }

    @(http.GET('/type/:type').group('auth-required'))
    async getByType(type: ProjectType, user: User) {
        return this.projectService.getByType(user.id, type);
    }

    @(http.GET('/:id').group('auth-required'))
    async getById(id: string, user: User) {
        const project = await this.projectService.getById(id, user.id);
        if (!project) {
            throw new HttpNotFoundError('Projekt nicht gefunden');
        }
        return project;
    }

    @(http.POST('').group('auth-required'))
    async create(body: HttpBody<CreateProjectDto>, user: User) {
        return this.projectService.create(user.id, body);
    }

    @(http.PATCH('/:id').group('auth-required'))
    async update(id: string, body: HttpBody<UpdateProjectDto>, user: User) {
        const project = await this.projectService.update(id, user.id, body);
        if (!project) {
            throw new HttpNotFoundError('Projekt nicht gefunden');
        }
        return project;
    }

    @(http.DELETE('/:id').group('auth-required'))
    async delete(id: string, user: User) {
        const success = await this.projectService.delete(id, user.id);
        if (!success) {
            throw new HttpNotFoundError('Projekt nicht gefunden');
        }
    }

    @(http.POST('/:id/archive').group('auth-required'))
    async archive(id: string, user: User) {
        const project = await this.projectService.archive(id, user.id);
        if (!project) {
            throw new HttpNotFoundError('Projekt nicht gefunden');
        }
        return project;
    }

    @(http.POST('/:id/unarchive').group('auth-required'))
    async unarchive(id: string, user: User) {
        const project = await this.projectService.unarchive(id, user.id);
        if (!project) {
            throw new HttpNotFoundError('Projekt nicht gefunden');
        }
        return project;
    }

    // Task endpoints
    @(http.POST('/:id/tasks').group('auth-required'))
    async addTask(id: string, body: HttpBody<AddTaskDto>, user: User) {
        const project = await this.projectService.addTask(id, user.id, body);
        if (!project) {
            throw new HttpNotFoundError('Projekt nicht gefunden');
        }
        return project;
    }

    @(http.PATCH('/:projectId/tasks/:taskId').group('auth-required'))
    async updateTask(
        projectId: string,
        taskId: string,
        body: HttpBody<UpdateTaskDto>,
        user: User
    ) {
        const project = await this.projectService.updateTask(projectId, user.id, taskId, body);
        if (!project) {
            throw new HttpNotFoundError('Projekt oder Task nicht gefunden');
        }
        return project;
    }

    @(http.DELETE('/:projectId/tasks/:taskId').group('auth-required'))
    async deleteTask(projectId: string, taskId: string, user: User) {
        const project = await this.projectService.deleteTask(projectId, user.id, taskId);
        if (!project) {
            throw new HttpNotFoundError('Projekt oder Task nicht gefunden');
        }
        return project;
    }

    @(http.POST('/:projectId/tasks/:taskId/toggle').group('auth-required'))
    async toggleTask(projectId: string, taskId: string, user: User) {
        const project = await this.projectService.toggleTask(projectId, user.id, taskId);
        if (!project) {
            throw new HttpNotFoundError('Projekt oder Task nicht gefunden');
        }
        return project;
    }

    // Milestone endpoints
    @(http.POST('/:id/milestones').group('auth-required'))
    async addMilestone(id: string, body: HttpBody<AddMilestoneDto>, user: User) {
        const project = await this.projectService.addMilestone(id, user.id, body);
        if (!project) {
            throw new HttpNotFoundError('Projekt nicht gefunden');
        }
        return project;
    }

    @(http.PATCH('/:projectId/milestones/:milestoneId').group('auth-required'))
    async updateMilestone(
        projectId: string,
        milestoneId: string,
        body: HttpBody<UpdateMilestoneDto>,
        user: User
    ) {
        const project = await this.projectService.updateMilestone(projectId, user.id, milestoneId, body);
        if (!project) {
            throw new HttpNotFoundError('Projekt oder Meilenstein nicht gefunden');
        }
        return project;
    }

    @(http.DELETE('/:projectId/milestones/:milestoneId').group('auth-required'))
    async deleteMilestone(projectId: string, milestoneId: string, user: User) {
        const project = await this.projectService.deleteMilestone(projectId, user.id, milestoneId);
        if (!project) {
            throw new HttpNotFoundError('Projekt oder Meilenstein nicht gefunden');
        }
        return project;
    }

    @(http.POST('/:projectId/milestones/:milestoneId/toggle').group('auth-required'))
    async toggleMilestone(projectId: string, milestoneId: string, user: User) {
        const project = await this.projectService.toggleMilestone(projectId, user.id, milestoneId);
        if (!project) {
            throw new HttpNotFoundError('Projekt oder Meilenstein nicht gefunden');
        }
        return project;
    }
}
