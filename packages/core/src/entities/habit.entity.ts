import { entity, PrimaryKey, Index, Reference } from '@deepkit/type';
import { User } from './user.entity.js';

export type HabitType = 'boolean' | 'quantity' | 'duration';
export type HabitFrequency = 'daily' | 'weekly' | 'custom';

@entity.name('habits')
export class Habit {
    id: string & PrimaryKey = '';
    userId: string & Index = '';
    user?: User & Reference;

    name: string = '';
    description?: string;
    icon: string = 'check';
    color: string = '#228be6';

    type: HabitType = 'boolean';
    targetValue?: number; // For quantity/duration types
    unit?: string; // e.g., "glasses", "minutes", "pages"

    frequency: HabitFrequency = 'daily';
    customDays?: string; // JSON array of days [0-6] for custom frequency

    reminderTime?: string; // HH:mm format
    isArchived: boolean = false;

    currentStreak: number = 0;
    longestStreak: number = 0;
    totalCompletions: number = 0;

    createdAt: Date = new Date();
    updatedAt: Date = new Date();
}
