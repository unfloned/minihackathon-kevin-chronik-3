import { AppDatabase } from '../../app/database';
import {
    User,
    Application,
    Deadline,
    ExpenseCategory,
    Expense,
    HabitLog,
    Habit,
    InventoryItem,
    List,
    Meal,
    MediaItem,
    Note,
    Notification,
    Project,
    RefreshToken,
    Subscription,
    UserAchievement,
    Wishlist,
} from '@ycmm/core';

export class DemoCleanupService {
    constructor(private db: AppDatabase) {}

    /**
     * Delete a demo user and ALL their associated data
     */
    async deleteDemoUser(userId: string): Promise<void> {
        // Verify user is actually a demo user
        const user = await this.db.query(User)
            .filter({ id: userId })
            .findOneOrUndefined();

        if (!user || !user.isDemo) {
            console.log(`[DemoCleanup] User ${userId} is not a demo user, skipping deletion`);
            return;
        }

        console.log(`[DemoCleanup] Deleting demo user ${userId} and all associated data...`);

        // Delete all user data in order (to avoid foreign key issues)
        await this.deleteUserData(userId);

        // Finally delete the user
        await this.db.remove(user);

        console.log(`[DemoCleanup] Demo user ${userId} deleted successfully`);
    }

    /**
     * Delete all data associated with a user (but not the user itself)
     */
    private async deleteUserData(userId: string): Promise<void> {
        // Delete refresh tokens
        const refreshTokens = await this.db.query(RefreshToken)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .find();
        for (const token of refreshTokens) {
            await this.db.remove(token);
        }

        // Delete notifications
        const notifications = await this.db.query(Notification)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .find();
        for (const notification of notifications) {
            await this.db.remove(notification);
        }

        // Delete user achievements
        const userAchievements = await this.db.query(UserAchievement)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .find();
        for (const achievement of userAchievements) {
            await this.db.remove(achievement);
        }

        // Delete applications
        const applications = await this.db.query(Application)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .find();
        for (const app of applications) {
            await this.db.remove(app);
        }

        // Delete habit logs first (references habits)
        const habitLogs = await this.db.query(HabitLog)
            .useInnerJoinWith('habit')
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .end()
            .find();
        for (const log of habitLogs) {
            await this.db.remove(log);
        }

        // Delete habits
        const habits = await this.db.query(Habit)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .find();
        for (const habit of habits) {
            await this.db.remove(habit);
        }

        // Delete expenses
        const expenses = await this.db.query(Expense)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .find();
        for (const expense of expenses) {
            await this.db.remove(expense);
        }

        // Delete expense categories
        const expenseCategories = await this.db.query(ExpenseCategory)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .find();
        for (const category of expenseCategories) {
            await this.db.remove(category);
        }

        // Delete deadlines
        const deadlines = await this.db.query(Deadline)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .find();
        for (const deadline of deadlines) {
            await this.db.remove(deadline);
        }

        // Delete subscriptions
        const subscriptions = await this.db.query(Subscription)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .find();
        for (const subscription of subscriptions) {
            await this.db.remove(subscription);
        }

        // Delete media items
        const mediaItems = await this.db.query(MediaItem)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .find();
        for (const media of mediaItems) {
            await this.db.remove(media);
        }

        // Delete inventory items
        const inventoryItems = await this.db.query(InventoryItem)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .find();
        for (const item of inventoryItems) {
            await this.db.remove(item);
        }

        // Delete notes
        const notes = await this.db.query(Note)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .find();
        for (const note of notes) {
            await this.db.remove(note);
        }

        // Delete lists
        const lists = await this.db.query(List)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .find();
        for (const list of lists) {
            await this.db.remove(list);
        }

        // Delete projects
        const projects = await this.db.query(Project)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .find();
        for (const project of projects) {
            await this.db.remove(project);
        }

        // Delete meals
        const meals = await this.db.query(Meal)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .find();
        for (const meal of meals) {
            await this.db.remove(meal);
        }

        // Delete wishlists
        const wishlists = await this.db.query(Wishlist)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .find();
        for (const wishlist of wishlists) {
            await this.db.remove(wishlist);
        }
    }

    /**
     * Cleanup all expired demo accounts
     * Should be called periodically (e.g., every hour)
     */
    async cleanupExpiredDemoAccounts(): Promise<number> {
        const now = new Date();

        const expiredDemoUsers = await this.db.query(User)
            .filter({ isDemo: true })
            .find();

        let deletedCount = 0;

        for (const user of expiredDemoUsers) {
            if (user.demoExpiresAt && user.demoExpiresAt < now) {
                console.log(`[DemoCleanup] Cleaning up expired demo account: ${user.id}`);
                await this.deleteDemoUser(user.id);
                deletedCount++;
            }
        }

        if (deletedCount > 0) {
            console.log(`[DemoCleanup] Cleaned up ${deletedCount} expired demo accounts`);
        }

        return deletedCount;
    }
}
