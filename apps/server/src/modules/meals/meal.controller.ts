import { http, HttpBody, HttpQueries, HttpNotFoundError } from '@deepkit/http';
import { MealService, CreateMealDto, UpdateMealDto, CreateMealPlanDto, UpdateMealPlanDto } from './meal.service';
import { User, MealType } from '@ycmm/core';

interface MealFilters {
    mealType?: MealType;
    favorites?: boolean;
}

interface PlanFilters {
    startDate: string;
    endDate: string;
}

@http.controller('/api/meals')
export class MealController {
    constructor(private mealService: MealService) {}

    // Meals (Recipes)
    @(http.GET('').group('auth-required'))
    async getAllMeals(user: User, queries: HttpQueries<MealFilters>) {
        if (queries.favorites) {
            return this.mealService.getFavoriteMeals(user.id);
        }
        if (queries.mealType) {
            return this.mealService.getMealsByType(user.id, queries.mealType);
        }
        return this.mealService.getAllMeals(user.id);
    }

    @(http.GET('stats').group('auth-required'))
    async getStats(user: User) {
        return this.mealService.getStats(user.id);
    }

    @(http.GET(':id').group('auth-required'))
    async getMealById(id: string, user: User) {
        const meal = await this.mealService.getMealById(id, user.id);
        if (!meal) {
            throw new HttpNotFoundError('Meal not found');
        }
        return meal;
    }

    @(http.POST('').group('auth-required'))
    async createMeal(body: HttpBody<CreateMealDto>, user: User) {
        return this.mealService.createMeal(user.id, body);
    }

    @(http.PATCH(':id').group('auth-required'))
    async updateMeal(id: string, body: HttpBody<UpdateMealDto>, user: User) {
        const meal = await this.mealService.updateMeal(id, user.id, body);
        if (!meal) {
            throw new HttpNotFoundError('Meal not found');
        }
        return meal;
    }

    @(http.POST(':id/cooked').group('auth-required'))
    async markAsCooked(id: string, user: User) {
        const meal = await this.mealService.markAsCooked(id, user.id);
        if (!meal) {
            throw new HttpNotFoundError('Meal not found');
        }
        return meal;
    }

    @(http.POST(':id/favorite').group('auth-required'))
    async toggleFavorite(id: string, user: User) {
        const meal = await this.mealService.toggleFavorite(id, user.id);
        if (!meal) {
            throw new HttpNotFoundError('Meal not found');
        }
        return meal;
    }

    @(http.DELETE(':id').group('auth-required'))
    async deleteMeal(id: string, user: User) {
        const success = await this.mealService.deleteMeal(id, user.id);
        if (!success) {
            throw new HttpNotFoundError('Meal not found');
        }
        return { success: true };
    }
}

// Meal Plans Controller
@http.controller('/api/meal-plans')
export class MealPlanController {
    constructor(private mealService: MealService) {}

    @(http.GET('').group('auth-required'))
    async getMealPlans(user: User, queries: HttpQueries<PlanFilters>) {
        const startDate = new Date(queries.startDate);
        const endDate = new Date(queries.endDate);
        return this.mealService.getMealPlans(user.id, startDate, endDate);
    }

    @(http.GET('shopping-list').group('auth-required'))
    async getShoppingList(user: User, queries: HttpQueries<PlanFilters>) {
        const startDate = new Date(queries.startDate);
        const endDate = new Date(queries.endDate);
        return this.mealService.getShoppingList(user.id, startDate, endDate);
    }

    @(http.POST('').group('auth-required'))
    async createMealPlan(body: HttpBody<CreateMealPlanDto>, user: User) {
        return this.mealService.createMealPlan(user.id, body);
    }

    @(http.PATCH(':id').group('auth-required'))
    async updateMealPlan(id: string, body: HttpBody<UpdateMealPlanDto>, user: User) {
        const plan = await this.mealService.updateMealPlan(id, user.id, body);
        if (!plan) {
            throw new HttpNotFoundError('Meal plan not found');
        }
        return plan;
    }

    @(http.DELETE(':id').group('auth-required'))
    async deleteMealPlan(id: string, user: User) {
        const success = await this.mealService.deleteMealPlan(id, user.id);
        if (!success) {
            throw new HttpNotFoundError('Meal plan not found');
        }
        return { success: true };
    }
}
