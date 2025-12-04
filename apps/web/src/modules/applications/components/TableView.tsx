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
} from '@mantine/core';
import {
    IconDotsVertical,
    IconEdit,
    IconTrash,
    IconBuilding,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { Application, ApplicationStatus, SalaryRange } from '../types';
import { statusColors } from '../types';

interface TableViewProps {
    applications: Application[];
    statusLabels: Record<ApplicationStatus, string>;
    onView: (app: Application) => void;
    onEdit: (app: Application) => void;
    onDelete: (id: string) => void;
}

export function TableView({
    applications,
    statusLabels,
    onView,
    onEdit,
    onDelete,
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

    return (
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
                    {applications.map((app) => (
                        <Table.Tr key={app.id} style={{ cursor: 'pointer' }} onClick={() => onView(app)}>
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
