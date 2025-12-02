import { createModule } from '@deepkit/app';
import { ApplicationService } from './application.service';
import { ApplicationController } from './application.controller';

export const ApplicationsModule = createModule({
    controllers: [ApplicationController],
    providers: [ApplicationService],
    exports: [ApplicationService],
});
