import { useState, useMemo } from 'react';
import {
    Group,
    Stack,
    Button,
    Skeleton,
    Container,
    Text,
    Select,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { useDisclosure } from '@mantine/hooks';
import { IconUser } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { useRequest, useMutation } from '../../../hooks';
import { PageTitle } from '../../../components/PageTitle';
import type { Application, ApplicationStatus, CreateApplicationForm, SalaryRange } from '../types';
import { defaultForm } from '../types';
import {
    TableView,
    ApplicationFormModal,
    ApplicationDetailModal,
    FilterBar,
    AnalyticsDashboard,
} from '../components';
import { applyFilters, defaultFilters } from '../components/FilterBar';
import type { ApplicationFilters } from '../components/FilterBar';
import { sortApplications } from '../components/TableView';
import type { SortState } from '../components/TableView';

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
    const [filters, setFilters] = useState<ApplicationFilters>({ ...defaultFilters });
    const [sort, setSort] = useState<SortState>({ field: 'appliedAt', direction: 'desc' });
    const [groupBy, setGroupBy] = useState<'none' | 'status' | 'priority'>('none');

    const { data: applications, isLoading, refetch } = useRequest<Application[]>('/applications');

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

    // Derive unique sources and tags from data
    const allSources = useMemo(() => {
        if (!applications) return [];
        return [...new Set(applications.map((a) => a.source).filter(Boolean))];
    }, [applications]);

    const allTags = useMemo(() => {
        if (!applications) return [];
        return [...new Set(applications.flatMap((a) => a.tags))];
    }, [applications]);

    // Pipeline: filter -> sort
    const processedApplications = useMemo(() => {
        const raw = applications || [];
        const filtered = applyFilters(raw, filters);
        return sortApplications(filtered, sort);
    }, [applications, filters, sort]);

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
            contactPhone: app.contactPhone || '',
            notes: app.notes,
            source: app.source,
            tags: app.tags || [],
            priority: app.priority || 'medium',
            appliedAt: app.appliedAt || '',
        });
        open();
    };

    const handleViewDetail = (app: Application) => {
        setSelectedApp(app);
        openDetail();
    };

    const handleSubmit = async () => {
        if (!form.companyName.trim() || !form.jobTitle.trim()) {
            notifications.show({
                title: t('common.error'),
                message: t('applications.validation.requiredFields'),
                color: 'red',
            });
            return;
        }

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
            close();
        } catch {
            notifications.show({
                title: t('common.error'),
                message: t('errors.generic'),
                color: 'red',
            });
        }
    };

    const handleDelete = (id: string) => {
        modals.openConfirmModal({
            title: t('applications.deleteApplication'),
            children: (
                <Text size="sm">{t('applications.deleteConfirm')}</Text>
            ),
            labels: { confirm: t('common.delete'), cancel: t('common.cancel') },
            confirmProps: { color: 'red' },
            onConfirm: async () => {
                try {
                    await deleteApp({ id });
                    notifications.show({
                        title: t('common.success'),
                        message: t('applications.applicationDeleted'),
                        color: 'green',
                    });
                    refetch();
                    closeDetail();
                } catch {
                    notifications.show({
                        title: t('common.error'),
                        message: t('errors.generic'),
                        color: 'red',
                    });
                }
            },
        });
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
        } catch {
            notifications.show({
                title: t('common.error'),
                message: t('errors.generic'),
                color: 'red',
            });
        }
    };

    if (isLoading) {
        return (
            <Container size="xl" py="xl">
                <Stack gap="md">
                    <Group justify="space-between">
                        <PageTitle title={t('applications.title')} subtitle={t('applications.subtitle')} />
                        <Group>
                            <Button variant="light" leftSection={<IconUser size={16} />} component={Link} to="/app/applications/cv">
                                {t('nav.cvGenerator')}
                            </Button>
                            <Button onClick={handleOpenCreate}>{t('applications.newApplication')}</Button>
                        </Group>
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
                    <Group>
                        <Button variant="light" leftSection={<IconUser size={16} />} component={Link} to="/app/applications/cv">
                            {t('nav.cvGenerator')}
                        </Button>
                        <Button onClick={handleOpenCreate}>{t('applications.newApplication')}</Button>
                    </Group>
                </Group>

                {/* Analytics Dashboard */}
                <AnalyticsDashboard applications={applications || []} />

                {/* Filter Bar */}
                <FilterBar
                    filters={filters}
                    onFiltersChange={setFilters}
                    statusLabels={statusLabels}
                    allSources={allSources}
                    allTags={allTags}
                />

                {/* Results count + GroupBy */}
                <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                        {t('applications.filter.resultsCount', { count: processedApplications.length })}
                    </Text>
                    <Select
                        size="xs"
                        w={180}
                        value={groupBy}
                        onChange={(val) => setGroupBy((val as 'none' | 'status' | 'priority') || 'none')}
                        data={[
                            { value: 'none', label: t('applications.groupBy.none') },
                            { value: 'status', label: t('applications.groupBy.status') },
                            { value: 'priority', label: t('applications.groupBy.priority') },
                        ]}
                        leftSection={<Text size="xs" fw={500}>{t('applications.groupBy.label')}:</Text>}
                        leftSectionWidth={90}
                    />
                </Group>

                {/* Table */}
                <TableView
                    applications={processedApplications}
                    statusLabels={statusLabels}
                    onView={handleViewDetail}
                    onEdit={handleOpenEdit}
                    onDelete={handleDelete}
                    onStatusChange={handleStatusChange}
                    sort={sort}
                    onSortChange={setSort}
                    groupBy={groupBy}
                />

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
                    onStatusChange={handleStatusChange}
                />
            </Stack>
        </Container>
    );
}
