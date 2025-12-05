import { SimpleGrid } from '@mantine/core';
import { ListCard } from './ListCard';
import { type List, type ListTypeOption } from '../types';

interface GridViewProps {
    lists: List[];
    listTypeOptions: ListTypeOption[];
    onNavigate: (listId: string) => void;
    onEdit: (list: List) => void;
    onArchive: (listId: string) => void;
    onUnarchive: (listId: string) => void;
    onDelete: (listId: string) => void;
}

export function GridView({
    lists,
    listTypeOptions,
    onNavigate,
    onEdit,
    onArchive,
    onUnarchive,
    onDelete,
}: GridViewProps) {
    return (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
            {lists.map((list) => (
                <ListCard
                    key={list.id}
                    list={list}
                    listTypeOptions={listTypeOptions}
                    onNavigate={onNavigate}
                    onEdit={onEdit}
                    onArchive={onArchive}
                    onUnarchive={onUnarchive}
                    onDelete={onDelete}
                />
            ))}
        </SimpleGrid>
    );
}
