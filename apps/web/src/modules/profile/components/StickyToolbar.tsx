import { Group, Button, Paper } from '@mantine/core';
import { IconDeviceFloppy, IconDownload } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

interface StickyToolbarProps {
    onSave: () => void;
    onDownloadPdf: () => void;
    saving: boolean;
}

export function StickyToolbar({ onSave, onDownloadPdf, saving }: StickyToolbarProps) {
    const { t } = useTranslation();

    return (
        <Paper
            withBorder
            p="sm"
            style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 100,
                borderTop: '1px solid var(--mantine-color-default-border)',
            }}
        >
            <Group justify="center" gap="md">
                <Button
                    variant="light"
                    leftSection={<IconDownload size={16} />}
                    onClick={onDownloadPdf}
                >
                    {t('cvGenerator.downloadPdf')}
                </Button>
                <Button
                    leftSection={<IconDeviceFloppy size={16} />}
                    onClick={onSave}
                    loading={saving}
                >
                    {t('common.save')}
                </Button>
            </Group>
        </Paper>
    );
}
