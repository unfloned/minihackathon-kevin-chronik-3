import { createModule } from '@deepkit/app';
import { MealService } from './meal.service';
import { MealController, MealPlanController } from './meal.controller';

export const MealsModule = createModule({
    controllers: [MealController, MealPlanController],
    providers: [MealService],
    exports: [MealService],
});
