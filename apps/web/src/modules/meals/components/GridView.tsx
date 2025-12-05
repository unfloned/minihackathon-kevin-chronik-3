import { SimpleGrid } from '@mantine/core';
import type { MealWithDetails } from '@ycmm/core';
import { MealCard } from './MealCard';

interface GridViewProps {
    meals: MealWithDetails[];
    onToggleFavorite: (id: string) => void;
    onMarkCooked: (id: string) => void;
    onEdit: (meal: MealWithDetails) => void;
    onDelete: (id: string) => void;
}

export function GridView({ meals, onToggleFavorite, onMarkCooked, onEdit, onDelete }: GridViewProps) {
    return (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
            {meals.map(meal => (
                <MealCard
                    key={meal.id}
                    meal={meal}
                    onToggleFavorite={onToggleFavorite}
                    onMarkCooked={onMarkCooked}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </SimpleGrid>
    );
}
