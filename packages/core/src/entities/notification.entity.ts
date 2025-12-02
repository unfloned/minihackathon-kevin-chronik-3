import { entity, PrimaryKey, Index, Reference } from '@deepkit/type';
import { User } from './user.entity.js';

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'achievement' | 'reminder';

@entity.name('notifications')
export class Notification {
    id: string & PrimaryKey = '';
    userId: string & Index = '';
    user?: User & Reference;
    type: NotificationType = 'info';
    title: string = '';
    message: string = '';
    link?: string;
    isRead: boolean = false;
    createdAt: Date = new Date();
}
