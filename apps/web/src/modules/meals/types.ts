import type { MealType, Ingredient } from '@ycmm/core';
import { IconCoffee, IconSoup, IconMeat, IconCookie } from '@tabler/icons-react';

// Meal Type Options
export const mealTypeOptions = [
    { value: 'breakfast' as MealType, label: 'meals.types.breakfast', icon: IconCoffee },
    { value: 'lunch' as MealType, label: 'meals.types.lunch', icon: IconSoup },
    { value: 'dinner' as MealType, label: 'meals.types.dinner', icon: IconMeat },
    { value: 'snack' as MealType, label: 'meals.types.snack', icon: IconCookie },
];

// Cuisine Options
export const cuisineOptions = [
    'meals.cuisines.german',
    'meals.cuisines.italian',
    'meals.cuisines.asian',
    'meals.cuisines.mexican',
    'meals.cuisines.indian',
    'meals.cuisines.greek',
    'meals.cuisines.turkish',
    'meals.cuisines.french',
    'meals.cuisines.american',
    'meals.cuisines.mediterranean',
    'meals.cuisines.vegetarian',
    'meals.cuisines.vegan',
    'meals.cuisines.other',
];

// Unit Options
export const unitOptions = [
    { value: '', label: 'meals.units.none' },
    { value: 'g', label: 'meals.units.g' },
    { value: 'kg', label: 'meals.units.kg' },
    { value: 'ml', label: 'meals.units.ml' },
    { value: 'l', label: 'meals.units.l' },
    { value: 'TL', label: 'meals.units.tl' },
    { value: 'EL', label: 'meals.units.el' },
    { value: 'Stück', label: 'meals.units.piece' },
    { value: 'Tasse', label: 'meals.units.cup' },
    { value: 'Prise', label: 'meals.units.pinch' },
    { value: 'Bund', label: 'meals.units.bunch' },
    { value: 'Zehen', label: 'meals.units.cloves' },
    { value: 'Scheiben', label: 'meals.units.slices' },
    { value: 'Packung', label: 'meals.units.pack' },
    { value: 'Dose', label: 'meals.units.can' },
];

// Default Form Values
export interface MealFormValues {
    name: string;
    description: string;
    imageUrl: string;
    ingredients: Ingredient[];
    instructions: string;
    prepTime: number | undefined;
    cookTime: number | undefined;
    servings: number | undefined;
    mealType: MealType[];
    cuisine: string;
    recipeUrl: string;
    source: string;
}

export const defaultMealForm: MealFormValues = {
    name: '',
    description: '',
    imageUrl: '',
    ingredients: [],
    instructions: '',
    prepTime: undefined,
    cookTime: undefined,
    servings: undefined,
    mealType: [],
    cuisine: '',
    recipeUrl: '',
    source: '',
};

export interface MealPlanFormValues {
    date: Date;
    mealType: MealType;
    mealId: string;
    customMealName: string;
    notes: string;
}

export const defaultMealPlanForm: MealPlanFormValues = {
    date: new Date(),
    mealType: 'dinner',
    mealId: '',
    customMealName: '',
    notes: '',
};

// Utility Functions
export function formatTime(minutes?: number): string {
    if (!minutes) return '-';
    if (minutes < 60) return `${minutes} Min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}
