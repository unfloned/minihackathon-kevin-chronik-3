import { useState, useEffect } from 'react';
import Joyride, { Step, CallBackProps, STATUS, EVENTS } from 'react-joyride';
import { useMantineColorScheme } from '@mantine/core';
import { useAuth } from '../contexts/AuthContext';

const ONBOARDING_KEY = 'ycmm_onboarding_completed';

const steps: Step[] = [
    {
        target: 'body',
        content: 'Willkommen bei YCMM - You Can Manage More! Lass mich dir zeigen, wie du das Beste aus deinem Life-Manager herausholst.',
        placement: 'center',
        disableBeacon: true,
        title: 'Willkommen!',
    },
    {
        target: '[data-tour="nav-dashboard"]',
        content: 'Das Dashboard gibt dir einen schnellen Überblick über all deine Aktivitäten, deinen Chaos-Score und aktuelle Statistiken.',
        title: 'Dashboard',
    },
    {
        target: '[data-tour="nav-habits"]',
        content: 'Tracke deine täglichen Gewohnheiten und baue Streaks auf. Jeder abgeschlossene Habit gibt dir XP!',
        title: 'Habits',
    },
    {
        target: '[data-tour="nav-expenses"]',
        content: 'Behalte deine Finanzen im Blick. Kategorisiere Ausgaben und sieh deine monatlichen Trends.',
        title: 'Ausgaben',
    },
    {
        target: '[data-tour="nav-projects"]',
        content: 'Manage deine Projekte mit Kanban-Boards, Deadlines und Unteraufgaben.',
        title: 'Projekte',
    },
    {
        target: '[data-tour="nav-media"]',
        content: 'Tracke Filme, Serien, Bücher und Spiele die du schauen, lesen oder spielen möchtest.',
        title: 'Media Tracker',
    },
    {
        target: '[data-tour="nav-achievements"]',
        content: 'Schalte Achievements frei und sammle XP um Level aufzusteigen. Gamifiziere dein Leben!',
        title: 'Achievements',
    },
    {
        target: '[data-tour="theme-toggle"]',
        content: 'Wechsle zwischen Light- und Dark-Mode für optimalen Komfort.',
        title: 'Theme Wechsel',
    },
    {
        target: '[data-tour="spotlight"]',
        content: 'Drücke Cmd/Ctrl + K für die Schnellsuche. Navigiere blitzschnell durch die App!',
        title: 'Spotlight Suche',
    },
    {
        target: 'body',
        content: 'Das war\'s! Du bist bereit loszulegen. Viel Spaß mit YCMM!',
        placement: 'center',
        title: 'Los geht\'s!',
    },
];

interface OnboardingTourProps {
    children: React.ReactNode;
}

export function OnboardingTour({ children }: OnboardingTourProps) {
    const [run, setRun] = useState(false);
    const { colorScheme } = useMantineColorScheme();
    const { user } = useAuth();
    const isDark = colorScheme === 'dark';

    useEffect(() => {
        // Only show tour for new users (not demo users, not if already completed)
        if (user && !user.isDemo) {
            const completed = localStorage.getItem(ONBOARDING_KEY);
            if (!completed) {
                // Small delay to ensure the page is fully loaded
                const timer = setTimeout(() => setRun(true), 1000);
                return () => clearTimeout(timer);
            }
        }
    }, [user]);

    const handleJoyrideCallback = (data: CallBackProps) => {
        const { status, type } = data;
        const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

        if (finishedStatuses.includes(status)) {
            setRun(false);
            localStorage.setItem(ONBOARDING_KEY, 'true');
        }

        // Handle step changes for analytics or other purposes
        if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
            // Could add analytics tracking here
        }
    };

    const joyrideStyles = {
        options: {
            arrowColor: isDark ? '#25262b' : '#ffffff',
            backgroundColor: isDark ? '#25262b' : '#ffffff',
            overlayColor: 'rgba(0, 0, 0, 0.5)',
            primaryColor: '#228be6',
            textColor: isDark ? '#c1c2c5' : '#212529',
            zIndex: 10000,
        },
        tooltip: {
            borderRadius: 8,
            padding: 16,
        },
        tooltipContainer: {
            textAlign: 'left' as const,
        },
        tooltipTitle: {
            fontSize: 18,
            fontWeight: 600,
            marginBottom: 8,
        },
        tooltipContent: {
            fontSize: 14,
            lineHeight: 1.5,
        },
        buttonNext: {
            backgroundColor: '#228be6',
            borderRadius: 6,
            color: '#ffffff',
            fontSize: 14,
            padding: '8px 16px',
        },
        buttonBack: {
            color: isDark ? '#909296' : '#868e96',
            fontSize: 14,
            marginRight: 8,
        },
        buttonSkip: {
            color: isDark ? '#909296' : '#868e96',
            fontSize: 14,
        },
        spotlight: {
            borderRadius: 8,
        },
    };

    return (
        <>
            <Joyride
                steps={steps}
                run={run}
                continuous
                showSkipButton
                showProgress
                scrollToFirstStep
                disableOverlayClose
                callback={handleJoyrideCallback}
                styles={joyrideStyles}
                locale={{
                    back: 'Zurück',
                    close: 'Schließen',
                    last: 'Fertig',
                    next: 'Weiter',
                    open: 'Dialog öffnen',
                    skip: 'Überspringen',
                }}
            />
            {children}
        </>
    );
}

// Hook to manually trigger the tour
export function useOnboardingTour() {
    const resetTour = () => {
        localStorage.removeItem(ONBOARDING_KEY);
        window.location.reload();
    };

    const isTourCompleted = () => {
        return localStorage.getItem(ONBOARDING_KEY) === 'true';
    };

    return { resetTour, isTourCompleted };
}

export default OnboardingTour;
