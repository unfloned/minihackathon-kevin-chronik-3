import { List, ListItem, ListType, ListItemPriority } from '@ycmm/core';
import { AppDatabase } from '../../app/database';
import { v4 as uuidv4 } from 'uuid';

export interface CreateListDto {
    name: string;
    description?: string;
    type: ListType;
    icon?: string;
    color?: string;
    isTemplate?: boolean;
    templateCategory?: string;
}

export interface UpdateListDto {
    name?: string;
    description?: string;
    type?: ListType;
    icon?: string;
    color?: string;
    isPublic?: boolean;
}

export interface AddListItemDto {
    text: string;
    quantity?: number;
    unit?: string;
    note?: string;
    priority?: ListItemPriority;
    dueDate?: Date;
}

export interface UpdateListItemDto {
    text?: string;
    completed?: boolean;
    quantity?: number;
    unit?: string;
    note?: string;
    priority?: ListItemPriority;
    dueDate?: Date;
    order?: number;
}

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[äÄ]/g, 'ae')
        .replace(/[öÖ]/g, 'oe')
        .replace(/[üÜ]/g, 'ue')
        .replace(/[ß]/g, 'ss')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        + '-' + uuidv4().substring(0, 8);
}

export class ListService {
    constructor(private database: AppDatabase) {}

    async getAll(userId: string): Promise<List[]> {
        return this.database.query(List)
            .filter({ userId, isArchived: false, isTemplate: false })
            .orderBy('createdAt', 'desc')
            .find();
    }

    async getArchived(userId: string): Promise<List[]> {
        return this.database.query(List)
            .filter({ userId, isArchived: true })
            .orderBy('updatedAt', 'desc')
            .find();
    }

    async getTemplates(userId: string): Promise<List[]> {
        return this.database.query(List)
            .filter({ userId, isTemplate: true })
            .orderBy('name', 'asc')
            .find();
    }

    async getByType(userId: string, type: ListType): Promise<List[]> {
        return this.database.query(List)
            .filter({ userId, type, isArchived: false, isTemplate: false })
            .orderBy('createdAt', 'desc')
            .find();
    }

    async getById(id: string, userId: string): Promise<List | undefined> {
        return this.database.query(List)
            .filter({ id, userId })
            .findOneOrUndefined();
    }

    async getByPublicSlug(slug: string): Promise<List | undefined> {
        return this.database.query(List)
            .filter({ publicSlug: slug, isPublic: true })
            .findOneOrUndefined();
    }

    async create(userId: string, dto: CreateListDto): Promise<List> {
        const list = new List();
        list.id = uuidv4();
        list.userId = userId;
        list.name = dto.name;
        list.description = dto.description || '';
        list.type = dto.type;
        list.icon = dto.icon || '';
        list.color = dto.color || '#228be6';
        list.isTemplate = dto.isTemplate || false;
        list.templateCategory = dto.templateCategory || '';
        list.items = [];
        list.publicSlug = generateSlug(dto.name);
        list.createdAt = new Date();
        list.updatedAt = new Date();

        await this.database.persist(list);
        return list;
    }

    async createFromTemplate(userId: string, templateId: string, name: string): Promise<List | null> {
        const template = await this.database.query(List)
            .filter({ id: templateId, isTemplate: true })
            .findOneOrUndefined();

        if (!template) return null;

        const list = new List();
        list.id = uuidv4();
        list.userId = userId;
        list.name = name;
        list.description = template.description;
        list.type = template.type;
        list.icon = template.icon;
        list.color = template.color;
        list.items = template.items.map(item => ({
            ...item,
            id: uuidv4(),
            completed: false,
        }));
        list.publicSlug = generateSlug(name);
        list.createdAt = new Date();
        list.updatedAt = new Date();

        await this.database.persist(list);
        return list;
    }

    async update(id: string, userId: string, dto: UpdateListDto): Promise<List | null> {
        const list = await this.getById(id, userId);
        if (!list) return null;

        if (dto.name !== undefined) list.name = dto.name;
        if (dto.description !== undefined) list.description = dto.description;
        if (dto.type !== undefined) list.type = dto.type;
        if (dto.icon !== undefined) list.icon = dto.icon;
        if (dto.color !== undefined) list.color = dto.color;
        if (dto.isPublic !== undefined) list.isPublic = dto.isPublic;
        list.updatedAt = new Date();

        await this.database.persist(list);
        return list;
    }

    async delete(id: string, userId: string): Promise<boolean> {
        const list = await this.getById(id, userId);
        if (!list) return false;

        await this.database.remove(list);
        return true;
    }

    async archive(id: string, userId: string): Promise<List | null> {
        const list = await this.getById(id, userId);
        if (!list) return null;

        list.isArchived = true;
        list.updatedAt = new Date();

        await this.database.persist(list);
        return list;
    }

    async unarchive(id: string, userId: string): Promise<List | null> {
        const list = await this.getById(id, userId);
        if (!list) return null;

        list.isArchived = false;
        list.updatedAt = new Date();

        await this.database.persist(list);
        return list;
    }

    // Item operations
    async addItem(id: string, userId: string, dto: AddListItemDto): Promise<List | null> {
        const list = await this.getById(id, userId);
        if (!list) return null;

        const newItem: ListItem = {
            id: uuidv4(),
            text: dto.text,
            completed: false,
            quantity: dto.quantity,
            unit: dto.unit,
            note: dto.note,
            priority: dto.priority,
            dueDate: dto.dueDate,
            order: list.items.length,
        };

        list.items.push(newItem);
        list.updatedAt = new Date();

        await this.database.persist(list);
        return list;
    }

    async updateItem(listId: string, userId: string, itemId: string, dto: UpdateListItemDto): Promise<List | null> {
        const list = await this.getById(listId, userId);
        if (!list) return null;

        const itemIndex = list.items.findIndex(i => i.id === itemId);
        if (itemIndex === -1) return null;

        const item = list.items[itemIndex];
        if (dto.text !== undefined) item.text = dto.text;
        if (dto.completed !== undefined) item.completed = dto.completed;
        if (dto.quantity !== undefined) item.quantity = dto.quantity;
        if (dto.unit !== undefined) item.unit = dto.unit;
        if (dto.note !== undefined) item.note = dto.note;
        if (dto.priority !== undefined) item.priority = dto.priority;
        if (dto.dueDate !== undefined) item.dueDate = dto.dueDate;
        if (dto.order !== undefined) item.order = dto.order;

        list.updatedAt = new Date();

        await this.database.persist(list);
        return list;
    }

    async deleteItem(listId: string, userId: string, itemId: string): Promise<List | null> {
        const list = await this.getById(listId, userId);
        if (!list) return null;

        const itemIndex = list.items.findIndex(i => i.id === itemId);
        if (itemIndex === -1) return null;

        list.items.splice(itemIndex, 1);
        // Re-order remaining items
        list.items.forEach((item, index) => {
            item.order = index;
        });
        list.updatedAt = new Date();

        await this.database.persist(list);
        return list;
    }

    async toggleItem(listId: string, userId: string, itemId: string): Promise<List | null> {
        const list = await this.getById(listId, userId);
        if (!list) return null;

        const item = list.items.find(i => i.id === itemId);
        if (!item) return null;

        item.completed = !item.completed;
        list.updatedAt = new Date();

        await this.database.persist(list);
        return list;
    }

    async reorderItems(listId: string, userId: string, itemIds: string[]): Promise<List | null> {
        const list = await this.getById(listId, userId);
        if (!list) return null;

        // Reorder items based on provided order
        const orderedItems: ListItem[] = [];
        for (let i = 0; i < itemIds.length; i++) {
            const item = list.items.find(it => it.id === itemIds[i]);
            if (item) {
                item.order = i;
                orderedItems.push(item);
            }
        }

        // Add any items that weren't in the order list
        for (const item of list.items) {
            if (!orderedItems.includes(item)) {
                item.order = orderedItems.length;
                orderedItems.push(item);
            }
        }

        list.items = orderedItems;
        list.updatedAt = new Date();

        await this.database.persist(list);
        return list;
    }

    async clearCompleted(listId: string, userId: string): Promise<List | null> {
        const list = await this.getById(listId, userId);
        if (!list) return null;

        list.items = list.items.filter(item => !item.completed);
        list.items.forEach((item, index) => {
            item.order = index;
        });
        list.updatedAt = new Date();

        await this.database.persist(list);
        return list;
    }

    async getProgress(listId: string, userId: string): Promise<{ completed: number; total: number; percentage: number } | null> {
        const list = await this.getById(listId, userId);
        if (!list) return null;

        const total = list.items.length;
        const completed = list.items.filter(i => i.completed).length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        return { completed, total, percentage };
    }
}
