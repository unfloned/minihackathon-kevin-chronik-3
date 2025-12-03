import { entity, PrimaryKey, Reference, uuid, UUID, Index } from '@deepkit/type';
import { User } from './user.entity.js';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface Ingredient {
    name: string;
    amount?: string;
    unit?: string;
}

export interface NutritionInfo {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
}

@entity.name('meals')
export class Meal {
    id: UUID & PrimaryKey = uuid();
    user!: User & Reference;

    name: string = '';
    description: string = '';
    imageUrl: string = '';

    ingredients: Ingredient[] = [];
    instructions: string = '';
    prepTime?: number;
    cookTime?: number;
    servings?: number;

    mealType: MealType[] = [];
    cuisine: string = '';
    tags: string[] = [];

    nutrition?: NutritionInfo;

    isFavorite: boolean = false;
    lastMade?: Date;
    timesCooked: number = 0;

    recipeUrl: string = '';
    source: string = '';

    createdAt: Date = new Date();
    updatedAt: Date = new Date();
}

export type MealFrontend = Readonly<Meal>;

@entity.name('meal_plans')
export class MealPlan {
    id: UUID & PrimaryKey = uuid();
    user!: User & Reference;
    meal?: Meal & Reference;

    date: Date & Index = new Date();
    mealType: MealType = 'dinner';
    customMealName: string = '';
    notes: string = '';

    createdAt: Date = new Date();
}

export type MealPlanFrontend = Readonly<MealPlan>;
