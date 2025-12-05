import { SimpleGrid } from '@mantine/core';
import type { WishlistItem } from '../types';
import { WishlistCard } from './WishlistCard';

interface GridViewProps {
    items: WishlistItem[];
    onEdit: (item: WishlistItem) => void;
    onDelete: (id: string) => void;
    onPurchase: (id: string) => void;
    showPurchaseButton?: boolean;
}

export function GridView({ items, onEdit, onDelete, onPurchase, showPurchaseButton = true }: GridViewProps) {
    return (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
            {items.map((item) => (
                <WishlistCard
                    key={item.id}
                    item={item}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onPurchase={onPurchase}
                    showPurchaseButton={showPurchaseButton}
                />
            ))}
        </SimpleGrid>
    );
}
