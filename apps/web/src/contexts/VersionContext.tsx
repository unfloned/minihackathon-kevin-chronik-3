import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { Modal, Stack, Text, Button, Group, ThemeIcon } from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';
import { api } from '../config/api';
import type { VersionInfo } from '@ycmm/core';

interface VersionContextType {
    currentVersion: string | null;
    versionInfo: VersionInfo | null;
    checkForUpdates: () => Promise<void>;
}

const VersionContext = createContext<VersionContextType | null>(null);

const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
const VERSION_STORAGE_KEY = 'ycmm_version';

export function VersionProvider({ children }: { children: ReactNode }) {
    const [currentVersion, setCurrentVersion] = useState<string | null>(null);
    const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [newVersion, setNewVersion] = useState<string | null>(null);

    const fetchVersion = useCallback(async (): Promise<VersionInfo | null> => {
        try {
            const data = await api.get<VersionInfo>('/version', { auth: false });
            setVersionInfo(data);
            return data;
        } catch (error) {
            console.error('Failed to fetch version:', error);
            return null;
        }
    }, []);

    const checkForUpdates = useCallback(async () => {
        const data = await fetchVersion();
        if (!data) return;

        const storedVersion = localStorage.getItem(VERSION_STORAGE_KEY);

        if (!storedVersion) {
            localStorage.setItem(VERSION_STORAGE_KEY, data.version);
            setCurrentVersion(data.version);
        } else if (storedVersion !== data.version) {
            setNewVersion(data.version);
            setUpdateAvailable(true);
        }
    }, [fetchVersion]);

    const handleReload = useCallback(() => {
        if (newVersion) {
            localStorage.setItem(VERSION_STORAGE_KEY, newVersion);
        }
        window.location.reload();
    }, [newVersion]);

    const handleDismiss = useCallback(() => {
        setUpdateAvailable(false);
    }, []);

    // Initial check
    useEffect(() => {
        const storedVersion = localStorage.getItem(VERSION_STORAGE_KEY);
        if (storedVersion) {
            setCurrentVersion(storedVersion);
        }
        checkForUpdates();
    }, [checkForUpdates]);

    // Periodic check
    useEffect(() => {
        const interval = setInterval(checkForUpdates, CHECK_INTERVAL);
        return () => clearInterval(interval);
    }, [checkForUpdates]);

    // Check on visibility change (tab focus)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                checkForUpdates();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [checkForUpdates]);

    return (
        <VersionContext.Provider value={{ currentVersion, versionInfo, checkForUpdates }}>
            {children}

            <Modal
                opened={updateAvailable}
                onClose={handleDismiss}
                title="Update verfügbar"
                centered
                closeOnClickOutside={false}
            >
                <Stack>
                    <Group>
                        <ThemeIcon size="xl" color="blue" variant="light">
                            <IconRefresh size={28} />
                        </ThemeIcon>
                        <div>
                            <Text fw={500}>Neue Version verfügbar</Text>
                            <Text size="sm" c="dimmed">
                                Version {newVersion} ist verfügbar
                            </Text>
                        </div>
                    </Group>

                    <Text size="sm" c="dimmed">
                        Es gibt eine neue Version. Bitte lade die Seite neu,
                        um die neuesten Funktionen und Verbesserungen zu erhalten.
                    </Text>

                    <Group justify="flex-end" mt="md">
                        <Button variant="subtle" onClick={handleDismiss}>
                            Später
                        </Button>
                        <Button
                            leftSection={<IconRefresh size={16} />}
                            onClick={handleReload}
                        >
                            Jetzt neu laden
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </VersionContext.Provider>
    );
}

export function useVersion() {
    const context = useContext(VersionContext);
    if (!context) {
        throw new Error('useVersion must be used within a VersionProvider');
    }
    return context;
}
