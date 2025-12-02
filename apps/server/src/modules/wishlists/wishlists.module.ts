import { createModule } from '@deepkit/app';
import { WishlistService } from './wishlist.service';
import { WishlistItemController, WishlistController, PublicWishlistController } from './wishlist.controller';

export const WishlistsModule = createModule({
    controllers: [WishlistItemController, WishlistController, PublicWishlistController],
    providers: [WishlistService],
    exports: [WishlistService],
});
