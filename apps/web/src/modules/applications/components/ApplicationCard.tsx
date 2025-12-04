import {
    Card,
    Stack,
    Group,
    Text,
    Badge,
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
    IconMapPin,
    IconCurrencyEuro,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { Application, ApplicationStatus, SalaryRange } from '../types';
import { statusColors } from '../types';

interface ApplicationCardProps {
    app: Application;
    statusLabels: Record<ApplicationStatus, string>;
    onView: (app: Application) => void;
    onEdit: (app: Application) => void;
    onDelete: (id: string) => void;
    onStatusChange: (appId: string, status: ApplicationStatus) => void;
}

export function ApplicationCard({
    app,
    statusLabels,
    onView,
    onEdit,
    onDelete,
    onStatusChange,
}: ApplicationCardProps) {
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
        <Card shadow="sm" withBorder p="md" radius="md" style={{ cursor: 'pointer' }}>
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
                        <div onClick={() => onView(app)}>
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
                            <Menu.Divider />
                            <Menu.Label>{t('common.status')}</Menu.Label>
                            {Object.entries(statusLabels).map(([status, label]) => (
                                <Menu.Item
                                    key={status}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onStatusChange(app.id, status as ApplicationStatus);
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
}
