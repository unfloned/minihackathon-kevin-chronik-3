import { useState } from 'react';
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
    Menu,
    Box,
    Textarea,
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
    IconCircleFilled,
    IconPhone,
    IconMail,
    IconSend,
    IconTag,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import type { Application, ApplicationStatus, SalaryRange } from '../types';
import { statusColors, sourceOptions, priorityColors } from '../types';
import { useMutation } from '../../../hooks';

interface ApplicationDetailModalProps {
    opened: boolean;
    onClose: () => void;
    application: Application | null;
    statusLabels: Record<ApplicationStatus, string>;
    onEdit: (app: Application) => void;
    onDelete: (id: string) => void;
    onStatusChange: (appId: string, status: ApplicationStatus) => void;
}

export function ApplicationDetailModal({
    opened,
    onClose,
    application,
    statusLabels,
    onEdit,
    onDelete,
    onStatusChange,
}: ApplicationDetailModalProps) {
    const { t } = useTranslation();
    const [showEmailPreview, setShowEmailPreview] = useState(false);
    const [emailBody, setEmailBody] = useState('');

    const { mutate: sendApplication, isLoading: sending } = useMutation<void, { id: string; emailBody: string }>(
        (vars) => `/applications/${vars.id}/apply`,
        { method: 'POST' }
    );

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

    const handleApplyByEmail = () => {
        if (!application) return;
        setEmailBody(application.notes || '');
        setShowEmailPreview(true);
    };

    const handleSendEmail = async () => {
        if (!application) return;
        try {
            await sendApplication({ id: application.id, emailBody });
            notifications.show({
                title: t('common.success'),
                message: t('applications.emailSent'),
                color: 'green',
            });
            setShowEmailPreview(false);
            onStatusChange(application.id, 'applied');
        } catch {
            notifications.show({
                title: t('common.error'),
                message: t('errors.generic'),
                color: 'red',
            });
        }
    };

    if (!application) return null;

    const canApplyByEmail = application.contactEmail && application.status === 'draft';

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
                        <Menu shadow="md" width={220}>
                            <Menu.Target>
                                <Box style={{ cursor: 'pointer', display: 'inline-block' }}>
                                    <Badge
                                        color={statusColors[application.status]}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {statusLabels[application.status]}
                                    </Badge>
                                </Box>
                            </Menu.Target>
                            <Menu.Dropdown>
                                <Menu.Label>{t('common.status')}</Menu.Label>
                                {(Object.keys(statusLabels) as ApplicationStatus[]).map((status) => (
                                    <Menu.Item
                                        key={status}
                                        disabled={status === application.status}
                                        leftSection={
                                            <IconCircleFilled
                                                size={8}
                                                style={{ color: `var(--mantine-color-${statusColors[status]}-filled)` }}
                                            />
                                        }
                                        onClick={() => onStatusChange(application.id, status)}
                                    >
                                        {statusLabels[status]}
                                    </Menu.Item>
                                ))}
                            </Menu.Dropdown>
                        </Menu>
                    </Stack>
                    <Stack gap={4}>
                        <Text size="xs" c="dimmed">Remote</Text>
                        <Badge variant="light">
                            {application.remote === 'onsite' ? t('applications.interviewType.onsite') : application.remote === 'hybrid' ? 'Hybrid' : 'Remote'}
                        </Badge>
                    </Stack>
                    {application.priority && (
                        <Stack gap={4}>
                            <Text size="xs" c="dimmed">{t('common.priority')}</Text>
                            <Badge color={priorityColors[application.priority]} variant="light">
                                {t(`applications.priority.${application.priority}`)}
                            </Badge>
                        </Stack>
                    )}
                </Group>

                {application.tags && application.tags.length > 0 && (
                    <Stack gap={4}>
                        <Group gap={4}>
                            <IconTag size={16} />
                            <Text size="sm" fw={500}>{t('common.tags')}</Text>
                        </Group>
                        <Group gap="xs" pl="lg">
                            {application.tags.map((tag) => (
                                <Badge key={tag} variant="outline" size="sm">{tag}</Badge>
                            ))}
                        </Group>
                    </Stack>
                )}

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

                {(application.contactName || application.contactEmail || application.contactPhone) && (
                    <Stack gap={4}>
                        <Group gap={4}>
                            <IconUser size={16} />
                            <Text size="sm" fw={500}>{t('applications.contactPerson')}</Text>
                        </Group>
                        {application.contactName && (
                            <Text size="sm" pl="lg">{application.contactName}</Text>
                        )}
                        {application.contactEmail && (
                            <Group gap={4} pl="lg">
                                <IconMail size={14} />
                                <Text size="sm" c="blue">{application.contactEmail}</Text>
                            </Group>
                        )}
                        {application.contactPhone && (
                            <Group gap={4} pl="lg">
                                <IconPhone size={14} />
                                <Text size="sm">{application.contactPhone}</Text>
                            </Group>
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

                {/* Email Preview Section */}
                {showEmailPreview && (
                    <>
                        <Divider />
                        <Stack gap="sm">
                            <Text size="sm" fw={500}>{t('applications.emailPreview')}</Text>
                            <Paper withBorder p="sm">
                                <Text size="xs" c="dimmed">{t('applications.emailTo')}: {application.contactEmail}</Text>
                                <Text size="xs" c="dimmed">{t('applications.emailSubject')}: Bewerbung als {application.jobTitle}</Text>
                            </Paper>
                            <Textarea
                                label={t('applications.coverLetter')}
                                value={emailBody}
                                onChange={(e) => setEmailBody(e.currentTarget.value)}
                                minRows={5}
                            />
                            <Group justify="flex-end">
                                <Button variant="subtle" onClick={() => setShowEmailPreview(false)}>
                                    {t('common.cancel')}
                                </Button>
                                <Button
                                    leftSection={<IconSend size={16} />}
                                    onClick={handleSendEmail}
                                    loading={sending}
                                >
                                    {t('applications.sendEmail')}
                                </Button>
                            </Group>
                        </Stack>
                    </>
                )}

                <Divider />

                <Group justify="space-between">
                    <Group>
                        <Button
                            variant="subtle"
                            color="red"
                            leftSection={<IconTrash size={16} />}
                            onClick={() => onDelete(application.id)}
                        >
                            {t('common.delete')}
                        </Button>
                        {canApplyByEmail && !showEmailPreview && (
                            <Button
                                variant="light"
                                leftSection={<IconMail size={16} />}
                                onClick={handleApplyByEmail}
                            >
                                {t('applications.applyByEmail')}
                            </Button>
                        )}
                    </Group>
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
