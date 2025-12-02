import { createModule } from '@deepkit/app';
import { ExpenseService } from './expense.service';
import { ExpenseController } from './expense.controller';

export const ExpensesModule = createModule({
    controllers: [ExpenseController],
    providers: [ExpenseService],
    exports: [ExpenseService],
});
