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
}
