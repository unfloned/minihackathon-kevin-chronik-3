import { http, HttpBody, HttpNotFoundError, HttpQuery } from '@deepkit/http';
import { InventoryItemService, CreateInventoryItemDto, UpdateInventoryItemDto, LendItemDto } from './inventory-item.service';
import { User } from '@ycmm/core';

@http.controller('/api/inventory')
export class InventoryItemController {
    constructor(private inventoryItemService: InventoryItemService) {}

    @(http.GET('').group('auth-required'))
    async getAll(user: User) {
        return this.inventoryItemService.getAll(user.id);
    }

    @(http.GET('/search').group('auth-required'))
    async search(user: User, query: HttpQuery<{ q: string }>) {
        return this.inventoryItemService.search(user.id, query.q);
    }

    @(http.GET('/stats').group('auth-required'))
    async getStats(user: User) {
        return this.inventoryItemService.getStats(user.id);
    }

    @(http.GET('/categories').group('auth-required'))
    async getCategories(user: User) {
        return this.inventoryItemService.getCategories(user.id);
    }

    @(http.GET('/locations').group('auth-required'))
    async getLocations(user: User) {
        return this.inventoryItemService.getLocations(user.id);
    }

    @(http.GET('/lent').group('auth-required'))
    async getLentItems(user: User) {
        return this.inventoryItemService.getLentItems(user.id);
    }

    @(http.GET('/category/:category').group('auth-required'))
    async getByCategory(category: string, user: User) {
        return this.inventoryItemService.getByCategory(user.id, category);
    }

    @(http.GET('/location/:area').group('auth-required'))
    async getByLocation(area: string, user: User) {
        return this.inventoryItemService.getByLocation(user.id, area);
    }

    @(http.GET('/:id').group('auth-required'))
    async getById(id: string, user: User) {
        const item = await this.inventoryItemService.getById(id, user.id);
        if (!item) {
            throw new HttpNotFoundError('Item nicht gefunden');
        }
        return item;
    }

    @(http.POST('').group('auth-required'))
    async create(body: HttpBody<CreateInventoryItemDto>, user: User) {
        return await this.inventoryItemService.create(user.id, body);
    }

    @(http.PATCH('/:id').group('auth-required'))
    async update(id: string, body: HttpBody<UpdateInventoryItemDto>, user: User) {
        const item = await this.inventoryItemService.update(id, user.id, body);
        if (!item) {
            throw new HttpNotFoundError('Item nicht gefunden');
        }
        return item;
    }

    @(http.DELETE('/:id').group('auth-required'))
    async delete(id: string, user: User) {
        const success = await this.inventoryItemService.delete(id, user.id);
        if (!success) {
            throw new HttpNotFoundError('Item nicht gefunden');
        }
    }

    @(http.POST('/:id/lend').group('auth-required'))
    async lendItem(id: string, body: HttpBody<LendItemDto>, user: User) {
        const item = await this.inventoryItemService.lendItem(id, user.id, body);
        if (!item) {
            throw new HttpNotFoundError('Item nicht gefunden');
        }
        return item;
    }

    @(http.POST('/:id/return').group('auth-required'))
    async returnItem(id: string, user: User) {
        const item = await this.inventoryItemService.returnItem(id, user.id);
        if (!item) {
            throw new HttpNotFoundError('Item nicht gefunden');
        }
        return item;
    }
}
