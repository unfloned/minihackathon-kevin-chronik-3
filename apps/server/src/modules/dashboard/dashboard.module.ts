import { createModule } from '@deepkit/app';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

export const DashboardModule = createModule({
    controllers: [DashboardController],
    providers: [DashboardService],
    exports: [DashboardService],
});
