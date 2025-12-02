import { createModule } from '@deepkit/app';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';

export const NotificationsModule = createModule({
    controllers: [NotificationController],
    providers: [NotificationService],
    exports: [NotificationService],
});
