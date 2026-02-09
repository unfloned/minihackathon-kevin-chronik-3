import { createModule } from '@deepkit/app';
import { EmailService } from './email.service';

export const EmailModule = createModule({
    providers: [EmailService],
    exports: [EmailService],
});
