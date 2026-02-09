import { createModule } from '@deepkit/app';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';

export const ProfileModule = createModule({
    controllers: [ProfileController],
    providers: [ProfileService],
    exports: [ProfileService],
});
