import type {
    WishlistPriority,
    WishlistCategory,
    PriceInfo,
    WishlistItemWithDetails,
} from '@ycmm/core';
import {
    IconDevices,
    IconShirt,
    IconHome,
    IconPalette,
    IconBook,
    IconPlane,
    IconStar,
    IconDots,
} from '@tabler/icons-react';

// Re-export types from core for component usage
export type { WishlistPriority, WishlistCategory, PriceInfo };

// Alias for component usage
export type WishlistItem = WishlistItemWithDetails;

export interface SharingInfo {
    isPublic: boolean;
    shareUrl: string | null;
    publicSlug: string;
}

export interface WishlistFormValues {
    name: string;
    description: string;
    imageUrl: string;
    productUrl: string;
    category: WishlistCategory;
    priority: WishlistPriority;
    priceAmount: number | undefined;
    priceCurrency: string;
    targetPrice: number | undefined;
    isGiftIdea: boolean;
    giftFor: string;
    occasion: string;
    notes: string;
    store: string;
}

export const defaultFormValues: WishlistFormValues = {
    name: '',
    description: '',
    imageUrl: '',
    productUrl: '',
    category: 'other' as WishlistCategory,
    priority: 'medium' as WishlistPriority,
    priceAmount: undefined,
    priceCurrency: 'EUR',
    targetPrice: undefined,
    isGiftIdea: false,
    giftFor: '',
    occasion: '',
    notes: '',
    store: '',
};

export const categoryOptions: { value: WishlistCategory; label: string; icon: typeof IconDevices }[] = [
    { value: 'tech', label: 'wishlists.categories.tech', icon: IconDevices },
    { value: 'fashion', label: 'wishlists.categories.fashion', icon: IconShirt },
    { value: 'home', label: 'wishlists.categories.home', icon: IconHome },
    { value: 'hobby', label: 'wishlists.categories.hobby', icon: IconPalette },
    { value: 'books', label: 'wishlists.categories.books', icon: IconBook },
    { value: 'travel', label: 'wishlists.categories.travel', icon: IconPlane },
    { value: 'experience', label: 'wishlists.categories.experience', icon: IconStar },
    { value: 'other', label: 'wishlists.categories.other', icon: IconDots },
];

export const priorityOptions: { value: WishlistPriority; label: string; color: string }[] = [
    { value: 'low', label: 'wishlists.priority.low', color: 'gray' },
    { value: 'medium', label: 'wishlists.priority.medium', color: 'blue' },
    { value: 'high', label: 'wishlists.priority.high', color: 'orange' },
    { value: 'must_have', label: 'wishlists.priority.mustHave', color: 'red' },
];

export const priorityOrder: Record<WishlistPriority, number> = {
    must_have: 0,
    high: 1,
    medium: 2,
    low: 3,
};

export function formatPrice(price?: PriceInfo): string {
    if (!price) return '-';
    return `${price.amount.toFixed(2)} ${price.currency}`;
}
