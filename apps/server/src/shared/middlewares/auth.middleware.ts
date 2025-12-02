import { HttpMiddleware, HttpRequest, HttpResponse, HttpUnauthorizedError } from '@deepkit/http';
import { TokenService } from '../utils/token';
import { AppDatabase } from '../../app/database';
import { User } from '@ycmm/core';

// Helper to parse cookies from request
function parseCookies(cookieHeader: string | undefined): Record<string, string> {
    const cookies: Record<string, string> = {};
    if (!cookieHeader) return cookies;

    cookieHeader.split(';').forEach(cookie => {
        const [name, ...rest] = cookie.trim().split('=');
        if (name && rest.length > 0) {
            cookies[name] = rest.join('=');
        }
    });
    return cookies;
}

export class AuthMiddleware implements HttpMiddleware {
    constructor(
        private tokenService: TokenService,
        private database: AppDatabase
    ) {}

    async execute(request: HttpRequest, response: HttpResponse, next: (err?: any) => void): Promise<void> {
        const cookies = parseCookies(request.headers.cookie);
        const accessToken = cookies['access_token']; // Fixed: was 'accessToken'

        if (!accessToken) {
            throw new HttpUnauthorizedError('No token provided');
        }

        const payload = this.tokenService.verifyAccessToken(accessToken);

        if (!payload) {
            throw new HttpUnauthorizedError('Invalid or expired token');
        }

        const user = await this.database.query(User)
            .filter({ id: payload.userId })
            .findOneOrUndefined();

        if (!user) {
            throw new HttpUnauthorizedError('User not found');
        }

        // Store user in request for injection via provider
        (request as any).user = user;
        request.store.user = user;
        request.store.userId = user.id;
        next();
    }
}

// Helper to get current user from request (for use outside of DI)
export function getCurrentUser(request: HttpRequest): User {
    const user = request.store.user as User | undefined;
    if (!user) {
        throw new HttpUnauthorizedError('User not authenticated');
    }
    return user;
}

export function getCurrentUserId(request: HttpRequest): string {
    const userId = request.store.userId as string | undefined;
    if (!userId) {
        throw new HttpUnauthorizedError('User not authenticated');
    }
    return userId;
}
