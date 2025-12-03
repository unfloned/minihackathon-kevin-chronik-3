import { entity, PrimaryKey, Reference, uuid, UUID } from '@deepkit/type';
import { User } from './user.entity.js';

export type HabitType = 'boolean' | 'quantity' | 'duration';
export type HabitFrequency = 'daily' | 'weekly' | 'custom';

@entity.name('habits')
export class Habit {
    id: UUID & PrimaryKey = uuid();
    user!: User & Reference;

    name: string = '';
    description?: string;
    icon: string = 'check';
    color: string = '#228be6';

    type: HabitType = 'boolean';
    targetValue?: number;
    unit?: string;

    frequency: HabitFrequency = 'daily';
    customDays?: string;

    reminderTime?: string;
    isArchived: boolean = false;

    currentStreak: number = 0;
    longestStreak: number = 0;
    totalCompletions: number = 0;

    createdAt: Date = new Date();
    updatedAt: Date = new Date();
}

export type HabitFrontend = Readonly<Habit>;
