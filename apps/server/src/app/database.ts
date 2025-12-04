import { SQLiteDatabaseAdapter } from '@deepkit/sqlite';
import { PostgresDatabaseAdapter } from '@deepkit/postgres';
import { MySQLDatabaseAdapter } from '@deepkit/mysql';
import { Database, DatabaseAdapter } from '@deepkit/orm';
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

const entities = [
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
];

function createDatabaseAdapter(url: string): DatabaseAdapter {
    const protocol = url.split('://')[0].toLowerCase();
    const connectionString = url.substring(protocol.length + 3);

    switch (protocol) {
        case 'sqlite':
            console.log('Using SQLite database:', connectionString);
            return new SQLiteDatabaseAdapter(connectionString);

        case 'postgres':
        case 'postgresql':
            console.log('Using PostgreSQL database');
            return new PostgresDatabaseAdapter(url);

        case 'mysql':
            console.log('Using MySQL database');
            return new MySQLDatabaseAdapter(url);

        default:
            throw new Error(`Unsupported database protocol: ${protocol}. Supported: sqlite, postgres, postgresql, mysql`);
    }
}

export class AppDatabase extends Database {
    constructor(protected config: AppConfig) {
        super(createDatabaseAdapter(config.databaseUrl), entities);
    }
}
