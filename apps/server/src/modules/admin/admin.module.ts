import { createModule } from '@deepkit/app';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';

export const AdminModule = createModule({
    controllers: [AdminController],
    providers: [AdminService],
    exports: [AdminService],
});
