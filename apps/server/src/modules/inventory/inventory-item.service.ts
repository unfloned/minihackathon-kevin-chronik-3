import { InventoryItem, ItemLocation, ItemWarranty, ItemLent, User } from '@ycmm/core';
import { AppDatabase } from '../../app/database';
import crypto from 'crypto';

export interface CreateInventoryItemDto {
    name: string;
    description?: string;
    category?: string;
    tags?: string[];
    location: ItemLocation;
    quantity?: number;
    purchaseDate?: Date;
    purchasePrice?: number;
    currentValue?: number;
    serialNumber?: string;
    warranty?: ItemWarranty;
}

export interface UpdateInventoryItemDto {
    name?: string;
    description?: string;
    category?: string;
    tags?: string[];
    location?: ItemLocation;
    quantity?: number;
    purchaseDate?: Date;
    purchasePrice?: number;
    currentValue?: number;
    serialNumber?: string;
    warranty?: ItemWarranty;
}

export interface LendItemDto {
    to: string;
    expectedReturn?: Date;
}

export class InventoryItemService {
    constructor(private database: AppDatabase) {}

    async getAll(userId: string): Promise<InventoryItem[]> {
        return this.database.query(InventoryItem)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .orderBy('name', 'asc')
            .find();
    }

    async getByCategory(userId: string, category: string): Promise<InventoryItem[]> {
        return this.database.query(InventoryItem)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .filter({ category })
            .orderBy('name', 'asc')
            .find();
    }

    async getByLocation(userId: string, area: string): Promise<InventoryItem[]> {
        const items = await this.database.query(InventoryItem)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .find();
        return items.filter(item => item.location.area === area);
    }

    async getLentItems(userId: string): Promise<InventoryItem[]> {
        const items = await this.database.query(InventoryItem)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .find();
        return items.filter(item => item.isLent !== undefined);
    }

    async search(userId: string, query: string): Promise<InventoryItem[]> {
        const items = await this.database.query(InventoryItem)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .find();

        const q = query.toLowerCase();
        return items.filter(item =>
            item.name.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q) ||
            item.location.area.toLowerCase().includes(q) ||
            item.location.container?.toLowerCase().includes(q) ||
            item.tags.some(tag => tag.toLowerCase().includes(q))
        );
    }

    async getById(id: string, userId: string): Promise<InventoryItem | undefined> {
        return this.database.query(InventoryItem)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .filter({ id })
            .findOneOrUndefined();
    }

    async create(userId: string, dto: CreateInventoryItemDto): Promise<InventoryItem> {
        const item = new InventoryItem();
        item.user = this.database.getReference(User, userId);
        item.name = dto.name;
        item.description = dto.description || '';
        item.category = dto.category || '';
        item.tags = dto.tags || [];
        item.location = dto.location;
        item.quantity = dto.quantity || 1;
        item.purchaseDate = dto.purchaseDate;
        item.purchasePrice = dto.purchasePrice;
        item.currentValue = dto.currentValue;
        item.serialNumber = dto.serialNumber || '';
        item.warranty = dto.warranty;
        item.qrCode = crypto.randomUUID(); // Generate unique QR code identifier
        item.createdAt = new Date();
        item.updatedAt = new Date();

        await this.database.persist(item);
        return item;
    }

    async update(id: string, userId: string, dto: UpdateInventoryItemDto): Promise<InventoryItem | null> {
        const item = await this.getById(id, userId);
        if (!item) return null;

        if (dto.name !== undefined) item.name = dto.name;
        if (dto.description !== undefined) item.description = dto.description;
        if (dto.category !== undefined) item.category = dto.category;
        if (dto.tags !== undefined) item.tags = dto.tags;
        if (dto.location !== undefined) item.location = dto.location;
        if (dto.quantity !== undefined) item.quantity = dto.quantity;
        if (dto.purchaseDate !== undefined) item.purchaseDate = dto.purchaseDate;
        if (dto.purchasePrice !== undefined) item.purchasePrice = dto.purchasePrice;
        if (dto.currentValue !== undefined) item.currentValue = dto.currentValue;
        if (dto.serialNumber !== undefined) item.serialNumber = dto.serialNumber;
        if (dto.warranty !== undefined) item.warranty = dto.warranty;
        item.updatedAt = new Date();

        await this.database.persist(item);
        return item;
    }

    async delete(id: string, userId: string): Promise<boolean> {
        const item = await this.getById(id, userId);
        if (!item) return false;

        await this.database.remove(item);
        return true;
    }

    async lendItem(id: string, userId: string, dto: LendItemDto): Promise<InventoryItem | null> {
        const item = await this.getById(id, userId);
        if (!item) return null;

        const lent: ItemLent = {
            to: dto.to,
            since: new Date(),
            expectedReturn: dto.expectedReturn,
        };
        item.isLent = lent;
        item.updatedAt = new Date();

        await this.database.persist(item);
        return item;
    }

    async returnItem(id: string, userId: string): Promise<InventoryItem | null> {
        const item = await this.getById(id, userId);
        if (!item) return null;

        item.isLent = undefined;
        item.updatedAt = new Date();

        await this.database.persist(item);
        return item;
    }

    async getCategories(userId: string): Promise<string[]> {
        const items = await this.database.query(InventoryItem)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .find();

        const categories = new Set<string>();
        items.forEach(item => {
            if (item.category) categories.add(item.category);
        });
        return Array.from(categories).sort();
    }

    async getLocations(userId: string): Promise<{ area: string; containers: string[] }[]> {
        const items = await this.database.query(InventoryItem)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .find();

        const locationMap = new Map<string, Set<string>>();
        items.forEach(item => {
            if (item.location.area) {
                if (!locationMap.has(item.location.area)) {
                    locationMap.set(item.location.area, new Set());
                }
                if (item.location.container) {
                    locationMap.get(item.location.area)!.add(item.location.container);
                }
            }
        });

        return Array.from(locationMap.entries())
            .map(([area, containers]) => ({
                area,
                containers: Array.from(containers).sort(),
            }))
            .sort((a, b) => a.area.localeCompare(b.area));
    }

    async getStats(userId: string): Promise<{
        totalItems: number;
        totalValue: number;
        lentItems: number;
        categories: number;
        locations: number;
    }> {
        const items = await this.database.query(InventoryItem)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .find();

        const categories = new Set<string>();
        const locations = new Set<string>();
        let totalValue = 0;
        let lentItems = 0;

        items.forEach(item => {
            if (item.category) categories.add(item.category);
            if (item.location.area) locations.add(item.location.area);
            if (item.currentValue) totalValue += item.currentValue * item.quantity;
            if (item.isLent) lentItems++;
        });

        return {
            totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
            totalValue,
            lentItems,
            categories: categories.size,
            locations: locations.size,
        };
    }
}
