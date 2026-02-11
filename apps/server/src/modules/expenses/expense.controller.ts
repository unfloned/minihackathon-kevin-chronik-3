import { http, HttpBody, HttpNotFoundError, HttpBadRequestError } from '@deepkit/http';
import { ExpenseService, CreateExpenseDto, UpdateExpenseDto, CreateCategoryDto } from './expense.service';
import { User } from '@ycmm/core';

@http.controller('/api/expenses')
export class ExpenseController {
    constructor(private expenseService: ExpenseService) {}

    // Categories
    @(http.GET('/categories').group('auth-required'))
    async getCategories(user: User) {
        return this.expenseService.getCategories(user.id);
    }

    @(http.POST('/categories').group('auth-required'))
    async createCategory(body: HttpBody<CreateCategoryDto>, user: User) {
        return await this.expenseService.createCategory(user.id, body);
    }

    @(http.PATCH('/categories/:id').group('auth-required'))
    async updateCategory(id: string, body: HttpBody<Partial<CreateCategoryDto>>, user: User) {
        const category = await this.expenseService.updateCategory(id, user.id, body);
        if (!category) {
            throw new HttpNotFoundError('Kategorie nicht gefunden');
        }
        return category;
    }

    @(http.DELETE('/categories/:id').group('auth-required'))
    async deleteCategory(id: string, user: User) {
        const success = await this.expenseService.deleteCategory(id, user.id);
        if (!success) {
            throw new HttpBadRequestError('Kategorie nicht gefunden oder enthält Ausgaben');
        }
    }

    // Expenses
    @(http.GET('').group('auth-required'))
    async getAllExpenses(user: User) {
        return this.expenseService.getAll(user.id);
    }

    @(http.GET('/month/:year/:month').group('auth-required'))
    async getByMonth(year: string, month: string, user: User) {
        return this.expenseService.getByMonth(user.id, parseInt(year), parseInt(month));
    }

    @(http.GET('/stats/:year/:month').group('auth-required'))
    async getMonthlyStats(year: string, month: string, user: User) {
        return this.expenseService.getMonthlyStats(user.id, parseInt(year), parseInt(month));
    }

    @(http.GET('/:id').group('auth-required'))
    async getExpense(id: string, user: User) {
        const expense = await this.expenseService.getById(id, user.id);
        if (!expense) {
            throw new HttpNotFoundError('Ausgabe nicht gefunden');
        }
        return expense;
    }

    @(http.POST('').group('auth-required'))
    async createExpense(body: HttpBody<CreateExpenseDto>, user: User) {
        return await this.expenseService.create(user.id, body);
    }

    @(http.PATCH('/:id').group('auth-required'))
    async updateExpense(id: string, body: HttpBody<UpdateExpenseDto>, user: User) {
        const expense = await this.expenseService.update(id, user.id, body);
        if (!expense) {
            throw new HttpNotFoundError('Ausgabe nicht gefunden');
        }
        return expense;
    }

    @(http.DELETE('/:id').group('auth-required'))
    async deleteExpense(id: string, user: User) {
        const success = await this.expenseService.delete(id, user.id);
        if (!success) {
            throw new HttpNotFoundError('Ausgabe nicht gefunden');
        }
    }
}
