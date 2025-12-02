import { useState, useMemo, useEffect } from 'react';
import {
    Container,
    Title,
    Text,
    Button,
    Group,
    Stack,
    Card,
    Badge,
    TextInput,
    Select,
    Textarea,
    NumberInput,
    Modal,
    ActionIcon,
    SimpleGrid,
    Image,
    Tabs,
    Paper,
    List,
    ThemeIcon,
    Divider,
    Checkbox,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { DatePickerInput } from '@mantine/dates';
import {
    IconPlus,
    IconSearch,
    IconToolsKitchen2,
    IconClock,
    IconFlame,
    IconStar,
    IconStarFilled,
    IconEdit,
    IconTrash,
    IconChefHat,
    IconCalendar,
    IconShoppingCart,
    IconCheck,
    IconMeat,
    IconSoup,
    IconCoffee,
    IconCookie,
} from '@tabler/icons-react';
import { useRequest, useMutation } from '../../../hooks';

import type { MealType, Ingredient, NutritionInfo } from '@ycmm/core';

interface Meal {
    id: string;
    userId: string;
    name: string;
    description: string;
    imageUrl: string;
    ingredients: Ingredient[];
    instructions: string;
    prepTime?: number;
    cookTime?: number;
    servings?: number;
    mealType: MealType[];
    cuisine: string;
    tags: string[];
    nutrition?: NutritionInfo;
    isFavorite: boolean;
    lastMade?: string;
    timesCooked: number;
    recipeUrl: string;
    source: string;
    createdAt: string;
    updatedAt: string;
}

interface MealPlan {
    id: string;
    date: string;
    mealType: MealType;
    mealId?: string;
    customMealName: string;
    notes: string;
}

interface MealStats {
    totalMeals: number;
    totalCooked: number;
    favorites: number;
    byCuisine: { cuisine: string; count: number }[];
    recentlyCooked: Meal[];
}

interface ShoppingItem {
    ingredient: string;
    amount: string;
    meals: string[];
}

interface CreateMealDto {
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
    recipeUrl?: string;
    source?: string;
}

interface CreateMealPlanDto {
    date: string;
    mealType: MealType;
    mealId?: string;
    customMealName?: string;
    notes?: string;
}

const mealTypeOptions: { value: MealType; label: string; icon: typeof IconCoffee }[] = [
    { value: 'breakfast', label: 'Frühstück', icon: IconCoffee },
    { value: 'lunch', label: 'Mittagessen', icon: IconSoup },
    { value: 'dinner', label: 'Abendessen', icon: IconMeat },
    { value: 'snack', label: 'Snack', icon: IconCookie },
];

const cuisineOptions = [
    'Deutsch', 'Italienisch', 'Asiatisch', 'Mexikanisch', 'Indisch',
    'Griechisch', 'Türkisch', 'Französisch', 'Amerikanisch', 'Mediterran',
    'Vegetarisch', 'Vegan', 'Andere',
];

function getMealTypeIcon(type: MealType) {
    const config = mealTypeOptions.find(t => t.value === type);
    const Icon = config?.icon || IconToolsKitchen2;
    return <Icon size={16} />;
}

function formatTime(minutes?: number): string {
    if (!minutes) return '-';
    if (minutes < 60) return `${minutes} Min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

export default function MealsPage() {
    const [activeTab, setActiveTab] = useState<string | null>('recipes');
    const [modalOpen, setModalOpen] = useState(false);
    const [planModalOpen, setPlanModalOpen] = useState(false);
    const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMealType, setSelectedMealType] = useState<string>('all');

    // Date range for meal plans (current week)
    const weekStart = useMemo(() => {
        const date = new Date();
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(date.setDate(diff));
    }, []);

    const weekEnd = useMemo(() => {
        const end = new Date(weekStart);
        end.setDate(end.getDate() + 6);
        return end;
    }, [weekStart]);

    const { data: meals, isLoading, refetch } = useRequest<Meal[]>('/meals');
    const { data: stats } = useRequest<MealStats>('/meals/stats');
    const { data: mealPlans, refetch: refetchPlans } = useRequest<MealPlan[]>(
        `/meal-plans?startDate=${weekStart.toISOString()}&endDate=${weekEnd.toISOString()}`
    );
    const { data: shoppingList } = useRequest<ShoppingItem[]>(
        `/meal-plans/shopping-list?startDate=${weekStart.toISOString()}&endDate=${weekEnd.toISOString()}`
    );

    const { mutate: createMeal } = useMutation<Meal, CreateMealDto>(
        '/meals',
        { method: 'POST' }
    );

    const { mutate: updateMeal } = useMutation<Meal, { id: string; data: Partial<CreateMealDto> }>(
        (vars) => `/meals/${vars.id}`,
        { method: 'PATCH' }
    );

    const { mutate: deleteMeal } = useMutation<{ success: boolean }, { id: string }>(
        (vars) => `/meals/${vars.id}`,
        { method: 'DELETE' }
    );

    const { mutate: toggleFavorite } = useMutation<Meal, { id: string }>(
        (vars) => `/meals/${vars.id}/favorite`,
        { method: 'POST' }
    );

    const { mutate: markCooked } = useMutation<Meal, { id: string }>(
        (vars) => `/meals/${vars.id}/cooked`,
        { method: 'POST' }
    );

    const { mutate: createPlan } = useMutation<MealPlan, CreateMealPlanDto>(
        '/meal-plans',
        { method: 'POST' }
    );

    const { mutate: deletePlan } = useMutation<{ success: boolean }, { id: string }>(
        (vars) => `/meal-plans/${vars.id}`,
        { method: 'DELETE' }
    );

    const form = useForm({
        initialValues: {
            name: '',
            description: '',
            imageUrl: '',
            ingredients: '' as string, // Will be parsed
            instructions: '',
            prepTime: undefined as number | undefined,
            cookTime: undefined as number | undefined,
            servings: undefined as number | undefined,
            mealType: [] as MealType[],
            cuisine: '',
            recipeUrl: '',
            source: '',
        },
    });

    const planForm = useForm({
        initialValues: {
            date: new Date(),
            mealType: 'dinner' as MealType,
            mealId: '' as string,
            customMealName: '',
            notes: '',
        },
    });

    const filteredMeals = useMemo(() => {
        if (!meals) return [];
        return meals.filter(meal => {
            const matchesSearch = meal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                meal.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = selectedMealType === 'all' || meal.mealType.includes(selectedMealType as MealType);
            return matchesSearch && matchesType;
        });
    }, [meals, searchQuery, selectedMealType]);

    const openCreateModal = () => {
        setEditingMeal(null);
        form.reset();
        setModalOpen(true);
    };


