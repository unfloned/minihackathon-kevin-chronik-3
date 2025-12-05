import { SimpleGrid } from '@mantine/core';
import { InventoryCard } from './InventoryCard';
import { InventoryItem } from '../types';

interface GridViewProps {
    items: InventoryItem[];
    onEdit: (item: InventoryItem) => void;
    onDelete: (id: string) => void;
    onLend: (item: InventoryItem) => void;
    onReturn: (id: string) => void;
}

export function GridView({ items, onEdit, onDelete, onLend, onReturn }: GridViewProps) {
    return (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
            {items.map((item) => (
                <InventoryCard
                    key={item.id}
                    item={item}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onLend={onLend}
                    onReturn={onReturn}
                />
            ))}
        </SimpleGrid>
    );
}
