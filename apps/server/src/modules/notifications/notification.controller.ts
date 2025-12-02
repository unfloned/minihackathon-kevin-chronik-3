import { http, HttpNotFoundError } from '@deepkit/http';
import { NotificationService } from './notification.service';
import { User } from '@ycmm/core';

@http.controller('/api/notifications')
export class NotificationController {
    constructor(private notificationService: NotificationService) {}

    @(http.GET('').group('auth-required'))
    async getNotifications(user: User) {
        return this.notificationService.getForUser(user.id);
    }

    @(http.GET('/unread-count').group('auth-required'))
    async getUnreadCount(user: User) {
        return this.notificationService.getUnreadCount(user.id);
    }

    @(http.PATCH('/:id/read').group('auth-required'))
    async markAsRead(id: string, user: User) {
        const success = await this.notificationService.markAsRead(id, user.id);
        if (!success) {
            throw new HttpNotFoundError('Notification not found');
        }
    }

    @(http.POST('/read-all').group('auth-required'))
    async markAllAsRead(user: User) {
        return this.notificationService.markAllAsRead(user.id);
    }

    @(http.DELETE('/:id').group('auth-required'))
    async deleteNotification(id: string, user: User) {
        const success = await this.notificationService.delete(id, user.id);
        if (!success) {
            throw new HttpNotFoundError('Notification not found');
        }
    }
}
