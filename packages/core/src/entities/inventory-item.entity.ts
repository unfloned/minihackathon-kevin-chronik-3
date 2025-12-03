import { entity, PrimaryKey, Reference, uuid, UUID } from '@deepkit/type';
import { User } from './user.entity.js';

export interface ItemLocation {
    area: string;
    container?: string;
    details?: string;
}

export interface ItemWarranty {
    until: Date;
    documentUrl?: string;
}

export interface ItemLent {
    to: string;
    since: Date;
    expectedReturn?: Date;
}

@entity.name('inventory_items')
export class InventoryItem {
    id: UUID & PrimaryKey = uuid();
    user!: User & Reference;

    name: string = '';
    description: string = '';

    photos: string[] = [];

    category: string = '';
    tags: string[] = [];

    location: ItemLocation = { area: '' };

    quantity: number = 1;
    purchaseDate?: Date;
    purchasePrice?: number;
    currentValue?: number;
    serialNumber: string = '';
    warranty?: ItemWarranty;

    qrCode: string = '';

    isLent?: ItemLent;

    createdAt: Date = new Date();
    updatedAt: Date = new Date();
}

export type InventoryItemFrontend = Readonly<InventoryItem>;
