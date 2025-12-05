import { createModule } from '@deepkit/app';
import { NotificationSchedulerService } from './notification-scheduler.service';

export const SchedulerModule = createModule({
    providers: [NotificationSchedulerService],
    exports: [NotificationSchedulerService],
});
