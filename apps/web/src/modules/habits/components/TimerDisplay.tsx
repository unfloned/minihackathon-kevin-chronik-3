import { useState, useEffect, memo } from 'react';
import { Group, Badge, ActionIcon } from '@mantine/core';
import { IconPlayerStop } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { calculateElapsedSeconds, formatTime } from '../types';

interface TimerDisplayProps {
    timerStartedAt: string;
    targetValue: number;
    unit?: string;
    color: string;
    onStop: () => void;
}

export const TimerDisplay = memo(function TimerDisplay({
    timerStartedAt,
    targetValue,
    unit,
    color,
    onStop,
}: TimerDisplayProps) {
    const { t } = useTranslation();
    const [elapsedSeconds, setElapsedSeconds] = useState(() => calculateElapsedSeconds(timerStartedAt));

    const formatUnitShort = (u?: string): string => {
        switch (u) {
            case 'seconds': return t('habits.units.secondsShort');
            case 'minutes': return t('habits.units.minutesShort');
            case 'hours': return t('habits.units.hoursShort');
            default: return u || '';
        }
    };

    useEffect(() => {
        // Update elapsed seconds every second
        const interval = setInterval(() => {
            setElapsedSeconds(calculateElapsedSeconds(timerStartedAt));
        }, 1000);

        return () => clearInterval(interval);
    }, [timerStartedAt]);

    return (
        <Group gap="xs">
            <Badge size="lg" variant="light" color={color} style={{ fontFamily: 'monospace' }}>
                {formatTime(elapsedSeconds)} / {targetValue} {formatUnitShort(unit)}
            </Badge>
            <ActionIcon size="sm" color="red" variant="filled" onClick={onStop}>
                <IconPlayerStop size={14} />
            </ActionIcon>
        </Group>
    );
});
