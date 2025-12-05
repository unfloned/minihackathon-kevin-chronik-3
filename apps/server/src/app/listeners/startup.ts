import { onAppExecute } from '@deepkit/app';
import { eventDispatcher } from '@deepkit/event';
import { Logger } from '@deepkit/logger';
import { AppDatabase } from '../database';
import { AppConfig } from '../config';
import { GamificationService } from '../../modules/gamification/index';
import { DemoCleanupService } from '../../modules/auth/demo-cleanup.service';

export class StartupListener {
    private cleanupInterval: NodeJS.Timeout | null = null;

    constructor(
        private database: AppDatabase,
        private logger: Logger,
        private config: AppConfig,
        private gamificationService: GamificationService,
        private demoCleanupService: DemoCleanupService
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

        // Start demo cleanup scheduler (runs every hour)
        this.startDemoCleanupScheduler();
        this.logger.log('Demo cleanup scheduler started (runs every hour).');

        // Run initial cleanup on startup
        try {
            const cleaned = await this.demoCleanupService.cleanupExpiredDemoAccounts();
            if (cleaned > 0) {
                this.logger.log(`Cleaned up ${cleaned} expired demo accounts on startup.`);
            }
        } catch (err) {
            this.logger.error('Failed to run initial demo cleanup:', err);
        }
    }

    private startDemoCleanupScheduler() {
        // Run cleanup every hour
        const ONE_HOUR = 60 * 60 * 1000;

        this.cleanupInterval = setInterval(async () => {
            try {
                const cleaned = await this.demoCleanupService.cleanupExpiredDemoAccounts();
                if (cleaned > 0) {
                    this.logger.log(`[Scheduled] Cleaned up ${cleaned} expired demo accounts.`);
                }
            } catch (err) {
                this.logger.error('[Scheduled] Demo cleanup failed:', err);
            }
        }, ONE_HOUR);
    }
}
