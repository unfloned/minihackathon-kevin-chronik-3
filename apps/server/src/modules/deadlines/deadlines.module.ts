import { createModule } from '@deepkit/app';
import { DeadlineService } from './deadline.service';
import { DeadlineController } from './deadline.controller';

export const DeadlinesModule = createModule({
    controllers: [DeadlineController],
    providers: [DeadlineService],
    exports: [DeadlineService],
});
