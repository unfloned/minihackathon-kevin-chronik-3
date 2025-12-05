import { Paper, Group, ThemeIcon, Stack, Text, Button, Switch } from '@mantine/core';
import { IconShare, IconCopy, IconLink } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';
import type { ProfileSharingStatus } from '../types';

interface ProfileSharingPanelProps {
    sharingStatus?: ProfileSharingStatus;
    loadingSharing: boolean;
    togglingSharing: boolean;
    onToggle: () => void;
}

export function ProfileSharingPanel({
    sharingStatus,
    loadingSharing,
    togglingSharing,
    onToggle,
}: ProfileSharingPanelProps) {
    const { t } = useTranslation();

    const handleCopyLink = () => {
        if (sharingStatus?.shareUrl) {
            const fullUrl = `${window.location.origin}${sharingStatus.shareUrl}`;
            navigator.clipboard.writeText(fullUrl);
            notifications.show({
                title: t('achievements.sharing.linkCopied'),
                message: t('achievements.sharing.linkCopiedDesc'),
                color: 'green',
            });
        }
    };

    return (
        <Paper
            withBorder
            p="md"
            radius="md"
            style={{
                background: sharingStatus?.isPublic
                    ? 'linear-gradient(135deg, rgba(156, 39, 176, 0.1) 0%, rgba(233, 30, 99, 0.1) 100%)'
                    : undefined,
                borderColor: sharingStatus?.isPublic ? 'var(--mantine-color-grape-4)' : undefined,
            }}
        >
            <Group justify="space-between" wrap="wrap" gap="md">
                <Group gap="md">
                    <ThemeIcon
                        size={50}
                        radius="xl"
                        variant={sharingStatus?.isPublic ? 'gradient' : 'light'}
                        gradient={{ from: 'grape', to: 'pink' }}
                        color="gray"
                    >
                        <IconShare size={24} />
                    </ThemeIcon>
                    <Stack gap={2}>
                        <Text fw={600}>{t('achievements.sharing.title')}</Text>
                        <Text size="sm" c="dimmed">
                            {sharingStatus?.isPublic
                                ? t('achievements.sharing.publicDesc')
                                : t('achievements.sharing.privateDesc')}
                        </Text>
                    </Stack>
                </Group>
                <Group gap="sm">
                    {sharingStatus?.isPublic && (
                        <Button
                            variant="light"
                            color="grape"
                            leftSection={<IconCopy size={16} />}
                            onClick={handleCopyLink}
                        >
                            {t('achievements.sharing.copyLink')}
                        </Button>
                    )}
                    <Switch
                        checked={sharingStatus?.isPublic || false}
                        onChange={onToggle}
                        disabled={loadingSharing || togglingSharing}
                        size="lg"
                        onLabel={<IconLink size={14} />}
                        offLabel={<IconLink size={14} />}
                    />
                </Group>
            </Group>
        </Paper>
    );
}
