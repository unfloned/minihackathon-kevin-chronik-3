import { createModule } from '@deepkit/app';
import { GamificationService } from './gamification.service';
import { GamificationController, PublicProfileController } from './gamification.controller';

export const GamificationModule = createModule({
    controllers: [GamificationController, PublicProfileController],
    providers: [GamificationService],
    exports: [GamificationService],
});
