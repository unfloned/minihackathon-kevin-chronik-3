import { entity, PrimaryKey, Index } from '@deepkit/type';

export interface ItemLocation {
    area: string;           // "Wohnzimmer", "Garage", "Keller"
    container?: string;     // "Regal 1", "Karton A"
    details?: string;       // "Oberstes Fach, links"
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
    id: string & PrimaryKey = '';
    userId: string & Index = '';
    name: string = '';
    description: string = '';

    // Photos (URLs)
    photos: string[] = [];

    // Categorization
    category: string = '';
    tags: string[] = [];

    // Location
    location: ItemLocation = { area: '' };

    // Optional details
    quantity: number = 1;
    purchaseDate?: Date;
    purchasePrice?: number;
    currentValue?: number;
    serialNumber: string = '';
    warranty?: ItemWarranty;

    // QR Code
    qrCode: string = '';

    // Lending
    isLent?: ItemLent;

    // Meta
    createdAt: Date = new Date();
    updatedAt: Date = new Date();
}
