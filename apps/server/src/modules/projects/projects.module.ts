import { createModule } from '@deepkit/app';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';

export const ProjectsModule = createModule({
    controllers: [ProjectController],
    providers: [ProjectService],
    exports: [ProjectService],
});
