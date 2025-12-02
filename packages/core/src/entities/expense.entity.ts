import { entity, PrimaryKey, Index, Reference } from '@deepkit/type';
import { User } from './user.entity.js';
import { ExpenseCategory } from './expense-category.entity.js';

@entity.name('expenses')
export class Expense {
    id: string & PrimaryKey = '';
    userId: string & Index = '';
    user?: User & Reference;
    categoryId: string & Index = '';
    category?: ExpenseCategory & Reference;

    amount: number = 0;
    description: string = '';
    date: string & Index = ''; // YYYY-MM-DD format
    isRecurring: boolean = false;
    recurringInterval?: 'monthly' | 'yearly';

    createdAt: Date = new Date();
    updatedAt: Date = new Date();
}
