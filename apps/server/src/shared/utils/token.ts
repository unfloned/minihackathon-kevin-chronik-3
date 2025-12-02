import jwt, { SignOptions } from 'jsonwebtoken';
import { AppConfig } from '../../app/config';

export interface TokenPayload {
    userId: string;
    email: string;
    isDemo: boolean;
    type: 'access' | 'refresh';
    iat?: number;
    exp?: number;
}

export interface TokenPairResult {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: number;
    refreshTokenExpiresAt: number;
}

export class TokenService {
    constructor(private config: AppConfig) {}

    generateAccessToken(userId: string, email: string, isDemo: boolean): string {
        const options: SignOptions = { expiresIn: this.config.jwtExpiresIn as SignOptions['expiresIn'] };
        return jwt.sign(
            { userId, email, isDemo, type: 'access' } as TokenPayload,
            this.config.jwtSecret,
            options
        );
    }

    generateRefreshToken(userId: string, email: string, isDemo: boolean): string {
        const options: SignOptions = { expiresIn: this.config.jwtRefreshExpiresIn as SignOptions['expiresIn'] };
        return jwt.sign(
            { userId, email, isDemo, type: 'refresh' } as TokenPayload,
            this.config.jwtRefreshSecret,
            options
        );
    }

    verifyAccessToken(token: string): TokenPayload | null {
        try {
            const payload = jwt.verify(token, this.config.jwtSecret) as TokenPayload;
            if (payload.type !== 'access') return null;
            return payload;
        } catch {
            return null;
        }
    }

    verifyRefreshToken(token: string): TokenPayload | null {
        try {
            const payload = jwt.verify(token, this.config.jwtRefreshSecret) as TokenPayload;
            if (payload.type !== 'refresh') return null;
            return payload;
        } catch {
            return null;
        }
    }

    generateTokenPair(userId: string, email: string, isDemo: boolean): TokenPairResult {
        const accessToken = this.generateAccessToken(userId, email, isDemo);
        const refreshToken = this.generateRefreshToken(userId, email, isDemo);

        // Decode tokens to get expiry times
        const accessPayload = jwt.decode(accessToken) as TokenPayload;
        const refreshPayload = jwt.decode(refreshToken) as TokenPayload;

        return {
            accessToken,
            refreshToken,
            accessTokenExpiresAt: accessPayload.exp || 0,
            refreshTokenExpiresAt: refreshPayload.exp || 0,
        };
    }

    decodeToken(token: string): TokenPayload | null {
        try {
            return jwt.decode(token) as TokenPayload;
        } catch {
            return null;
        }
    }
}
