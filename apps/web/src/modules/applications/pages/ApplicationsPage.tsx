import { useState } from 'react';
import {
    SimpleGrid,
    Group,
    Stack,
    Button,
    TextInput,
    Paper,
    Skeleton,
    SegmentedControl,
    Container,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
    IconBriefcase,
    IconLayoutGrid,
    IconLayoutKanban,
    IconList,
    IconMessageCircle,
    IconCalendarEvent,
    IconGift,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { useRequest, useMutation, useViewMode } from '../../../hooks';
import { PageTitle } from '../../../components/PageTitle';
import { CardStatistic } from '../../../components/CardStatistic';
import type { Application, ApplicationStatus, CreateApplicationForm, SalaryRange } from '../types';
import { defaultForm } from '../types';
import {
    KanbanView,
    CardsView,
    TableView,
    ApplicationFormModal,
    ApplicationDetailModal,
} from '../components';

export default function ApplicationsPage() {
    const { t } = useTranslation();

    const statusLabels: Record<ApplicationStatus, string> = {
        draft: t('applications.status.draft'),
        applied: t('applications.status.applied'),
        in_review: t('applications.status.screening'),
        interview_scheduled: t('applications.status.interview'),
        interviewed: t('applications.status.interviewed'),
        offer_received: t('applications.status.offer'),
        accepted: t('applications.status.accepted'),
        rejected: t('applications.status.rejected'),
        withdrawn: t('applications.status.withdrawn'),
    };

    const [opened, { open, close }] = useDisclosure(false);
    const [detailOpened, { open: openDetail, close: closeDetail }] = useDisclosure(false);
    const [editingApp, setEditingApp] = useState<Application | null>(null);
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);
    const [form, setForm] = useState<CreateApplicationForm>(defaultForm);
    const [searchQuery, setSearchQuery] = useState('');
    const [globalViewMode, setViewMode] = useViewMode();

    const viewMode = globalViewMode === 'kanban' ? 'kanban'
        : (globalViewMode === 'list' || globalViewMode === 'table') ? 'list' : 'grid';

    const { data: applications, isLoading, refetch } = useRequest<Application[]>('/applications');
    const { data: stats, refetch: refetchStats } = useRequest<{
        total: number;
        byStatus: { status: ApplicationStatus; count: number }[];
        responseRate: number;
        interviewRate: number;
        offerRate: number;
        averageResponseDays: number | null;
    }>('/applications/stats');

    const { mutate: createApp, isLoading: creating } = useMutation<Application, CreateApplicationForm & { salary?: SalaryRange }>(
        '/applications',
        { method: 'POST' }
    );

    const { mutate: updateApp } = useMutation<Application, { id: string; data: Partial<CreateApplicationForm> }>(
        (vars) => `/applications/${vars.id}`,
        { method: 'PATCH' }
    );

    const { mutate: deleteApp } = useMutation<void, { id: string }>(
        (vars) => `/applications/${vars.id}`,
        { method: 'DELETE' }
    );

    const { mutate: updateStatus } = useMutation<Application, { id: string; status: ApplicationStatus; note?: string }>(
        (vars) => `/applications/${vars.id}/status`,
        { method: 'POST' }
    );

    const handleOpenCreate = () => {
        setEditingApp(null);
        setForm(defaultForm);
        open();
    };

    const handleOpenEdit = (app: Application) => {
        setEditingApp(app);
        setForm({
            companyName: app.companyName,
            jobTitle: app.jobTitle,
            companyWebsite: app.companyWebsite,
            jobUrl: app.jobUrl,
            jobDescription: app.jobDescription,
            location: app.location,
            remote: app.remote,
            salaryMin: app.salary?.min,
            salaryMax: app.salary?.max,
            contactName: app.contactName,
            contactEmail: app.contactEmail,
            notes: app.notes,
            source: app.source,
        });
        open();
    };

    const handleViewDetail = (app: Application) => {
        setSelectedApp(app);
        openDetail();
    };

    const handleSubmit = async () => {
        const payload: CreateApplicationForm & { salary?: SalaryRange } = {
            ...form,
            salary: form.salaryMin || form.salaryMax ? {
                min: form.salaryMin,
                max: form.salaryMax,
                currency: 'EUR',
            } : undefined,
        };

        try {
            if (editingApp) {
                await updateApp({ id: editingApp.id, data: payload });
                notifications.show({
                    title: t('common.success'),
                    message: t('applications.applicationUpdated'),
                    color: 'green',
                });
            } else {
                await createApp(payload);
                notifications.show({
                    title: t('common.success'),
                    message: t('applications.applicationCreated'),
                    color: 'green',
                });
            }
            refetch();
            refetchStats();
            close();
        } catch {
            notifications.show({
                title: t('common.error'),
                message: t('errors.generic'),
                color: 'red',
            });
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteApp({ id });
            notifications.show({
                title: t('common.success'),
                message: t('applications.applicationDeleted'),
                color: 'green',
            });
            refetch();
            refetchStats();
            closeDetail();
        } catch {
            notifications.show({
                title: t('common.error'),
                message: t('errors.generic'),
                color: 'red',
            });
        }
    };

    const handleStatusChange = async (appId: string, newStatus: ApplicationStatus) => {
        try {
            await updateStatus({ id: appId, status: newStatus });
            notifications.show({
                title: t('common.success'),
                message: t('applications.applicationUpdated'),
                color: 'green',
            });
            refetch();
            refetchStats();
        } catch {
            notifications.show({
                title: t('common.error'),
                message: t('errors.generic'),
                color: 'red',
            });
        }
    };

    const filteredApplications = applications?.filter((app) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            app.companyName.toLowerCase().includes(query) ||
            app.jobTitle.toLowerCase().includes(query) ||
            app.location.toLowerCase().includes(query)
        );
    }) || [];

    if (isLoading) {
        return (
            <Container size="xl" py="xl">
                <Stack gap="md">
                    <Group justify="space-between">
                        <PageTitle title={t('applications.title')} subtitle={t('applications.subtitle')} />
                        <Button onClick={handleOpenCreate}>{t('applications.newApplication')}</Button>
                    </Group>
                    <Skeleton height={100} />
                    <Skeleton height={400} />
                </Stack>
            </Container>
        );
    }

    return (
        <Container size="xl" py="xl">
            <Stack gap="lg">
                {/* Header */}
                <Group justify="space-between">
                    <PageTitle title={t('applications.title')} subtitle={t('applications.subtitle')} />
                    <Button onClick={handleOpenCreate}>{t('applications.newApplication')}</Button>
                </Group>

                {/* Stats */}
                {stats && (
                    <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="lg">
                        <CardStatistic
                            type="icon"
                            title={t('applications.stats.total')}
                            value={stats.total}
                            icon={IconBriefcase}
                            color="blue"
                        />
                        <CardStatistic
                            type="icon"
                            title={t('dashboard.stats.responseRate', { defaultValue: 'Rücklaufquote' })}
                            value={`${Math.round(stats.responseRate)}%`}
                            icon={IconMessageCircle}
                            color="cyan"
                        />
                        <CardStatistic
                            type="icon"
                            title={t('dashboard.stats.interviewRate', { defaultValue: 'Interview-Quote' })}
                            value={`${Math.round(stats.interviewRate)}%`}
                            icon={IconCalendarEvent}
                            color="violet"
                        />
                        <CardStatistic
                            type="icon"
                            title={t('dashboard.stats.offerRate', { defaultValue: 'Angebots-Quote' })}
                            value={`${Math.round(stats.offerRate)}%`}
                            icon={IconGift}
                            color="green"
                        />
                    </SimpleGrid>
                )}

                {/* Search Bar */}
                <Paper shadow="sm" withBorder p="md" radius="md">
                    <Group>
                        <TextInput
                            placeholder={t('common.search')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.currentTarget.value)}
                            style={{ flex: 1 }}
                        />
                        <SegmentedControl
                            value={viewMode}
                            onChange={(value) => setViewMode(value as 'kanban' | 'grid' | 'list')}
                            data={[
                                { value: 'kanban', label: <IconLayoutKanban size={16} /> },
                                { value: 'grid', label: <IconLayoutGrid size={16} /> },
                                { value: 'list', label: <IconList size={16} /> },
                            ]}
                        />
                    </Group>
                </Paper>

                {/* Content */}
                {viewMode === 'kanban' && (
                    <KanbanView
                        applications={filteredApplications}
                        statusLabels={statusLabels}
                        onStatusChange={handleStatusChange}
                        onView={handleViewDetail}
                        onEdit={handleOpenEdit}
                        onDelete={handleDelete}
                    />
                )}
                {viewMode === 'grid' && (
                    <CardsView
                        applications={filteredApplications}
                        statusLabels={statusLabels}
                        onView={handleViewDetail}
                        onEdit={handleOpenEdit}
                        onDelete={handleDelete}
                        onStatusChange={handleStatusChange}
                    />
                )}
                {viewMode === 'list' && (
                    <TableView
                        applications={filteredApplications}
                        statusLabels={statusLabels}
                        onView={handleViewDetail}
                        onEdit={handleOpenEdit}
                        onDelete={handleDelete}
                    />
                )}

                {/* Modals */}
                <ApplicationFormModal
                    opened={opened}
                    onClose={close}
                    editingApp={editingApp}
                    form={form}
                    onFormChange={setForm}
                    onSubmit={handleSubmit}
                    isLoading={creating}
                />

                <ApplicationDetailModal
                    opened={detailOpened}
                    onClose={closeDetail}
                    application={selectedApp}
                    statusLabels={statusLabels}
                    onEdit={handleOpenEdit}
                    onDelete={handleDelete}
                />
            </Stack>
        </Container>
    );
}
