import { http, HttpBody, HttpQueries, HttpNotFoundError } from '@deepkit/http';
import { MediaItemService, CreateMediaItemDto, UpdateMediaItemDto } from './media-item.service';
import { User, MediaType, MediaStatus } from '@ycmm/core';

interface MediaFilters {
    type?: MediaType;
    status?: MediaStatus;
}

@http.controller('/api/media')
export class MediaItemController {
    constructor(private mediaItemService: MediaItemService) {}

    @(http.GET('').group('auth-required'))
    async getAll(user: User, queries: HttpQueries<MediaFilters>) {
        if (queries.type) {
            return this.mediaItemService.getByType(user.id, queries.type);
        }
        if (queries.status) {
            return this.mediaItemService.getByStatus(user.id, queries.status);
        }
        return this.mediaItemService.getAll(user.id);
    }

    @(http.GET('stats').group('auth-required'))
    async getStats(user: User) {
        return this.mediaItemService.getStats(user.id);
    }

    @(http.GET(':id').group('auth-required'))
    async getById(id: string, user: User) {
        const item = await this.mediaItemService.getById(id, user.id);
        if (!item) {
            throw new HttpNotFoundError('Media item not found');
        }
        return item;
    }

    @(http.POST('').group('auth-required'))
    async create(body: HttpBody<CreateMediaItemDto>, user: User) {
        return await this.mediaItemService.create(user.id, body);
    }

    @(http.PATCH(':id').group('auth-required'))
    async update(id: string, body: HttpBody<UpdateMediaItemDto>, user: User) {
        const item = await this.mediaItemService.update(id, user.id, body);
        if (!item) {
            throw new HttpNotFoundError('Media item not found');
        }
        return item;
    }

    @(http.PATCH(':id/progress').group('auth-required'))
    async updateProgress(id: string, body: HttpBody<{ current: number }>, user: User) {
        const item = await this.mediaItemService.updateProgress(id, user.id, body.current);
        if (!item) {
            throw new HttpNotFoundError('Media item not found or no progress tracking');
        }
        return item;
    }

    @(http.DELETE(':id').group('auth-required'))
    async delete(id: string, user: User) {
        const success = await this.mediaItemService.delete(id, user.id);
        if (!success) {
            throw new HttpNotFoundError('Media item not found');
        }
        return { success: true };
    }
}

// Public profile controller
@http.controller('/api/public/media')
export class PublicMediaController {
    constructor(private mediaItemService: MediaItemService) {}

    @http.GET(':userId')
    async getPublicProfile(userId: string) {
        return this.mediaItemService.getPublicProfile(userId);
    }
}
