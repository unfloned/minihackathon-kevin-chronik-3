import { createModule } from '@deepkit/app';
import { InventoryItemService } from './inventory-item.service';
import { InventoryItemController } from './inventory-item.controller';

export const InventoryModule = createModule({
    controllers: [InventoryItemController],
    providers: [InventoryItemService],
    exports: [InventoryItemService],
});
