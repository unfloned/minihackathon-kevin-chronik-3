import { entity, PrimaryKey, Index } from '@deepkit/type';

export type WishlistPriority = 'low' | 'medium' | 'high' | 'must_have';

export type WishlistCategory =
    | 'tech'
    | 'fashion'
    | 'home'
    | 'hobby'
    | 'books'
    | 'travel'
    | 'experience'
    | 'other';

export interface PriceInfo {
    amount: number;
    currency: string;
    lastChecked?: Date;
}

@entity.name('wishlist_items')
export class WishlistItem {
    id: string & PrimaryKey = '';
    userId: string & Index = '';

    // Basic Info
    name: string = '';
    description: string = '';
    imageUrl: string = '';
    productUrl: string = '';

    // Categorization
    category: WishlistCategory = 'other';
    tags: string[] = [];

    // Priority & Status
    priority: WishlistPriority = 'medium';
    isPurchased: boolean = false;
    purchasedAt?: Date;

    // Price tracking
    price?: PriceInfo;
    targetPrice?: number; // Alert when price drops to this

    // Gift options
    isGiftIdea: boolean = false;
    giftFor?: string; // Name of person this is a gift for
    occasion?: string; // Birthday, Christmas, etc.

    // Notes
    notes: string = '';
    store: string = ''; // Where to buy

    // Meta
    createdAt: Date = new Date();
    updatedAt: Date = new Date();
}

// Public Wishlist for sharing
@entity.name('wishlists')
export class Wishlist {
    id: string & PrimaryKey = '';
    userId: string & Index = '';

    name: string = '';
    description: string = '';
    isPublic: boolean = false;
    publicSlug: string & Index = '';

    itemIds: string[] = []; // References to WishlistItems

    createdAt: Date = new Date();
    updatedAt: Date = new Date();
}
