import { createModule } from '@deepkit/app';
import { MediaItemService } from './media-item.service';
import { MediaItemController, PublicMediaController } from './media-item.controller';

export const MediaModule = createModule({
    controllers: [MediaItemController, PublicMediaController],
    providers: [MediaItemService],
    exports: [MediaItemService],
});
