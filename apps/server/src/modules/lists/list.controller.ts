import { http, HttpBody, HttpNotFoundError } from '@deepkit/http';
import { ListService, CreateListDto, UpdateListDto, AddListItemDto, UpdateListItemDto } from './list.service';
import { User, ListType } from '@ycmm/core';

@http.controller('/api/lists')
export class ListController {
    constructor(private listService: ListService) {}

    @(http.GET('').group('auth-required'))
    async getAll(user: User) {
        return this.listService.getAll(user.id);
    }

    @(http.GET('/archived').group('auth-required'))
    async getArchived(user: User) {
        return this.listService.getArchived(user.id);
    }

    @(http.GET('/templates').group('auth-required'))
    async getTemplates(user: User) {
        return this.listService.getTemplates(user.id);
    }

    @(http.GET('/type/:type').group('auth-required'))
    async getByType(type: ListType, user: User) {
        return this.listService.getByType(user.id, type);
    }

    @(http.GET('/:id').group('auth-required'))
    async getById(id: string, user: User) {
        const list = await this.listService.getById(id, user.id);
        if (!list) {
            throw new HttpNotFoundError('Liste nicht gefunden');
        }
        return list;
    }

    @(http.GET('/:id/progress').group('auth-required'))
    async getProgress(id: string, user: User) {
        const progress = await this.listService.getProgress(id, user.id);
        if (!progress) {
            throw new HttpNotFoundError('Liste nicht gefunden');
        }
        return progress;
    }

    @(http.POST('').group('auth-required'))
    async create(body: HttpBody<CreateListDto>, user: User) {
        return this.listService.create(user.id, body);
    }

    @(http.POST('/from-template/:templateId').group('auth-required'))
    async createFromTemplate(
        templateId: string,
        body: HttpBody<{ name: string }>,
        user: User
    ) {
        const list = await this.listService.createFromTemplate(user.id, templateId, body.name);
        if (!list) {
            throw new HttpNotFoundError('Template nicht gefunden');
        }
        return list;
    }

    @(http.PATCH('/:id').group('auth-required'))
    async update(id: string, body: HttpBody<UpdateListDto>, user: User) {
        const list = await this.listService.update(id, user.id, body);
        if (!list) {
            throw new HttpNotFoundError('Liste nicht gefunden');
        }
        return list;
    }

    @(http.DELETE('/:id').group('auth-required'))
    async delete(id: string, user: User) {
        const success = await this.listService.delete(id, user.id);
        if (!success) {
            throw new HttpNotFoundError('Liste nicht gefunden');
        }
    }

    @(http.POST('/:id/archive').group('auth-required'))
    async archive(id: string, user: User) {
        const list = await this.listService.archive(id, user.id);
        if (!list) {
            throw new HttpNotFoundError('Liste nicht gefunden');
        }
        return list;
    }

    @(http.POST('/:id/unarchive').group('auth-required'))
    async unarchive(id: string, user: User) {
        const list = await this.listService.unarchive(id, user.id);
        if (!list) {
            throw new HttpNotFoundError('Liste nicht gefunden');
        }
        return list;
    }

    // Item endpoints
    @(http.POST('/:id/items').group('auth-required'))
    async addItem(id: string, body: HttpBody<AddListItemDto>, user: User) {
        const list = await this.listService.addItem(id, user.id, body);
        if (!list) {
            throw new HttpNotFoundError('Liste nicht gefunden');
        }
        return list;
    }

    @(http.PATCH('/:listId/items/:itemId').group('auth-required'))
    async updateItem(
        listId: string,
        itemId: string,
        body: HttpBody<UpdateListItemDto>,
        user: User
    ) {
        const list = await this.listService.updateItem(listId, user.id, itemId, body);
        if (!list) {
            throw new HttpNotFoundError('Liste oder Item nicht gefunden');
        }
        return list;
    }

    @(http.DELETE('/:listId/items/:itemId').group('auth-required'))
    async deleteItem(listId: string, itemId: string, user: User) {
        const list = await this.listService.deleteItem(listId, user.id, itemId);
        if (!list) {
            throw new HttpNotFoundError('Liste oder Item nicht gefunden');
        }
        return list;
    }

    @(http.POST('/:listId/items/:itemId/toggle').group('auth-required'))
    async toggleItem(listId: string, itemId: string, user: User) {
        const list = await this.listService.toggleItem(listId, user.id, itemId);
        if (!list) {
            throw new HttpNotFoundError('Liste oder Item nicht gefunden');
        }
        return list;
    }

    @(http.POST('/:id/reorder').group('auth-required'))
    async reorderItems(id: string, body: HttpBody<{ itemIds: string[] }>, user: User) {
        const list = await this.listService.reorderItems(id, user.id, body.itemIds);
        if (!list) {
            throw new HttpNotFoundError('Liste nicht gefunden');
        }
        return list;
    }

    @(http.POST('/:id/clear-completed').group('auth-required'))
    async clearCompleted(id: string, user: User) {
        const list = await this.listService.clearCompleted(id, user.id);
        if (!list) {
            throw new HttpNotFoundError('Liste nicht gefunden');
        }
        return list;
    }
}

// Public controller for shared lists
@http.controller('/api/public/lists')
export class PublicListController {
    constructor(private listService: ListService) {}

    @http.GET('/:slug')
    async getBySlug(slug: string) {
        const list = await this.listService.getByPublicSlug(slug);
        if (!list) {
            throw new HttpNotFoundError('Liste nicht gefunden');
        }
        // Return public view without sensitive data
        return {
            name: list.name,
            description: list.description,
            type: list.type,
            icon: list.icon,
            color: list.color,
            items: list.items.map(item => ({
                id: item.id,
                text: item.text,
                completed: item.completed,
                quantity: item.quantity,
                unit: item.unit,
                priority: item.priority,
                order: item.order,
            })),
        };
    }
}
