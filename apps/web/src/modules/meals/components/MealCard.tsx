import {
    Card,
    Stack,
    Group,
    Text,
    ActionIcon,
    Badge,
    Image,
    Divider,
    Button,
} from '@mantine/core';
import {
    IconStarFilled,
    IconStar,
    IconClock,
    IconFlame,
    IconEdit,
    IconTrash,
    IconChefHat,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { MealWithDetails, MealType } from '@ycmm/core';
import { mealTypeOptions, formatTime } from '../types';

interface MealCardProps {
    meal: MealWithDetails;
    onToggleFavorite: (id: string) => void;
    onMarkCooked: (id: string) => void;
    onEdit: (meal: MealWithDetails) => void;
    onDelete: (id: string) => void;
}

export function MealCard({ meal, onToggleFavorite, onMarkCooked, onEdit, onDelete }: MealCardProps) {
    const { t } = useTranslation();

    const getMealTypeIcon = (type: MealType) => {
        const config = mealTypeOptions.find(t => t.value === type);
        const Icon = config?.icon || IconChefHat;
        return <Icon size={16} />;
    };

    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
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
                        onClick={() => onToggleFavorite(meal.id)}
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
                            {t(mealTypeOptions.find(opt => opt.value === type)?.label || '')}
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
                        onClick={() => onMarkCooked(meal.id)}
                    >
                        {t('meals.markAsCooked')}
                    </Button>
                    <Group gap="xs">
                        <ActionIcon
                            variant="subtle"
                            onClick={() => onEdit(meal)}
                        >
                            <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon
                            variant="subtle"
                            color="red"
                            onClick={() => onDelete(meal.id)}
                        >
                            <IconTrash size={16} />
                        </ActionIcon>
                    </Group>
                </Group>
            </Stack>
        </Card>
    );
}
