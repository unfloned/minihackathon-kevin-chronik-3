import { entity, PrimaryKey, Reference, uuid, UUID, Index } from '@deepkit/type';
import { User } from './user.entity.js';

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
    id: UUID & PrimaryKey = uuid();
    user!: User & Reference;

    name: string = '';
    description: string = '';
    imageUrl: string = '';
    productUrl: string = '';

    category: WishlistCategory = 'other';
    tags: string[] = [];

    priority: WishlistPriority = 'medium';
    isPurchased: boolean = false;
    purchasedAt?: Date;

    price?: PriceInfo;
    targetPrice?: number;

    isGiftIdea: boolean = false;
    giftFor?: string;
    occasion?: string;

    notes: string = '';
    store: string = '';

    createdAt: Date = new Date();
    updatedAt: Date = new Date();
}

export type WishlistItemFrontend = Readonly<WishlistItem>;

@entity.name('wishlists')
export class Wishlist {
    id: UUID & PrimaryKey = uuid();
    user!: User & Reference;

    name: string = '';
    description: string = '';
    isPublic: boolean = false;
    publicSlug: string & Index = '';

    itemIds: string[] = [];

    createdAt: Date = new Date();
    updatedAt: Date = new Date();
}

export type WishlistFrontend = Readonly<Wishlist>;
