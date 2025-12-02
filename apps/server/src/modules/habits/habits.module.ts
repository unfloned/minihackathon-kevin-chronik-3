import { createModule } from '@deepkit/app';
import { HabitService } from './habit.service';
import { HabitController } from './habit.controller';

export const HabitsModule = createModule({
    controllers: [HabitController],
    providers: [HabitService],
    exports: [HabitService],
});
