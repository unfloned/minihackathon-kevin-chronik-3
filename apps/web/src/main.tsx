import { createRoot } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AppSpotlight } from './components/AppSpotlight';
import { QuickCreateSpotlight } from './components/QuickCreateSpotlight';
import { OnboardingTour } from './components/OnboardingTour';
import { AuthProvider } from './contexts/AuthContext';
import { VersionProvider } from './contexts/VersionContext';
import { LevelUpProvider } from './contexts/LevelUpContext';
import { QuickCreateProvider } from './contexts/QuickCreateContext';
import { createModals } from './components/CreateModals';

import './i18n';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/spotlight/styles.css';
import '@mantine/tiptap/styles.css';
import './styles/transitions.css';

createRoot(document.getElementById('root')!).render(
    <MantineProvider defaultColorScheme="auto">
        <ModalsProvider modals={createModals}>
            <Notifications position="top-right" />
            <BrowserRouter>
                <VersionProvider>
                    <AuthProvider>
                        <QuickCreateProvider>
                            <LevelUpProvider>
                                <OnboardingTour>
                                    <AppSpotlight>
                                        <QuickCreateSpotlight>
                                            <App />
                                        </QuickCreateSpotlight>
                                    </AppSpotlight>
                                </OnboardingTour>
                            </LevelUpProvider>
                        </QuickCreateProvider>
                    </AuthProvider>
                </VersionProvider>
            </BrowserRouter>
        </ModalsProvider>
    </MantineProvider>
);
