import { createModule } from '@deepkit/app';
import { GamificationService } from './gamification.service';
import { GamificationController } from './gamification.controller';

export const GamificationModule = createModule({
    controllers: [GamificationController],
    providers: [GamificationService],
    exports: [GamificationService],
});
