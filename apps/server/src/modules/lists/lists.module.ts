import { createModule } from '@deepkit/app';
import { ListService } from './list.service';
import { ListController, PublicListController } from './list.controller';

export const ListsModule = createModule({
    controllers: [ListController, PublicListController],
    providers: [ListService],
    exports: [ListService],
});
