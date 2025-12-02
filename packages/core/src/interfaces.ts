/**
 * Frontend-kompatible Interfaces
 *
 * Diese Interfaces sind identisch zu den Entity-Klassen, aber ohne Deepkit-spezifische
 * Type-Annotationen (PrimaryKey, Index, Reference). Sie können sicher im Frontend
 * verwendet werden.
 */

import type { HabitType, HabitFrequency } from './entities/habit.entity.js';
import type { DeadlinePriority, DeadlineStatus } from './entities/deadline.entity.js';
import type { SubscriptionBillingCycle, SubscriptionStatus } from './entities/subscription.entity.js';
import type { NotificationType } from './entities/notification.entity.js';

// Re-export types for convenience
export type { HabitType, HabitFrequency };
export type { DeadlinePriority, DeadlineStatus };
export type { SubscriptionBillingCycle, SubscriptionStatus };
export type { NotificationType };

// ===== User =====
export interface IUser {
    id: string;
    email: string;
    displayName: string;
    isDemo: boolean;
    isAdmin: boolean;
    level: number;
    xp: number;
    locale: string;
    createdAt: Date;
    updatedAt: Date;
}

export type IUserPublic = Omit<IUser, 'updatedAt' | 'locale'>;

// ===== Habit =====
export interface IHabit {
    id: string;
    userId: string;
    name: string;
    description?: string;
    icon: string;
    color: string;
    type: HabitType;
    targetValue?: number;
    unit?: string;
    frequency: HabitFrequency;
    customDays?: string;
    reminderTime?: string;
    isArchived: boolean;
    currentStreak: number;
    longestStreak: number;
    totalCompletions: number;
    createdAt: Date;
    updatedAt: Date;
}

// ===== HabitLog =====
export interface IHabitLog {
    id: string;
    userId: string;
    habitId: string;
    date: string;
    value: number;
    completed: boolean;
    note?: string;
    createdAt: Date;
}

// ===== Expense =====
export interface IExpense {
    id: string;
    userId: string;
    categoryId: string;
    amount: number;
    description: string;
    date: string;
    isRecurring: boolean;
    recurringInterval?: 'monthly' | 'yearly';
    createdAt: Date;
    updatedAt: Date;
}

// ===== ExpenseCategory =====
export interface IExpenseCategory {
    id: string;
    userId: string;
    name: string;
    icon: string;
    color: string;
    budget?: number;
    isDefault: boolean;
    createdAt: Date;
}

// ===== Deadline =====
export interface IDeadline {
    id: string;
    userId: string;
    title: string;
    description?: string;
    dueDate: string;
    dueTime?: string;
    priority: DeadlinePriority;
    status: DeadlineStatus;
    category?: string;
    color: string;
    reminderEnabled: boolean;
    reminderDaysBefore?: number;
    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

// ===== Subscription =====
export interface ISubscription {
    id: string;
    userId: string;
    name: string;
    description?: string;
    amount: number;
    currency: string;
    billingCycle: SubscriptionBillingCycle;
    billingDay: number;
    nextBillingDate: string;
    category?: string;
    color: string;
    icon?: string;
    website?: string;
    status: SubscriptionStatus;
    reminderEnabled: boolean;
    reminderDaysBefore: number;
    startDate: string;
    cancelledAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

// ===== Notification =====
export interface INotification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
    isRead: boolean;
    createdAt: Date;
}

// ===== Achievement =====
export interface IAchievement {
    id: string;
    key: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    xpReward: number;
    requirement: number;
    isHidden: boolean;
    createdAt: Date;
}

// ===== UserAchievement =====
export interface IUserAchievement {
    id: string;
    userId: string;
    achievementId: string;
    unlockedAt: Date;
}
