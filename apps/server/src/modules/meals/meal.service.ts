import { Meal, MealPlan, MealType, Ingredient, NutritionInfo, User } from '@ycmm/core';
import { AppDatabase } from '../../app/database';
import type { Reference } from '@deepkit/type';

export interface CreateMealDto {
    name: string;
    description?: string;
    imageUrl?: string;
    ingredients?: Ingredient[];
    instructions?: string;
    prepTime?: number;
    cookTime?: number;
    servings?: number;
    mealType?: MealType[];
    cuisine?: string;
    tags?: string[];
    nutrition?: NutritionInfo;
    recipeUrl?: string;
    source?: string;
}

export interface UpdateMealDto {
    name?: string;
    description?: string;
    imageUrl?: string;
    ingredients?: Ingredient[];
    instructions?: string;
    prepTime?: number;
    cookTime?: number;
    servings?: number;
    mealType?: MealType[];
    cuisine?: string;
    tags?: string[];
    nutrition?: NutritionInfo;
    isFavorite?: boolean;
    recipeUrl?: string;
    source?: string;
}

export interface CreateMealPlanDto {
    date: string;
    mealType: MealType;
    mealId?: string;
    customMealName?: string;
    notes?: string;
}

export interface UpdateMealPlanDto {
    date?: string;
    mealType?: MealType;
    mealId?: string;
    customMealName?: string;
    notes?: string;
}

export class MealService {
    constructor(private database: AppDatabase) {}

    // Meals (Recipes)
    async getAllMeals(userId: string): Promise<Meal[]> {
        return this.database.query(Meal)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .orderBy('updatedAt', 'desc')
            .find();
    }

    async getMealsByType(userId: string, mealType: MealType): Promise<Meal[]> {
        const all = await this.database.query(Meal)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .find();
        return all.filter(m => m.mealType.includes(mealType));
    }

    async getFavoriteMeals(userId: string): Promise<Meal[]> {
        return this.database.query(Meal)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .filter({ isFavorite: true })
            .orderBy('updatedAt', 'desc')
            .find();
    }

    async getMealById(id: string, userId: string): Promise<Meal | undefined> {
        return this.database.query(Meal)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .filter({ id })
            .findOneOrUndefined();
    }

    async createMeal(userId: string, dto: CreateMealDto): Promise<Meal> {
        const meal = new Meal();
        meal.user = this.database.getReference(User, userId);
        meal.name = dto.name;
        meal.description = dto.description || '';
        meal.imageUrl = dto.imageUrl || '';
        meal.ingredients = dto.ingredients || [];
        meal.instructions = dto.instructions || '';
        meal.prepTime = dto.prepTime;
        meal.cookTime = dto.cookTime;
        meal.servings = dto.servings;
        meal.mealType = dto.mealType || [];
        meal.cuisine = dto.cuisine || '';
        meal.tags = dto.tags || [];
        meal.nutrition = dto.nutrition;
        meal.recipeUrl = dto.recipeUrl || '';
        meal.source = dto.source || '';
        meal.createdAt = new Date();
        meal.updatedAt = new Date();

        await this.database.persist(meal);
        return meal;
    }

    async updateMeal(id: string, userId: string, dto: UpdateMealDto): Promise<Meal | null> {
        const meal = await this.getMealById(id, userId);
        if (!meal) return null;

        if (dto.name !== undefined) meal.name = dto.name;
        if (dto.description !== undefined) meal.description = dto.description;
        if (dto.imageUrl !== undefined) meal.imageUrl = dto.imageUrl;
        if (dto.ingredients !== undefined) meal.ingredients = dto.ingredients;
        if (dto.instructions !== undefined) meal.instructions = dto.instructions;
        if (dto.prepTime !== undefined) meal.prepTime = dto.prepTime;
        if (dto.cookTime !== undefined) meal.cookTime = dto.cookTime;
        if (dto.servings !== undefined) meal.servings = dto.servings;
        if (dto.mealType !== undefined) meal.mealType = dto.mealType;
        if (dto.cuisine !== undefined) meal.cuisine = dto.cuisine;
        if (dto.tags !== undefined) meal.tags = dto.tags;
        if (dto.nutrition !== undefined) meal.nutrition = dto.nutrition;
        if (dto.isFavorite !== undefined) meal.isFavorite = dto.isFavorite;
        if (dto.recipeUrl !== undefined) meal.recipeUrl = dto.recipeUrl;
        if (dto.source !== undefined) meal.source = dto.source;
        meal.updatedAt = new Date();

        await this.database.persist(meal);
        return meal;
    }

    async deleteMeal(id: string, userId: string): Promise<boolean> {
        const meal = await this.getMealById(id, userId);
        if (!meal) return false;

        await this.database.remove(meal);
        return true;
    }

    async markAsCooked(id: string, userId: string): Promise<Meal | null> {
        const meal = await this.getMealById(id, userId);
        if (!meal) return null;

        meal.timesCooked++;
        meal.lastMade = new Date();
        meal.updatedAt = new Date();

        await this.database.persist(meal);
        return meal;
    }

    async toggleFavorite(id: string, userId: string): Promise<Meal | null> {
        const meal = await this.getMealById(id, userId);
        if (!meal) return null;

        meal.isFavorite = !meal.isFavorite;
        meal.updatedAt = new Date();

        await this.database.persist(meal);
        return meal;
    }

    // Meal Plans
    async getMealPlans(userId: string, startDate: Date, endDate: Date): Promise<MealPlan[]> {
        const all = await this.database.query(MealPlan)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .find();

        return all.filter(plan => {
            const planDate = new Date(plan.date);
            return planDate >= startDate && planDate <= endDate;
        });
    }

    async getMealPlanById(id: string, userId: string): Promise<MealPlan | undefined> {
        return this.database.query(MealPlan)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .filter({ id })
            .findOneOrUndefined();
    }

    async createMealPlan(userId: string, dto: CreateMealPlanDto): Promise<MealPlan> {
        const plan = new MealPlan();
        plan.user = this.database.getReference(User, userId);
        plan.date = new Date(dto.date);
        plan.mealType = dto.mealType;
        if (dto.mealId) {
            plan.meal = this.database.getReference(Meal, dto.mealId);
        }
        plan.customMealName = dto.customMealName || '';
        plan.notes = dto.notes || '';
        plan.createdAt = new Date();

        await this.database.persist(plan);
        return plan;
    }

    async updateMealPlan(id: string, userId: string, dto: UpdateMealPlanDto): Promise<MealPlan | null> {
        const plan = await this.getMealPlanById(id, userId);
        if (!plan) return null;

        if (dto.date !== undefined) plan.date = new Date(dto.date);
        if (dto.mealType !== undefined) plan.mealType = dto.mealType;
        if (dto.mealId !== undefined) {
            plan.meal = dto.mealId ? this.database.getReference(Meal, dto.mealId) : undefined;
        }
        if (dto.customMealName !== undefined) plan.customMealName = dto.customMealName;
        if (dto.notes !== undefined) plan.notes = dto.notes;

        await this.database.persist(plan);
        return plan;
    }

    async deleteMealPlan(id: string, userId: string): Promise<boolean> {
        const plan = await this.getMealPlanById(id, userId);
        if (!plan) return false;

        await this.database.remove(plan);
        return true;
    }

    // Stats
    async getStats(userId: string): Promise<{
        totalMeals: number;
        totalCooked: number;
        favorites: number;
        byCuisine: { cuisine: string; count: number }[];
        recentlyCooked: Meal[];
    }> {
        const all = await this.database.query(Meal)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .find();

        const cuisineCounts: Record<string, number> = {};
        let totalCooked = 0;
        let favorites = 0;

        all.forEach(meal => {
            totalCooked += meal.timesCooked;
            if (meal.isFavorite) favorites++;
            if (meal.cuisine) {
                cuisineCounts[meal.cuisine] = (cuisineCounts[meal.cuisine] || 0) + 1;
            }
        });

        const recentlyCooked = all
            .filter(m => m.lastMade)
            .sort((a, b) => new Date(b.lastMade!).getTime() - new Date(a.lastMade!).getTime())
            .slice(0, 5);

        return {
            totalMeals: all.length,
            totalCooked,
            favorites,
            byCuisine: Object.entries(cuisineCounts).map(([cuisine, count]) => ({ cuisine, count })),
            recentlyCooked,
        };
    }

    // Generate shopping list from meal plans
    async getShoppingList(userId: string, startDate: Date, endDate: Date): Promise<{
        ingredient: string;
        amount: string;
        meals: string[];
    }[]> {
        const plans = await this.getMealPlans(userId, startDate, endDate);
        const ingredientMap: Record<string, { amounts: string[]; meals: string[] }> = {};

        for (const plan of plans) {
            if (plan.meal) {
                const meal = await this.getMealById(plan.meal.id, userId);
                if (meal) {
                    for (const ing of meal.ingredients) {
                        const key = ing.name.toLowerCase();
                        if (!ingredientMap[key]) {
                            ingredientMap[key] = { amounts: [], meals: [] };
                        }
                        if (ing.amount) {
                            ingredientMap[key].amounts.push(`${ing.amount}${ing.unit ? ' ' + ing.unit : ''}`);
                        }
                        if (!ingredientMap[key].meals.includes(meal.name)) {
                            ingredientMap[key].meals.push(meal.name);
                        }
                    }
                }
            }
        }

        return Object.entries(ingredientMap).map(([ingredient, data]) => ({
            ingredient,
            amount: data.amounts.join(', ') || '-',
            meals: data.meals,
        }));
    }
}
