export interface ItemLocation {
    area: string;
    container?: string;
    details?: string;
}

export interface ItemLent {
    to: string;
    since: string;
    expectedReturn?: string;
}

export interface InventoryItem {
    id: string;
    name: string;
    description: string;
    photos: string[];
    category: string;
    tags: string[];
    location: ItemLocation;
    quantity: number;
    purchaseDate?: string;
    purchasePrice?: number;
    currentValue?: number;
    serialNumber: string;
    qrCode: string;
    isLent?: ItemLent;
    createdAt: string;
    updatedAt: string;
}

export interface CreateItemForm {
    name: string;
    description: string;
    category: string;
    location: ItemLocation;
    quantity: number;
    purchasePrice?: number;
    currentValue?: number;
    serialNumber: string;
}

export const defaultForm: CreateItemForm = {
    name: '',
    description: '',
    category: '',
    location: { area: '' },
    quantity: 1,
    serialNumber: '',
};

// Helper to convert Mantine v8 DateValue to Date
import { DateValue } from '@mantine/dates';

export const toDateOrNull = (value: DateValue): Date | null => {
    if (!value) return null;
    if (value instanceof Date) return value;
    return new Date(value);
};
