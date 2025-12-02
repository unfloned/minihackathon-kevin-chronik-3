import { createModule } from '@deepkit/app';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

export const AuthModule = createModule({
    controllers: [AuthController],
    providers: [AuthService],
    exports: [AuthService],
});
