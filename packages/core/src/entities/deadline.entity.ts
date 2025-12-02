import { entity, PrimaryKey, Index } from '@deepkit/type';

export type DeadlinePriority = 'low' | 'medium' | 'high' | 'urgent';
export type DeadlineStatus = 'pending' | 'completed' | 'overdue' | 'cancelled';

@entity.name('deadlines')
export class Deadline {
    id: string & PrimaryKey = '';
    userId: string & Index = '';

    title: string = '';
    description?: string;

    dueDate: string & Index = ''; // YYYY-MM-DD format
    dueTime?: string; // HH:MM format (optional)

    priority: DeadlinePriority = 'medium';
    status: DeadlineStatus = 'pending';

    category?: string; // e.g., 'work', 'personal', 'study'
    color: string = '#228be6';

    // Reminder settings
    reminderEnabled: boolean = false;
    reminderDaysBefore?: number;

    completedAt?: Date;
    createdAt: Date = new Date();
    updatedAt: Date = new Date();
}
