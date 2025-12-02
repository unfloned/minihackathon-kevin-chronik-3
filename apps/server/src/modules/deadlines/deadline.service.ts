import { v4 as uuidv4 } from 'uuid';
import { AppDatabase } from '../../app/database';
import { GamificationService } from '../gamification/gamification.service';
import { NotificationService } from '../notifications/notification.service';
import { Deadline, DeadlinePriority, DeadlineStatus } from '@ycmm/core';

export interface CreateDeadlineDto {
    title: string;
    description?: string;
    dueDate: string;
    dueTime?: string;
    priority?: DeadlinePriority;
    category?: string;
    color?: string;
    reminderEnabled?: boolean;
    reminderDaysBefore?: number;
}

export interface UpdateDeadlineDto {
    title?: string;
    description?: string;
    dueDate?: string;
    dueTime?: string;
    priority?: DeadlinePriority;
    status?: DeadlineStatus;
    category?: string;
    color?: string;
    reminderEnabled?: boolean;
    reminderDaysBefore?: number;
}

export interface DeadlineStats {
    total: number;
    pending: number;
    completed: number;
    overdue: number;
    completedThisMonth: number;
    byPriority: { priority: DeadlinePriority; count: number }[];
    byCategory: { category: string; count: number }[];
    upcomingThisWeek: Deadline[];
}

export class DeadlineService {
    constructor(
        private db: AppDatabase,
        private gamificationService: GamificationService,
        private notificationService: NotificationService
    ) {}

    async create(userId: string, dto: CreateDeadlineDto): Promise<Deadline> {
        const deadline = new Deadline();
        deadline.id = uuidv4();
        deadline.userId = userId;
        deadline.title = dto.title;
        deadline.description = dto.description;
        deadline.dueDate = dto.dueDate;
        deadline.dueTime = dto.dueTime;
        deadline.priority = dto.priority || 'medium';
        deadline.category = dto.category;
        deadline.color = dto.color || '#228be6';
        deadline.reminderEnabled = dto.reminderEnabled || false;
        deadline.reminderDaysBefore = dto.reminderDaysBefore;
        deadline.status = 'pending';
        deadline.createdAt = new Date();
        deadline.updatedAt = new Date();

        await this.db.persist(deadline);

        // Award XP for creating a deadline
        await this.gamificationService.awardXp(userId, 5, 'deadline_created');

        // Check for first deadline achievement
        await this.gamificationService.checkAndUnlockAchievement(userId, 'first_deadline');

        return deadline;
    }

    async getAll(userId: string): Promise<Deadline[]> {
        return this.db.query(Deadline)
            .filter({ userId })
            .orderBy('dueDate', 'asc')
            .find();
    }

    async getById(id: string, userId: string): Promise<Deadline | undefined> {
        return this.db.query(Deadline)
            .filter({ id, userId })
            .findOneOrUndefined();
    }

    async getUpcoming(userId: string, days: number = 7): Promise<Deadline[]> {
        const today = new Date().toISOString().split('T')[0];
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);
        const endDate = futureDate.toISOString().split('T')[0];

        return this.db.query(Deadline)
            .filter({
                userId,
                status: 'pending',
                dueDate: { $gte: today, $lte: endDate }
            })
            .orderBy('dueDate', 'asc')
            .find();
    }

    async getOverdue(userId: string): Promise<Deadline[]> {
        const today = new Date().toISOString().split('T')[0];

        const overdue = await this.db.query(Deadline)
            .filter({
                userId,
                status: 'pending',
                dueDate: { $lt: today }
            })
            .orderBy('dueDate', 'asc')
            .find();

        // Update status to overdue for these items
        for (const deadline of overdue) {
            if (deadline.status === 'pending') {
                deadline.status = 'overdue';
                deadline.updatedAt = new Date();
                await this.db.persist(deadline);
            }
        }

        return overdue;
    }

    async update(id: string, userId: string, dto: UpdateDeadlineDto): Promise<Deadline | null> {
        const deadline = await this.getById(id, userId);
        if (!deadline) return null;

        if (dto.title !== undefined) deadline.title = dto.title;
        if (dto.description !== undefined) deadline.description = dto.description;
        if (dto.dueDate !== undefined) deadline.dueDate = dto.dueDate;
        if (dto.dueTime !== undefined) deadline.dueTime = dto.dueTime;
        if (dto.priority !== undefined) deadline.priority = dto.priority;
        if (dto.category !== undefined) deadline.category = dto.category;
        if (dto.color !== undefined) deadline.color = dto.color;
        if (dto.reminderEnabled !== undefined) deadline.reminderEnabled = dto.reminderEnabled;
        if (dto.reminderDaysBefore !== undefined) deadline.reminderDaysBefore = dto.reminderDaysBefore;

        if (dto.status !== undefined) {
            const wasNotCompleted = deadline.status !== 'completed';
            deadline.status = dto.status;

            if (dto.status === 'completed' && wasNotCompleted) {
                deadline.completedAt = new Date();

                // Award XP for completing deadline
                await this.gamificationService.awardXp(userId, 20, 'deadline_completed');

                // Check if completed before due date
                const today = new Date().toISOString().split('T')[0];
                if (deadline.dueDate >= today) {
                    await this.gamificationService.checkAndUnlockAchievement(userId, 'deadline_met');
                }

                // Create notification
                await this.notificationService.create(
                    userId,
                    'success',
                    'Frist erledigt!',
                    `Du hast "${deadline.title}" rechtzeitig abgeschlossen.`,
                    '/app/deadlines'
                );
            }
        }

        deadline.updatedAt = new Date();
        await this.db.persist(deadline);
        return deadline;
    }

    async delete(id: string, userId: string): Promise<boolean> {
        const deadline = await this.getById(id, userId);
        if (!deadline) return false;

        await this.db.remove(deadline);
        return true;
    }

    async complete(id: string, userId: string): Promise<Deadline | null> {
        return this.update(id, userId, { status: 'completed' });
    }

    async getStats(userId: string): Promise<DeadlineStats> {
        const allDeadlines = await this.getAll(userId);
        const today = new Date().toISOString().split('T')[0];

        // Get dates for this week
        const weekEnd = new Date();
        weekEnd.setDate(weekEnd.getDate() + 7);
        const weekEndStr = weekEnd.toISOString().split('T')[0];

        // Get dates for this month
        const monthStart = new Date();
        monthStart.setDate(1);
        const monthStartStr = monthStart.toISOString().split('T')[0];
        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);
        const monthEndStr = monthEnd.toISOString().split('T')[0];

        const pending = allDeadlines.filter(d => d.status === 'pending').length;
        const completed = allDeadlines.filter(d => d.status === 'completed').length;
        const overdue = allDeadlines.filter(d => d.status === 'overdue' || (d.status === 'pending' && d.dueDate < today)).length;

        const completedThisMonth = allDeadlines.filter(d =>
            d.status === 'completed' &&
            d.completedAt &&
            d.completedAt >= new Date(monthStartStr) &&
            d.completedAt < new Date(monthEndStr)
        ).length;

        // Group by priority
        const priorityMap = new Map<DeadlinePriority, number>();
        for (const deadline of allDeadlines.filter(d => d.status === 'pending' || d.status === 'overdue')) {
            const count = priorityMap.get(deadline.priority) || 0;
            priorityMap.set(deadline.priority, count + 1);
        }
        const byPriority = Array.from(priorityMap.entries()).map(([priority, count]) => ({ priority, count }));

        // Group by category
        const categoryMap = new Map<string, number>();
        for (const deadline of allDeadlines.filter(d => d.status === 'pending' || d.status === 'overdue')) {
            const cat = deadline.category || 'Ohne Kategorie';
            const count = categoryMap.get(cat) || 0;
            categoryMap.set(cat, count + 1);
        }
        const byCategory = Array.from(categoryMap.entries()).map(([category, count]) => ({ category, count }));

        // Upcoming this week
        const upcomingThisWeek = allDeadlines.filter(d =>
            d.status === 'pending' &&
            d.dueDate >= today &&
            d.dueDate <= weekEndStr
        ).slice(0, 5);

        return {
            total: allDeadlines.length,
            pending,
            completed,
            overdue,
            completedThisMonth,
            byPriority,
            byCategory,
            upcomingThisWeek,
        };
    }

    async checkAndNotifyUpcoming(userId: string): Promise<void> {
        const today = new Date().toISOString().split('T')[0];
        const deadlines = await this.db.query(Deadline)
            .filter({ userId, status: 'pending', reminderEnabled: true })
            .find();

        for (const deadline of deadlines) {
            if (!deadline.reminderDaysBefore) continue;

            const dueDate = new Date(deadline.dueDate);
            const reminderDate = new Date(dueDate);
            reminderDate.setDate(reminderDate.getDate() - deadline.reminderDaysBefore);
            const reminderDateStr = reminderDate.toISOString().split('T')[0];

            if (reminderDateStr === today) {
                await this.notificationService.create(
                    userId,
                    'warning',
                    'Frist nähert sich!',
                    `"${deadline.title}" ist in ${deadline.reminderDaysBefore} Tag(en) fällig.`,
                    '/app/deadlines'
                );
            }
        }
    }
}
