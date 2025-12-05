import type { HabitWithStatus, HabitType, HabitFrequency } from '@ycmm/core';

// Alias for component usage
export type Habit = HabitWithStatus;

export interface CreateHabitForm {
    name: string;
    description: string;
    icon: string;
    color: string;
    type: HabitType;
    targetValue: number;
    unit: string;
    frequency: HabitFrequency;
}

// Duration unit keys for translation
export const DURATION_UNIT_KEYS = ['seconds', 'minutes', 'hours'] as const;

// Default form values
export const defaultForm: CreateHabitForm = {
    name: '',
    description: '',
    icon: 'check',
    color: '#228be6',
    type: 'boolean',
    targetValue: 1,
    unit: '',
    frequency: 'daily',
};

// Color swatches for habit colors
export const COLOR_SWATCHES = [
    '#228be6', '#40c057', '#fab005', '#fd7e14',
    '#fa5252', '#be4bdb', '#7950f2', '#15aabf',
];

// Calculate elapsed seconds from server start time
export const calculateElapsedSeconds = (timerStartedAt?: string): number => {
    if (!timerStartedAt) return 0;
    const startTime = new Date(timerStartedAt).getTime();
    const now = Date.now();
    return Math.floor((now - startTime) / 1000);
};

// Format seconds to display string
export const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
        return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
