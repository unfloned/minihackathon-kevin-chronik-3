import { entity, PrimaryKey, Index } from '@deepkit/type';

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
    id: string & PrimaryKey = '';
    userId: string & Index = '';
    name: string = '';
    description: string = '';
    type: ListType = 'custom';
    icon: string = '';
    color: string = '#228be6';

    // Items stored as JSON
    items: ListItem[] = [];

    // Sharing
    isPublic: boolean = false;
    publicSlug: string = '';

    // Template
    isTemplate: boolean = false;
    templateCategory: string = '';

    // Meta
    isArchived: boolean = false;
    createdAt: Date = new Date();
    updatedAt: Date = new Date();
}
