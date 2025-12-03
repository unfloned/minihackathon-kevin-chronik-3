// ===== Entities =====
export { User } from './entities/user.entity.js';
export type { UserPublic } from './entities/user.entity.js';

export { RefreshToken } from './entities/refresh-token.entity.js';
export type { RefreshTokenFrontend } from './entities/refresh-token.entity.js';

export { PasswordResetToken } from './entities/password-reset-token.entity.js';
export type { PasswordResetTokenFrontend } from './entities/password-reset-token.entity.js';

export { Achievement } from './entities/achievement.entity.js';
export type { AchievementCategory, AchievementType, AchievementFrontend } from './entities/achievement.entity.js';

export { UserAchievement } from './entities/user-achievement.entity.js';
export type { UserAchievementFrontend } from './entities/user-achievement.entity.js';

export { Notification } from './entities/notification.entity.js';
export type { NotificationType, NotificationFrontend } from './entities/notification.entity.js';

export { Habit } from './entities/habit.entity.js';
export type { HabitType, HabitFrequency, HabitFrontend } from './entities/habit.entity.js';

export { HabitLog } from './entities/habit-log.entity.js';
export type { HabitLogFrontend } from './entities/habit-log.entity.js';

export { ExpenseCategory } from './entities/expense-category.entity.js';
export type { ExpenseCategoryFrontend } from './entities/expense-category.entity.js';

export { Expense } from './entities/expense.entity.js';
export type { ExpenseFrontend } from './entities/expense.entity.js';

export { Deadline } from './entities/deadline.entity.js';
export type { DeadlinePriority, DeadlineStatus, DeadlineFrontend } from './entities/deadline.entity.js';

export { Subscription } from './entities/subscription.entity.js';
export type { SubscriptionBillingCycle, SubscriptionStatus, SubscriptionFrontend } from './entities/subscription.entity.js';

export { Note } from './entities/note.entity.js';
export type { NoteFrontend } from './entities/note.entity.js';

export { List } from './entities/list.entity.js';
export type { ListItem, ListType, ListItemPriority, ListFrontend } from './entities/list.entity.js';

export { Project } from './entities/project.entity.js';
export type { ProjectTask, Milestone, ProjectType, ProjectStatus, TaskPriority, ProjectFrontend } from './entities/project.entity.js';

export { InventoryItem } from './entities/inventory-item.entity.js';
export type { ItemLocation, ItemWarranty, ItemLent, InventoryItemFrontend } from './entities/inventory-item.entity.js';

export { Application } from './entities/application.entity.js';
export type { ApplicationStatus, RemoteType, SalaryRange, StatusChange, Interview, ApplicationFrontend } from './entities/application.entity.js';

export { MediaItem } from './entities/media-item.entity.js';
export type { MediaType, MediaStatus, MediaProgress, SeriesSeason, ExternalIds, MediaItemFrontend } from './entities/media-item.entity.js';

export { Meal, MealPlan } from './entities/meal.entity.js';
export type { MealType, Ingredient, NutritionInfo, MealFrontend, MealPlanFrontend } from './entities/meal.entity.js';

export { WishlistItem, Wishlist } from './entities/wishlist.entity.js';
export type { WishlistPriority, WishlistCategory, PriceInfo, WishlistItemFrontend, WishlistFrontend } from './entities/wishlist.entity.js';

// ===== Version Info =====
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

// ===== API Response Types =====
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// ===== Auth Types =====
import type { UserPublic } from './entities/user.entity.js';

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

// ===== XP Constants =====
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
    0, 100, 250, 500, 1000, 1750, 2750, 4000, 5500, 7500,
    10000, 13000, 16500, 20500, 25000,
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

// ===== Dashboard Types =====
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

// ===== Module Stats Types =====

// Import types for stats interfaces
import type { HabitType, HabitFrequency } from './entities/habit.entity.js';
import type { DeadlinePriority } from './entities/deadline.entity.js';
import type { SubscriptionBillingCycle, SubscriptionStatus } from './entities/subscription.entity.js';
import type { MediaType, MediaStatus, MediaProgress } from './entities/media-item.entity.js';
import type { MealType, Ingredient, NutritionInfo } from './entities/meal.entity.js';
import type { WishlistPriority, WishlistCategory, PriceInfo } from './entities/wishlist.entity.js';

export interface HabitStats {
    totalHabits: number;
    activeHabits: number;
    completedToday: number;
    totalToday: number;
    currentStreak: number;
    longestStreak: number;
    weeklyCompletion: number[];
}

export interface HabitWithStatus {
    id: string;
    name: string;
    description?: string;
    icon: string;
    color: string;
    type: HabitType;
    targetValue?: number;
    unit?: string;
    frequency: HabitFrequency;
    currentStreak: number;
    longestStreak: number;
    totalCompletions: number;
    completedToday?: boolean;
    todayValue?: number;
    timerStartedAt?: string;
    timerRunning?: boolean;
    isArchived?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface ExpenseWithCategory {
    id: string;
    amount: number;
    description: string;
    categoryId: string;
    date: string;
    isRecurring: boolean;
    recurringInterval?: 'monthly' | 'yearly';
    createdAt: string;
    updatedAt?: string;
    // Flattened category fields from server
    categoryName?: string;
    categoryIcon?: string;
    categoryColor?: string;
}

export interface ExpenseStats {
    total: number;
    byCategory: {
        categoryId: string;
        categoryName: string;
        categoryIcon: string;
        categoryColor: string;
        amount: number;
        count: number;
        budget?: number;
    }[];
    dailyTotals: { date: string; amount: number }[];
    comparedToLastMonth: number;
}

export interface DeadlineStats {
    total: number;
    upcoming: number;
    overdue: number;
    completed: number;
    completedThisMonth: number;
}

export interface SubscriptionStats {
    totalMonthly: number;
    totalYearly: number;
    activeCount: number;
    pausedCount: number;
    byCategory: { category: string; amount: number; count: number }[];
}

export interface MediaItemWithDetails {
    id: string;
    type: MediaType;
    title: string;
    originalTitle: string;
    year?: number;
    creator: string;
    coverUrl: string;
    description: string;
    status: MediaStatus;
    startedAt?: string;
    finishedAt?: string;
    progress?: MediaProgress;
    rating?: number;
    review: string;
    genre: string[];
    tags: string[];
    source: string;
    createdAt: string;
    updatedAt: string;
}

export interface MediaStats {
    total: number;
    byType: { type: MediaType; count: number }[];
    byStatus: { status: MediaStatus; count: number }[];
    completedThisYear: number;
    averageRating: number | null;
}

export interface MealWithDetails {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    ingredients: Ingredient[];
    instructions: string;
    prepTime?: number;
    cookTime?: number;
    servings?: number;
    mealType: MealType[];
    cuisine: string;
    tags: string[];
    nutrition?: NutritionInfo;
    isFavorite: boolean;
    timesCooked: number;
    lastMade?: string;
    recipeUrl: string;
    source: string;
    createdAt: string;
    updatedAt: string;
}

export interface MealPlanWithDetails {
    id: string;
    date: string;
    mealType: MealType;
    meal?: MealWithDetails;
    customMealName: string;
    notes: string;
    createdAt: string;
}

export interface MealStats {
    totalMeals: number;
    totalCooked: number;
    favorites: number;
    byCuisine: { cuisine: string; count: number }[];
    recentlyCooked: MealWithDetails[];
}

export interface ShoppingListItem {
    ingredient: string;
    amount: string;
    meals: string[];
}

export interface WishlistItemWithDetails {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    productUrl: string;
    category: WishlistCategory;
    tags: string[];
    priority: WishlistPriority;
    isPurchased: boolean;
    purchasedAt?: string;
    price?: PriceInfo;
    targetPrice?: number;
    isGiftIdea: boolean;
    giftFor?: string;
    occasion?: string;
    notes: string;
    store: string;
    createdAt: string;
    updatedAt: string;
}

export interface WishlistStats {
    totalItems: number;
    totalWishlists: number;
    purchased: number;
    totalValue: number;
    byCategory: { category: WishlistCategory; count: number }[];
    byPriority: { priority: WishlistPriority; count: number }[];
    giftIdeas: number;
}

export interface GamificationStats {
    level: number;
    xp: number;
    xpProgress: {
        current: number;
        required: number;
        percentage: number;
    };
    achievementsUnlocked: number;
}

export interface AdminStats {
    totalUsers: number;
    demoUsers: number;
    adminUsers: number;
    regularUsers: number;
}

// ===== DTO Types (for creating/updating) =====

export interface CreateHabitDto {
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    type?: HabitType;
    targetValue?: number;
    unit?: string;
    frequency?: HabitFrequency;
}

export interface UpdateHabitDto extends Partial<CreateHabitDto> {
    isArchived?: boolean;
}

export interface CreateExpenseDto {
    amount: number;
    description: string;
    categoryId: string;
    date: string;
    isRecurring?: boolean;
    recurringInterval?: 'monthly' | 'yearly';
}

export interface UpdateExpenseDto extends Partial<CreateExpenseDto> {}

export interface CreateExpenseCategoryDto {
    name: string;
    icon?: string;
    color?: string;
    budget?: number;
}

export interface CreateDeadlineDto {
    title: string;
    description?: string;
    dueDate: string;
    priority?: DeadlinePriority;
    category?: string;
}

export interface UpdateDeadlineDto extends Partial<CreateDeadlineDto> {
    isCompleted?: boolean;
}

export interface CreateSubscriptionDto {
    name: string;
    description?: string;
    amount: number;
    billingCycle: SubscriptionBillingCycle;
    billingDay?: number;
    category?: string;
    website?: string;
    status?: SubscriptionStatus;
}

export interface UpdateSubscriptionDto extends Partial<CreateSubscriptionDto> {}

export interface CreateMediaItemDto {
    type: MediaType;
    title: string;
    originalTitle?: string;
    year?: number;
    creator?: string;
    coverUrl?: string;
    description?: string;
    status?: MediaStatus;
    rating?: number;
    review?: string;
    genre?: string[];
    tags?: string[];
    source?: string;
    progress?: MediaProgress;
}

export interface UpdateMediaItemDto extends Partial<CreateMediaItemDto> {}

export interface CreateMealDto {
    name: string;
    description?: string;
    imageUrl?: string;
    ingredients?: Ingredient[];
    instructions?: string;
    prepTime?: number;
    cookTime?: number;
    servings?: number;
    mealType?: MealType[];
    cuisine?: string;
    tags?: string[];
    nutrition?: NutritionInfo;
    recipeUrl?: string;
    source?: string;
}

export interface UpdateMealDto extends Partial<CreateMealDto> {
    isFavorite?: boolean;
}

export interface CreateMealPlanDto {
    date: string;
    mealType: MealType;
    mealId?: string;
    customMealName?: string;
    notes?: string;
}

export interface UpdateMealPlanDto extends Partial<CreateMealPlanDto> {}

export interface CreateWishlistItemDto {
    name: string;
    description?: string;
    imageUrl?: string;
    productUrl?: string;
    category?: WishlistCategory;
    priority?: WishlistPriority;
    price?: PriceInfo;
    targetPrice?: number;
    isGiftIdea?: boolean;
    giftFor?: string;
    occasion?: string;
    notes?: string;
    store?: string;
}

// ===== Simple Frontend Response Types =====
// These are for API responses where Reference types are resolved

export interface ExpenseCategorySimple {
    id: string;
    name: string;
    icon: string;
    color: string;
    budget?: number;
    isDefault?: boolean;
}

export interface SubscriptionSimple {
    id: string;
    name: string;
    description: string;
    amount: number;
    billingCycle: SubscriptionBillingCycle;
    billingDay: number;
    category: string;
    website: string;
    status: SubscriptionStatus;
    nextBillingDate?: string;
    createdAt: string;
}

export interface DeadlineSimple {
    id: string;
    title: string;
    description: string;
    dueDate: string;
    priority: DeadlinePriority;
    category: string;
    isCompleted: boolean;
    completedAt?: string;
    createdAt: string;
}

export interface NoteSimple {
    id: string;
    title: string;
    content: string;
    tags: string[];
    isPinned: boolean;
    isArchived: boolean;
    color: string;
    createdAt: string;
    updatedAt: string;
}

export interface ListSimple {
    id: string;
    name: string;
    description: string;
    type: ListType;
    color: string;
    icon: string;
    items: ListItem[];
    isArchived: boolean;
    createdAt: string;
    updatedAt: string;
}

import type { ListType, ListItem } from './entities/list.entity.js';

export interface ProjectSimple {
    id: string;
    name: string;
    description: string;
    type: ProjectType;
    status: ProjectStatus;
    color: string;
    progress: number;
    startDate?: string;
    endDate?: string;
    targetDate?: string;
    tasks: ProjectTask[];
    milestones: Milestone[];
    isArchived: boolean;
    createdAt: string;
    updatedAt: string;
}

import type { ProjectType, ProjectStatus, ProjectTask, Milestone } from './entities/project.entity.js';

export interface InventoryItemSimple {
    id: string;
    name: string;
    description: string;
    category: string;
    quantity: number;
    imageUrl: string;
    purchaseDate?: string;
    purchasePrice?: number;
    location?: ItemLocation;
    warranty?: ItemWarranty;
    lent?: ItemLent;
    notes: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}

import type { ItemLocation, ItemWarranty, ItemLent } from './entities/inventory-item.entity.js';

export interface ApplicationSimple {
    id: string;
    company: string;
    position: string;
    description: string;
    jobUrl: string;
    location: string;
    remote: RemoteType;
    salary?: SalaryRange;
    status: ApplicationStatus;
    appliedAt: string;
    statusHistory: StatusChange[];
    interviews: Interview[];
    notes: string;
    contacts: string;
    priority: number;
    createdAt: string;
    updatedAt: string;
}

import type { ApplicationStatus, RemoteType, SalaryRange, StatusChange, Interview } from './entities/application.entity.js';
