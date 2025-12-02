import { entity, PrimaryKey, Index, Reference } from '@deepkit/type';
import { User } from './user.entity.js';

@entity.name('expense_categories')
export class ExpenseCategory {
    id: string & PrimaryKey = '';
    userId: string & Index = '';
    user?: User & Reference;

    name: string = '';
    icon: string = 'coin';
    color: string = '#228be6';
    budget?: number; // Monthly budget limit
    isDefault: boolean = false;

    createdAt: Date = new Date();
}
