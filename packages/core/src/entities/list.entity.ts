import { entity, PrimaryKey, Reference, uuid, UUID, Index } from '@deepkit/type';
import { User } from './user.entity.js';

export type ListType = 'shopping' | 'todo' | 'packing' | 'checklist' | 'custom';
export type ListItemPriority = 'low' | 'medium' | 'high';

export interface ListItem {
    id: string;
    text: string;
    completed: boolean;
    quantity?: number;
    unit?: string;
    note?: string;
    priority?: ListItemPriority;
    dueDate?: Date;
    order: number;
}

@entity.name('lists')
export class List {
    id: UUID & PrimaryKey = uuid();
    user!: User & Reference;

    name: string = '';
    description: string = '';
    type: ListType = 'custom';
    icon: string = '';
    color: string = '#228be6';

    items: ListItem[] = [];

    isPublic: boolean = false;
    publicSlug: string & Index = '';

    isTemplate: boolean = false;
    templateCategory: string = '';

    isArchived: boolean = false;
    createdAt: Date = new Date();
    updatedAt: Date = new Date();
}

export type ListFrontend = Readonly<List>;
