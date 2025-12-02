import { SQLiteDatabaseAdapter } from '@deepkit/sqlite';
import { Database } from '@deepkit/orm';
import { AppConfig } from './config';
import {
    User,
    RefreshToken,
    PasswordResetToken,
    Achievement,
    UserAchievement,
    Notification,
    Habit,
    HabitLog,
    ExpenseCategory,
    Expense,
    Deadline,
    Subscription,
    Note,
    List,
    Project,
    InventoryItem,
    Application,
    MediaItem,
    Meal,
    MealPlan,
    WishlistItem,
    Wishlist,
} from '@ycmm/core';

export class AppDatabase extends Database {
    constructor(protected config: AppConfig) {
        console.log('Using SQLite database:', config.databasePath);
        super(new SQLiteDatabaseAdapter(config.databasePath), [
            User,
            RefreshToken,
            PasswordResetToken,
            Achievement,
            UserAchievement,
            Notification,
            Habit,
            HabitLog,
            ExpenseCategory,
            Expense,
            Deadline,
            Subscription,
            Note,
            List,
            Project,
            InventoryItem,
            Application,
            MediaItem,
            Meal,
            MealPlan,
            WishlistItem,
            Wishlist,
        ]);
    }
}
