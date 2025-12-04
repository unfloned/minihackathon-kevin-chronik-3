import { createRoot } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import App from './App';
import { AppSpotlight } from './components/AppSpotlight';
import { QuickCreateSpotlight } from './components/QuickCreateSpotlight';
import { OnboardingTour } from './components/OnboardingTour';
import { AuthProvider } from './contexts/AuthContext';
import { VersionProvider } from './contexts/VersionContext';
import { LevelUpProvider } from './contexts/LevelUpContext';
import { QuickCreateProvider } from './contexts/QuickCreateContext';
import { lazyCreateModals } from './components/LazyCreateModals';

import i18n from './i18n';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/spotlight/styles.css';
import '@mantine/tiptap/styles.css';
import './styles/transitions.css';

createRoot(document.getElementById('root')!).render(
    <I18nextProvider i18n={i18n}>
        <MantineProvider defaultColorScheme="auto">
            <ModalsProvider modals={lazyCreateModals}>
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
    </I18nextProvider>
);
