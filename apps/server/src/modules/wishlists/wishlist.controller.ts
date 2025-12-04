import { http, HttpBody, HttpQueries, HttpRequest, HttpUnauthorizedError, HttpNotFoundError } from '@deepkit/http';
import { WishlistService, CreateWishlistItemDto, UpdateWishlistItemDto, CreateWishlistDto, UpdateWishlistDto } from './wishlist.service';
import { AuthService } from '../auth/auth.service';
import { WishlistCategory } from '@ycmm/core';

interface ItemFilters {
    category?: WishlistCategory;
    gifts?: boolean;
    purchased?: boolean;
}

@http.controller('/api/wishlist-items')
export class WishlistItemController {
    constructor(
        private wishlistService: WishlistService,
        private authService: AuthService
    ) {}

    private getCookie(request: HttpRequest, name: string): string | undefined {
        const cookies = request.headers.cookie;
        if (!cookies) return undefined;
        const match = cookies.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
        return match ? match[1] : undefined;
    }

    private async getUserId(request: HttpRequest): Promise<string> {
        const accessToken = this.getCookie(request, 'access_token');
        if (!accessToken) {
            throw new HttpUnauthorizedError('Nicht angemeldet');
        }
        const payload = await this.authService.validateAccessToken(accessToken);
        return payload.userId;
    }

    @http.GET('')
    async getAllItems(request: HttpRequest, queries: HttpQueries<ItemFilters>) {
        const userId = await this.getUserId(request);

        if (queries.gifts) {
            return this.wishlistService.getGiftIdeas(userId);
        }
        if (queries.purchased) {
            return this.wishlistService.getPurchasedItems(userId);
        }
        if (queries.category) {
            return this.wishlistService.getItemsByCategory(userId, queries.category);
        }
        return this.wishlistService.getAllItems(userId);
    }

    @http.GET('stats')
    async getStats(request: HttpRequest) {
        const userId = await this.getUserId(request);
        return this.wishlistService.getStats(userId);
    }

    @http.GET(':id')
    async getItemById(request: HttpRequest, id: string) {
        const userId = await this.getUserId(request);
        const item = await this.wishlistService.getItemById(id, userId);
        if (!item) {
            throw new HttpNotFoundError('Item not found');
        }
        return item;
    }

    @http.POST('')
    async createItem(request: HttpRequest, body: HttpBody<CreateWishlistItemDto>) {
        const userId = await this.getUserId(request);
        return this.wishlistService.createItem(userId, body);
    }

    @http.PATCH(':id')
    async updateItem(request: HttpRequest, id: string, body: HttpBody<UpdateWishlistItemDto>) {
        const userId = await this.getUserId(request);
        const item = await this.wishlistService.updateItem(id, userId, body);
        if (!item) {
            throw new HttpNotFoundError('Item not found');
        }
        return item;
    }

    @http.POST(':id/purchase')
    async markAsPurchased(request: HttpRequest, id: string) {
        const userId = await this.getUserId(request);
        const item = await this.wishlistService.markAsPurchased(id, userId);
        if (!item) {
            throw new HttpNotFoundError('Item not found');
        }
        return item;
    }

    @http.DELETE(':id')
    async deleteItem(request: HttpRequest, id: string) {
        const userId = await this.getUserId(request);
        const success = await this.wishlistService.deleteItem(id, userId);
        if (!success) {
            throw new HttpNotFoundError('Item not found');
        }
        return { success: true };
    }
}

// Wishlist Collections Controller
@http.controller('/api/wishlists')
export class WishlistController {
    constructor(
        private wishlistService: WishlistService,
        private authService: AuthService
    ) {}

    private getCookie(request: HttpRequest, name: string): string | undefined {
        const cookies = request.headers.cookie;
        if (!cookies) return undefined;
        const match = cookies.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
        return match ? match[1] : undefined;
    }

    private async getUserId(request: HttpRequest): Promise<string> {
        const accessToken = this.getCookie(request, 'access_token');
        if (!accessToken) {
            throw new HttpUnauthorizedError('Nicht angemeldet');
        }
        const payload = await this.authService.validateAccessToken(accessToken);
        return payload.userId;
    }

    @http.GET('')
    async getAllWishlists(request: HttpRequest) {
        const userId = await this.getUserId(request);
        return this.wishlistService.getAllWishlists(userId);
    }

    @http.GET(':id')
    async getWishlistById(request: HttpRequest, id: string) {
        const userId = await this.getUserId(request);
        const wishlist = await this.wishlistService.getWishlistById(id, userId);
        if (!wishlist) {
            throw new HttpNotFoundError('Wishlist not found');
        }
        return wishlist;
    }

    @http.POST('')
    async createWishlist(request: HttpRequest, body: HttpBody<CreateWishlistDto>) {
        const userId = await this.getUserId(request);
        return this.wishlistService.createWishlist(userId, body);
    }

    @http.PATCH(':id')
    async updateWishlist(request: HttpRequest, id: string, body: HttpBody<UpdateWishlistDto>) {
        const userId = await this.getUserId(request);
        const wishlist = await this.wishlistService.updateWishlist(id, userId, body);
        if (!wishlist) {
            throw new HttpNotFoundError('Wishlist not found');
        }
        return wishlist;
    }

    @http.POST(':id/items/:itemId')
    async addItemToWishlist(request: HttpRequest, id: string, itemId: string) {
        const userId = await this.getUserId(request);
        const wishlist = await this.wishlistService.addItemToWishlist(id, itemId, userId);
        if (!wishlist) {
            throw new HttpNotFoundError('Wishlist not found');
        }
        return wishlist;
    }

    @http.DELETE(':id/items/:itemId')
    async removeItemFromWishlist(request: HttpRequest, id: string, itemId: string) {
        const userId = await this.getUserId(request);
        const wishlist = await this.wishlistService.removeItemFromWishlist(id, itemId, userId);
        if (!wishlist) {
            throw new HttpNotFoundError('Wishlist not found');
        }
        return wishlist;
    }

    @http.DELETE(':id')
    async deleteWishlist(request: HttpRequest, id: string) {
        const userId = await this.getUserId(request);
        const success = await this.wishlistService.deleteWishlist(id, userId);
        if (!success) {
            throw new HttpNotFoundError('Wishlist not found');
        }
        return { success: true };
    }

    @http.GET('default/sharing')
    async getDefaultWishlistSharing(request: HttpRequest) {
        const userId = await this.getUserId(request);
        // Sync items first
        await this.wishlistService.syncDefaultWishlistItems(userId);
        const wishlist = await this.wishlistService.getOrCreateDefaultWishlist(userId);
        return {
            isPublic: wishlist.isPublic,
            shareUrl: wishlist.isPublic ? `/shared/${wishlist.publicSlug}` : null,
            publicSlug: wishlist.publicSlug,
        };
    }

    @http.POST('default/sharing')
    async toggleDefaultWishlistSharing(request: HttpRequest, body: HttpBody<{ isPublic: boolean }>) {
        const userId = await this.getUserId(request);
        // Sync items first
        await this.wishlistService.syncDefaultWishlistItems(userId);
        const wishlist = await this.wishlistService.getOrCreateDefaultWishlist(userId);
        const updated = await this.wishlistService.updateWishlist(wishlist.id, userId, {
            isPublic: body.isPublic,
        });
        if (!updated) {
            throw new HttpNotFoundError('Wishlist not found');
        }
        return {
            isPublic: updated.isPublic,
            shareUrl: updated.isPublic ? `/shared/${updated.publicSlug}` : null,
            publicSlug: updated.publicSlug,
        };
    }
}

// Public Wishlist Controller
@http.controller('/api/public/wishlists')
export class PublicWishlistController {
    constructor(private wishlistService: WishlistService) {}

    @http.GET(':slug')
    async getPublicWishlist(slug: string) {
        const result = await this.wishlistService.getPublicWishlist(slug);
        if (!result) {
            throw new HttpNotFoundError('Wishlist not found');
        }
        return result;
    }

    @http.POST(':slug/items/:itemId/reserve')
    async reserveItem(slug: string, itemId: string, body: HttpBody<{ name: string }>) {
        if (!body.name || body.name.trim().length === 0) {
            throw new HttpNotFoundError('Name required');
        }
        const success = await this.wishlistService.reservePublicItem(slug, itemId, body.name.trim());
        if (!success) {
            throw new HttpNotFoundError('Item not found or already reserved');
        }
        return { success: true };
    }

    @http.DELETE(':slug/items/:itemId/reserve')
    async unreserveItem(slug: string, itemId: string) {
        const success = await this.wishlistService.unreservePublicItem(slug, itemId);
        if (!success) {
            throw new HttpNotFoundError('Item not found');
        }
        return { success: true };
    }
}
