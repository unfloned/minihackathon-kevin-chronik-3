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
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useRequest, useMutation } from '../../../hooks';
import PageLayout, { StatsGrid } from '../../../components/PageLayout';


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

const statusLabels: Record<ApplicationStatus, string> = {
    draft: 'Entwurf',
    applied: 'Beworben',
    in_review: 'In Prüfung',
    interview_scheduled: 'Interview geplant',
    interviewed: 'Interview absolviert',
    offer_received: 'Angebot erhalten',
    accepted: 'Angenommen',
    rejected: 'Abgelehnt',
    withdrawn: 'Zurückgezogen',
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

const remoteLabels: Record<RemoteType, string> = {
    onsite: 'Vor Ort',
    hybrid: 'Hybrid',
    remote: 'Remote',
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
    { status: 'draft', label: 'Entwürfe' },
    { status: 'applied', label: 'Beworben' },
    { status: 'interview_scheduled', label: 'Interviews' },
    { status: 'offer_received', label: 'Angebote' },
    { status: 'rejected', label: 'Abgelehnt' },
];

export default function ApplicationsPage() {
    const [opened, { open, close }] = useDisclosure(false);
    const [detailOpened, { open: openDetail, close: closeDetail }] = useDisclosure(false);
    const [editingApp, setEditingApp] = useState<Application | null>(null);
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);
    const [form, setForm] = useState<CreateApplicationForm>(defaultForm);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

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
                    title: 'Erfolg',
                    message: 'Bewerbung aktualisiert',
                    color: 'green',
                });
            } else {
                await createApp(payload);
                notifications.show({
                    title: 'Erfolg',
                    message: 'Bewerbung erstellt',
                    color: 'green',
                });
            }
            refetch();
            close();
        } catch (error) {
            notifications.show({
                title: 'Fehler',
                message: 'Ein Fehler ist aufgetreten',
                color: 'red',
            });
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteApp({ id });
            notifications.show({
                title: 'Erfolg',
                message: 'Bewerbung gelöscht',
                color: 'green',
            });
            refetch();
            closeDetail();
        } catch (error) {
            notifications.show({
                title: 'Fehler',
                message: 'Fehler beim Löschen',
                color: 'red',
            });
        }
    };

    const handleStatusChange = async (appId: string, newStatus: ApplicationStatus) => {
        try {
            await updateStatus({ id: appId, status: newStatus });
            notifications.show({
                title: 'Erfolg',
                message: 'Status aktualisiert',
                color: 'green',
            });
            refetch();
        } catch (error) {
            notifications.show({
                title: 'Fehler',
                message: 'Fehler beim Aktualisieren des Status',
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
            return `ab ${salary.min.toLocaleString()} ${salary.currency}`;
        }
        if (salary.max) {
            return `bis ${salary.max.toLocaleString()} ${salary.currency}`;
        }
        return null;
    };

    const renderApplicationCard = (app: Application) => (
        <Card key={app.id} withBorder shadow="sm" p="md" style={{ cursor: 'pointer' }}>
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
                                Bearbeiten
                            </Menu.Item>
                            <Menu.Item
                                leftSection={<IconTrash size={14} />}
                                color="red"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(app.id);
                                }}
                            >
                                Löschen
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Label>Status ändern</Menu.Label>
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
                        {remoteLabels[app.remote]}
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
                        {app.interviews.length} Interview(s)
                    </Text>
                )}
            </Stack>
        </Card>
    );

    const renderKanbanView = () => (
        <ScrollArea>
            <Group align="flex-start" style={{ minWidth: 'max-content' }}>
                {kanbanColumns.map((column) => {
                    const apps = getApplicationsByStatus(column.status);
                    return (
                        <Paper key={column.status} withBorder p="md" style={{ minWidth: 300, maxWidth: 350 }}>
                            <Stack gap="md">
                                <Group justify="space-between">
                                    <Text fw={600} size="sm">{column.label}</Text>
                                    <Badge size="sm" variant="light">{apps.length}</Badge>
                                </Group>
                                <Stack gap="sm">
                                    {apps.map((app) => renderApplicationCard(app))}
                                    {apps.length === 0 && (
                                        <Text size="xs" c="dimmed" ta="center" py="xl">
                                            Keine Bewerbungen
                                        </Text>
                                    )}
                                </Stack>
                            </Stack>
                        </Paper>
                    );
                })}
            </Group>
        </ScrollArea>
    );

    const renderListView = () => (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
            {filteredApplications.map((app) => renderApplicationCard(app))}
            {filteredApplications.length === 0 && (
                <Text c="dimmed" ta="center" py="xl">
                    Keine Bewerbungen gefunden
                </Text>
            )}
        </SimpleGrid>
    );

    const statsData = stats ? [
        { value: stats.total.toString(), label: 'Gesamt' },
        { value: `${Math.round(stats.responseRate)}%`, label: 'Rücklaufquote' },
        { value: `${Math.round(stats.interviewRate)}%`, label: 'Interview-Quote' },
        { value: `${Math.round(stats.offerRate)}%`, label: 'Angebots-Quote' },
    ] : [];

    if (isLoading) {
        return (
            <PageLayout
                header={{
                    title: 'Bewerbungen',
                    actionLabel: 'Neue Bewerbung',
                    onAction: handleOpenCreate,
                }}
            >
                <Stack gap="md">
                    <Skeleton height={100} />
                    <Skeleton height={400} />
                </Stack>
            </PageLayout>
        );
    }

    return (
        <PageLayout
            header={{
                title: 'Bewerbungen',
                actionLabel: 'Neue Bewerbung',
                onAction: handleOpenCreate,
            }}
            stats={stats && <StatsGrid stats={statsData} columns={{ base: 2, sm: 4 }} />}
            searchBar={{
                value: searchQuery,
                onChange: setSearchQuery,
                placeholder: 'Suche nach Firma, Position oder Ort...',
                rightSection: (
                    <Group>
                        <Button.Group>
                            <Button
                                variant={viewMode === 'kanban' ? 'filled' : 'default'}
                                onClick={() => setViewMode('kanban')}
                                size="sm"
                            >
                                Kanban
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'filled' : 'default'}
                                onClick={() => setViewMode('list')}
                                size="sm"
                            >
                                Liste
                            </Button>
                        </Button.Group>
                    </Group>
                ),
            }}
        >
            {viewMode === 'kanban' ? renderKanbanView() : renderListView()}

            {/* Create/Edit Modal */}
            <Modal
                opened={opened}
                onClose={close}
                title={editingApp ? 'Bewerbung bearbeiten' : 'Neue Bewerbung'}
                size="lg"
            >
                <Stack gap="md">
                    <TextInput
                        label="Firma"
                        placeholder="Firma"
                        required
                        value={form.companyName}
                        onChange={(e) => setForm({ ...form, companyName: e.currentTarget.value })}
                    />
                    <TextInput
                        label="Position"
                        placeholder="Position"
                        required
                        value={form.jobTitle}
                        onChange={(e) => setForm({ ...form, jobTitle: e.currentTarget.value })}
                    />
                    <TextInput
                        label="Firmen-Website"
                        placeholder="https://..."
                        value={form.companyWebsite}
                        onChange={(e) => setForm({ ...form, companyWebsite: e.currentTarget.value })}
                    />
                    <TextInput
                        label="Stellenanzeige URL"
                        placeholder="https://..."
                        value={form.jobUrl}
                        onChange={(e) => setForm({ ...form, jobUrl: e.currentTarget.value })}
                    />
                    <Textarea
                        label="Stellenbeschreibung"
                        placeholder="Beschreibung der Stelle..."
                        minRows={3}
                        value={form.jobDescription}
                        onChange={(e) => setForm({ ...form, jobDescription: e.currentTarget.value })}
                    />
                    <TextInput
                        label="Standort"
                        placeholder="Stadt, Land"
                        required
                        value={form.location}
                        onChange={(e) => setForm({ ...form, location: e.currentTarget.value })}
                    />
                    <Select
                        label="Remote-Typ"
                        placeholder="Wählen..."
                        data={[
                            { value: 'onsite', label: 'Vor Ort' },
                            { value: 'hybrid', label: 'Hybrid' },
                            { value: 'remote', label: 'Remote' },
                        ]}
                        value={form.remote}
                        onChange={(value) => setForm({ ...form, remote: value as RemoteType })}
                    />
                    <Group grow>
                        <NumberInput
                            label="Gehalt Min"
                            placeholder="z.B. 50000"
                            min={0}
                            value={form.salaryMin}
                            onChange={(value) => setForm({ ...form, salaryMin: value as number })}
                        />
                        <NumberInput
                            label="Gehalt Max"
                            placeholder="z.B. 70000"
                            min={0}
                            value={form.salaryMax}
                            onChange={(value) => setForm({ ...form, salaryMax: value as number })}
                        />
                    </Group>
                    <TextInput
                        label="Kontaktperson"
                        placeholder="Name"
                        value={form.contactName}
                        onChange={(e) => setForm({ ...form, contactName: e.currentTarget.value })}
                    />
                    <TextInput
                        label="Kontakt E-Mail"
                        placeholder="email@example.com"
                        type="email"
                        value={form.contactEmail}
                        onChange={(e) => setForm({ ...form, contactEmail: e.currentTarget.value })}
                    />
                    <Select
                        label="Quelle"
                        placeholder="Wo gefunden?"
                        data={sourceOptions}
                        value={form.source}
                        onChange={(value) => setForm({ ...form, source: value || '' })}
                    />
                    <Textarea
                        label="Notizen"
                        placeholder="Zusätzliche Notizen..."
                        minRows={3}
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.currentTarget.value })}
                    />
                    <Group justify="flex-end">
                        <Button variant="subtle" onClick={close}>
                            Abbrechen
                        </Button>
                        <Button onClick={handleSubmit} loading={creating}>
                            {editingApp ? 'Aktualisieren' : 'Erstellen'}
                        </Button>
                    </Group>
                </Stack>
            </Modal>

            {/* Detail Modal */}
            <Modal
                opened={detailOpened}
                onClose={closeDetail}
                title="Bewerbungsdetails"
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
                                <Text size="xs" c="dimmed">Status</Text>
                                <Badge color={statusColors[selectedApp.status]}>
                                    {statusLabels[selectedApp.status]}
                                </Badge>
                            </Stack>
                            <Stack gap={4}>
                                <Text size="xs" c="dimmed">Remote-Typ</Text>
                                <Badge variant="light">{remoteLabels[selectedApp.remote]}</Badge>
                            </Stack>
                        </Group>

                        <Stack gap={4}>
                            <Group gap={4}>
                                <IconMapPin size={16} />
                                <Text size="sm" fw={500}>Standort</Text>
                            </Group>
                            <Text size="sm" pl="lg">{selectedApp.location}</Text>
                        </Stack>

                        {selectedApp.salary && (
                            <Stack gap={4}>
                                <Group gap={4}>
                                    <IconCurrencyEuro size={16} />
                                    <Text size="sm" fw={500}>Gehalt</Text>
                                </Group>
                                <Text size="sm" pl="lg">{formatSalary(selectedApp.salary)}</Text>
                            </Stack>
                        )}

                        {selectedApp.companyWebsite && (
                            <Stack gap={4}>
                                <Group gap={4}>
                                    <IconExternalLink size={16} />
                                    <Text size="sm" fw={500}>Website</Text>
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
                                    <Text size="sm" fw={500}>Stellenanzeige</Text>
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
                                    Link zur Anzeige
                                </Text>
                            </Stack>
                        )}

                        {selectedApp.jobDescription && (
                            <Stack gap={4}>
                                <Text size="sm" fw={500}>Stellenbeschreibung</Text>
                                <Text size="sm" c="dimmed">{selectedApp.jobDescription}</Text>
                            </Stack>
                        )}

                        {selectedApp.contactName && (
                            <Stack gap={4}>
                                <Group gap={4}>
                                    <IconUser size={16} />
                                    <Text size="sm" fw={500}>Kontaktperson</Text>
                                </Group>
                                <Text size="sm" pl="lg">{selectedApp.contactName}</Text>
                                {selectedApp.contactEmail && (
                                    <Text size="sm" pl="lg" c="blue">{selectedApp.contactEmail}</Text>
                                )}
                            </Stack>
                        )}

                        {selectedApp.source && (
                            <Stack gap={4}>
                                <Text size="sm" fw={500}>Quelle</Text>
                                <Text size="sm" c="dimmed">
                                    {sourceOptions.find(opt => opt.value === selectedApp.source)?.label || selectedApp.source}
                                </Text>
                            </Stack>
                        )}

                        {selectedApp.notes && (
                            <Stack gap={4}>
                                <Text size="sm" fw={500}>Notizen</Text>
                                <Text size="sm" c="dimmed">{selectedApp.notes}</Text>
                            </Stack>
                        )}

                        {selectedApp.interviews.length > 0 && (
                            <>
                                <Divider />
                                <Stack gap="xs">
                                    <Text size="sm" fw={500}>Interviews ({selectedApp.interviews.length})</Text>
                                    {selectedApp.interviews.map((interview) => (
                                        <Paper key={interview.id} withBorder p="sm">
                                            <Group justify="space-between">
                                                <div>
                                                    <Text size="sm" fw={500}>
                                                        {interview.type === 'phone' && 'Telefon'}
                                                        {interview.type === 'video' && 'Video'}
                                                        {interview.type === 'onsite' && 'Vor Ort'}
                                                        {interview.type === 'technical' && 'Technisch'}
                                                        {interview.type === 'hr' && 'HR'}
                                                    </Text>
                                                    <Text size="xs" c="dimmed">
                                                        {new Date(interview.scheduledAt).toLocaleString('de-DE')}
                                                    </Text>
                                                </div>
                                                <Badge color={interview.completed ? 'green' : 'blue'}>
                                                    {interview.completed ? 'Abgeschlossen' : 'Geplant'}
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
                                Löschen
                            </Button>
                            <Group>
                                <Button variant="default" onClick={closeDetail}>
                                    Schließen
                                </Button>
                                <Button
                                    leftSection={<IconEdit size={16} />}
                                    onClick={() => {
                                        closeDetail();
                                        handleOpenEdit(selectedApp);
                                    }}
                                >
                                    Bearbeiten
                                </Button>
                            </Group>
                        </Group>
                    </Stack>
                )}
            </Modal>
        </PageLayout>
    );
}
