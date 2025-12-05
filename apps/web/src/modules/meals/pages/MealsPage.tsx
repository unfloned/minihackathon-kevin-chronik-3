import { useState, useMemo } from 'react';
import {
    Container,
    Text,
    Button,
    Group,
    Stack,
    TextInput,
    Select,
    Tabs,
    Paper,
    SimpleGrid,
    SegmentedControl,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
    IconPlus,
    IconSearch,
    IconChefHat,
    IconCalendar,
    IconShoppingCart,
    IconCheck,
    IconStarFilled,
    IconToolsKitchen2,
    IconLayoutGrid,
    IconList,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useRequest, useMutation, useViewMode } from '../../../hooks';
import { PageTitle } from '../../../components/PageTitle';
import { CardStatistic } from '../../../components/CardStatistic';
import type {
    MealType,
    Ingredient,
    MealWithDetails,
    MealPlanWithDetails,
    MealStats,
    ShoppingListItem,
    CreateMealDto,
    CreateMealPlanDto,
} from '@ycmm/core';
import {
    mealTypeOptions,
    defaultMealForm,
    defaultMealPlanForm,
    type MealFormValues,
    type MealPlanFormValues,
} from '../types';
import {
    GridView,
    ListView,
    MealFormModal,
    MealPlanModal,
    PlannerView,
    ShoppingListView,
} from '../components';

// Alias for component usage
type Meal = MealWithDetails;
type MealPlan = MealPlanWithDetails;
type ShoppingItem = ShoppingListItem;

export default function MealsPage() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<string | null>('recipes');
    const [modalOpen, setModalOpen] = useState(false);
    const [planModalOpen, setPlanModalOpen] = useState(false);
    const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMealType, setSelectedMealType] = useState<string>('all');
    const [globalViewMode, setViewMode] = useViewMode();
    // Fallback to 'grid' if global viewMode is not supported by this page
    const viewMode = ['grid', 'list'].includes(globalViewMode) ? globalViewMode : 'grid';

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

    const weekDays = useMemo(() => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(date.getDate() + i);
            days.push(date);
        }
        return days;
    }, [weekStart]);

    // API Requests
    const { data: meals, isLoading, refetch } = useRequest<Meal[]>('/meals');
    const { data: stats } = useRequest<MealStats>('/meals/stats');
    const { data: mealPlans, refetch: refetchPlans } = useRequest<MealPlan[]>(
        `/meal-plans?startDate=${weekStart.toISOString()}&endDate=${weekEnd.toISOString()}`
    );
    const { data: shoppingList } = useRequest<ShoppingItem[]>(
        `/meal-plans/shopping-list?startDate=${weekStart.toISOString()}&endDate=${weekEnd.toISOString()}`
    );

    // Mutations
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

    // Forms
    const form = useForm<MealFormValues>({
        initialValues: defaultMealForm,
    });

    const planForm = useForm<MealPlanFormValues>({
        initialValues: defaultMealPlanForm,
    });

    // Filtered meals
    const filteredMeals = useMemo(() => {
        if (!meals) return [];
        return meals.filter(meal => {
            const matchesSearch = meal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                meal.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = selectedMealType === 'all' || meal.mealType.includes(selectedMealType as MealType);
            return matchesSearch && matchesType;
        });
    }, [meals, searchQuery, selectedMealType]);

    // Ingredient handlers
    const addIngredient = () => {
        form.setFieldValue('ingredients', [
            ...form.values.ingredients,
            { name: '', amount: '', unit: '' },
        ]);
    };

    const removeIngredient = (index: number) => {
        form.setFieldValue(
            'ingredients',
            form.values.ingredients.filter((_, i) => i !== index)
        );
    };

    const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
        const updated = [...form.values.ingredients];
        updated[index] = { ...updated[index], [field]: value };
        form.setFieldValue('ingredients', updated);
    };

    // Modal handlers
    const openCreateModal = () => {
        setEditingMeal(null);
        form.reset();
        setModalOpen(true);
    };

    const openEditModal = (meal: Meal) => {
        setEditingMeal(meal);
        form.setValues({
            name: meal.name,
            description: meal.description || '',
            imageUrl: meal.imageUrl || '',
            ingredients: meal.ingredients || [],
            instructions: meal.instructions || '',
            prepTime: meal.prepTime,
            cookTime: meal.cookTime,
            servings: meal.servings,
            mealType: meal.mealType || [],
            cuisine: meal.cuisine || '',
            recipeUrl: meal.recipeUrl || '',
            source: meal.source || '',
        });
        setModalOpen(true);
    };

    const openPlanModal = (date?: Date, mealType?: MealType) => {
        planForm.reset();
        if (date) planForm.setFieldValue('date', date);
        if (mealType) planForm.setFieldValue('mealType', mealType);
        setPlanModalOpen(true);
    };

    // Submit handlers
    const handleSubmitMeal = async (values: MealFormValues) => {
        // Filter out empty ingredients
        const validIngredients = values.ingredients.filter(ing => ing.name.trim());

        const mealData: CreateMealDto = {
            name: values.name,
            description: values.description || undefined,
            imageUrl: values.imageUrl || undefined,
            ingredients: validIngredients.length > 0 ? validIngredients : undefined,
            instructions: values.instructions || undefined,
            prepTime: values.prepTime,
            cookTime: values.cookTime,
            servings: values.servings,
            mealType: values.mealType.length > 0 ? values.mealType : undefined,
            cuisine: values.cuisine || undefined,
            recipeUrl: values.recipeUrl || undefined,
            source: values.source || undefined,
        };

        if (editingMeal) {
            await updateMeal({ id: editingMeal.id, data: mealData });
        } else {
            await createMeal(mealData);
        }

        setModalOpen(false);
        refetch();
    };

    const handleSubmitPlan = async (values: MealPlanFormValues) => {
        const planData: CreateMealPlanDto = {
            date: values.date.toISOString(),
            mealType: values.mealType,
            mealId: values.mealId || undefined,
            customMealName: values.customMealName || undefined,
            notes: values.notes || undefined,
        };

        await createPlan(planData);
        setPlanModalOpen(false);
        refetchPlans();
    };

    // Action handlers
    const handleDeleteMeal = async (id: string) => {
        if (confirm(t('meals.deleteConfirm'))) {
            await deleteMeal({ id });
            refetch();
        }
    };

    const handleToggleFavorite = async (id: string) => {
        await toggleFavorite({ id });
        refetch();
    };

    const handleMarkCooked = async (id: string) => {
        await markCooked({ id });
        refetch();
    };

    const handleDeletePlan = async (id: string) => {
        if (confirm(t('meals.deletePlanConfirm'))) {
            await deletePlan({ id });
            refetchPlans();
        }
    };

    return (
        <Container size="xl" py="xl">
            <Stack gap="lg">
                <PageTitle title={t('meals.title')} subtitle={t('meals.subtitle')} />

                {stats && (
                    <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
                        <CardStatistic
                            type="icon"
                            title={t('meals.stats.total')}
                            value={stats.totalMeals}
                            icon={IconChefHat}
                            color="blue"
                            subtitle={t('meals.stats.totalSubtitle')}
                        />
                        <CardStatistic
                            type="icon"
                            title={t('meals.stats.cooked')}
                            value={stats.totalCooked}
                            icon={IconCheck}
                            color="green"
                            subtitle={t('meals.stats.cookedSubtitle')}
                        />
                        <CardStatistic
                            type="icon"
                            title={t('meals.stats.favorites')}
                            value={stats.favorites}
                            icon={IconStarFilled}
                            color="yellow"
                            subtitle={t('meals.stats.favoritesSubtitle')}
                        />
                        <CardStatistic
                            type="icon"
                            title={t('meals.stats.cuisines')}
                            value={stats.byCuisine.length}
                            icon={IconToolsKitchen2}
                            color="grape"
                            subtitle={t('meals.stats.cuisinesSubtitle')}
                        />
                    </SimpleGrid>
                )}

                <Tabs value={activeTab} onChange={setActiveTab}>
                    <Tabs.List>
                        <Tabs.Tab value="recipes" leftSection={<IconChefHat size={16} />}>
                            {t('meals.tabs.recipes')}
                        </Tabs.Tab>
                        <Tabs.Tab value="planner" leftSection={<IconCalendar size={16} />}>
                            {t('meals.tabs.planner')}
                        </Tabs.Tab>
                        <Tabs.Tab value="shopping" leftSection={<IconShoppingCart size={16} />}>
                            {t('meals.tabs.shopping')}
                        </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="recipes" pt="xl">
                        <Stack gap="lg">
                            <Paper shadow="sm" withBorder p="md" radius="md">
                                <Group>
                                    <TextInput
                                        placeholder={t('meals.search')}
                                        leftSection={<IconSearch size={16} />}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        style={{ flex: 1 }}
                                    />
                                    <Select
                                        placeholder={t('meals.mealTypeFilter')}
                                        data={[
                                            { value: 'all', label: t('meals.all') },
                                            ...mealTypeOptions.map(opt => ({ value: opt.value, label: t(opt.label) }))
                                        ]}
                                        value={selectedMealType}
                                        onChange={(value) => setSelectedMealType(value || 'all')}
                                        style={{ width: 200 }}
                                    />
                                    <SegmentedControl
                                        value={viewMode}
                                        onChange={(value) => setViewMode(value as 'grid' | 'list')}
                                        data={[
                                            { value: 'grid', label: <IconLayoutGrid size={16} /> },
                                            { value: 'list', label: <IconList size={16} /> },
                                        ]}
                                    />
                                    <Button leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
                                        {t('meals.newRecipe')}
                                    </Button>
                                </Group>
                            </Paper>

                            {isLoading ? (
                                <Text>{t('meals.loading')}</Text>
                            ) : viewMode === 'grid' ? (
                                <GridView
                                    meals={filteredMeals}
                                    onToggleFavorite={handleToggleFavorite}
                                    onMarkCooked={handleMarkCooked}
                                    onEdit={openEditModal}
                                    onDelete={handleDeleteMeal}
                                />
                            ) : (
                                <ListView
                                    meals={filteredMeals}
                                    onToggleFavorite={handleToggleFavorite}
                                    onMarkCooked={handleMarkCooked}
                                    onEdit={openEditModal}
                                    onDelete={handleDeleteMeal}
                                />
                            )}

                            {!isLoading && filteredMeals.length === 0 && (
                                <Paper shadow="sm" p="xl" radius="md" withBorder>
                                    <Stack align="center" gap="md">
                                        <IconChefHat size={60} opacity={0.3} />
                                        <Text size="lg" c="dimmed">{t('meals.noRecipesFound')}</Text>
                                        <Button onClick={openCreateModal}>{t('meals.createFirstRecipe')}</Button>
                                    </Stack>
                                </Paper>
                            )}
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="planner" pt="xl">
                        <PlannerView
                            weekStart={weekStart}
                            weekEnd={weekEnd}
                            weekDays={weekDays}
                            mealPlans={mealPlans || undefined}
                            meals={meals || undefined}
                            onPlanMeal={openPlanModal}
                            onDeletePlan={handleDeletePlan}
                        />
                    </Tabs.Panel>

                    <Tabs.Panel value="shopping" pt="xl">
                        <ShoppingListView
                            weekStart={weekStart}
                            weekEnd={weekEnd}
                            shoppingList={shoppingList || undefined}
                        />
                    </Tabs.Panel>
                </Tabs>
            </Stack>

            <MealFormModal
                opened={modalOpen}
                onClose={() => setModalOpen(false)}
                form={form}
                onSubmit={handleSubmitMeal}
                editingMeal={editingMeal}
                onAddIngredient={addIngredient}
                onRemoveIngredient={removeIngredient}
                onUpdateIngredient={updateIngredient}
            />

            <MealPlanModal
                opened={planModalOpen}
                onClose={() => setPlanModalOpen(false)}
                form={planForm}
                onSubmit={handleSubmitPlan}
                meals={meals || undefined}
            />
        </Container>
    );
}
