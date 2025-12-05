import { createModule } from '@deepkit/app';
import { PushService } from './push.service';
import { PushController } from './push.controller';

export const PushModule = createModule({
    controllers: [PushController],
    providers: [PushService],
    exports: [PushService],
});
