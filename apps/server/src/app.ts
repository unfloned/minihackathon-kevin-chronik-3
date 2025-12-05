import { App } from '@deepkit/app';
import { FrameworkModule } from '@deepkit/framework';
import { httpMiddleware, HttpRequest } from '@deepkit/http';

import { AppConfig } from './app/config';
import { AppDatabase } from './app/database';

// Listeners
import { CORSListener } from './app/listeners/cors';
import { StartupListener } from './app/listeners/startup';
import { ErrorHandlerListener } from './app/listeners/errorHandler';

// Middlewares
import { AuthMiddleware } from './shared/middlewares/auth.middleware';

// Services
import { TokenService } from './shared/utils/token';

// Entities
import { User } from '@ycmm/core';

// Modules
import { AuthModule } from './modules/auth';
import { GamificationModule } from './modules/gamification';
import { NotificationsModule } from './modules/notifications';
import { HabitsModule } from './modules/habits';
import { ExpensesModule } from './modules/expenses';
import { DeadlinesModule } from './modules/deadlines';
import { SubscriptionsModule } from './modules/subscriptions';
import { DashboardModule } from './modules/dashboard';
import { NotesModule } from './modules/notes';
import { ListsModule } from './modules/lists';
import { ProjectsModule } from './modules/projects';
import { InventoryModule } from './modules/inventory';
import { ApplicationsModule } from './modules/applications';
import { MediaModule } from './modules/media';
import { MealsModule } from './modules/meals';
import { WishlistsModule } from './modules/wishlists';
import { AdminModule } from './modules/admin';
import { PushModule } from './modules/push';

// Standalone Controllers
import { VersionController } from './controllers/version.controller';

// YCMM Server
new App({
    config: AppConfig,
    controllers: [
        VersionController,
    ],
    providers: [
        AppDatabase,
        TokenService,
        {
            provide: User,
            scope: 'http',
            useFactory: (request: HttpRequest) => request.store.user
        },
    ],
    middlewares: [
        httpMiddleware.for(AuthMiddleware).forRoutes({ group: 'auth-required' }),
    ],
    listeners: [
        CORSListener,
        StartupListener,
        ErrorHandlerListener,
    ],
    imports: [
        new FrameworkModule({
            debug: process.env.NODE_ENV !== 'production',
            migrateOnStartup: true,
        }),
        // Feature Modules
        GamificationModule,
        NotificationsModule,
        AuthModule,
        HabitsModule,
        ExpensesModule,
        DeadlinesModule,
        SubscriptionsModule,
        DashboardModule,
        NotesModule,
        ListsModule,
        ProjectsModule,
        InventoryModule,
        ApplicationsModule,
        MediaModule,
        MealsModule,
        WishlistsModule,
        AdminModule,
        PushModule,
    ],
})
    .loadConfigFromEnv({ prefix: '' })
    .run(['server:start']);
