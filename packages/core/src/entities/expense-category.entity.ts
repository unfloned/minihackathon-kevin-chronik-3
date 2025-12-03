import { entity, PrimaryKey, Reference, uuid, UUID } from '@deepkit/type';
import { User } from './user.entity.js';

@entity.name('expense_categories')
export class ExpenseCategory {
    id: UUID & PrimaryKey = uuid();
    user!: User & Reference;

    name: string = '';
    icon: string = 'coin';
    color: string = '#228be6';
    budget?: number;
    isDefault: boolean = false;

    createdAt: Date = new Date();
}

export type ExpenseCategoryFrontend = Readonly<ExpenseCategory>;
