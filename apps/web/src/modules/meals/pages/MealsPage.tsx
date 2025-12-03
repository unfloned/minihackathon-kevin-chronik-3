import { useState, useMemo } from 'react';
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
    ThemeIcon,
    Divider,
    Checkbox,
    CloseButton,
    Box,
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
        { value: '', label: '-' },
        { value: 'g', label: 'g' },
        { value: 'kg', label: 'kg' },
        { value: 'ml', label: 'ml' },
        { value: 'l', label: 'l' },
        { value: 'TL', label: 'TL' },
        { value: 'EL', label: 'EL' },
        { value: 'Stück', label: 'Stück' },
        { value: 'Tasse', label: 'Tasse' },
        { value: 'Prise', label: 'Prise' },
        { value: 'Bund', label: 'Bund' },
        { value: 'Zehen', label: 'Zehen' },
        { value: 'Scheiben', label: 'Scheiben' },
        { value: 'Packung', label: 'Packung' },
        { value: 'Dose', label: 'Dose' },
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
        if (confirm('Möchten Sie dieses Rezept wirklich löschen?')) {
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
        if (confirm('Möchten Sie diesen Essensplan wirklich löschen?')) {
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
                <Group justify="space-between">
                    <div>
                        <Title order={1}>Mahlzeiten</Title>
                        <Text c="dimmed">Verwalte deine Rezepte und plane deine Mahlzeiten</Text>
                    </div>
                </Group>

                {stats && (
                    <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
                        <Paper p="md" withBorder>
                            <Group>
                                <ThemeIcon size="lg" variant="light" color="blue">
                                    <IconChefHat size={20} />
                                </ThemeIcon>
                                <div>
                                    <Text size="xs" c="dimmed">Rezepte</Text>
                                    <Text size="xl" fw={700}>{stats.totalMeals}</Text>
                                </div>
                            </Group>
                        </Paper>
                        <Paper p="md" withBorder>
                            <Group>
                                <ThemeIcon size="lg" variant="light" color="green">
                                    <IconCheck size={20} />
                                </ThemeIcon>
                                <div>
                                    <Text size="xs" c="dimmed">Gekocht</Text>
                                    <Text size="xl" fw={700}>{stats.totalCooked}</Text>
                                </div>
                            </Group>
                        </Paper>
                        <Paper p="md" withBorder>
                            <Group>
                                <ThemeIcon size="lg" variant="light" color="yellow">
                                    <IconStarFilled size={20} />
                                </ThemeIcon>
                                <div>
                                    <Text size="xs" c="dimmed">Favoriten</Text>
                                    <Text size="xl" fw={700}>{stats.favorites}</Text>
                                </div>
                            </Group>
                        </Paper>
                        <Paper p="md" withBorder>
                            <Group>
                                <ThemeIcon size="lg" variant="light" color="grape">
                                    <IconToolsKitchen2 size={20} />
                                </ThemeIcon>
                                <div>
                                    <Text size="xs" c="dimmed">Küchen</Text>
                                    <Text size="xl" fw={700}>{stats.byCuisine.length}</Text>
                                </div>
                            </Group>
                        </Paper>
                    </SimpleGrid>
                )}

                <Tabs value={activeTab} onChange={setActiveTab}>
                    <Tabs.List>
                        <Tabs.Tab value="recipes" leftSection={<IconChefHat size={16} />}>
                            Rezepte
                        </Tabs.Tab>
                        <Tabs.Tab value="planner" leftSection={<IconCalendar size={16} />}>
                            Essensplaner
                        </Tabs.Tab>
                        <Tabs.Tab value="shopping" leftSection={<IconShoppingCart size={16} />}>
                            Einkaufsliste
                        </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="recipes" pt="xl">
                        <Stack gap="lg">
                            <Group>
                                <TextInput
                                    placeholder="Rezepte durchsuchen..."
                                    leftSection={<IconSearch size={16} />}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ flex: 1 }}
                                />
                                <Select
                                    placeholder="Mahlzeit"
                                    data={[
                                        { value: 'all', label: 'Alle' },
                                        ...mealTypeOptions.map(opt => ({ value: opt.value, label: opt.label }))
                                    ]}
                                    value={selectedMealType}
                                    onChange={(value) => setSelectedMealType(value || 'all')}
                                    style={{ width: 200 }}
                                />
                                <Button leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
                                    Neues Rezept
                                </Button>
                            </Group>

                            {isLoading ? (
                                <Text>Lädt...</Text>
                            ) : (
                                <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
                                    {filteredMeals.map(meal => (
                                        <Card key={meal.id} shadow="sm" padding="lg" withBorder>
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
                                                        <Text size="sm">{meal.servings} Portionen</Text>
                                                    )}
                                                </Group>

                                                {meal.timesCooked > 0 && (
                                                    <Group gap={5}>
                                                        <IconFlame size={16} />
                                                        <Text size="sm">{meal.timesCooked}x gekocht</Text>
                                                    </Group>
                                                )}

                                                <Divider />

                                                <Group justify="space-between">
                                                    <Button
                                                        variant="light"
                                                        size="xs"
                                                        onClick={() => handleMarkCooked(meal.id)}
                                                    >
                                                        Als gekocht markieren
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
                            )}

                            {!isLoading && filteredMeals.length === 0 && (
                                <Paper p="xl" withBorder>
                                    <Stack align="center" gap="md">
                                        <IconChefHat size={60} opacity={0.3} />
                                        <Text size="lg" c="dimmed">Keine Rezepte gefunden</Text>
                                        <Button onClick={openCreateModal}>Erstes Rezept erstellen</Button>
                                    </Stack>
                                </Paper>
                            )}
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="planner" pt="xl">
                        <Stack gap="lg">
                            <Group justify="space-between">
                                <Text size="lg" fw={500}>
                                    Woche vom {weekStart.toLocaleDateString('de-DE')} bis {weekEnd.toLocaleDateString('de-DE')}
                                </Text>
                                <Button
                                    leftSection={<IconPlus size={16} />}
                                    onClick={() => openPlanModal()}
                                >
                                    Mahlzeit planen
                                </Button>
                            </Group>

                            <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 7 }} spacing="md">
                                {weekDays.map(date => {
                                    const plans = getPlansByDate(date);
                                    const isToday = date.toDateString() === new Date().toDateString();

                                    return (
                                        <Paper
                                            key={date.toISOString()}
                                            p="md"
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
                                                                                {meal?.name || plan.customMealName || 'Geplant'}
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
                                    <Text size="lg" fw={500}>Einkaufsliste</Text>
                                    <Text size="sm" c="dimmed">
                                        Für die Woche vom {weekStart.toLocaleDateString('de-DE')} bis {weekEnd.toLocaleDateString('de-DE')}
                                    </Text>
                                </div>
                            </Group>

                            {shoppingList && shoppingList.length > 0 ? (
                                <Paper p="lg" withBorder>
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
                                <Paper p="xl" withBorder>
                                    <Stack align="center" gap="md">
                                        <IconShoppingCart size={60} opacity={0.3} />
                                        <Text size="lg" c="dimmed">Keine Einkaufsliste verfügbar</Text>
                                        <Text size="sm" c="dimmed" ta="center">
                                            Plane Mahlzeiten für diese Woche, um eine Einkaufsliste zu erstellen
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
                title={editingMeal ? 'Rezept bearbeiten' : 'Neues Rezept'}
                size="lg"
            >
                <form onSubmit={form.onSubmit(handleSubmitMeal)}>
                    <Stack gap="md">
                        <TextInput
                            label="Name"
                            placeholder="z.B. Spaghetti Bolognese"
                            required
                            {...form.getInputProps('name')}
                        />

                        <Textarea
                            label="Beschreibung"
                            placeholder="Kurze Beschreibung des Gerichts..."
                            rows={2}
                            {...form.getInputProps('description')}
                        />

                        <TextInput
                            label="Bild URL"
                            placeholder="https://..."
                            {...form.getInputProps('imageUrl')}
                        />

                        <Box>
                            <Group justify="space-between" mb="xs">
                                <Text size="sm" fw={500}>Zutaten</Text>
                                <Button
                                    size="xs"
                                    variant="light"
                                    leftSection={<IconPlus size={14} />}
                                    onClick={addIngredient}
                                >
                                    Zutat hinzufügen
                                </Button>
                            </Group>
                            <Stack gap="xs">
                                {form.values.ingredients.length === 0 ? (
                                    <Paper p="md" withBorder bg="gray.0">
                                        <Text size="sm" c="dimmed" ta="center">
                                            Noch keine Zutaten. Klicke auf "Zutat hinzufügen".
                                        </Text>
                                    </Paper>
                                ) : (
                                    form.values.ingredients.map((ingredient, index) => (
                                        <Group key={index} gap="xs" align="flex-end">
                                            <TextInput
                                                placeholder="Menge"
                                                value={ingredient.amount || ''}
                                                onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                                                style={{ width: 70 }}
                                                size="sm"
                                            />
                                            <Select
                                                placeholder="Einheit"
                                                data={unitOptions}
                                                value={ingredient.unit || ''}
                                                onChange={(val) => updateIngredient(index, 'unit', val || '')}
                                                style={{ width: 100 }}
                                                size="sm"
                                                clearable
                                            />
                                            <TextInput
                                                placeholder="Zutat (z.B. Hackfleisch)"
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
                            label="Anleitung"
                            placeholder="Schritt-für-Schritt Anleitung..."
                            rows={6}
                            {...form.getInputProps('instructions')}
                        />

                        <Group grow>
                            <NumberInput
                                label="Vorbereitungszeit (Min)"
                                placeholder="30"
                                min={0}
                                {...form.getInputProps('prepTime')}
                            />
                            <NumberInput
                                label="Kochzeit (Min)"
                                placeholder="45"
                                min={0}
                                {...form.getInputProps('cookTime')}
                            />
                        </Group>

                        <NumberInput
                            label="Portionen"
                            placeholder="4"
                            min={1}
                            {...form.getInputProps('servings')}
                        />

                        <Select
                            label="Küche"
                            placeholder="Wähle eine Küche"
                            data={cuisineOptions}
                            searchable
                            {...form.getInputProps('cuisine')}
                        />

                        <Stack gap="xs">
                            <Text size="sm" fw={500}>Mahlzeittyp</Text>
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
                            label="Rezept URL"
                            placeholder="https://..."
                            {...form.getInputProps('recipeUrl')}
                        />

                        <TextInput
                            label="Quelle"
                            placeholder="z.B. Chefkoch, eigenes Rezept..."
                            {...form.getInputProps('source')}
                        />

                        <Group justify="flex-end" mt="md">
                            <Button variant="subtle" onClick={() => setModalOpen(false)}>
                                Abbrechen
                            </Button>
                            <Button type="submit">
                                {editingMeal ? 'Aktualisieren' : 'Erstellen'}
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>

            {/* Meal Plan Modal */}
            <Modal
                opened={planModalOpen}
                onClose={() => setPlanModalOpen(false)}
                title="Mahlzeit planen"
                size="md"
            >
                <form onSubmit={planForm.onSubmit(handleSubmitPlan)}>
                    <Stack gap="md">
                        <DatePickerInput
                            label="Datum"
                            placeholder="Wähle ein Datum"
                            valueFormat="DD.MM.YYYY"
                            locale="de"
                            required
                            {...planForm.getInputProps('date')}
                        />

                        <Select
                            label="Mahlzeittyp"
                            placeholder="Wähle einen Typ"
                            data={mealTypeOptions.map(opt => ({ value: opt.value, label: opt.label }))}
                            required
                            {...planForm.getInputProps('mealType')}
                        />

                        <Select
                            label="Rezept"
                            placeholder="Wähle ein Rezept oder lasse leer für eigene Eingabe"
                            data={meals?.map(meal => ({ value: meal.id, label: meal.name })) || []}
                            searchable
                            clearable
                            {...planForm.getInputProps('mealId')}
                        />

                        <TextInput
                            label="Eigene Mahlzeit"
                            placeholder="z.B. Essen gehen, Auswärts..."
                            disabled={!!planForm.values.mealId}
                            {...planForm.getInputProps('customMealName')}
                        />

                        <Textarea
                            label="Notizen"
                            placeholder="Zusätzliche Notizen..."
                            rows={3}
                            {...planForm.getInputProps('notes')}
                        />

                        <Group justify="flex-end" mt="md">
                            <Button variant="subtle" onClick={() => setPlanModalOpen(false)}>
                                Abbrechen
                            </Button>
                            <Button type="submit">
                                Planen
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>
        </Container>
    );
}
