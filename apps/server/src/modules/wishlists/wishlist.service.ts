import { WishlistItem, Wishlist, WishlistPriority, WishlistCategory, PriceInfo } from '@ycmm/core';
import { AppDatabase } from '../../app/database';
import { v4 as uuidv4 } from 'uuid';

export interface CreateWishlistItemDto {
    name: string;
    description?: string;
    imageUrl?: string;
    productUrl?: string;
    category?: WishlistCategory;
    tags?: string[];
    priority?: WishlistPriority;
    price?: PriceInfo;
    targetPrice?: number;
    isGiftIdea?: boolean;
    giftFor?: string;
    occasion?: string;
    notes?: string;
    store?: string;
}

export interface UpdateWishlistItemDto {
    name?: string;
    description?: string;
    imageUrl?: string;
    productUrl?: string;
    category?: WishlistCategory;
    tags?: string[];
    priority?: WishlistPriority;
    isPurchased?: boolean;
    price?: PriceInfo;
    targetPrice?: number;
    isGiftIdea?: boolean;
    giftFor?: string;
    occasion?: string;
    notes?: string;
    store?: string;
}

export interface CreateWishlistDto {
    name: string;
    description?: string;
    isPublic?: boolean;
    itemIds?: string[];
}

export interface UpdateWishlistDto {
    name?: string;
    description?: string;
    isPublic?: boolean;
    itemIds?: string[];
}

export class WishlistService {
    constructor(private database: AppDatabase) {}

    // Wishlist Items
    async getAllItems(userId: string): Promise<WishlistItem[]> {
        return this.database.query(WishlistItem)
            .filter({ userId })
            .orderBy('priority', 'desc')
            .find();
    }

    async getItemsByCategory(userId: string, category: WishlistCategory): Promise<WishlistItem[]> {
        return this.database.query(WishlistItem)
            .filter({ userId, category })
            .orderBy('priority', 'desc')
            .find();
    }

    async getGiftIdeas(userId: string): Promise<WishlistItem[]> {
        return this.database.query(WishlistItem)
            .filter({ userId, isGiftIdea: true })
            .orderBy('occasion', 'asc')
            .find();
    }

    async getPurchasedItems(userId: string): Promise<WishlistItem[]> {
        return this.database.query(WishlistItem)
            .filter({ userId, isPurchased: true })
            .orderBy('purchasedAt', 'desc')
            .find();
    }

    async getItemById(id: string, userId: string): Promise<WishlistItem | undefined> {
        return this.database.query(WishlistItem)
            .filter({ id, userId })
            .findOneOrUndefined();
    }

    async createItem(userId: string, dto: CreateWishlistItemDto): Promise<WishlistItem> {
        const item = new WishlistItem();
        item.id = uuidv4();
        item.userId = userId;
        item.name = dto.name;
        item.description = dto.description || '';
        item.imageUrl = dto.imageUrl || '';
        item.productUrl = dto.productUrl || '';
        item.category = dto.category || 'other';
        item.tags = dto.tags || [];
        item.priority = dto.priority || 'medium';
        item.price = dto.price;
        item.targetPrice = dto.targetPrice;
        item.isGiftIdea = dto.isGiftIdea || false;
        item.giftFor = dto.giftFor;
        item.occasion = dto.occasion;
        item.notes = dto.notes || '';
        item.store = dto.store || '';
        item.createdAt = new Date();
        item.updatedAt = new Date();

        await this.database.persist(item);
        return item;
    }

    async updateItem(id: string, userId: string, dto: UpdateWishlistItemDto): Promise<WishlistItem | null> {
        const item = await this.getItemById(id, userId);
        if (!item) return null;

        if (dto.name !== undefined) item.name = dto.name;
        if (dto.description !== undefined) item.description = dto.description;
        if (dto.imageUrl !== undefined) item.imageUrl = dto.imageUrl;
        if (dto.productUrl !== undefined) item.productUrl = dto.productUrl;
        if (dto.category !== undefined) item.category = dto.category;
        if (dto.tags !== undefined) item.tags = dto.tags;
        if (dto.priority !== undefined) item.priority = dto.priority;
        if (dto.isPurchased !== undefined) {
            item.isPurchased = dto.isPurchased;
            if (dto.isPurchased && !item.purchasedAt) {
                item.purchasedAt = new Date();
            }
        }
        if (dto.price !== undefined) item.price = dto.price;
        if (dto.targetPrice !== undefined) item.targetPrice = dto.targetPrice;
        if (dto.isGiftIdea !== undefined) item.isGiftIdea = dto.isGiftIdea;
        if (dto.giftFor !== undefined) item.giftFor = dto.giftFor;
        if (dto.occasion !== undefined) item.occasion = dto.occasion;
        if (dto.notes !== undefined) item.notes = dto.notes;
        if (dto.store !== undefined) item.store = dto.store;
        item.updatedAt = new Date();

        await this.database.persist(item);
        return item;
    }

    async deleteItem(id: string, userId: string): Promise<boolean> {
        const item = await this.getItemById(id, userId);
        if (!item) return false;

        await this.database.remove(item);
        return true;
    }

    async markAsPurchased(id: string, userId: string): Promise<WishlistItem | null> {
        return this.updateItem(id, userId, { isPurchased: true });
    }

    // Wishlists (Collections)
    async getAllWishlists(userId: string): Promise<Wishlist[]> {
        return this.database.query(Wishlist)
            .filter({ userId })
            .orderBy('updatedAt', 'desc')
            .find();
    }

    async getWishlistById(id: string, userId: string): Promise<Wishlist | undefined> {
        return this.database.query(Wishlist)
            .filter({ id, userId })
            .findOneOrUndefined();
    }

    async getPublicWishlist(slug: string): Promise<{
        wishlist: Wishlist;
        items: WishlistItem[];
    } | null> {
        const wishlist = await this.database.query(Wishlist)
            .filter({ publicSlug: slug, isPublic: true })
            .findOneOrUndefined();

        if (!wishlist) return null;

        const items: WishlistItem[] = [];
        for (const itemId of wishlist.itemIds) {
            const item = await this.database.query(WishlistItem)
                .filter({ id: itemId })
                .findOneOrUndefined();
            if (item) items.push(item);
        }

        return { wishlist, items };
    }

    async createWishlist(userId: string, dto: CreateWishlistDto): Promise<Wishlist> {
        const wishlist = new Wishlist();
        wishlist.id = uuidv4();
        wishlist.userId = userId;
        wishlist.name = dto.name;
        wishlist.description = dto.description || '';
        wishlist.isPublic = dto.isPublic || false;
        wishlist.publicSlug = dto.isPublic ? this.generateSlug(dto.name) : '';
        wishlist.itemIds = dto.itemIds || [];
        wishlist.createdAt = new Date();
        wishlist.updatedAt = new Date();

        await this.database.persist(wishlist);
        return wishlist;
    }

    async updateWishlist(id: string, userId: string, dto: UpdateWishlistDto): Promise<Wishlist | null> {
        const wishlist = await this.getWishlistById(id, userId);
        if (!wishlist) return null;

        if (dto.name !== undefined) wishlist.name = dto.name;
        if (dto.description !== undefined) wishlist.description = dto.description;
        if (dto.isPublic !== undefined) {
            wishlist.isPublic = dto.isPublic;
            if (dto.isPublic && !wishlist.publicSlug) {
                wishlist.publicSlug = this.generateSlug(wishlist.name);
            }
        }
        if (dto.itemIds !== undefined) wishlist.itemIds = dto.itemIds;
        wishlist.updatedAt = new Date();

        await this.database.persist(wishlist);
        return wishlist;
    }

    async deleteWishlist(id: string, userId: string): Promise<boolean> {
        const wishlist = await this.getWishlistById(id, userId);
        if (!wishlist) return false;

        await this.database.remove(wishlist);
        return true;
    }

    async addItemToWishlist(wishlistId: string, itemId: string, userId: string): Promise<Wishlist | null> {
        const wishlist = await this.getWishlistById(wishlistId, userId);
        if (!wishlist) return null;

        if (!wishlist.itemIds.includes(itemId)) {
            wishlist.itemIds.push(itemId);
            wishlist.updatedAt = new Date();
            await this.database.persist(wishlist);
        }

        return wishlist;
    }

    async removeItemFromWishlist(wishlistId: string, itemId: string, userId: string): Promise<Wishlist | null> {
        const wishlist = await this.getWishlistById(wishlistId, userId);
        if (!wishlist) return null;

        wishlist.itemIds = wishlist.itemIds.filter(id => id !== itemId);
        wishlist.updatedAt = new Date();
        await this.database.persist(wishlist);

        return wishlist;
    }

    // Stats
    async getStats(userId: string): Promise<{
        totalItems: number;
        totalWishlists: number;
        purchased: number;
        totalValue: number;
        byCategory: { category: WishlistCategory; count: number }[];
        byPriority: { priority: WishlistPriority; count: number }[];
        giftIdeas: number;
    }> {
        const items = await this.database.query(WishlistItem)
            .filter({ userId })
            .find();

        const wishlists = await this.database.query(Wishlist)
            .filter({ userId })
            .find();

        const categoryCounts: Record<string, number> = {};
        const priorityCounts: Record<string, number> = {};
        let purchased = 0;
        let totalValue = 0;
        let giftIdeas = 0;

        items.forEach(item => {
            categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
            priorityCounts[item.priority] = (priorityCounts[item.priority] || 0) + 1;

            if (item.isPurchased) purchased++;
            if (item.price) totalValue += item.price.amount;
            if (item.isGiftIdea) giftIdeas++;
        });

        return {
            totalItems: items.length,
            totalWishlists: wishlists.length,
            purchased,
            totalValue,
            byCategory: Object.entries(categoryCounts).map(([category, count]) => ({
                category: category as WishlistCategory,
                count,
            })),
            byPriority: Object.entries(priorityCounts).map(([priority, count]) => ({
                priority: priority as WishlistPriority,
                count,
            })),
            giftIdeas,
        };
    }

    private generateSlug(name: string): string {
        const base = name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        return `${base}-${uuidv4().slice(0, 8)}`;
    }
}
