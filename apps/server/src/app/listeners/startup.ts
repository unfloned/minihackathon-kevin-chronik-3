import { onAppExecute } from '@deepkit/app';
import { eventDispatcher } from '@deepkit/event';
import { Logger } from '@deepkit/logger';
import { AppDatabase } from '../database';
import { AppConfig } from '../config';
import { GamificationService } from '../../modules/gamification/index';
import { AdminService } from '../../modules/admin';
import { AuthService } from '../../modules/auth';
import { Habit } from '@ycmm/core';

export class StartupListener {
    constructor(
        private database: AppDatabase,
        private logger: Logger,
        private config: AppConfig,
        private gamificationService: GamificationService,
        private adminService: AdminService,
        private authService: AuthService
    ) {}

    @eventDispatcher.listen(onAppExecute)
    async onAppExecute() {
        this.logger.log(`Starting YCMM API Server...`);
        this.logger.log(`Environment: ${this.config.environment}`);

        // Run migrations
        await this.database.migrate();
        this.logger.log('Database migrations completed.');

        // Initialize achievements
        try {
            await this.gamificationService.initializeAchievements();
            this.logger.log('Achievements initialized.');
        } catch (err) {
            this.logger.error('Failed to initialize achievements:', err);
        }

        // Initialize demo account and seed data if needed
        try {
            const demoUser = await this.authService.createDemoUser();
            this.logger.log(`Demo user ready: ${demoUser.email}`);

            // Check if demo data exists
            const demoHabits = await this.database.query(Habit)
                .useInnerJoinWith('user').filter({ id: AuthService.DEMO_USER_ID }).end()
                .count();

            if (demoHabits === 0) {
                this.logger.log('Seeding demo data...');
                await this.adminService.seedDemoData(demoUser);
                this.logger.log('Demo data seeded successfully.');
            } else {
                this.logger.log('Demo data already exists, skipping seed.');
            }
        } catch (err) {
            this.logger.error('Failed to initialize demo account:', err);
        }
    }
}
