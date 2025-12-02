import { AppDatabase } from '../../app/database';
import { GamificationService } from '../gamification/gamification.service';
import { HabitService } from '../habits/habit.service';
import { ExpenseService } from '../expenses/expense.service';
import { DeadlineService } from '../deadlines/deadline.service';
import { SubscriptionService } from '../subscriptions/subscription.service';
import { User, xpProgressInLevel, type DashboardStats, type ExpenseChartData, type HabitCompletionEntry } from '@ycmm/core';

const MONTH_NAMES = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

export class DashboardService {
    constructor(
        private db: AppDatabase,
        private gamificationService: GamificationService,
        private habitService: HabitService,
        private expenseService: ExpenseService,
        private deadlineService: DeadlineService,
        private subscriptionService: SubscriptionService
    ) {}

    async getStats(userId: string): Promise<DashboardStats> {
        const user = await this.db.query(User)
            .filter({ id: userId })
            .findOne();

        const recentAchievements = await this.gamificationService.getRecentAchievements(userId, 3);

        // Get real data from tracker modules
        const habitStats = await this.habitService.getStats(userId);
        const deadlineStats = await this.deadlineService.getStats(userId);
        const subscriptionStats = await this.subscriptionService.getStats(userId);

        // Get monthly expenses
        const now = new Date();
        const expenseStats = await this.expenseService.getMonthlyStats(
            userId,
            now.getFullYear(),
            now.getMonth() + 1
        );

        // Calculate XP progress
        const xpProgress = xpProgressInLevel(user.xp, user.level);

        // Calculate chaos score based on real data
        const chaosScore = this.calculateChaosScore(user, {
            ...habitStats,
            totalHabits: habitStats.totalHabits,
        }, deadlineStats);
        const chaosScoreTrend = 0; // Will be calculated from historical data

        // Get expense chart data
        const expenseChart = await this.getExpenseChartData(userId);

        // Get habit completion history
        const habitHistory = await this.getHabitHistory(userId);

        return {
            chaosScore,
            chaosScoreTrend,
            level: user.level,
            xp: user.xp,
            xpProgress,
            streak: habitStats.currentStreak,
            longestStreak: habitStats.longestStreak,
            todayHabits: {
                completed: habitStats.completedToday,
                total: habitStats.totalToday,
            },
            upcomingDeadlines: deadlineStats.pending + deadlineStats.overdue,
            activeApplications: 0, // TODO: Implement job applications module
            monthlyExpenses: expenseStats.total + subscriptionStats.totalMonthly,
            recentAchievements,
            expenseChart,
            habitHistory,
        };
    }

    private async getExpenseChartData(userId: string): Promise<ExpenseChartData> {
        const now = new Date();

        // Get last 6 months of expense data for trend
        const monthlyTrend: { month: string; amount: number }[] = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const stats = await this.expenseService.getMonthlyStats(
                userId,
                date.getFullYear(),
                date.getMonth() + 1
            );
            monthlyTrend.push({
                month: MONTH_NAMES[date.getMonth()],
                amount: stats.total,
            });
        }

        // Get current month categories
        const currentMonthStats = await this.expenseService.getMonthlyStats(
            userId,
            now.getFullYear(),
            now.getMonth() + 1
        );

        const categories = currentMonthStats.byCategory.map(cat => ({
            name: cat.name,
            total: cat.amount,
            color: cat.color,
        }));

        return { categories, monthlyTrend };
    }

    private async getHabitHistory(userId: string): Promise<HabitCompletionEntry[]> {
        const history = await this.habitService.getCompletionHistory(userId, 84);
        return history.map(entry => ({
            date: entry.date,
            completed: entry.completed,
        }));
    }

    private calculateChaosScore(
        user: User,
        habitStats: { completedToday: number; totalToday: number; currentStreak: number; totalHabits?: number },
        deadlineStats: { overdue: number; pending: number }
    ): number {
        // Chaos Score: 100% = total chaos, 0% = perfectly organized
        // Start at 100% chaos and reduce based on organization

        let chaos = 100;

        // Check if user has any activity
        const hasHabits = habitStats.totalHabits && habitStats.totalHabits > 0;
        const hasDeadlines = deadlineStats.pending > 0 || deadlineStats.overdue > 0;

        // === HABIT ORGANIZATION (up to -40% chaos) ===
        if (hasHabits) {
            // Having habits set up shows intent to organize (-10%)
            chaos -= 10;

            // Completing habits today reduces chaos
            if (habitStats.totalToday > 0) {
                const completionRate = habitStats.completedToday / habitStats.totalToday;
                // Full completion = -20% chaos
                chaos -= Math.round(completionRate * 20);
            }

            // Maintaining a streak shows consistency
            if (habitStats.currentStreak >= 3) chaos -= 3;
            if (habitStats.currentStreak >= 7) chaos -= 4;
            if (habitStats.currentStreak >= 14) chaos -= 3;
            if (habitStats.currentStreak >= 30) chaos -= 5;
            if (habitStats.currentStreak >= 100) chaos -= 5;
        }

        // === DEADLINE MANAGEMENT (up to -30% chaos, or +20% for overdue) ===
        if (hasDeadlines) {
            // Having deadlines tracked = less chaos (-5%)
            chaos -= 5;

            // No overdue deadlines = great organization (-15%)
            if (deadlineStats.overdue === 0) {
                chaos -= 15;

                // Bonus for actively managing pending deadlines (-10%)
                if (deadlineStats.pending > 0) {
                    chaos -= 10;
                }
            } else {
                // Overdue deadlines ADD chaos (+5% per overdue, max +20%)
                chaos += Math.min(deadlineStats.overdue * 5, 20);
            }
        }

        // === ENGAGEMENT & CONSISTENCY (up to -20% chaos) ===
        // XP shows consistent app usage
        if (user.xp > 50) chaos -= 5;
        if (user.xp > 200) chaos -= 5;
        if (user.xp > 500) chaos -= 5;
        if (user.xp > 1000) chaos -= 5;

        // Level indicates long-term engagement
        if (user.level >= 3) chaos -= 3;
        if (user.level >= 5) chaos -= 2;

        // Clamp between 0 and 100
        return Math.max(0, Math.min(100, Math.round(chaos)));
    }
}
