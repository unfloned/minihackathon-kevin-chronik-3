import { useState, useEffect } from 'react';
import { Paper, Group, Text, Button, CloseButton } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        // Check if dismissed recently (24h cooldown)
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (dismissed) {
            const dismissedTime = parseInt(dismissed, 10);
            if (Date.now() - dismissedTime < 24 * 60 * 60 * 1000) {
                return;
            }
        }

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Listen for successful install
        window.addEventListener('appinstalled', () => {
            setIsInstalled(true);
            setShowPrompt(false);
            setDeferredPrompt(null);
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setShowPrompt(false);
        }
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    };

    if (!showPrompt || isInstalled) {
        return null;
    }

    return (
        <Paper
            shadow="lg"
            p="md"
            radius="md"
            style={{
                position: 'fixed',
                bottom: 20,
                left: 20,
                right: 20,
                maxWidth: 400,
                zIndex: 1000,
                margin: '0 auto',
            }}
            withBorder
        >
            <Group justify="space-between" wrap="nowrap">
                <Group wrap="nowrap" gap="sm">
                    <IconDownload size={24} color="var(--mantine-color-blue-6)" />
                    <div>
                        <Text size="sm" fw={500}>
                            App installieren
                        </Text>
                        <Text size="xs" c="dimmed">
                            Schnellzugriff vom Homescreen
                        </Text>
                    </div>
                </Group>
                <Group gap="xs" wrap="nowrap">
                    <Button size="xs" onClick={handleInstall}>
                        Installieren
                    </Button>
                    <CloseButton size="sm" onClick={handleDismiss} />
                </Group>
            </Group>
        </Paper>
    );
}
