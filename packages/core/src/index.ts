// Entities (Server-only - use Interfaces for Frontend)
export { User } from './entities/user.entity';
export type { UserPublic } from './entities/user.entity';
export { RefreshToken } from './entities/refresh-token.entity';
export { PasswordResetToken } from './entities/password-reset-token.entity';
export { Achievement } from './entities/achievement.entity';
export type { AchievementCategory, AchievementType } from './entities/achievement.entity';
export { UserAchievement } from './entities/user-achievement.entity';
export { Notification } from './entities/notification.entity';
export type { NotificationType } from './entities/notification.entity';
export { Habit } from './entities/habit.entity';
export type { HabitType, HabitFrequency } from './entities/habit.entity';
export { HabitLog } from './entities/habit-log.entity';
export { ExpenseCategory } from './entities/expense-category.entity';
export { Expense } from './entities/expense.entity';
export { Deadline } from './entities/deadline.entity';
export type { DeadlinePriority, DeadlineStatus } from './entities/deadline.entity';
export { Subscription } from './entities/subscription.entity';
export type { SubscriptionBillingCycle, SubscriptionStatus } from './entities/subscription.entity';
export { Note } from './entities/note.entity';
export { List } from './entities/list.entity';
export type { ListItem, ListType, ListItemPriority } from './entities/list.entity';
export { Project } from './entities/project.entity';
export type { ProjectTask, Milestone, ProjectType, ProjectStatus, TaskPriority } from './entities/project.entity';
export { InventoryItem } from './entities/inventory-item.entity';
export type { ItemLocation, ItemWarranty, ItemLent } from './entities/inventory-item.entity';
export { Application } from './entities/application.entity';
export type { ApplicationStatus, RemoteType, SalaryRange, StatusChange, Interview } from './entities/application.entity';
export { MediaItem } from './entities/media-item.entity';
export type { MediaType, MediaStatus, MediaProgress, SeriesSeason, ExternalIds } from './entities/media-item.entity';
export { Meal, MealPlan } from './entities/meal.entity';
export type { MealType, Ingredient, NutritionInfo } from './entities/meal.entity';
export { WishlistItem, Wishlist } from './entities/wishlist.entity';
export type { WishlistPriority, WishlistCategory, PriceInfo } from './entities/wishlist.entity';

// Frontend-compatible Interfaces
export type {
    IUser,
    IUserPublic,
    IHabit,
    IHabitLog,
    IExpense,
    IExpenseCategory,
    IDeadline,
    ISubscription,
    INotification,
    IAchievement,
    IUserAchievement,
} from './interfaces';

import type { UserPublic } from './entities/user.entity';

// Version Info
export interface VersionInfo {
    version: string;
    name: string;
    description: string;
    released: string;
    changelog: ChangelogEntry[];
}

export interface ChangelogEntry {
    version: string;
    date: string;
    changes: string[];
}

// API Response Types
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// Auth Types
export interface SessionResponse {
    authenticated: boolean;
    user?: UserPublic;
}

export interface NotificationPublic {
    id: string;
    type: string;
    title: string;
    message: string;
    link?: string;
    isRead: boolean;
    createdAt: Date;
}

// XP Constants
export const XP_ACTIONS = {
    HABIT_COMPLETED: 10,
    HABIT_STREAK_7: 50,
    HABIT_STREAK_30: 200,
    APPLICATION_SENT: 15,
    APPLICATION_RESPONSE: 25,
    APPLICATION_INTERVIEW: 50,
    EXPENSE_LOGGED: 5,
    DEADLINE_MET: 20,
    MEDIA_COMPLETED: 10,
    NOTE_CREATED: 5,
    GOAL_COMPLETED: 100,
    FIRST_LOGIN_OF_DAY: 10,
} as const;

export const LEVEL_XP_REQUIREMENTS = [
    0,      // Level 1
    100,    // Level 2
    250,    // Level 3
    500,    // Level 4
    1000,   // Level 5
    1750,   // Level 6
    2750,   // Level 7
    4000,   // Level 8
    5500,   // Level 9
    7500,   // Level 10
    10000,  // Level 11
    13000,  // Level 12
    16500,  // Level 13
    20500,  // Level 14
    25000,  // Level 15
] as const;

export function calculateLevel(xp: number): number {
    for (let i = LEVEL_XP_REQUIREMENTS.length - 1; i >= 0; i--) {
        if (xp >= LEVEL_XP_REQUIREMENTS[i]) {
            return i + 1;
        }
    }
    return 1;
}

export function xpForNextLevel(currentLevel: number): number {
    if (currentLevel >= LEVEL_XP_REQUIREMENTS.length) {
        return Infinity;
    }
    return LEVEL_XP_REQUIREMENTS[currentLevel];
}

export function xpProgressInLevel(xp: number, level: number): { current: number; required: number; percentage: number } {
    const currentLevelXp = LEVEL_XP_REQUIREMENTS[level - 1] || 0;
    const nextLevelXp = LEVEL_XP_REQUIREMENTS[level] || Infinity;
    const current = xp - currentLevelXp;
    const required = nextLevelXp - currentLevelXp;
    const percentage = required === Infinity ? 100 : Math.min(100, (current / required) * 100);
    return { current, required, percentage };
}

// Dashboard Types
export interface ExpenseChartData {
    categories: { name: string; total: number; color: string }[];
    monthlyTrend: { month: string; amount: number }[];
}

export interface HabitCompletionEntry {
    date: string;
    completed: boolean;
}

export interface DashboardStats {
    chaosScore: number;
    chaosScoreTrend: number;
    level: number;
    xp: number;
    xpProgress: {
        current: number;
        required: number;
        percentage: number;
    };
    streak: number;
    longestStreak: number;
    todayHabits: {
        completed: number;
        total: number;
    };
    upcomingDeadlines: number;
    activeApplications: number;
    monthlyExpenses: number;
    recentAchievements: AchievementPublic[];
    expenseChart?: ExpenseChartData;
    habitHistory?: HabitCompletionEntry[];
}

export interface AchievementPublic {
    id: string;
    key: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    xpReward: number;
    type?: 'one_time' | 'repeatable' | 'daily' | 'weekly' | 'monthly';
    tier?: number;
    unlockedAt?: Date;
}

export interface XpAwardResult {
    xpAwarded: number;
    newXp: number;
    newLevel: number;
    leveledUp: boolean;
    previousLevel: number;
}
