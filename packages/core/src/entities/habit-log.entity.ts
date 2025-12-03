import { entity, PrimaryKey, Index, Reference } from '@deepkit/type';
import { User } from './user.entity.js';
import { Habit } from './habit.entity.js';

@entity.name('habit_logs')
export class HabitLog {
    id: string & PrimaryKey = '';
    userId: string & Index = '';
    user?: User & Reference;
    habitId: string & Index = '';
    habit?: Habit & Reference;

    date: string & Index = ''; // YYYY-MM-DD format for easy querying
    value: number = 1; // 1 for boolean, actual value for quantity/duration
    completed: boolean = false;
    note?: string;

    // Timer fields for duration habits
    timerStartedAt?: Date; // When the timer was started
    timerEndedAt?: Date; // When the timer was stopped (null = timer still running)

    createdAt: Date = new Date();
}
