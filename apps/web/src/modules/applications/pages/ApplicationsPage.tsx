import { useState } from 'react';
import {
    Text,
    SimpleGrid,
    Card,
    Group,
    Stack,
    Button,
    ActionIcon,
    Badge,
    Modal,
    TextInput,
    Textarea,
    Select,
    Menu,
    Paper,
    Skeleton,
    ThemeIcon,
    ScrollArea,
    NumberInput,
    Divider,
    Avatar,
    Table,
    SegmentedControl,
    Container,
    Box,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
    IconDotsVertical,
    IconEdit,
    IconTrash,
    IconBriefcase,
    IconBuilding,
    IconMapPin,
    IconCurrencyEuro,
    IconExternalLink,
    IconUser,
    IconLayoutGrid,
    IconLayoutKanban,
    IconList,
    IconMessageCircle,
    IconCalendarEvent,
    IconGift,
} from '@tabler/icons-react';
import {
    DndContext,
    DragOverlay,
    useDraggable,
    useDroppable,
    DragEndEvent,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { useRequest, useMutation, useViewMode } from '../../../hooks';
import { PageTitle } from '../../../components/PageTitle';
import { CardStatistic } from '../../../components/CardStatistic';


type ApplicationStatus =
    | 'draft'
    | 'applied'
    | 'in_review'
    | 'interview_scheduled'
    | 'interviewed'
    | 'offer_received'
    | 'accepted'
    | 'rejected'
    | 'withdrawn';

type RemoteType = 'onsite' | 'hybrid' | 'remote';

interface SalaryRange {
    min?: number;
    max?: number;
    currency: string;
}

interface Interview {
    id: string;
    type: 'phone' | 'video' | 'onsite' | 'technical' | 'hr';
    scheduledAt: string;
    duration?: number;
    location?: string;
    interviewers?: string[];
    notes?: string;
    completed: boolean;
    feedback?: string;
}

interface Application {
    id: string;
    companyName: string;
    companyWebsite: string;
    companyLogo: string;
    jobTitle: string;
    jobUrl: string;
    jobDescription: string;
    salary?: SalaryRange;
    location: string;
    remote: RemoteType;
    status: ApplicationStatus;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    notes: string;
    interviews: Interview[];
    appliedAt?: string;
    source: string;
    createdAt: string;
    updatedAt: string;
}

interface CreateApplicationForm {
    companyName: string;
    jobTitle: string;
    companyWebsite: string;
    jobUrl: string;
    jobDescription: string;
    location: string;
    remote: RemoteType;
    salaryMin?: number;
    salaryMax?: number;
    contactName: string;
    contactEmail: string;
    notes: string;
    source: string;
}

const defaultForm: CreateApplicationForm = {
    companyName: '',
    jobTitle: '',
    companyWebsite: '',
    jobUrl: '',
    jobDescription: '',
    location: '',
    remote: 'onsite',
    contactName: '',
    contactEmail: '',
    notes: '',
    source: '',
};

const statusColors: Record<ApplicationStatus, string> = {
    draft: 'gray',
    applied: 'blue',
    in_review: 'cyan',
    interview_scheduled: 'violet',
    interviewed: 'indigo',
    offer_received: 'green',
    accepted: 'teal',
    rejected: 'red',
    withdrawn: 'orange',
};

// Draggable Application Card
function DraggableCard({
    app,
    children,
}: {
    app: Application;
    children: React.ReactNode;
}) {
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

// Droppable Column
function DroppableColumn({
    status,
    children,
}: {
    status: ApplicationStatus;
    children: React.ReactNode;
}) {
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

    const sourceOptions = [
        { value: 'linkedin', label: 'LinkedIn' },
        { value: 'indeed', label: 'Indeed' },
        { value: 'xing', label: 'XING' },
        { value: 'stepstone', label: 'StepStone' },
        { value: 'direct', label: 'Direkt' },
        { value: 'referral', label: 'Empfehlung' },
        { value: 'other', label: 'Sonstige' },
    ];

    const kanbanColumns: { status: ApplicationStatus; label: string }[] = [
        { status: 'draft', label: t('applications.status.draft') },
        { status: 'applied', label: t('applications.status.applied') },
        { status: 'interview_scheduled', label: t('applications.status.interview') },
        { status: 'interviewed', label: t('applications.status.interviewed') },
        { status: 'offer_received', label: t('applications.status.offer') },
        { status: 'rejected', label: t('applications.status.rejected') },
    ];
    const [opened, { open, close }] = useDisclosure(false);
    const [detailOpened, { open: openDetail, close: closeDetail }] = useDisclosure(false);
    const [editingApp, setEditingApp] = useState<Application | null>(null);
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);
    const [form, setForm] = useState<CreateApplicationForm>(defaultForm);
    const [searchQuery, setSearchQuery] = useState('');
    const [globalViewMode, setViewMode] = useViewMode();
    // Map global viewMode to this page's supported modes (kanban/grid/list)
    const viewMode = globalViewMode === 'kanban' ? 'kanban'
        : (globalViewMode === 'list' || globalViewMode === 'table') ? 'list' : 'grid';

    // Drag & Drop state
    const [activeApp, setActiveApp] = useState<Application | null>(null);
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // 8px movement before drag starts
            },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const app = applications?.find((a) => a.id === active.id);
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

        // Find the app and check if status changed
        const app = applications?.find((a) => a.id === appId);
        if (!app || app.status === newStatus) return;

        // Update status
        await handleStatusChange(appId, newStatus);
    };

    const { data: applications, isLoading, refetch } = useRequest<Application[]>('/applications');
    const { data: stats } = useRequest<{
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
            close();
        } catch (error) {
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
            closeDetail();
        } catch (error) {
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
        } catch (error) {
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

    const getApplicationsByStatus = (status: ApplicationStatus) => {
        return filteredApplications.filter((app) => app.status === status);
    };

    const formatSalary = (salary?: SalaryRange) => {
        if (!salary) return null;
        if (salary.min && salary.max) {
            return `${salary.min.toLocaleString()} - ${salary.max.toLocaleString()} ${salary.currency}`;
        }
        if (salary.min) {
            return `${t('common.from', { defaultValue: 'ab' })} ${salary.min.toLocaleString()} ${salary.currency}`;
        }
        if (salary.max) {
            return `${t('common.to', { defaultValue: 'bis' })} ${salary.max.toLocaleString()} ${salary.currency}`;
        }
        return null;
    };

    const renderApplicationCard = (app: Application) => (
        <Card key={app.id} shadow="sm" withBorder p="md" radius="md" style={{ cursor: 'pointer' }}>
            <Stack gap="sm">
                <Group justify="space-between">
                    <Group>
                        {app.companyLogo ? (
                            <Avatar src={app.companyLogo} size={40} radius="sm" />
                        ) : (
                            <ThemeIcon size={40} radius="sm" variant="light">
                                <IconBuilding size={20} />
                            </ThemeIcon>
                        )}
                        <div onClick={() => handleViewDetail(app)}>
                            <Text fw={600} size="sm">{app.companyName}</Text>
                            <Text size="xs" c="dimmed">{app.jobTitle}</Text>
                        </div>
                    </Group>
                    <Menu>
                        <Menu.Target>
                            <ActionIcon variant="subtle" onClick={(e) => e.stopPropagation()}>
                                <IconDotsVertical size={16} />
                            </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Item
                                leftSection={<IconEdit size={14} />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEdit(app);
                                }}
                            >
                                {t('common.edit')}
                            </Menu.Item>
                            <Menu.Item
                                leftSection={<IconTrash size={14} />}
                                color="red"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(app.id);
                                }}
                            >
                                {t('common.delete')}
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Label>{t('common.status')}</Menu.Label>
                            {Object.entries(statusLabels).map(([status, label]) => (
                                <Menu.Item
                                    key={status}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleStatusChange(app.id, status as ApplicationStatus);
                                    }}
                                >
                                    {label}
                                </Menu.Item>
                            ))}
                        </Menu.Dropdown>
                    </Menu>
                </Group>

                <Group gap="xs">
                    <Badge color={statusColors[app.status]} size="sm">
                        {statusLabels[app.status]}
                    </Badge>
                    <Badge variant="light" size="sm">
                        {app.remote === 'onsite' ? t('applications.interviewType.onsite') : app.remote === 'hybrid' ? 'Hybrid' : 'Remote'}
                    </Badge>
                </Group>

                <Group gap="xs" style={{ fontSize: '0.75rem' }}>
                    <Group gap={4}>
                        <IconMapPin size={12} />
                        <Text size="xs" c="dimmed">{app.location}</Text>
                    </Group>
                    {app.salary && (
                        <Group gap={4}>
                            <IconCurrencyEuro size={12} />
                            <Text size="xs" c="dimmed">{formatSalary(app.salary)}</Text>
                        </Group>
                    )}
                </Group>

                {app.interviews.length > 0 && (
                    <Text size="xs" c="blue">
                        {app.interviews.length} {t('applications.interviews')}
                    </Text>
                )}
            </Stack>
        </Card>
    );

    const renderKanbanView = () => (
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
                                                    {renderApplicationCard(app)}
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
                        {renderApplicationCard(activeApp)}
                    </Box>
                ) : null}
            </DragOverlay>
        </DndContext>
    );

    const renderCardsView = () => (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
            {filteredApplications.map((app) => renderApplicationCard(app))}
            {filteredApplications.length === 0 && (
                <Text c="dimmed" ta="center" py="xl">
                    {t('common.noResults')}
                </Text>
            )}
        </SimpleGrid>
    );

    const renderTableView = () => (
        <Paper shadow="sm" withBorder radius="md">
            <Table striped highlightOnHover>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>{t('applications.company')}</Table.Th>
                        <Table.Th>{t('applications.position')}</Table.Th>
                        <Table.Th>{t('common.status')}</Table.Th>
                        <Table.Th>{t('applications.location')}</Table.Th>
                        <Table.Th>Remote</Table.Th>
                        <Table.Th>{t('applications.salary')}</Table.Th>
                        <Table.Th>{t('applications.appliedOn')}</Table.Th>
                        <Table.Th>{t('common.actions')}</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {filteredApplications.map((app) => (
                        <Table.Tr key={app.id} style={{ cursor: 'pointer' }} onClick={() => handleViewDetail(app)}>
                            <Table.Td>
                                <Group gap="xs">
                                    {app.companyLogo ? (
                                        <Avatar src={app.companyLogo} size={24} radius="sm" />
                                    ) : (
                                        <ThemeIcon size={24} radius="sm" variant="light">
                                            <IconBuilding size={14} />
                                        </ThemeIcon>
                                    )}
                                    <Text size="sm" fw={500}>{app.companyName}</Text>
                                </Group>
                            </Table.Td>
                            <Table.Td>
                                <Text size="sm">{app.jobTitle}</Text>
                            </Table.Td>
                            <Table.Td>
                                <Badge color={statusColors[app.status]} size="sm">
                                    {statusLabels[app.status]}
                                </Badge>
                            </Table.Td>
                            <Table.Td>
                                <Text size="sm">{app.location}</Text>
                            </Table.Td>
                            <Table.Td>
                                <Badge variant="light" size="sm">
                                    {app.remote === 'onsite' ? t('applications.interviewType.onsite') : app.remote === 'hybrid' ? 'Hybrid' : 'Remote'}
                                </Badge>
                            </Table.Td>
                            <Table.Td>
                                <Text size="sm">{formatSalary(app.salary) || '-'}</Text>
                            </Table.Td>
                            <Table.Td>
                                <Text size="sm">
                                    {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('de-DE') : '-'}
                                </Text>
                            </Table.Td>
                            <Table.Td>
                                <Menu shadow="md" width={200}>
                                    <Menu.Target>
                                        <ActionIcon variant="subtle" onClick={(e) => e.stopPropagation()}>
                                            <IconDotsVertical size={16} />
                                        </ActionIcon>
                                    </Menu.Target>
                                    <Menu.Dropdown>
                                        <Menu.Item
                                            leftSection={<IconEdit size={14} />}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenEdit(app);
                                            }}
                                        >
                                            {t('common.edit')}
                                        </Menu.Item>
                                        <Menu.Item
                                            leftSection={<IconTrash size={14} />}
                                            color="red"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(app.id);
                                            }}
                                        >
                                            {t('common.delete')}
                                        </Menu.Item>
                                    </Menu.Dropdown>
                                </Menu>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
            {filteredApplications.length === 0 && (
                <Text c="dimmed" ta="center" py="xl">
                    {t('common.noResults')}
                </Text>
            )}
        </Paper>
    );

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
                {viewMode === 'kanban' && renderKanbanView()}
                {viewMode === 'grid' && renderCardsView()}
                {viewMode === 'list' && renderTableView()}

            {/* Create/Edit Modal */}
            <Modal
                opened={opened}
                onClose={close}
                title={editingApp ? t('applications.editApplication') : t('applications.newApplication')}
                size="lg"
            >
                <Stack gap="md">
                    <TextInput
                        label={t('applications.company')}
                        placeholder={t('applications.company')}
                        required
                        value={form.companyName}
                        onChange={(e) => setForm({ ...form, companyName: e.currentTarget.value })}
                    />
                    <TextInput
                        label={t('applications.position')}
                        placeholder={t('applications.position')}
                        required
                        value={form.jobTitle}
                        onChange={(e) => setForm({ ...form, jobTitle: e.currentTarget.value })}
                    />
                    <TextInput
                        label={t('common.website', { defaultValue: 'Firmen-Website' })}
                        placeholder="https://..."
                        value={form.companyWebsite}
                        onChange={(e) => setForm({ ...form, companyWebsite: e.currentTarget.value })}
                    />
                    <TextInput
                        label={t('common.url', { defaultValue: 'Stellenanzeige URL' })}
                        placeholder="https://..."
                        value={form.jobUrl}
                        onChange={(e) => setForm({ ...form, jobUrl: e.currentTarget.value })}
                    />
                    <Textarea
                        label={t('common.description')}
                        placeholder={t('common.description')}
                        minRows={3}
                        value={form.jobDescription}
                        onChange={(e) => setForm({ ...form, jobDescription: e.currentTarget.value })}
                    />
                    <TextInput
                        label={t('applications.location')}
                        placeholder={t('applications.location')}
                        required
                        value={form.location}
                        onChange={(e) => setForm({ ...form, location: e.currentTarget.value })}
                    />
                    <Select
                        label="Remote"
                        placeholder={t('common.select', { defaultValue: 'Wählen...' })}
                        data={[
                            { value: 'onsite', label: t('applications.interviewType.onsite') },
                            { value: 'hybrid', label: 'Hybrid' },
                            { value: 'remote', label: 'Remote' },
                        ]}
                        value={form.remote}
                        onChange={(value) => setForm({ ...form, remote: value as RemoteType })}
                    />
                    <Group grow>
                        <NumberInput
                            label={t('applications.salary') + ' Min'}
                            placeholder="50000"
                            min={0}
                            value={form.salaryMin}
                            onChange={(value) => setForm({ ...form, salaryMin: value as number })}
                        />
                        <NumberInput
                            label={t('applications.salary') + ' Max'}
                            placeholder="70000"
                            min={0}
                            value={form.salaryMax}
                            onChange={(value) => setForm({ ...form, salaryMax: value as number })}
                        />
                    </Group>
                    <TextInput
                        label={t('applications.contactPerson')}
                        placeholder={t('common.name')}
                        value={form.contactName}
                        onChange={(e) => setForm({ ...form, contactName: e.currentTarget.value })}
                    />
                    <TextInput
                        label={t('auth.email')}
                        placeholder="email@example.com"
                        type="email"
                        value={form.contactEmail}
                        onChange={(e) => setForm({ ...form, contactEmail: e.currentTarget.value })}
                    />
                    <Select
                        label={t('applications.source')}
                        placeholder={t('applications.source')}
                        data={sourceOptions}
                        value={form.source}
                        onChange={(value) => setForm({ ...form, source: value || '' })}
                    />
                    <Textarea
                        label={t('common.notes')}
                        placeholder={t('common.notes')}
                        minRows={3}
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.currentTarget.value })}
                    />
                    <Group justify="flex-end">
                        <Button variant="subtle" onClick={close}>
                            {t('common.cancel')}
                        </Button>
                        <Button onClick={handleSubmit} loading={creating}>
                            {editingApp ? t('common.save') : t('common.create')}
                        </Button>
                    </Group>
                </Stack>
            </Modal>

            {/* Detail Modal */}
            <Modal
                opened={detailOpened}
                onClose={closeDetail}
                title={t('applications.title')}
                size="lg"
            >
                {selectedApp && (
                    <Stack gap="md">
                        <Group>
                            {selectedApp.companyLogo ? (
                                <Avatar src={selectedApp.companyLogo} size={60} radius="md" />
                            ) : (
                                <ThemeIcon size={60} radius="md" variant="light">
                                    <IconBuilding size={30} />
                                </ThemeIcon>
                            )}
                            <div>
                                <Text fw={700} size="lg">{selectedApp.companyName}</Text>
                                <Text size="md" c="dimmed">{selectedApp.jobTitle}</Text>
                            </div>
                        </Group>

                        <Divider />

                        <Group grow>
                            <Stack gap={4}>
                                <Text size="xs" c="dimmed">{t('common.status')}</Text>
                                <Badge color={statusColors[selectedApp.status]}>
                                    {statusLabels[selectedApp.status]}
                                </Badge>
                            </Stack>
                            <Stack gap={4}>
                                <Text size="xs" c="dimmed">Remote</Text>
                                <Badge variant="light">{selectedApp.remote === 'onsite' ? t('applications.interviewType.onsite') : selectedApp.remote === 'hybrid' ? 'Hybrid' : 'Remote'}</Badge>
                            </Stack>
                        </Group>

                        <Stack gap={4}>
                            <Group gap={4}>
                                <IconMapPin size={16} />
                                <Text size="sm" fw={500}>{t('applications.location')}</Text>
                            </Group>
                            <Text size="sm" pl="lg">{selectedApp.location}</Text>
                        </Stack>

                        {selectedApp.salary && (
                            <Stack gap={4}>
                                <Group gap={4}>
                                    <IconCurrencyEuro size={16} />
                                    <Text size="sm" fw={500}>{t('applications.salary')}</Text>
                                </Group>
                                <Text size="sm" pl="lg">{formatSalary(selectedApp.salary)}</Text>
                            </Stack>
                        )}

                        {selectedApp.companyWebsite && (
                            <Stack gap={4}>
                                <Group gap={4}>
                                    <IconExternalLink size={16} />
                                    <Text size="sm" fw={500}>{t('common.website', { defaultValue: 'Website' })}</Text>
                                </Group>
                                <Text
                                    size="sm"
                                    pl="lg"
                                    component="a"
                                    href={selectedApp.companyWebsite}
                                    target="_blank"
                                    c="blue"
                                    style={{ textDecoration: 'none' }}
                                >
                                    {selectedApp.companyWebsite}
                                </Text>
                            </Stack>
                        )}

                        {selectedApp.jobUrl && (
                            <Stack gap={4}>
                                <Group gap={4}>
                                    <IconBriefcase size={16} />
                                    <Text size="sm" fw={500}>{t('applications.jobTitle')}</Text>
                                </Group>
                                <Text
                                    size="sm"
                                    pl="lg"
                                    component="a"
                                    href={selectedApp.jobUrl}
                                    target="_blank"
                                    c="blue"
                                    style={{ textDecoration: 'none' }}
                                >
                                    {t('common.link', { defaultValue: 'Link' })}
                                </Text>
                            </Stack>
                        )}

                        {selectedApp.jobDescription && (
                            <Stack gap={4}>
                                <Text size="sm" fw={500}>{t('common.description')}</Text>
                                <Text size="sm" c="dimmed">{selectedApp.jobDescription}</Text>
                            </Stack>
                        )}

                        {selectedApp.contactName && (
                            <Stack gap={4}>
                                <Group gap={4}>
                                    <IconUser size={16} />
                                    <Text size="sm" fw={500}>{t('applications.contactPerson')}</Text>
                                </Group>
                                <Text size="sm" pl="lg">{selectedApp.contactName}</Text>
                                {selectedApp.contactEmail && (
                                    <Text size="sm" pl="lg" c="blue">{selectedApp.contactEmail}</Text>
                                )}
                            </Stack>
                        )}

                        {selectedApp.source && (
                            <Stack gap={4}>
                                <Text size="sm" fw={500}>{t('applications.source')}</Text>
                                <Text size="sm" c="dimmed">
                                    {sourceOptions.find(opt => opt.value === selectedApp.source)?.label || selectedApp.source}
                                </Text>
                            </Stack>
                        )}

                        {selectedApp.notes && (
                            <Stack gap={4}>
                                <Text size="sm" fw={500}>{t('common.notes')}</Text>
                                <Text size="sm" c="dimmed">{selectedApp.notes}</Text>
                            </Stack>
                        )}

                        {selectedApp.interviews.length > 0 && (
                            <>
                                <Divider />
                                <Stack gap="xs">
                                    <Text size="sm" fw={500}>{t('applications.interviews')} ({selectedApp.interviews.length})</Text>
                                    {selectedApp.interviews.map((interview) => (
                                        <Paper key={interview.id} withBorder p="sm">
                                            <Group justify="space-between">
                                                <div>
                                                    <Text size="sm" fw={500}>
                                                        {interview.type === 'phone' && t('applications.interviewType.phone')}
                                                        {interview.type === 'video' && t('applications.interviewType.video')}
                                                        {interview.type === 'onsite' && t('applications.interviewType.onsite')}
                                                        {interview.type === 'technical' && t('applications.interviewType.technical')}
                                                        {interview.type === 'hr' && 'HR'}
                                                    </Text>
                                                    <Text size="xs" c="dimmed">
                                                        {new Date(interview.scheduledAt).toLocaleString('de-DE')}
                                                    </Text>
                                                </div>
                                                <Badge color={interview.completed ? 'green' : 'blue'}>
                                                    {interview.completed ? t('common.completed') : t('common.planned', { defaultValue: 'Geplant' })}
                                                </Badge>
                                            </Group>
                                            {interview.notes && (
                                                <Text size="xs" c="dimmed" mt="xs">{interview.notes}</Text>
                                            )}
                                        </Paper>
                                    ))}
                                </Stack>
                            </>
                        )}

                        <Divider />

                        <Group justify="space-between">
                            <Button
                                variant="subtle"
                                color="red"
                                leftSection={<IconTrash size={16} />}
                                onClick={() => handleDelete(selectedApp.id)}
                            >
                                {t('common.delete')}
                            </Button>
                            <Group>
                                <Button variant="default" onClick={closeDetail}>
                                    {t('common.close')}
                                </Button>
                                <Button
                                    leftSection={<IconEdit size={16} />}
                                    onClick={() => {
                                        closeDetail();
                                        handleOpenEdit(selectedApp);
                                    }}
                                >
                                    {t('common.edit')}
                                </Button>
                            </Group>
                        </Group>
                    </Stack>
                )}
            </Modal>
            </Stack>
        </Container>
    );
}
