import { useState, useMemo } from 'react';
import {
    Container,
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
    Divider,
    Checkbox,
    CloseButton,
    Box,
    Table,
    SegmentedControl,
    Menu,
    ThemeIcon,
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
    IconLayoutGrid,
    IconList,
    IconDotsVertical,
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

// Alias for component usage
type Meal = MealWithDetails;
type MealPlan = MealPlanWithDetails;
type ShoppingItem = ShoppingListItem;

function formatTime(minutes?: number): string {
    if (!minutes) return '-';
    if (minutes < 60) return `${minutes} Min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

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

    const mealTypeOptions: { value: MealType; label: string; icon: typeof IconCoffee }[] = [
        { value: 'breakfast', label: t('meals.types.breakfast'), icon: IconCoffee },
        { value: 'lunch', label: t('meals.types.lunch'), icon: IconSoup },
        { value: 'dinner', label: t('meals.types.dinner'), icon: IconMeat },
        { value: 'snack', label: t('meals.types.snack'), icon: IconCookie },
    ];

    const cuisineOptions = [
        t('meals.cuisines.german'),
        t('meals.cuisines.italian'),
        t('meals.cuisines.asian'),
        t('meals.cuisines.mexican'),
        t('meals.cuisines.indian'),
        t('meals.cuisines.greek'),
        t('meals.cuisines.turkish'),
        t('meals.cuisines.french'),
        t('meals.cuisines.american'),
        t('meals.cuisines.mediterranean'),
        t('meals.cuisines.vegetarian'),
        t('meals.cuisines.vegan'),
        t('meals.cuisines.other'),
    ];

    const getMealTypeIcon = (type: MealType) => {
        const config = mealTypeOptions.find(t => t.value === type);
        const Icon = config?.icon || IconToolsKitchen2;
        return <Icon size={16} />;
    };

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
            ingredients: [] as Ingredient[],
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

    const unitOptions = [
        { value: '', label: t('meals.units.none') },
        { value: 'g', label: t('meals.units.g') },
        { value: 'kg', label: t('meals.units.kg') },
        { value: 'ml', label: t('meals.units.ml') },
        { value: 'l', label: t('meals.units.l') },
        { value: 'TL', label: t('meals.units.tl') },
        { value: 'EL', label: t('meals.units.el') },
        { value: 'Stück', label: t('meals.units.piece') },
        { value: 'Tasse', label: t('meals.units.cup') },
        { value: 'Prise', label: t('meals.units.pinch') },
        { value: 'Bund', label: t('meals.units.bunch') },
        { value: 'Zehen', label: t('meals.units.cloves') },
        { value: 'Scheiben', label: t('meals.units.slices') },
        { value: 'Packung', label: t('meals.units.pack') },
        { value: 'Dose', label: t('meals.units.can') },
    ];

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

    const handleSubmitMeal = async (values: typeof form.values) => {
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

    const handleSubmitPlan = async (values: typeof planForm.values) => {
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

    const handleDeletePlan = async (id: string) => {
        if (confirm(t('meals.deletePlanConfirm'))) {
            await deletePlan({ id });
            refetchPlans();
        }
    };

    const openPlanModal = (date?: Date, mealType?: MealType) => {
        planForm.reset();
        if (date) planForm.setFieldValue('date', date);
        if (mealType) planForm.setFieldValue('mealType', mealType);
        setPlanModalOpen(true);
    };

    const getMealForPlan = (mealId?: string) => {
        if (!mealId || !meals) return null;
        return meals.find(m => m.id === mealId);
    };

    const weekDays = useMemo(() => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(date.getDate() + i);
            days.push(date);
        }
        return days;
    }, [weekStart]);

    const getPlansByDate = (date: Date) => {
        if (!mealPlans) return [];
        const dateStr = date.toISOString().split('T')[0];
        return mealPlans.filter(plan => plan.date.split('T')[0] === dateStr);
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
                                            ...mealTypeOptions.map(opt => ({ value: opt.value, label: opt.label }))
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
                                <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
                                    {filteredMeals.map(meal => (
                                        <Card key={meal.id} shadow="sm" padding="lg" radius="md" withBorder>
                                            <Card.Section>
                                                {meal.imageUrl ? (
                                                    <Image
                                                        src={meal.imageUrl}
                                                        height={200}
                                                        alt={meal.name}
                                                    />
                                                ) : (
                                                    <div style={{
                                                        height: 200,
                                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <IconChefHat size={60} color="white" opacity={0.5} />
                                                    </div>
                                                )}
                                            </Card.Section>

                                            <Stack gap="sm" mt="md">
                                                <Group justify="space-between">
                                                    <Text fw={500} size="lg">{meal.name}</Text>
                                                    <ActionIcon
                                                        variant="subtle"
                                                        color={meal.isFavorite ? 'yellow' : 'gray'}
                                                        onClick={() => handleToggleFavorite(meal.id)}
                                                    >
                                                        {meal.isFavorite ? <IconStarFilled size={20} /> : <IconStar size={20} />}
                                                    </ActionIcon>
                                                </Group>

                                                {meal.description && (
                                                    <Text size="sm" c="dimmed" lineClamp={2}>
                                                        {meal.description}
                                                    </Text>
                                                )}

                                                <Group gap="xs">
                                                    {meal.mealType.map(type => (
                                                        <Badge
                                                            key={type}
                                                            variant="light"
                                                            leftSection={getMealTypeIcon(type)}
                                                        >
                                                            {mealTypeOptions.find(opt => opt.value === type)?.label}
                                                        </Badge>
                                                    ))}
                                                </Group>

                                                {meal.cuisine && (
                                                    <Badge variant="outline">{meal.cuisine}</Badge>
                                                )}

                                                <Group gap="lg">
                                                    {(meal.prepTime || meal.cookTime) && (
                                                        <Group gap={5}>
                                                            <IconClock size={16} />
                                                            <Text size="sm">
                                                                {formatTime((meal.prepTime || 0) + (meal.cookTime || 0))}
                                                            </Text>
                                                        </Group>
                                                    )}
                                                    {meal.servings && (
                                                        <Text size="sm">{t('meals.servingsCount', { count: meal.servings })}</Text>
                                                    )}
                                                </Group>

                                                {meal.timesCooked > 0 && (
                                                    <Group gap={5}>
                                                        <IconFlame size={16} />
                                                        <Text size="sm">{t('meals.timesCooked', { count: meal.timesCooked })}</Text>
                                                    </Group>
                                                )}

                                                <Divider />

                                                <Group justify="space-between">
                                                    <Button
                                                        variant="light"
                                                        size="xs"
                                                        onClick={() => handleMarkCooked(meal.id)}
                                                    >
                                                        {t('meals.markAsCooked')}
                                                    </Button>
                                                    <Group gap="xs">
                                                        <ActionIcon
                                                            variant="subtle"
                                                            onClick={() => openEditModal(meal)}
                                                        >
                                                            <IconEdit size={16} />
                                                        </ActionIcon>
                                                        <ActionIcon
                                                            variant="subtle"
                                                            color="red"
                                                            onClick={() => handleDeleteMeal(meal.id)}
                                                        >
                                                            <IconTrash size={16} />
                                                        </ActionIcon>
                                                    </Group>
                                                </Group>
                                            </Stack>
                                        </Card>
                                    ))}
                                </SimpleGrid>
                            ) : (
                                <Paper shadow="sm" withBorder radius="md">
                                    <Table striped highlightOnHover>
                                        <Table.Thead>
                                            <Table.Tr>
                                                <Table.Th>{t('meals.table.recipe')}</Table.Th>
                                                <Table.Th>{t('meals.table.type')}</Table.Th>
                                                <Table.Th>{t('meals.table.cuisine')}</Table.Th>
                                                <Table.Th>{t('meals.table.time')}</Table.Th>
                                                <Table.Th>{t('meals.table.servings')}</Table.Th>
                                                <Table.Th>{t('meals.table.cooked')}</Table.Th>
                                                <Table.Th>{t('meals.table.actions')}</Table.Th>
                                            </Table.Tr>
                                        </Table.Thead>
                                        <Table.Tbody>
                                            {filteredMeals.map(meal => (
                                                <Table.Tr key={meal.id}>
                                                    <Table.Td>
                                                        <Group gap="sm">
                                                            {meal.imageUrl ? (
                                                                <Image src={meal.imageUrl} width={40} height={40} radius="sm" fit="cover" />
                                                            ) : (
                                                                <ThemeIcon size={40} variant="light" color="grape">
                                                                    <IconChefHat size={20} />
                                                                </ThemeIcon>
                                                            )}
                                                            <div>
                                                                <Group gap={4}>
                                                                    <Text fw={500} size="sm">{meal.name}</Text>
                                                                    {meal.isFavorite && <IconStarFilled size={14} style={{ color: 'gold' }} />}
                                                                </Group>
                                                                {meal.description && <Text size="xs" c="dimmed" lineClamp={1}>{meal.description}</Text>}
                                                            </div>
                                                        </Group>
                                                    </Table.Td>
                                                    <Table.Td>
                                                        <Group gap={4}>
                                                            {meal.mealType.map(type => (
                                                                <Badge key={type} size="xs" variant="light">
                                                                    {mealTypeOptions.find(opt => opt.value === type)?.label}
                                                                </Badge>
                                                            ))}
                                                        </Group>
                                                    </Table.Td>
                                                    <Table.Td>{meal.cuisine || '-'}</Table.Td>
                                                    <Table.Td>{formatTime((meal.prepTime || 0) + (meal.cookTime || 0))}</Table.Td>
                                                    <Table.Td>{meal.servings || '-'}</Table.Td>
                                                    <Table.Td>
                                                        {meal.timesCooked > 0 ? (
                                                            <Group gap={4}>
                                                                <IconFlame size={14} />
                                                                <Text size="sm">{meal.timesCooked}x</Text>
                                                            </Group>
                                                        ) : '-'}
                                                    </Table.Td>
                                                    <Table.Td>
                                                        <Menu shadow="md" position="bottom-end">
                                                            <Menu.Target>
                                                                <ActionIcon variant="subtle" size="sm">
                                                                    <IconDotsVertical size={16} />
                                                                </ActionIcon>
                                                            </Menu.Target>
                                                            <Menu.Dropdown>
                                                                <Menu.Item
                                                                    leftSection={<IconCheck size={16} />}
                                                                    onClick={() => handleMarkCooked(meal.id)}
                                                                >
                                                                    {t('meals.markAsCooked')}
                                                                </Menu.Item>
                                                                <Menu.Item
                                                                    leftSection={meal.isFavorite ? <IconStarFilled size={16} /> : <IconStar size={16} />}
                                                                    onClick={() => handleToggleFavorite(meal.id)}
                                                                >
                                                                    {meal.isFavorite ? t('meals.removeFavorite') : t('meals.addFavorite')}
                                                                </Menu.Item>
                                                                <Menu.Divider />
                                                                <Menu.Item
                                                                    leftSection={<IconEdit size={16} />}
                                                                    onClick={() => openEditModal(meal)}
                                                                >
                                                                    {t('meals.edit')}
                                                                </Menu.Item>
                                                                <Menu.Item
                                                                    leftSection={<IconTrash size={16} />}
                                                                    color="red"
                                                                    onClick={() => handleDeleteMeal(meal.id)}
                                                                >
                                                                    {t('meals.delete')}
                                                                </Menu.Item>
                                                            </Menu.Dropdown>
                                                        </Menu>
                                                    </Table.Td>
                                                </Table.Tr>
                                            ))}
                                        </Table.Tbody>
                                    </Table>
                                </Paper>
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
                        <Stack gap="lg">
                            <Group justify="space-between">
                                <Text size="lg" fw={500}>
                                    {t('meals.planner.weekOf', {
                                        start: weekStart.toLocaleDateString('de-DE'),
                                        end: weekEnd.toLocaleDateString('de-DE')
                                    })}
                                </Text>
                                <Button
                                    leftSection={<IconPlus size={16} />}
                                    onClick={() => openPlanModal()}
                                >
                                    {t('meals.planner.planMeal')}
                                </Button>
                            </Group>

                            <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 7 }} spacing="md">
                                {weekDays.map(date => {
                                    const plans = getPlansByDate(date);
                                    const isToday = date.toDateString() === new Date().toDateString();

                                    return (
                                        <Paper
                                            key={date.toISOString()}
                                            shadow="sm"
                                            p="md"
                                            radius="md"
                                            withBorder
                                            style={{
                                                background: isToday ? 'var(--mantine-color-blue-0)' : undefined
                                            }}
                                        >
                                            <Stack gap="sm">
                                                <div>
                                                    <Text size="xs" c="dimmed">
                                                        {date.toLocaleDateString('de-DE', { weekday: 'short' })}
                                                    </Text>
                                                    <Text fw={500}>
                                                        {date.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}
                                                    </Text>
                                                </div>

                                                <Stack gap="xs">
                                                    {mealTypeOptions.map(mealTypeOpt => {
                                                        const plan = plans.find(p => p.mealType === mealTypeOpt.value);
                                                        const meal = plan?.meal || (plan ? getMealForPlan(plan.meal?.id) : null);

                                                        return (
                                                            <Paper
                                                                key={mealTypeOpt.value}
                                                                p="xs"
                                                                withBorder
                                                                style={{ cursor: 'pointer' }}
                                                                onClick={() => !plan && openPlanModal(date, mealTypeOpt.value)}
                                                            >
                                                                {plan ? (
                                                                    <Group justify="space-between" gap="xs">
                                                                        <Stack gap={2} style={{ flex: 1 }}>
                                                                            <Group gap={5}>
                                                                                {getMealTypeIcon(mealTypeOpt.value)}
                                                                                <Text size="xs" c="dimmed">
                                                                                    {mealTypeOpt.label}
                                                                                </Text>
                                                                            </Group>
                                                                            <Text size="sm" lineClamp={2}>
                                                                                {meal?.name || plan.customMealName || t('meals.planner.planned')}
                                                                            </Text>
                                                                        </Stack>
                                                                        <ActionIcon
                                                                            size="sm"
                                                                            variant="subtle"
                                                                            color="red"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleDeletePlan(plan.id);
                                                                            }}
                                                                        >
                                                                            <IconTrash size={14} />
                                                                        </ActionIcon>
                                                                    </Group>
                                                                ) : (
                                                                    <Group gap={5}>
                                                                        {getMealTypeIcon(mealTypeOpt.value)}
                                                                        <Text size="xs" c="dimmed">
                                                                            {mealTypeOpt.label}
                                                                        </Text>
                                                                    </Group>
                                                                )}
                                                            </Paper>
                                                        );
                                                    })}
                                                </Stack>
                                            </Stack>
                                        </Paper>
                                    );
                                })}
                            </SimpleGrid>
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="shopping" pt="xl">
                        <Stack gap="lg">
                            <Group justify="space-between">
                                <div>
                                    <Text size="lg" fw={500}>{t('meals.shopping.title')}</Text>
                                    <Text size="sm" c="dimmed">
                                        {t('meals.shopping.weekRange', {
                                            start: weekStart.toLocaleDateString('de-DE'),
                                            end: weekEnd.toLocaleDateString('de-DE')
                                        })}
                                    </Text>
                                </div>
                            </Group>

                            {shoppingList && shoppingList.length > 0 ? (
                                <Paper shadow="sm" p="lg" radius="md" withBorder>
                                    <Stack gap="md">
                                        {shoppingList.map((item, idx) => (
                                            <Group key={idx} gap="md">
                                                <Checkbox />
                                                <div style={{ flex: 1 }}>
                                                    <Text>
                                                        {item.amount} {item.ingredient}
                                                    </Text>
                                                    <Text size="xs" c="dimmed">
                                                        {item.meals.join(', ')}
                                                    </Text>
                                                </div>
                                            </Group>
                                        ))}
                                    </Stack>
                                </Paper>
                            ) : (
                                <Paper shadow="sm" p="xl" radius="md" withBorder>
                                    <Stack align="center" gap="md">
                                        <IconShoppingCart size={60} opacity={0.3} />
                                        <Text size="lg" c="dimmed">{t('meals.shopping.noList')}</Text>
                                        <Text size="sm" c="dimmed" ta="center">
                                            {t('meals.shopping.noListHint')}
                                        </Text>
                                    </Stack>
                                </Paper>
                            )}
                        </Stack>
                    </Tabs.Panel>
                </Tabs>
            </Stack>

            {/* Meal Create/Edit Modal */}
            <Modal
                opened={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingMeal ? t('meals.editMeal') : t('meals.newMeal')}
                size="lg"
            >
                <form onSubmit={form.onSubmit(handleSubmitMeal)}>
                    <Stack gap="md">
                        <TextInput
                            label={t('meals.name')}
                            placeholder={t('meals.namePlaceholder')}
                            required
                            {...form.getInputProps('name')}
                        />

                        <Textarea
                            label={t('meals.description')}
                            placeholder={t('meals.descriptionPlaceholder')}
                            rows={2}
                            {...form.getInputProps('description')}
                        />

                        <TextInput
                            label={t('meals.imageUrl')}
                            placeholder={t('meals.imageUrlPlaceholder')}
                            {...form.getInputProps('imageUrl')}
                        />

                        <Box>
                            <Group justify="space-between" mb="xs">
                                <Text size="sm" fw={500}>{t('meals.ingredients')}</Text>
                                <Button
                                    size="xs"
                                    variant="light"
                                    leftSection={<IconPlus size={14} />}
                                    onClick={addIngredient}
                                >
                                    {t('meals.addIngredient')}
                                </Button>
                            </Group>
                            <Stack gap="xs">
                                {form.values.ingredients.length === 0 ? (
                                    <Paper p="md" withBorder bg="gray.0">
                                        <Text size="sm" c="dimmed" ta="center">
                                            {t('meals.noIngredients')}
                                        </Text>
                                    </Paper>
                                ) : (
                                    form.values.ingredients.map((ingredient, index) => (
                                        <Group key={index} gap="xs" align="flex-end">
                                            <TextInput
                                                placeholder={t('meals.ingredientAmount')}
                                                value={ingredient.amount || ''}
                                                onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                                                style={{ width: 70 }}
                                                size="sm"
                                            />
                                            <Select
                                                placeholder={t('meals.ingredientUnit')}
                                                data={unitOptions}
                                                value={ingredient.unit || ''}
                                                onChange={(val) => updateIngredient(index, 'unit', val || '')}
                                                style={{ width: 100 }}
                                                size="sm"
                                                clearable
                                            />
                                            <TextInput
                                                placeholder={t('meals.ingredientName')}
                                                value={ingredient.name}
                                                onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                                                style={{ flex: 1 }}
                                                size="sm"
                                            />
                                            <CloseButton
                                                size="sm"
                                                onClick={() => removeIngredient(index)}
                                            />
                                        </Group>
                                    ))
                                )}
                            </Stack>
                        </Box>

                        <Textarea
                            label={t('meals.instructions')}
                            placeholder={t('meals.instructionsPlaceholder')}
                            rows={6}
                            {...form.getInputProps('instructions')}
                        />

                        <Group grow>
                            <NumberInput
                                label={t('meals.prepTime')}
                                placeholder={t('meals.prepTimePlaceholder')}
                                min={0}
                                {...form.getInputProps('prepTime')}
                            />
                            <NumberInput
                                label={t('meals.cookTime')}
                                placeholder={t('meals.cookTimePlaceholder')}
                                min={0}
                                {...form.getInputProps('cookTime')}
                            />
                        </Group>

                        <NumberInput
                            label={t('meals.servings')}
                            placeholder={t('meals.servingsPlaceholder')}
                            min={1}
                            {...form.getInputProps('servings')}
                        />

                        <Select
                            label={t('meals.cuisine')}
                            placeholder={t('meals.selectCuisine')}
                            data={cuisineOptions}
                            searchable
                            {...form.getInputProps('cuisine')}
                        />

                        <Stack gap="xs">
                            <Text size="sm" fw={500}>{t('meals.mealType')}</Text>
                            <Group>
                                {mealTypeOptions.map(opt => (
                                    <Checkbox
                                        key={opt.value}
                                        label={opt.label}
                                        checked={form.values.mealType.includes(opt.value)}
                                        onChange={(e) => {
                                            const checked = e.currentTarget.checked;
                                            const current = form.values.mealType;
                                            if (checked) {
                                                form.setFieldValue('mealType', [...current, opt.value]);
                                            } else {
                                                form.setFieldValue('mealType', current.filter(t => t !== opt.value));
                                            }
                                        }}
                                    />
                                ))}
                            </Group>
                        </Stack>

                        <TextInput
                            label={t('meals.recipeUrl')}
                            placeholder={t('meals.recipeUrlPlaceholder')}
                            {...form.getInputProps('recipeUrl')}
                        />

                        <TextInput
                            label={t('meals.source')}
                            placeholder={t('meals.sourcePlaceholder')}
                            {...form.getInputProps('source')}
                        />

                        <Group justify="flex-end" mt="md">
                            <Button variant="subtle" onClick={() => setModalOpen(false)}>
                                {t('meals.cancel')}
                            </Button>
                            <Button type="submit">
                                {editingMeal ? t('meals.update') : t('meals.create')}
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>

            {/* Meal Plan Modal */}
            <Modal
                opened={planModalOpen}
                onClose={() => setPlanModalOpen(false)}
                title={t('meals.planner.planMealModal')}
                size="md"
            >
                <form onSubmit={planForm.onSubmit(handleSubmitPlan)}>
                    <Stack gap="md">
                        <DatePickerInput
                            label={t('meals.planner.date')}
                            placeholder={t('meals.planner.selectDate')}
                            valueFormat="DD.MM.YYYY"
                            locale="de"
                            required
                            {...planForm.getInputProps('date')}
                        />

                        <Select
                            label={t('meals.planner.mealType')}
                            placeholder={t('meals.planner.selectMealType')}
                            data={mealTypeOptions.map(opt => ({ value: opt.value, label: opt.label }))}
                            required
                            {...planForm.getInputProps('mealType')}
                        />

                        <Select
                            label={t('meals.planner.recipe')}
                            placeholder={t('meals.planner.selectRecipe')}
                            data={meals?.map(meal => ({ value: meal.id, label: meal.name })) || []}
                            searchable
                            clearable
                            {...planForm.getInputProps('mealId')}
                        />

                        <TextInput
                            label={t('meals.planner.customMeal')}
                            placeholder={t('meals.planner.customMealPlaceholder')}
                            disabled={!!planForm.values.mealId}
                            {...planForm.getInputProps('customMealName')}
                        />

                        <Textarea
                            label={t('meals.planner.notes')}
                            placeholder={t('meals.planner.notesPlaceholder')}
                            rows={3}
                            {...planForm.getInputProps('notes')}
                        />

                        <Group justify="flex-end" mt="md">
                            <Button variant="subtle" onClick={() => setPlanModalOpen(false)}>
                                {t('meals.cancel')}
                            </Button>
                            <Button type="submit">
                                {t('meals.planner.plan')}
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>
        </Container>
    );
}
