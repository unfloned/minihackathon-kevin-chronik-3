import { HttpUnauthorizedError, HttpBadRequestError, HttpNotFoundError } from '@deepkit/http';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { AppDatabase } from '../../app/database';
import { AppConfig } from '../../app/config';
import { User, RefreshToken, PasswordResetToken, UserPublic } from '@ycmm/core';

interface TokenPayload {
    userId: string;
    email: string;
    isDemo: boolean;
    type: 'access' | 'refresh';
}

export class AuthService {
    constructor(
        private db: AppDatabase,
        private config: AppConfig
    ) {}

    async register(email: string, password: string, displayName: string): Promise<User> {
        const existingUser = await this.db.query(User)
            .filter({ email })
            .findOneOrUndefined();

        if (existingUser) {
            throw new HttpBadRequestError('E-Mail bereits registriert');
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = new User();
        user.id = uuidv4();
        user.email = email;
        user.password = hashedPassword;
        user.displayName = displayName;
        user.isDemo = false;
        user.level = 1;
        user.xp = 0;
        user.createdAt = new Date();
        user.updatedAt = new Date();

        await this.db.persist(user);

        return user;
    }

    async login(email: string, password: string): Promise<User> {
        const user = await this.db.query(User)
            .filter({ email })
            .findOneOrUndefined();

        if (!user) {
            throw new HttpUnauthorizedError('Ungültige Anmeldedaten');
        }

        if (user.isDemo) {
            throw new HttpBadRequestError('Demo-Accounts können sich nicht anmelden');
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new HttpUnauthorizedError('Ungültige Anmeldedaten');
        }

        return user;
    }

    // Fixed demo account credentials
    static readonly DEMO_USER_ID = 'demo-user-fixed-id';
    static readonly DEMO_EMAIL = 'demo@ycmm.app';
    static readonly DEMO_PASSWORD = 'demo';

    async createDemoUser(): Promise<User> {
        // Check if demo user already exists
        let user = await this.db.query(User)
            .filter({ id: AuthService.DEMO_USER_ID })
            .findOneOrUndefined();

        if (user) {
            return user;
        }

        // Create fixed demo user
        user = new User();
        user.id = AuthService.DEMO_USER_ID;
        user.email = AuthService.DEMO_EMAIL;
        user.password = await bcrypt.hash(AuthService.DEMO_PASSWORD, 12);
        user.displayName = 'Demo User';
        user.isDemo = true;
        user.isAdmin = false;
        user.level = 5;
        user.xp = 1250;
        user.createdAt = new Date();
        user.updatedAt = new Date();

        await this.db.persist(user);

        return user;
    }

    async getDemoUser(): Promise<User | undefined> {
        return this.db.query(User)
            .filter({ id: AuthService.DEMO_USER_ID })
            .findOneOrUndefined();
    }

    async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
        const payload: TokenPayload = {
            userId: user.id,
            email: user.email,
            isDemo: user.isDemo,
            type: 'access',
        };

        const accessToken = jwt.sign(payload, this.config.jwtSecret, {
            expiresIn: this.config.jwtExpiresIn as jwt.SignOptions['expiresIn'],
        });

        const refreshTokenValue = uuidv4();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const refreshToken = new RefreshToken();
        refreshToken.id = uuidv4();
        refreshToken.token = refreshTokenValue;
        refreshToken.userId = user.id;
        refreshToken.expiresAt = expiresAt;
        refreshToken.createdAt = new Date();

        await this.db.persist(refreshToken);

        return { accessToken, refreshToken: refreshTokenValue };
    }

    async refreshTokens(refreshTokenValue: string): Promise<{ accessToken: string; refreshToken: string }> {
        const tokenRecord = await this.db.query(RefreshToken)
            .filter({ token: refreshTokenValue })
            .findOneOrUndefined();

        if (!tokenRecord) {
            throw new HttpUnauthorizedError('Ungültiger Refresh Token');
        }

        if (tokenRecord.expiresAt < new Date()) {
            await this.db.remove(tokenRecord);
            throw new HttpUnauthorizedError('Refresh Token abgelaufen');
        }

        const user = await this.db.query(User)
            .filter({ id: tokenRecord.userId })
            .findOneOrUndefined();

        if (!user) {
            throw new HttpUnauthorizedError('Benutzer nicht gefunden');
        }

        // Remove old refresh token
        await this.db.remove(tokenRecord);

        // Generate new tokens
        return this.generateTokens(user);
    }

    async validateAccessToken(token: string): Promise<TokenPayload> {
        try {
            const payload = jwt.verify(token, this.config.jwtSecret) as TokenPayload;
            return payload;
        } catch {
            throw new HttpUnauthorizedError('Ungültiger Access Token');
        }
    }

    async getUserById(userId: string): Promise<User | undefined> {
        return this.db.query(User)
            .filter({ id: userId })
            .findOneOrUndefined();
    }

    async revokeRefreshToken(refreshTokenValue: string): Promise<void> {
        const tokenRecord = await this.db.query(RefreshToken)
            .filter({ token: refreshTokenValue })
            .findOneOrUndefined();

        if (tokenRecord) {
            await this.db.remove(tokenRecord);
        }
    }

    async revokeAllUserTokens(userId: string): Promise<void> {
        const tokens = await this.db.query(RefreshToken)
            .filter({ userId })
            .find();

        for (const token of tokens) {
            await this.db.remove(token);
        }
    }

    toPublicUser(user: User): UserPublic {
        return {
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            isDemo: user.isDemo,
            isAdmin: user.isAdmin,
            level: user.level,
            xp: user.xp,
            createdAt: user.createdAt,
        };
    }

    async createPasswordResetToken(email: string): Promise<string | null> {
        const user = await this.db.query(User)
            .filter({ email })
            .findOneOrUndefined();

        if (!user || user.isDemo) {
            // Return null but don't throw - don't reveal if email exists
            return null;
        }

        // Delete any existing reset tokens for this user
        const existingTokens = await this.db.query(PasswordResetToken)
            .filter({ userId: user.id })
            .find();

        for (const token of existingTokens) {
            await this.db.remove(token);
        }

        // Generate a secure random token
        const tokenValue = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1); // Token valid for 1 hour

        const resetToken = new PasswordResetToken();
        resetToken.id = uuidv4();
        resetToken.token = tokenValue;
        resetToken.userId = user.id;
        resetToken.expiresAt = expiresAt;
        resetToken.createdAt = new Date();

        await this.db.persist(resetToken);

        return tokenValue;
    }

    async validatePasswordResetToken(token: string): Promise<{ valid: boolean; email?: string }> {
        const tokenRecord = await this.db.query(PasswordResetToken)
            .filter({ token })
            .findOneOrUndefined();

        if (!tokenRecord) {
            return { valid: false };
        }

        if (tokenRecord.expiresAt < new Date()) {
            await this.db.remove(tokenRecord);
            return { valid: false };
        }

        const user = await this.db.query(User)
            .filter({ id: tokenRecord.userId })
            .findOneOrUndefined();

        if (!user) {
            await this.db.remove(tokenRecord);
            return { valid: false };
        }

        return { valid: true, email: user.email };
    }

    async resetPassword(token: string, newPassword: string): Promise<void> {
        const tokenRecord = await this.db.query(PasswordResetToken)
            .filter({ token })
            .findOneOrUndefined();

        if (!tokenRecord) {
            throw new HttpBadRequestError('Ungültiger oder abgelaufener Link');
        }

        if (tokenRecord.expiresAt < new Date()) {
            await this.db.remove(tokenRecord);
            throw new HttpBadRequestError('Link ist abgelaufen');
        }

        const user = await this.db.query(User)
            .filter({ id: tokenRecord.userId })
            .findOneOrUndefined();

        if (!user) {
            await this.db.remove(tokenRecord);
            throw new HttpNotFoundError('Benutzer nicht gefunden');
        }

        // Hash new password and update user
        user.password = await bcrypt.hash(newPassword, 12);
        user.updatedAt = new Date();
        await this.db.persist(user);

        // Delete the reset token
        await this.db.remove(tokenRecord);

        // Revoke all existing refresh tokens for security
        await this.revokeAllUserTokens(user.id);
    }
}
