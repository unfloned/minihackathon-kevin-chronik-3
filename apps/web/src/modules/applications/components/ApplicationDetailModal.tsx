import {
    Modal,
    Stack,
    Group,
    Text,
    Badge,
    Button,
    Divider,
    Paper,
    ThemeIcon,
    Avatar,
} from '@mantine/core';
import {
    IconEdit,
    IconTrash,
    IconBuilding,
    IconMapPin,
    IconCurrencyEuro,
    IconExternalLink,
    IconUser,
    IconBriefcase,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { Application, ApplicationStatus, SalaryRange } from '../types';
import { statusColors, sourceOptions } from '../types';

interface ApplicationDetailModalProps {
    opened: boolean;
    onClose: () => void;
    application: Application | null;
    statusLabels: Record<ApplicationStatus, string>;
    onEdit: (app: Application) => void;
    onDelete: (id: string) => void;
}

export function ApplicationDetailModal({
    opened,
    onClose,
    application,
    statusLabels,
    onEdit,
    onDelete,
}: ApplicationDetailModalProps) {
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

    if (!application) return null;

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={t('applications.title')}
            size="lg"
        >
            <Stack gap="md">
                <Group>
                    {application.companyLogo ? (
                        <Avatar src={application.companyLogo} size={60} radius="md" />
                    ) : (
                        <ThemeIcon size={60} radius="md" variant="light">
                            <IconBuilding size={30} />
                        </ThemeIcon>
                    )}
                    <div>
                        <Text fw={700} size="lg">{application.companyName}</Text>
                        <Text size="md" c="dimmed">{application.jobTitle}</Text>
                    </div>
                </Group>

                <Divider />

                <Group grow>
                    <Stack gap={4}>
                        <Text size="xs" c="dimmed">{t('common.status')}</Text>
                        <Badge color={statusColors[application.status]}>
                            {statusLabels[application.status]}
                        </Badge>
                    </Stack>
                    <Stack gap={4}>
                        <Text size="xs" c="dimmed">Remote</Text>
                        <Badge variant="light">
                            {application.remote === 'onsite' ? t('applications.interviewType.onsite') : application.remote === 'hybrid' ? 'Hybrid' : 'Remote'}
                        </Badge>
                    </Stack>
                </Group>

                <Stack gap={4}>
                    <Group gap={4}>
                        <IconMapPin size={16} />
                        <Text size="sm" fw={500}>{t('applications.location')}</Text>
                    </Group>
                    <Text size="sm" pl="lg">{application.location}</Text>
                </Stack>

                {application.salary && (
                    <Stack gap={4}>
                        <Group gap={4}>
                            <IconCurrencyEuro size={16} />
                            <Text size="sm" fw={500}>{t('applications.salary')}</Text>
                        </Group>
                        <Text size="sm" pl="lg">{formatSalary(application.salary)}</Text>
                    </Stack>
                )}

                {application.companyWebsite && (
                    <Stack gap={4}>
                        <Group gap={4}>
                            <IconExternalLink size={16} />
                            <Text size="sm" fw={500}>{t('common.website', { defaultValue: 'Website' })}</Text>
                        </Group>
                        <Text
                            size="sm"
                            pl="lg"
                            component="a"
                            href={application.companyWebsite}
                            target="_blank"
                            c="blue"
                            style={{ textDecoration: 'none' }}
                        >
                            {application.companyWebsite}
                        </Text>
                    </Stack>
                )}

                {application.jobUrl && (
                    <Stack gap={4}>
                        <Group gap={4}>
                            <IconBriefcase size={16} />
                            <Text size="sm" fw={500}>{t('applications.jobTitle')}</Text>
                        </Group>
                        <Text
                            size="sm"
                            pl="lg"
                            component="a"
                            href={application.jobUrl}
                            target="_blank"
                            c="blue"
                            style={{ textDecoration: 'none' }}
                        >
                            {t('common.link', { defaultValue: 'Link' })}
                        </Text>
                    </Stack>
                )}

                {application.jobDescription && (
                    <Stack gap={4}>
                        <Text size="sm" fw={500}>{t('common.description')}</Text>
                        <Text size="sm" c="dimmed">{application.jobDescription}</Text>
                    </Stack>
                )}

                {application.contactName && (
                    <Stack gap={4}>
                        <Group gap={4}>
                            <IconUser size={16} />
                            <Text size="sm" fw={500}>{t('applications.contactPerson')}</Text>
                        </Group>
                        <Text size="sm" pl="lg">{application.contactName}</Text>
                        {application.contactEmail && (
                            <Text size="sm" pl="lg" c="blue">{application.contactEmail}</Text>
                        )}
                    </Stack>
                )}

                {application.source && (
                    <Stack gap={4}>
                        <Text size="sm" fw={500}>{t('applications.source')}</Text>
                        <Text size="sm" c="dimmed">
                            {sourceOptions.find(opt => opt.value === application.source)?.label || application.source}
                        </Text>
                    </Stack>
                )}

                {application.notes && (
                    <Stack gap={4}>
                        <Text size="sm" fw={500}>{t('common.notes')}</Text>
                        <Text size="sm" c="dimmed">{application.notes}</Text>
                    </Stack>
                )}

                {application.interviews.length > 0 && (
                    <>
                        <Divider />
                        <Stack gap="xs">
                            <Text size="sm" fw={500}>{t('applications.interviews')} ({application.interviews.length})</Text>
                            {application.interviews.map((interview) => (
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
                        onClick={() => onDelete(application.id)}
                    >
                        {t('common.delete')}
                    </Button>
                    <Group>
                        <Button variant="default" onClick={onClose}>
                            {t('common.close')}
                        </Button>
                        <Button
                            leftSection={<IconEdit size={16} />}
                            onClick={() => {
                                onClose();
                                onEdit(application);
                            }}
                        >
                            {t('common.edit')}
                        </Button>
                    </Group>
                </Group>
            </Stack>
        </Modal>
    );
}
