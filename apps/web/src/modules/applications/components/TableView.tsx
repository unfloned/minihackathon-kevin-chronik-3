import { Fragment, useMemo } from 'react';
import {
    Text,
    Group,
    Badge,
    Paper,
    Table,
    ActionIcon,
    Menu,
    ThemeIcon,
    Avatar,
    Box,
    UnstyledButton,
} from '@mantine/core';
import {
    IconDotsVertical,
    IconEdit,
    IconTrash,
    IconBuilding,
    IconCircleFilled,
    IconChevronUp,
    IconChevronDown,
    IconSelector,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { Application, ApplicationStatus, ApplicationPriority, SalaryRange } from '../types';
import { statusColors, priorityColors } from '../types';

export interface SortState {
    field: string;
    direction: 'asc' | 'desc';
}

interface TableViewProps {
    applications: Application[];
    statusLabels: Record<ApplicationStatus, string>;
    onView: (app: Application) => void;
    onEdit: (app: Application) => void;
    onDelete: (id: string) => void;
    onStatusChange: (appId: string, status: ApplicationStatus) => void;
    sort: SortState;
    onSortChange: (sort: SortState) => void;
    groupBy: 'none' | 'status' | 'priority';
}

function SortableHeader({
    label,
    field,
    sort,
    onSortChange,
}: {
    label: string;
    field: string;
    sort: SortState;
    onSortChange: (sort: SortState) => void;
}) {
    const isActive = sort.field === field;

    const handleClick = () => {
        if (isActive) {
            onSortChange({ field, direction: sort.direction === 'asc' ? 'desc' : 'asc' });
        } else {
            onSortChange({ field, direction: 'asc' });
        }
    };

    return (
        <UnstyledButton onClick={handleClick} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Text size="sm" fw={600}>{label}</Text>
            {isActive ? (
                sort.direction === 'asc' ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />
            ) : (
                <IconSelector size={14} style={{ opacity: 0.4 }} />
            )}
        </UnstyledButton>
    );
}

export function sortApplications(apps: Application[], sort: SortState): Application[] {
    const sorted = [...apps].sort((a, b) => {
        let cmp = 0;
        switch (sort.field) {
            case 'companyName':
                cmp = a.companyName.localeCompare(b.companyName);
                break;
            case 'jobTitle':
                cmp = a.jobTitle.localeCompare(b.jobTitle);
                break;
            case 'status':
                cmp = a.status.localeCompare(b.status);
                break;
            case 'appliedAt': {
                const da = a.appliedAt ? new Date(a.appliedAt).getTime() : 0;
                const db = b.appliedAt ? new Date(b.appliedAt).getTime() : 0;
                cmp = da - db;
                break;
            }
            case 'salary': {
                const sa = a.salary?.min ?? a.salary?.max ?? 0;
                const sb = b.salary?.min ?? b.salary?.max ?? 0;
                cmp = sa - sb;
                break;
            }
            case 'priority': {
                const order: Record<ApplicationPriority, number> = { low: 0, medium: 1, high: 2 };
                cmp = order[a.priority] - order[b.priority];
                break;
            }
            default:
                cmp = 0;
        }
        return sort.direction === 'asc' ? cmp : -cmp;
    });
    return sorted;
}

type GroupedApplications = { key: string; label: string; color: string; apps: Application[] }[];

function groupApplications(
    apps: Application[],
    groupBy: 'none' | 'status' | 'priority',
    statusLabels: Record<ApplicationStatus, string>,
    t: (key: string) => string,
): GroupedApplications {
    if (groupBy === 'none') {
        return [{ key: 'all', label: '', color: '', apps }];
    }

    if (groupBy === 'status') {
        const groups = new Map<ApplicationStatus, Application[]>();
        apps.forEach((app) => {
            const list = groups.get(app.status) || [];
            list.push(app);
            groups.set(app.status, list);
        });
        return Array.from(groups.entries()).map(([status, list]) => ({
            key: status,
            label: statusLabels[status],
            color: statusColors[status],
            apps: list,
        }));
    }

    // groupBy === 'priority'
    const groups = new Map<ApplicationPriority, Application[]>();
    apps.forEach((app) => {
        const list = groups.get(app.priority) || [];
        list.push(app);
        groups.set(app.priority, list);
    });
    const priorityOrder: ApplicationPriority[] = ['high', 'medium', 'low'];
    return priorityOrder
        .filter((p) => groups.has(p))
        .map((p) => ({
            key: p,
            label: t(`applications.priority.${p}`),
            color: priorityColors[p],
            apps: groups.get(p)!,
        }));
}

export function TableView({
    applications,
    statusLabels,
    onView,
    onEdit,
    onDelete,
    onStatusChange,
    sort,
    onSortChange,
    groupBy,
}: TableViewProps) {
    const { t } = useTranslation();

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

    const grouped = useMemo(
        () => groupApplications(applications, groupBy, statusLabels, t),
        [applications, groupBy, statusLabels, t],
    );

    const renderRow = (app: Application) => (
        <Table.Tr key={app.id} style={{ cursor: 'pointer' }} onClick={() => onView(app)}>
            {/* Company with priority dot */}
            <Table.Td>
                <Group gap="xs">
                    <IconCircleFilled
                        size={8}
                        style={{ color: `var(--mantine-color-${priorityColors[app.priority]}-filled)`, flexShrink: 0 }}
                    />
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
            {/* Position + Tags */}
            <Table.Td>
                <Group gap={4}>
                    <Text size="sm">{app.jobTitle}</Text>
                    {app.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} size="xs" variant="outline" color="gray">
                            {tag}
                        </Badge>
                    ))}
                    {app.tags.length > 3 && (
                        <Badge size="xs" variant="light" color="gray">
                            +{app.tags.length - 3}
                        </Badge>
                    )}
                </Group>
            </Table.Td>
            {/* Status */}
            <Table.Td>
                <Group gap={4}>
                    <Menu shadow="md" width={220}>
                        <Menu.Target>
                            <Box
                                onClick={(e) => e.stopPropagation()}
                                style={{ cursor: 'pointer', display: 'inline-block' }}
                            >
                                <Badge
                                    color={statusColors[app.status]}
                                    size="sm"
                                    style={{ cursor: 'pointer' }}
                                >
                                    {statusLabels[app.status]}
                                </Badge>
                            </Box>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Label>{t('common.status')}</Menu.Label>
                            {(Object.keys(statusLabels) as ApplicationStatus[]).map((status) => (
                                <Menu.Item
                                    key={status}
                                    disabled={status === app.status}
                                    leftSection={
                                        <IconCircleFilled
                                            size={8}
                                            style={{ color: `var(--mantine-color-${statusColors[status]}-filled)` }}
                                        />
                                    }
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onStatusChange(app.id, status);
                                    }}
                                >
                                    {statusLabels[status]}
                                </Menu.Item>
                            ))}
                        </Menu.Dropdown>
                    </Menu>
                    {app.interviews.length > 0 && (
                        <Badge size="xs" variant="light" color="violet">
                            {app.interviews.length}
                        </Badge>
                    )}
                </Group>
            </Table.Td>
            {/* Location */}
            <Table.Td>
                <Group gap={4}>
                    <Text size="sm">{app.location}</Text>
                    <Badge variant="dot" size="xs" color={app.remote === 'remote' ? 'green' : app.remote === 'hybrid' ? 'yellow' : 'gray'}>
                        {app.remote === 'onsite' ? t('applications.interviewType.onsite') : app.remote === 'hybrid' ? 'Hybrid' : 'Remote'}
                    </Badge>
                </Group>
            </Table.Td>
            {/* Salary */}
            <Table.Td>
                <Text size="sm">{formatSalary(app.salary) || '-'}</Text>
            </Table.Td>
            {/* Applied Date */}
            <Table.Td>
                <Text size="sm">
                    {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('de-DE') : '-'}
                </Text>
            </Table.Td>
            {/* Actions */}
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
                                onEdit(app);
                            }}
                        >
                            {t('common.edit')}
                        </Menu.Item>
                        <Menu.Item
                            leftSection={<IconTrash size={14} />}
                            color="red"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(app.id);
                            }}
                        >
                            {t('common.delete')}
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </Table.Td>
        </Table.Tr>
    );

    return (
        <Paper shadow="sm" withBorder radius="md">
            <Table striped highlightOnHover stickyHeader>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>
                            <SortableHeader label={t('applications.table.company')} field="companyName" sort={sort} onSortChange={onSortChange} />
                        </Table.Th>
                        <Table.Th>
                            <SortableHeader label={t('applications.table.position')} field="jobTitle" sort={sort} onSortChange={onSortChange} />
                        </Table.Th>
                        <Table.Th>
                            <SortableHeader label={t('applications.table.status')} field="status" sort={sort} onSortChange={onSortChange} />
                        </Table.Th>
                        <Table.Th>{t('applications.table.location')}</Table.Th>
                        <Table.Th>
                            <SortableHeader label={t('applications.table.salary')} field="salary" sort={sort} onSortChange={onSortChange} />
                        </Table.Th>
                        <Table.Th>
                            <SortableHeader label={t('applications.table.appliedAt')} field="appliedAt" sort={sort} onSortChange={onSortChange} />
                        </Table.Th>
                        <Table.Th>{t('applications.table.actions')}</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {grouped.map((group) => (
                        <Fragment key={group.key}>
                            {groupBy !== 'none' && (
                                <Table.Tr>
                                    <Table.Td colSpan={7} style={{ backgroundColor: `var(--mantine-color-${group.color}-light)` }}>
                                        <Group gap="xs">
                                            <IconCircleFilled
                                                size={10}
                                                style={{ color: `var(--mantine-color-${group.color}-filled)` }}
                                            />
                                            <Text size="sm" fw={600}>{group.label}</Text>
                                            <Badge size="xs" variant="light" color={group.color}>
                                                {group.apps.length}
                                            </Badge>
                                        </Group>
                                    </Table.Td>
                                </Table.Tr>
                            )}
                            {group.apps.map(renderRow)}
                        </Fragment>
                    ))}
                </Table.Tbody>
            </Table>
            {applications.length === 0 && (
                <Text c="dimmed" ta="center" py="xl">
                    {t('common.noResults')}
                </Text>
            )}
        </Paper>
    );
}
