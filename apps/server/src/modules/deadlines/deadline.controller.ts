import { http, HttpBody, HttpNotFoundError } from '@deepkit/http';
import { DeadlineService, CreateDeadlineDto, UpdateDeadlineDto } from './deadline.service';
import { User } from '@ycmm/core';

@http.controller('/api/deadlines')
export class DeadlineController {
    constructor(private deadlineService: DeadlineService) {}

    @(http.GET('').group('auth-required'))
    async getAll(user: User) {
        return this.deadlineService.getAll(user.id);
    }

    @(http.GET('/upcoming').group('auth-required'))
    async getUpcoming(user: User) {
        return this.deadlineService.getUpcoming(user.id, 14);
    }

    @(http.GET('/overdue').group('auth-required'))
    async getOverdue(user: User) {
        return this.deadlineService.getOverdue(user.id);
    }

    @(http.GET('/stats').group('auth-required'))
    async getStats(user: User) {
        return this.deadlineService.getStats(user.id);
    }

    @(http.GET('/:id').group('auth-required'))
    async getById(id: string, user: User) {
        const deadline = await this.deadlineService.getById(id, user.id);
        if (!deadline) {
            throw new HttpNotFoundError('Frist nicht gefunden');
        }
        return deadline;
    }

    @(http.POST('').group('auth-required'))
    async create(body: HttpBody<CreateDeadlineDto>, user: User) {
        return this.deadlineService.create(user.id, body);
    }

    @(http.PATCH('/:id').group('auth-required'))
    async update(id: string, body: HttpBody<UpdateDeadlineDto>, user: User) {
        const deadline = await this.deadlineService.update(id, user.id, body);
        if (!deadline) {
            throw new HttpNotFoundError('Frist nicht gefunden');
        }
        return deadline;
    }

    @(http.POST('/:id/complete').group('auth-required'))
    async complete(id: string, user: User) {
        const deadline = await this.deadlineService.complete(id, user.id);
        if (!deadline) {
            throw new HttpNotFoundError('Frist nicht gefunden');
        }
        return deadline;
    }

    @(http.DELETE('/:id').group('auth-required'))
    async delete(id: string, user: User) {
        const success = await this.deadlineService.delete(id, user.id);
        if (!success) {
            throw new HttpNotFoundError('Frist nicht gefunden');
        }
    }
}
