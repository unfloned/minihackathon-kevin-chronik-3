import { entity, PrimaryKey, Reference, uuid, UUID, Index } from '@deepkit/type';
import { User } from './user.entity.js';

export type DeadlinePriority = 'low' | 'medium' | 'high' | 'urgent';
export type DeadlineStatus = 'pending' | 'completed' | 'overdue' | 'cancelled';

@entity.name('deadlines')
export class Deadline {
    id: UUID & PrimaryKey = uuid();
    user!: User & Reference;

    title: string = '';
    description?: string;

    dueDate: string & Index = '';
    dueTime?: string;

    priority: DeadlinePriority = 'medium';
    status: DeadlineStatus = 'pending';

    category?: string;
    color: string = '#228be6';

    reminderEnabled: boolean = false;
    reminderDaysBefore?: number;

    completedAt?: Date;
    createdAt: Date = new Date();
    updatedAt: Date = new Date();
}

export type DeadlineFrontend = Readonly<Deadline>;
