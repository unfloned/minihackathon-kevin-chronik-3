import { SimpleGrid, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { Application, ApplicationStatus } from '../types';
import { ApplicationCard } from './ApplicationCard';

interface CardsViewProps {
    applications: Application[];
    statusLabels: Record<ApplicationStatus, string>;
    onView: (app: Application) => void;
    onEdit: (app: Application) => void;
    onDelete: (id: string) => void;
    onStatusChange: (appId: string, status: ApplicationStatus) => void;
}

export function CardsView({
    applications,
    statusLabels,
    onView,
    onEdit,
    onDelete,
    onStatusChange,
}: CardsViewProps) {
    const { t } = useTranslation();

    return (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
            {applications.map((app) => (
                <ApplicationCard
                    key={app.id}
                    app={app}
                    statusLabels={statusLabels}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onStatusChange={onStatusChange}
                />
            ))}
            {applications.length === 0 && (
                <Text c="dimmed" ta="center" py="xl">
                    {t('common.noResults')}
                </Text>
            )}
        </SimpleGrid>
    );
}
