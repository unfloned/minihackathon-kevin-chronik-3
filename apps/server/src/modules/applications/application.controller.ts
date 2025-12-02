import { http, HttpBody, HttpNotFoundError } from '@deepkit/http';
import { ApplicationService, CreateApplicationDto, UpdateApplicationDto, AddInterviewDto, UpdateInterviewDto } from './application.service';
import { User, ApplicationStatus } from '@ycmm/core';

@http.controller('/api/applications')
export class ApplicationController {
    constructor(private applicationService: ApplicationService) {}

    @(http.GET('').group('auth-required'))
    async getAll(user: User) {
        return this.applicationService.getAll(user.id);
    }

    @(http.GET('/stats').group('auth-required'))
    async getStats(user: User) {
        return this.applicationService.getStats(user.id);
    }

    @(http.GET('/status/:status').group('auth-required'))
    async getByStatus(status: ApplicationStatus, user: User) {
        return this.applicationService.getByStatus(user.id, status);
    }

    @(http.GET('/:id').group('auth-required'))
    async getById(id: string, user: User) {
        const app = await this.applicationService.getById(id, user.id);
        if (!app) {
            throw new HttpNotFoundError('Bewerbung nicht gefunden');
        }
        return app;
    }

    @(http.POST('').group('auth-required'))
    async create(body: HttpBody<CreateApplicationDto>, user: User) {
        return this.applicationService.create(user.id, body);
    }

    @(http.PATCH('/:id').group('auth-required'))
    async update(id: string, body: HttpBody<UpdateApplicationDto>, user: User) {
        const app = await this.applicationService.update(id, user.id, body);
        if (!app) {
            throw new HttpNotFoundError('Bewerbung nicht gefunden');
        }
        return app;
    }

    @(http.DELETE('/:id').group('auth-required'))
    async delete(id: string, user: User) {
        const success = await this.applicationService.delete(id, user.id);
        if (!success) {
            throw new HttpNotFoundError('Bewerbung nicht gefunden');
        }
    }

    @(http.POST('/:id/status').group('auth-required'))
    async updateStatus(
        id: string,
        body: HttpBody<{ status: ApplicationStatus; note?: string }>,
        user: User
    ) {
        const app = await this.applicationService.updateStatus(id, user.id, body.status, body.note);
        if (!app) {
            throw new HttpNotFoundError('Bewerbung nicht gefunden');
        }
        return app;
    }

    // Interview endpoints
    @(http.POST('/:id/interviews').group('auth-required'))
    async addInterview(id: string, body: HttpBody<AddInterviewDto>, user: User) {
        const app = await this.applicationService.addInterview(id, user.id, body);
        if (!app) {
            throw new HttpNotFoundError('Bewerbung nicht gefunden');
        }
        return app;
    }

    @(http.PATCH('/:appId/interviews/:interviewId').group('auth-required'))
    async updateInterview(
        appId: string,
        interviewId: string,
        body: HttpBody<UpdateInterviewDto>,
        user: User
    ) {
        const app = await this.applicationService.updateInterview(appId, user.id, interviewId, body);
        if (!app) {
            throw new HttpNotFoundError('Bewerbung oder Interview nicht gefunden');
        }
        return app;
    }

    @(http.DELETE('/:appId/interviews/:interviewId').group('auth-required'))
    async deleteInterview(appId: string, interviewId: string, user: User) {
        const app = await this.applicationService.deleteInterview(appId, user.id, interviewId);
        if (!app) {
            throw new HttpNotFoundError('Bewerbung oder Interview nicht gefunden');
        }
        return app;
    }
}
