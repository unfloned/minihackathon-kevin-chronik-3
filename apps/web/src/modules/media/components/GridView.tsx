import { SimpleGrid } from '@mantine/core';
import { IconMovie } from '@tabler/icons-react';
import { MediaItem } from '../types';
import { MediaCard } from './MediaCard';

interface GridViewProps {
    items: MediaItem[];
    onEdit: (item: MediaItem) => void;
    onDelete: (id: string) => void;
    mediaTypes: Array<{ value: string; label: string; icon: typeof IconMovie }>;
}

export function GridView({ items, onEdit, onDelete, mediaTypes }: GridViewProps) {
    return (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }}>
            {items.map((item) => (
                <MediaCard
                    key={item.id}
                    item={item}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    mediaTypes={mediaTypes}
                />
            ))}
        </SimpleGrid>
    );
}
