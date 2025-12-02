import { entity, PrimaryKey, Index } from '@deepkit/type';

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
    id: string & PrimaryKey = '';
    userId: string & Index = '';

    // Basic Info
    name: string = '';
    description: string = '';
    imageUrl: string = '';

    // Recipe
    ingredients: Ingredient[] = [];
    instructions: string = '';
    prepTime?: number; // minutes
    cookTime?: number; // minutes
    servings?: number;

    // Categorization
    mealType: MealType[] = [];
    cuisine: string = '';
    tags: string[] = [];

    // Nutrition
    nutrition?: NutritionInfo;

    // Planning
    isFavorite: boolean = false;
    lastMade?: Date;
    timesCooked: number = 0;

    // Source
    recipeUrl: string = '';
    source: string = ''; // Cookbook name, website, etc.

    // Meta
    createdAt: Date = new Date();
    updatedAt: Date = new Date();
}

@entity.name('meal_plans')
export class MealPlan {
    id: string & PrimaryKey = '';
    userId: string & Index = '';

    date: Date & Index = new Date();
    mealType: MealType = 'dinner';
    mealId?: string; // Reference to a saved meal
    customMealName: string = ''; // Or a custom meal name
    notes: string = '';

    createdAt: Date = new Date();
}
