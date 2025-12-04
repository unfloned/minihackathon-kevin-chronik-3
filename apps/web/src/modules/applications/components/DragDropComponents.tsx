import { Box } from '@mantine/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import type { Application, ApplicationStatus } from '../types';

interface DraggableCardProps {
    app: Application;
    children: React.ReactNode;
}

export function DraggableCard({ app, children }: DraggableCardProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: app.id,
        data: { app },
    });

    const style = transform
        ? {
              transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
              opacity: isDragging ? 0.5 : 1,
              cursor: 'grab',
          }
        : { cursor: 'grab' };

    return (
        <Box ref={setNodeRef} style={style} {...listeners} {...attributes}>
            {children}
        </Box>
    );
}

interface DroppableColumnProps {
    status: ApplicationStatus;
    children: React.ReactNode;
}

export function DroppableColumn({ status, children }: DroppableColumnProps) {
    const { isOver, setNodeRef } = useDroppable({
        id: status,
    });

    return (
        <Box
            ref={setNodeRef}
            style={{
                minHeight: 200,
                backgroundColor: isOver ? 'var(--mantine-color-blue-light)' : undefined,
                borderRadius: 'var(--mantine-radius-md)',
                transition: 'background-color 0.2s ease',
            }}
        >
            {children}
        </Box>
    );
}
