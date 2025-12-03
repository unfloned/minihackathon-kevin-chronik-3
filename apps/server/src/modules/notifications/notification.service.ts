import { AppDatabase } from '../../app/database';
import { Notification, type NotificationType, User } from '@ycmm/core';

export interface NotificationPublic {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
    isRead: boolean;
    createdAt: Date;
}

export class NotificationService {
    constructor(private db: AppDatabase) {}

    async create(
        userId: string,
        type: NotificationType,
        title: string,
        message: string,
        link?: string
    ): Promise<Notification> {
        const notification = new Notification();
        notification.user = this.db.getReference(User, userId);
        notification.type = type;
        notification.title = title;
        notification.message = message;
        notification.link = link;
        notification.isRead = false;
        notification.createdAt = new Date();

        await this.db.persist(notification);
        return notification;
    }

    async getForUser(userId: string, limit = 20): Promise<NotificationPublic[]> {
        const notifications = await this.db.query(Notification)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .find();

        return notifications.map(this.toPublic);
    }

    async getUnreadCount(userId: string): Promise<number> {
        return this.db.query(Notification)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .filter({ isRead: false })
            .count();
    }

    async markAsRead(notificationId: string, userId: string): Promise<boolean> {
        const notification = await this.db.query(Notification)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .filter({ id: notificationId })
            .findOneOrUndefined();

        if (!notification) {
            return false;
        }

        notification.isRead = true;
        await this.db.persist(notification);
        return true;
    }

    async markAllAsRead(userId: string): Promise<number> {
        const unread = await this.db.query(Notification)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .filter({ isRead: false })
            .find();

        for (const notification of unread) {
            notification.isRead = true;
            await this.db.persist(notification);
        }

        return unread.length;
    }

    async delete(notificationId: string, userId: string): Promise<boolean> {
        const notification = await this.db.query(Notification)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .filter({ id: notificationId })
            .findOneOrUndefined();

        if (!notification) {
            return false;
        }

        await this.db.remove(notification);
        return true;
    }

    private toPublic(notification: Notification): NotificationPublic {
        return {
            id: notification.id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            link: notification.link,
            isRead: notification.isRead,
            createdAt: notification.createdAt,
        };
    }
}
