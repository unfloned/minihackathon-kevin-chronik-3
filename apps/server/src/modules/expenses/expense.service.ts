import { AppDatabase } from '../../app/database';
import { GamificationService } from '../gamification/gamification.service';
import { Expense, ExpenseCategory, User } from '@ycmm/core';

const DEFAULT_CATEGORIES = [
    { name: 'Essen & Trinken', icon: 'burger', color: '#fa5252' },
    { name: 'Transport', icon: 'car', color: '#228be6' },
    { name: 'Shopping', icon: 'shopping-cart', color: '#be4bdb' },
    { name: 'Unterhaltung', icon: 'device-gamepad', color: '#7950f2' },
    { name: 'Wohnen', icon: 'home', color: '#40c057' },
    { name: 'Gesundheit', icon: 'heart', color: '#fd7e14' },
    { name: 'Sonstiges', icon: 'dots', color: '#868e96' },
];

export interface CreateExpenseDto {
    amount: number;
    description: string;
    categoryId: string;
    date: string;
    isRecurring?: boolean;
    recurringInterval?: 'monthly' | 'yearly';
}

export interface UpdateExpenseDto {
    amount?: number;
    description?: string;
    categoryId?: string;
    date?: string;
    isRecurring?: boolean;
    recurringInterval?: 'monthly' | 'yearly';
}

export interface CreateCategoryDto {
    name: string;
    icon?: string;
    color?: string;
    budget?: number;
}

export interface ExpenseWithCategory extends Expense {
    categoryName?: string;
    categoryIcon?: string;
    categoryColor?: string;
}

export interface MonthlyStats {
    total: number;
    byCategory: { categoryId: string; categoryName: string; categoryIcon: string; categoryColor: string; amount: number; count: number; budget?: number }[];
    dailyTotals: { date: string; amount: number }[];
    comparedToLastMonth: number; // Percentage change
}

export class ExpenseService {
    constructor(
        private db: AppDatabase,
        private gamificationService: GamificationService
    ) {}

    async initializeDefaultCategories(userId: string): Promise<void> {
        const existingCategories = await this.db.query(ExpenseCategory)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .count();

        if (existingCategories === 0) {
            for (const cat of DEFAULT_CATEGORIES) {
                const category = new ExpenseCategory();
                category.user = this.db.getReference(User, userId);
                category.name = cat.name;
                category.icon = cat.icon;
                category.color = cat.color;
                category.isDefault = true;
                category.createdAt = new Date();

                await this.db.persist(category);
            }
        }
    }

    async getCategories(userId: string): Promise<ExpenseCategory[]> {
        await this.initializeDefaultCategories(userId);
        return this.db.query(ExpenseCategory)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .orderBy('name', 'asc')
            .find();
    }

    async createCategory(userId: string, dto: CreateCategoryDto): Promise<ExpenseCategory> {
        const category = new ExpenseCategory();
        category.user = this.db.getReference(User, userId);
        category.name = dto.name;
        category.icon = dto.icon || 'coin';
        category.color = dto.color || '#228be6';
        category.budget = dto.budget;
        category.isDefault = false;
        category.createdAt = new Date();

        await this.db.persist(category);
        return category;
    }

    async updateCategory(
        categoryId: string,
        userId: string,
        dto: Partial<CreateCategoryDto>
    ): Promise<ExpenseCategory | null> {
        const category = await this.db.query(ExpenseCategory)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .filter({ id: categoryId })
            .findOneOrUndefined();

        if (!category) return null;

        if (dto.name !== undefined) category.name = dto.name;
        if (dto.icon !== undefined) category.icon = dto.icon;
        if (dto.color !== undefined) category.color = dto.color;
        if (dto.budget !== undefined) category.budget = dto.budget;

        await this.db.persist(category);
        return category;
    }

    async deleteCategory(categoryId: string, userId: string): Promise<boolean> {
        const category = await this.db.query(ExpenseCategory)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .filter({ id: categoryId })
            .findOneOrUndefined();

        if (!category) return false;

        // Check for expenses using this category
        const expenseCount = await this.db.query(Expense)
            .useInnerJoinWith('category').filter({ id: categoryId }).end()
            .count();

        if (expenseCount > 0) {
            return false; // Cannot delete category with expenses
        }

        await this.db.remove(category);
        return true;
    }

    async create(userId: string, dto: CreateExpenseDto): Promise<Expense> {
        const expense = new Expense();
        expense.user = this.db.getReference(User, userId);
        expense.category = this.db.getReference(ExpenseCategory, dto.categoryId);
        expense.amount = dto.amount;
        expense.description = dto.description;
        expense.date = dto.date;
        expense.isRecurring = dto.isRecurring || false;
        expense.recurringInterval = dto.recurringInterval;
        expense.createdAt = new Date();
        expense.updatedAt = new Date();

        await this.db.persist(expense);

        // Check for first_expense achievement
        await this.gamificationService.checkAndUnlockAchievement(userId, 'first_expense');

        // Award XP
        await this.gamificationService.awardXp(userId, 5, 'expense_logged');

        // Check for expense count achievements
        const expenseCount = await this.db.query(Expense)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .count();
        if (expenseCount >= 10) {
            await this.gamificationService.checkAndUnlockAchievement(userId, 'expenses_10');
        }
        if (expenseCount >= 100) {
            await this.gamificationService.checkAndUnlockAchievement(userId, 'expenses_100');
        }

        return expense;
    }

    async getAll(userId: string, limit = 50): Promise<ExpenseWithCategory[]> {
        const expenses = await this.db.query(Expense)
            .joinWith('category')
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .orderBy('date', 'desc')
            .limit(limit)
            .find();

        return expenses.map((expense: Expense) => ({
            ...expense,
            categoryName: expense.category.name,
            categoryIcon: expense.category.icon,
            categoryColor: expense.category.color,
        }));
    }

    async getByMonth(userId: string, year: number, month: number): Promise<ExpenseWithCategory[]> {
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const endMonth = month === 12 ? 1 : month + 1;
        const endYear = month === 12 ? year + 1 : year;
        const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;

        const expenses = await this.db.query(Expense)
            .joinWith('category')
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .filter({ date: { $gte: startDate, $lt: endDate } })
            .orderBy('date', 'desc')
            .find();

        return expenses.map((expense: Expense) => ({
            ...expense,
            categoryName: expense.category.name,
            categoryIcon: expense.category.icon,
            categoryColor: expense.category.color,
        }));
    }

    async getById(expenseId: string, userId: string): Promise<Expense | undefined> {
        return this.db.query(Expense)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .filter({ id: expenseId })
            .findOneOrUndefined();
    }

    async update(expenseId: string, userId: string, dto: UpdateExpenseDto): Promise<Expense | null> {
        const expense = await this.getById(expenseId, userId);
        if (!expense) return null;

        if (dto.amount !== undefined) expense.amount = dto.amount;
        if (dto.description !== undefined) expense.description = dto.description;
        if (dto.categoryId !== undefined) expense.category = this.db.getReference(ExpenseCategory, dto.categoryId);
        if (dto.date !== undefined) expense.date = dto.date;
        if (dto.isRecurring !== undefined) expense.isRecurring = dto.isRecurring;
        if (dto.recurringInterval !== undefined) expense.recurringInterval = dto.recurringInterval;
        expense.updatedAt = new Date();

        await this.db.persist(expense);
        return expense;
    }

    async delete(expenseId: string, userId: string): Promise<boolean> {
        const expense = await this.getById(expenseId, userId);
        if (!expense) return false;

        await this.db.remove(expense);
        return true;
    }

    async getMonthlyStats(userId: string, year: number, month: number): Promise<MonthlyStats> {
        const expenses = await this.getByMonth(userId, year, month);
        const categories = await this.getCategories(userId);

        // Calculate total
        const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

        // Group by category
        const categoryTotals = new Map<string, { amount: number; count: number }>();
        for (const expense of expenses) {
            const categoryId = expense.category.id;
            const current = categoryTotals.get(categoryId) || { amount: 0, count: 0 };
            categoryTotals.set(categoryId, {
                amount: current.amount + expense.amount,
                count: current.count + 1
            });
        }

        const byCategory = categories.map(cat => {
            const stats = categoryTotals.get(cat.id) || { amount: 0, count: 0 };
            return {
                categoryId: cat.id,
                categoryName: cat.name,
                categoryIcon: cat.icon,
                categoryColor: cat.color,
                amount: stats.amount,
                count: stats.count,
                budget: cat.budget,
            };
        }).filter(c => c.amount > 0);

        // Daily totals
        const dailyMap = new Map<string, number>();
        for (const expense of expenses) {
            const current = dailyMap.get(expense.date) || 0;
            dailyMap.set(expense.date, current + expense.amount);
        }

        const dailyTotals = Array.from(dailyMap.entries())
            .map(([date, amount]) => ({ date, amount }))
            .sort((a, b) => a.date.localeCompare(b.date));

        // Compare to last month
        const lastMonth = month === 1 ? 12 : month - 1;
        const lastYear = month === 1 ? year - 1 : year;
        const lastMonthExpenses = await this.getByMonth(userId, lastYear, lastMonth);
        const lastMonthTotal = lastMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);

        const comparedToLastMonth = lastMonthTotal > 0
            ? Math.round(((total - lastMonthTotal) / lastMonthTotal) * 100)
            : 0;

        return {
            total,
            byCategory,
            dailyTotals,
            comparedToLastMonth,
        };
    }
}
