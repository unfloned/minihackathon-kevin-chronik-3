import { v4 as uuidv4 } from 'uuid';
import { AppDatabase } from '../../app/database';
import { GamificationService } from '../gamification/gamification.service';
import { Habit, HabitLog, type HabitType, type HabitFrequency } from '@ycmm/core';

export interface CreateHabitDto {
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    type: HabitType;
    targetValue?: number;
    unit?: string;
    frequency: HabitFrequency;
    customDays?: number[];
    reminderTime?: string;
}

export interface UpdateHabitDto {
    name?: string;
    description?: string;
    icon?: string;
    color?: string;
    type?: HabitType;
    targetValue?: number;
    unit?: string;
    frequency?: HabitFrequency;
    customDays?: number[];
    reminderTime?: string;
    isArchived?: boolean;
}

export interface HabitWithTodayStatus extends Habit {
    completedToday: boolean;
    todayValue: number;
    // Timer info for duration habits
    timerStartedAt?: string; // ISO string for JSON serialization
    timerRunning: boolean;
}

export interface HabitStats {
    totalHabits: number;
    activeHabits: number;
    completedToday: number;
    totalToday: number;
    currentStreak: number;
    longestStreak: number;
    weeklyCompletion: number[];
}

export interface CompletionHistoryEntry {
    date: string;
    completed: boolean;
    totalCompleted: number;
    totalDue: number;
}

export class HabitService {
    constructor(
        private db: AppDatabase,
        private gamificationService: GamificationService
    ) {}

    private getToday(): string {
        return new Date().toISOString().split('T')[0];
    }

    async create(userId: string, dto: CreateHabitDto): Promise<Habit> {
        const habit = new Habit();
        habit.id = uuidv4();
        habit.userId = userId;
        habit.name = dto.name;
        habit.description = dto.description;
        habit.icon = dto.icon || 'check';
        habit.color = dto.color || '#228be6';
        habit.type = dto.type;
        habit.targetValue = dto.targetValue;
        habit.unit = dto.unit;
        habit.frequency = dto.frequency;
        habit.customDays = dto.customDays ? JSON.stringify(dto.customDays) : undefined;
        habit.reminderTime = dto.reminderTime;
        habit.createdAt = new Date();
        habit.updatedAt = new Date();

        await this.db.persist(habit);

        // Check for first_habit achievement
        await this.gamificationService.checkAndUnlockAchievement(userId, 'first_habit');

        return habit;
    }

    async getAll(userId: string, includeArchived = false): Promise<Habit[]> {
        const query = this.db.query(Habit).filter({ userId });

        if (!includeArchived) {
            query.filter({ isArchived: false });
        }

        return query.orderBy('createdAt', 'asc').find();
    }

    async getById(habitId: string, userId: string): Promise<Habit | undefined> {
        return this.db.query(Habit)
            .filter({ id: habitId, userId })
            .findOneOrUndefined();
    }

    async update(habitId: string, userId: string, dto: UpdateHabitDto): Promise<Habit | null> {
        const habit = await this.getById(habitId, userId);
        if (!habit) return null;

        if (dto.name !== undefined) habit.name = dto.name;
        if (dto.description !== undefined) habit.description = dto.description;
        if (dto.icon !== undefined) habit.icon = dto.icon;
        if (dto.color !== undefined) habit.color = dto.color;
        if (dto.type !== undefined) habit.type = dto.type;
        if (dto.targetValue !== undefined) habit.targetValue = dto.targetValue;
        if (dto.unit !== undefined) habit.unit = dto.unit;
        if (dto.frequency !== undefined) habit.frequency = dto.frequency;
        if (dto.customDays !== undefined) habit.customDays = JSON.stringify(dto.customDays);
        if (dto.reminderTime !== undefined) habit.reminderTime = dto.reminderTime;
        if (dto.isArchived !== undefined) habit.isArchived = dto.isArchived;
        habit.updatedAt = new Date();

        await this.db.persist(habit);
        return habit;
    }

    async delete(habitId: string, userId: string): Promise<boolean> {
        const habit = await this.getById(habitId, userId);
        if (!habit) return false;

        // Delete all logs for this habit
        const logs = await this.db.query(HabitLog).filter({ habitId }).find();
        for (const log of logs) {
            await this.db.remove(log);
        }

        await this.db.remove(habit);
        return true;
    }

    async getTodayHabits(userId: string): Promise<HabitWithTodayStatus[]> {
        const today = this.getToday();
        const dayOfWeek = new Date().getDay();

        const habits = await this.getAll(userId, false);
        const todayLogs = await this.db.query(HabitLog)
            .filter({ userId, date: today })
            .find();

        const logMap = new Map(todayLogs.map(log => [log.habitId, log]));

        return habits
            .filter(habit => this.isHabitDueToday(habit, dayOfWeek))
            .map(habit => {
                const log = logMap.get(habit.id);
                // Timer is running if timerStartedAt exists but timerEndedAt doesn't
                const timerRunning = !!(log?.timerStartedAt && !log?.timerEndedAt);
                return {
                    ...habit,
                    completedToday: log?.completed || false,
                    todayValue: log?.value || 0,
                    timerStartedAt: log?.timerStartedAt?.toISOString(),
                    timerRunning,
                };
            });
    }

    private isHabitDueToday(habit: Habit, dayOfWeek: number): boolean {
        if (habit.frequency === 'daily') return true;
        if (habit.frequency === 'weekly') return dayOfWeek === 1; // Monday
        if (habit.frequency === 'custom' && habit.customDays) {
            const days = JSON.parse(habit.customDays) as number[];
            return days.includes(dayOfWeek);
        }
        return true;
    }

    async logHabit(
        userId: string,
        habitId: string,
        value: number = 1,
        note?: string
    ): Promise<{ log: HabitLog; xpAwarded: number; streakUpdated: boolean } | null> {
        const habit = await this.getById(habitId, userId);
        if (!habit) return null;

        const today = this.getToday();

        // Check for existing log
        let log = await this.db.query(HabitLog)
            .filter({ habitId, userId, date: today })
            .findOneOrUndefined();

        const isNewCompletion = !log?.completed;

        if (log) {
            // Update existing log
            log.value = value;
            log.completed = this.isCompleted(habit, value);
            if (note) log.note = note;
        } else {
            // Create new log
            log = new HabitLog();
            log.id = uuidv4();
            log.userId = userId;
            log.habitId = habitId;
            log.date = today;
            log.value = value;
            log.completed = this.isCompleted(habit, value);
            log.note = note;
            log.createdAt = new Date();
        }

        await this.db.persist(log);

        let xpAwarded = 0;
        let streakUpdated = false;

        // Award XP and update streak only for new completions
        if (log.completed && isNewCompletion) {
            const xpResult = await this.gamificationService.awardXp(userId, 10, 'habit_completed');
            xpAwarded = xpResult.xpAwarded;

            // Update streak
            streakUpdated = await this.updateStreak(habit);

            // Check habit completion achievements
            habit.totalCompletions++;
            await this.db.persist(habit);

            if (habit.totalCompletions === 10) {
                await this.gamificationService.checkAndUnlockAchievement(userId, 'habits_10');
            } else if (habit.totalCompletions === 100) {
                await this.gamificationService.checkAndUnlockAchievement(userId, 'habits_100');
            }
        }

        return { log, xpAwarded, streakUpdated };
    }

    // Timer methods for duration habits
    async startTimer(userId: string, habitId: string): Promise<HabitLog | null> {
        const habit = await this.getById(habitId, userId);
        if (!habit || habit.type !== 'duration') return null;

        const today = this.getToday();

        // Check for existing log
        let log = await this.db.query(HabitLog)
            .filter({ habitId, userId, date: today })
            .findOneOrUndefined();

        if (log) {
            // If timer already running, return existing log
            if (log.timerStartedAt && !log.timerEndedAt) {
                return log;
            }
            // Start new timer session
            log.timerStartedAt = new Date();
            log.timerEndedAt = undefined;
        } else {
            // Create new log with timer started
            log = new HabitLog();
            log.id = uuidv4();
            log.userId = userId;
            log.habitId = habitId;
            log.date = today;
            log.value = 0;
            log.completed = false;
            log.timerStartedAt = new Date();
            log.createdAt = new Date();
        }

        await this.db.persist(log);
        return log;
    }

    async stopTimer(userId: string, habitId: string): Promise<{ log: HabitLog; xpAwarded: number; streakUpdated: boolean } | null> {
        const habit = await this.getById(habitId, userId);
        if (!habit || habit.type !== 'duration') return null;

        const today = this.getToday();

        const log = await this.db.query(HabitLog)
            .filter({ habitId, userId, date: today })
            .findOneOrUndefined();

        if (!log || !log.timerStartedAt) return null;

        const now = new Date();
        log.timerEndedAt = now;

        // Calculate elapsed time and convert to the habit's unit
        const elapsedMs = now.getTime() - log.timerStartedAt.getTime();
        const elapsedSeconds = Math.floor(elapsedMs / 1000);

        // Convert to target unit
        let valueInUnit: number;
        switch (habit.unit) {
            case 'seconds':
                valueInUnit = elapsedSeconds;
                break;
            case 'hours':
                valueInUnit = Math.floor(elapsedSeconds / 3600);
                break;
            case 'minutes':
            default:
                valueInUnit = Math.floor(elapsedSeconds / 60);
                break;
        }

        // Add to existing value (in case timer was started/stopped multiple times)
        log.value = (log.value || 0) + valueInUnit;

        const isNewCompletion = !log.completed;
        log.completed = this.isCompleted(habit, log.value);

        await this.db.persist(log);

        let xpAwarded = 0;
        let streakUpdated = false;

        // Award XP and update streak only for new completions
        if (log.completed && isNewCompletion) {
            const xpResult = await this.gamificationService.awardXp(userId, 10, 'habit_completed');
            xpAwarded = xpResult.xpAwarded;
            streakUpdated = await this.updateStreak(habit);

            habit.totalCompletions++;
            await this.db.persist(habit);

            if (habit.totalCompletions === 10) {
                await this.gamificationService.checkAndUnlockAchievement(userId, 'habits_10');
            } else if (habit.totalCompletions === 100) {
                await this.gamificationService.checkAndUnlockAchievement(userId, 'habits_100');
            }
        }

        return { log, xpAwarded, streakUpdated };
    }

    private isCompleted(habit: Habit, value: number): boolean {
        if (habit.type === 'boolean') return value >= 1;
        if (habit.targetValue) return value >= habit.targetValue;
        return value >= 1;
    }

    private async updateStreak(habit: Habit): Promise<boolean> {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        // Check if there was a log yesterday
        const yesterdayLog = await this.db.query(HabitLog)
            .filter({ habitId: habit.id, date: yesterdayStr, completed: true })
            .findOneOrUndefined();

        if (yesterdayLog) {
            habit.currentStreak++;
        } else {
            habit.currentStreak = 1;
        }

        if (habit.currentStreak > habit.longestStreak) {
            habit.longestStreak = habit.currentStreak;
        }

        habit.updatedAt = new Date();
        await this.db.persist(habit);

        // Check streak achievements
        if (habit.currentStreak === 3) {
            await this.gamificationService.checkAndUnlockAchievement(habit.userId, 'streak_3');
        } else if (habit.currentStreak === 7) {
            await this.gamificationService.checkAndUnlockAchievement(habit.userId, 'streak_7');
        } else if (habit.currentStreak === 30) {
            await this.gamificationService.checkAndUnlockAchievement(habit.userId, 'streak_30');
        } else if (habit.currentStreak === 100) {
            await this.gamificationService.checkAndUnlockAchievement(habit.userId, 'streak_100');
        }

        return true;
    }

    async getHabitLogs(habitId: string, userId: string, days = 30): Promise<HabitLog[]> {
        const habit = await this.getById(habitId, userId);
        if (!habit) return [];

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const startDateStr = startDate.toISOString().split('T')[0];

        return this.db.query(HabitLog)
            .filter({ habitId, date: { $gte: startDateStr } })
            .orderBy('date', 'desc')
            .find();
    }

    async getStats(userId: string): Promise<HabitStats> {
        const today = this.getToday();
        const habits = await this.getAll(userId, false);
        const todayHabits = await this.getTodayHabits(userId);

        const completedToday = todayHabits.filter(h => h.completedToday).length;

        // Get weekly completion data
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 6);
        const weeklyCompletion: number[] = [];

        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];

            const logsForDay = await this.db.query(HabitLog)
                .filter({ userId, date: dateStr, completed: true })
                .count();

            weeklyCompletion.push(logsForDay);
        }

        // Find max streaks
        let maxCurrentStreak = 0;
        let maxLongestStreak = 0;
        for (const habit of habits) {
            if (habit.currentStreak > maxCurrentStreak) maxCurrentStreak = habit.currentStreak;
            if (habit.longestStreak > maxLongestStreak) maxLongestStreak = habit.longestStreak;
        }

        return {
            totalHabits: habits.length,
            activeHabits: habits.filter(h => !h.isArchived).length,
            completedToday,
            totalToday: todayHabits.length,
            currentStreak: maxCurrentStreak,
            longestStreak: maxLongestStreak,
            weeklyCompletion,
        };
    }

    async getCompletionHistory(userId: string, days = 84): Promise<CompletionHistoryEntry[]> {
        const habits = await this.getAll(userId, false);
        const totalHabits = habits.length;

        if (totalHabits === 0) {
            return [];
        }

        const history: CompletionHistoryEntry[] = [];
        const today = new Date();

        // Get all logs for the period
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - days);
        const startDateStr = startDate.toISOString().split('T')[0];

        const logs = await this.db.query(HabitLog)
            .filter({ userId, date: { $gte: startDateStr }, completed: true })
            .find();

        // Group logs by date
        const logsByDate = new Map<string, number>();
        for (const log of logs) {
            const count = logsByDate.get(log.date) || 0;
            logsByDate.set(log.date, count + 1);
        }

        // Build history for each day
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const completedCount = logsByDate.get(dateStr) || 0;
            // Consider a day "completed" if at least half of habits were done
            const completed = completedCount >= Math.ceil(totalHabits / 2);

            history.push({
                date: dateStr,
                completed,
                totalCompleted: completedCount,
                totalDue: totalHabits,
            });
        }

        return history;
    }
}
