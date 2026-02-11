import { http, HttpBody, HttpNotFoundError } from '@deepkit/http';
import { SubscriptionService, CreateSubscriptionDto, UpdateSubscriptionDto } from './subscription.service';
import { User } from '@ycmm/core';

@http.controller('/api/subscriptions')
export class SubscriptionController {
    constructor(private subscriptionService: SubscriptionService) {}

    @(http.GET('').group('auth-required'))
    async getAll(user: User) {
        return this.subscriptionService.getAll(user.id);
    }

    @(http.GET('/active').group('auth-required'))
    async getActive(user: User) {
        return this.subscriptionService.getActive(user.id);
    }

    @(http.GET('/stats').group('auth-required'))
    async getStats(user: User) {
        return this.subscriptionService.getStats(user.id);
    }

    @(http.GET('/:id').group('auth-required'))
    async getById(id: string, user: User) {
        const subscription = await this.subscriptionService.getById(id, user.id);
        if (!subscription) {
            throw new HttpNotFoundError('Abo nicht gefunden');
        }
        return subscription;
    }

    @(http.POST('').group('auth-required'))
    async create(body: HttpBody<CreateSubscriptionDto>, user: User) {
        return await this.subscriptionService.create(user.id, body);
    }

    @(http.PATCH('/:id').group('auth-required'))
    async update(id: string, body: HttpBody<UpdateSubscriptionDto>, user: User) {
        const subscription = await this.subscriptionService.update(id, user.id, body);
        if (!subscription) {
            throw new HttpNotFoundError('Abo nicht gefunden');
        }
        return subscription;
    }

    @(http.POST('/:id/cancel').group('auth-required'))
    async cancel(id: string, user: User) {
        const subscription = await this.subscriptionService.cancel(id, user.id);
        if (!subscription) {
            throw new HttpNotFoundError('Abo nicht gefunden');
        }
        return subscription;
    }

    @(http.POST('/:id/pause').group('auth-required'))
    async pause(id: string, user: User) {
        const subscription = await this.subscriptionService.pause(id, user.id);
        if (!subscription) {
            throw new HttpNotFoundError('Abo nicht gefunden');
        }
        return subscription;
    }

    @(http.POST('/:id/resume').group('auth-required'))
    async resume(id: string, user: User) {
        const subscription = await this.subscriptionService.resume(id, user.id);
        if (!subscription) {
            throw new HttpNotFoundError('Abo nicht gefunden');
        }
        return subscription;
    }

    @(http.DELETE('/:id').group('auth-required'))
    async delete(id: string, user: User) {
        const success = await this.subscriptionService.delete(id, user.id);
        if (!success) {
            throw new HttpNotFoundError('Abo nicht gefunden');
        }
    }
}
