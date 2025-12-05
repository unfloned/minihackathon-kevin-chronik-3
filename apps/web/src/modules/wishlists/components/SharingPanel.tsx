import {
    Paper,
    Group,
    ThemeIcon,
    Stack,
    Text,
    Button,
    Switch,
} from '@mantine/core';
import { IconShare, IconCopy, IconLink } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { SharingInfo } from '../types';

interface SharingPanelProps {
    sharingInfo: SharingInfo | undefined;
    onToggleSharing: () => void;
    onCopyLink: () => void;
    isToggling: boolean;
}

export function SharingPanel({ sharingInfo, onToggleSharing, onCopyLink, isToggling }: SharingPanelProps) {
    const { t } = useTranslation();

    return (
        <Paper
            withBorder
            p="md"
            radius="md"
            style={{
                background: sharingInfo?.isPublic
                    ? 'linear-gradient(135deg, rgba(34, 139, 230, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)'
                    : undefined,
                borderColor: sharingInfo?.isPublic ? 'var(--mantine-color-blue-4)' : undefined,
            }}
        >
            <Group justify="space-between" wrap="wrap" gap="md">
                <Group gap="md">
                    <ThemeIcon
                        size={50}
                        radius="xl"
                        variant={sharingInfo?.isPublic ? 'gradient' : 'light'}
                        gradient={{ from: 'blue', to: 'teal' }}
                        color="gray"
                    >
                        <IconShare size={24} />
                    </ThemeIcon>
                    <Stack gap={2}>
                        <Text fw={600}>{t('wishlists.sharing.title')}</Text>
                        <Text size="sm" c="dimmed">
                            {sharingInfo?.isPublic
                                ? t('wishlists.sharing.publicDesc')
                                : t('wishlists.sharing.privateDesc')}
                        </Text>
                    </Stack>
                </Group>
                <Group gap="sm">
                    {sharingInfo?.isPublic && (
                        <Button
                            variant="light"
                            color="blue"
                            leftSection={<IconCopy size={16} />}
                            onClick={onCopyLink}
                        >
                            {t('wishlists.sharing.copyLink')}
                        </Button>
                    )}
                    <Switch
                        checked={sharingInfo?.isPublic || false}
                        onChange={onToggleSharing}
                        disabled={isToggling}
                        size="lg"
                        onLabel={<IconLink size={14} />}
                        offLabel={<IconLink size={14} />}
                    />
                </Group>
            </Group>
        </Paper>
    );
}
