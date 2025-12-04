import {
    Text,
    Group,
    Stack,
    Badge,
    Paper,
    ScrollArea,
    Box,
} from '@mantine/core';
import {
    DndContext,
    DragOverlay,
    DragEndEvent,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Application, ApplicationStatus } from '../types';
import { statusColors } from '../types';
import { DraggableCard, DroppableColumn } from './DragDropComponents';
import { ApplicationCard } from './ApplicationCard';

interface KanbanViewProps {
    applications: Application[];
    statusLabels: Record<ApplicationStatus, string>;
    onStatusChange: (appId: string, status: ApplicationStatus) => void;
    onView: (app: Application) => void;
    onEdit: (app: Application) => void;
    onDelete: (id: string) => void;
}

export function KanbanView({
    applications,
    statusLabels,
    onStatusChange,
    onView,
    onEdit,
    onDelete,
}: KanbanViewProps) {
    const { t } = useTranslation();
    const [activeApp, setActiveApp] = useState<Application | null>(null);

    const kanbanColumns: { status: ApplicationStatus; label: string }[] = [
        { status: 'draft', label: t('applications.status.draft') },
        { status: 'applied', label: t('applications.status.applied') },
        { status: 'interview_scheduled', label: t('applications.status.interview') },
        { status: 'interviewed', label: t('applications.status.interviewed') },
        { status: 'offer_received', label: t('applications.status.offer') },
        { status: 'rejected', label: t('applications.status.rejected') },
    ];

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const app = applications.find((a) => a.id === active.id);
        if (app) {
            setActiveApp(app);
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveApp(null);

        if (!over) return;

        const appId = active.id as string;
        const newStatus = over.id as ApplicationStatus;

        const app = applications.find((a) => a.id === appId);
        if (!app || app.status === newStatus) return;

        onStatusChange(appId, newStatus);
    };

    const getApplicationsByStatus = (status: ApplicationStatus) => {
        return applications.filter((app) => app.status === status);
    };

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <ScrollArea>
                <Group align="flex-start" style={{ minWidth: 'max-content' }}>
                    {kanbanColumns.map((column) => {
                        const apps = getApplicationsByStatus(column.status);
                        return (
                            <Paper key={column.status} shadow="sm" withBorder p="md" radius="md" style={{ minWidth: 300, maxWidth: 350 }}>
                                <Stack gap="md">
                                    <Group justify="space-between">
                                        <Text fw={600} size="sm">{column.label}</Text>
                                        <Badge size="sm" variant="light" color={statusColors[column.status]}>{apps.length}</Badge>
                                    </Group>
                                    <DroppableColumn status={column.status}>
                                        <Stack gap="sm">
                                            {apps.map((app) => (
                                                <DraggableCard key={app.id} app={app}>
                                                    <ApplicationCard
                                                        app={app}
                                                        statusLabels={statusLabels}
                                                        onView={onView}
                                                        onEdit={onEdit}
                                                        onDelete={onDelete}
                                                        onStatusChange={onStatusChange}
                                                    />
                                                </DraggableCard>
                                            ))}
                                            {apps.length === 0 && (
                                                <Text size="xs" c="dimmed" ta="center" py="xl">
                                                    {t('applications.emptyState')}
                                                </Text>
                                            )}
                                        </Stack>
                                    </DroppableColumn>
                                </Stack>
                            </Paper>
                        );
                    })}
                </Group>
            </ScrollArea>
            <DragOverlay>
                {activeApp ? (
                    <Box style={{ opacity: 0.9, transform: 'rotate(3deg)' }}>
                        <ApplicationCard
                            app={activeApp}
                            statusLabels={statusLabels}
                            onView={onView}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onStatusChange={onStatusChange}
                        />
                    </Box>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
