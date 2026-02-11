import { http, HttpBody, HttpNotFoundError } from '@deepkit/http';
import { HabitService, CreateHabitDto, UpdateHabitDto } from './habit.service';
import { User } from '@ycmm/core';

interface LogHabitBody {
    value?: number;
    note?: string;
}

@http.controller('/api/habits')
export class HabitController {
    constructor(private habitService: HabitService) {}

    @(http.GET('').group('auth-required'))
    async getAllHabits(user: User) {
        return this.habitService.getAll(user.id);
    }

    @(http.GET('/today').group('auth-required'))
    async getTodayHabits(user: User) {
        return this.habitService.getTodayHabits(user.id);
    }

    @(http.GET('/stats').group('auth-required'))
    async getStats(user: User) {
        return this.habitService.getStats(user.id);
    }

    @(http.GET('/:id').group('auth-required'))
    async getHabit(id: string, user: User) {
        const habit = await this.habitService.getById(id, user.id);
        if (!habit) {
            throw new HttpNotFoundError('Habit nicht gefunden');
        }
        return habit;
    }

    @(http.GET('/:id/logs').group('auth-required'))
    async getHabitLogs(id: string, user: User) {
        return this.habitService.getHabitLogs(id, user.id);
    }

    @(http.POST('').group('auth-required'))
    async createHabit(body: HttpBody<CreateHabitDto>, user: User) {
        return await this.habitService.create(user.id, body);
    }

    @(http.POST('/:id/log').group('auth-required'))
    async logHabit(id: string, body: HttpBody<LogHabitBody>, user: User) {
        const result = await this.habitService.logHabit(user.id, id, body.value || 1, body.note);
        if (!result) {
            throw new HttpNotFoundError('Habit nicht gefunden');
        }
        return {
            log: result.log,
            xpAwarded: result.xpAwarded,
            streakUpdated: result.streakUpdated,
        };
    }

    @(http.POST('/:id/timer/start').group('auth-required'))
    async startTimer(id: string, user: User) {
        const log = await this.habitService.startTimer(user.id, id);
        if (!log) {
            throw new HttpNotFoundError('Habit nicht gefunden oder kein Dauer-Habit');
        }
        return {
            log,
            timerStartedAt: log.timerStartedAt?.toISOString(),
        };
    }

    @(http.POST('/:id/timer/stop').group('auth-required'))
    async stopTimer(id: string, user: User) {
        const result = await this.habitService.stopTimer(user.id, id);
        if (!result) {
            throw new HttpNotFoundError('Habit nicht gefunden oder kein Timer aktiv');
        }
        return {
            log: result.log,
            xpAwarded: result.xpAwarded,
            streakUpdated: result.streakUpdated,
        };
    }

    @(http.PATCH('/:id').group('auth-required'))
    async updateHabit(id: string, body: HttpBody<UpdateHabitDto>, user: User) {
        const habit = await this.habitService.update(id, user.id, body);
        if (!habit) {
            throw new HttpNotFoundError('Habit nicht gefunden');
        }
        return habit;
    }

    @(http.DELETE('/:id').group('auth-required'))
    async deleteHabit(id: string, user: User) {
        const success = await this.habitService.delete(id, user.id);
        if (!success) {
            throw new HttpNotFoundError('Habit nicht gefunden');
        }
    }
}
