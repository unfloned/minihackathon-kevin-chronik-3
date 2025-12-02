import { createModule } from '@deepkit/app';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';

export const SubscriptionsModule = createModule({
    controllers: [SubscriptionController],
    providers: [SubscriptionService],
    exports: [SubscriptionService],
});
