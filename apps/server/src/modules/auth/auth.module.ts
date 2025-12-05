import { createModule } from '@deepkit/app';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DemoCleanupService } from './demo-cleanup.service';

export const AuthModule = createModule({
    controllers: [AuthController],
    providers: [AuthService, DemoCleanupService],
    exports: [AuthService, DemoCleanupService],
});
