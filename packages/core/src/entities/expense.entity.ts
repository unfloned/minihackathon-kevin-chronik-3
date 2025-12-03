import { entity, PrimaryKey, Reference, uuid, UUID, Index } from '@deepkit/type';
import { User } from './user.entity.js';
import { ExpenseCategory } from './expense-category.entity.js';

@entity.name('expenses')
export class Expense {
    id: UUID & PrimaryKey = uuid();
    user!: User & Reference;
    category!: ExpenseCategory & Reference;

    amount: number = 0;
    description: string = '';
    date: string & Index = '';
    isRecurring: boolean = false;
    recurringInterval?: 'monthly' | 'yearly';

    createdAt: Date = new Date();
    updatedAt: Date = new Date();
}

export type ExpenseFrontend = Readonly<Expense>;
