import 'dotenv/config';

export class AppConfig {
    environment: 'production' | 'development' = (process.env.NODE_ENV as 'production' | 'development') || 'development';
    port: number = parseInt(process.env.PORT || '8080');
    host: string = process.env.HOST || '0.0.0.0';

    // Database
    databasePath: string = process.env.DATABASE_PATH || './data/ycmm.db';

    // JWT
    jwtSecret: string = process.env.JWT_SECRET || 'dev-only-insecure-jwt-secret';
    jwtRefreshSecret: string = process.env.JWT_REFRESH_SECRET || 'dev-only-insecure-refresh-secret';
    jwtExpiresIn: string = process.env.JWT_EXPIRES_IN || '15m';
    jwtRefreshExpiresIn: string = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

    // Password
    passwordSaltRounds: number = parseInt(process.env.PASSWORD_SALT_ROUNDS || '10');

    // Frontend URL
    webUrl: string = process.env.WEB_URL || 'http://localhost:5173';

    // API Keys
    tmdbApiKey?: string = process.env.TMDB_API_KEY;
    omdbApiKey?: string = process.env.OMDB_API_KEY;

    constructor() {
        if (this.environment === 'production') {
            if (this.jwtSecret.includes('dev-only')) {
                throw new Error('JWT_SECRET must be set in production!');
            }
            if (this.jwtRefreshSecret.includes('dev-only')) {
                throw new Error('JWT_REFRESH_SECRET must be set in production!');
            }
        }
    }
}
