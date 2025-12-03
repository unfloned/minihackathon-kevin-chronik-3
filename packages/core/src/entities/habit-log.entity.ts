import { entity, PrimaryKey, Reference, uuid, UUID, Index } from '@deepkit/type';
import { User } from './user.entity.js';
import { Habit } from './habit.entity.js';

@entity.name('habit_logs')
export class HabitLog {
    id: UUID & PrimaryKey = uuid();
    user!: User & Reference;
    habit!: Habit & Reference;

    date: string & Index = '';
    value: number = 1;
    completed: boolean = false;
    note?: string;

    timerStartedAt?: Date;
    timerEndedAt?: Date;

    createdAt: Date = new Date();
}

export type HabitLogFrontend = Readonly<HabitLog>;
