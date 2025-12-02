import { http, HttpBody, HttpRequest, HttpResponse, HttpQuery, HttpUnauthorizedError } from '@deepkit/http';
import { AuthService } from './auth.service';
import { NotificationService } from '../notifications/notification.service';
import { GamificationService } from '../gamification/gamification.service';
import { AppConfig } from '../../app/config';

interface RegisterBody {
    email: string;
    password: string;
    displayName: string;
}

interface LoginBody {
    email: string;
    password: string;
}

interface ForgotPasswordBody {
    email: string;
}

interface ResetPasswordBody {
    token: string;
    password: string;
}

interface ValidateResetTokenQuery {
    token: string;
}

@http.controller('/api/auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private notificationService: NotificationService,
        private gamificationService: GamificationService,
        private config: AppConfig
    ) {}

    private setTokenCookies(response: HttpResponse, accessToken: string, refreshToken: string) {
        const isProduction = process.env.NODE_ENV === 'production';

        response.setHeader('Set-Cookie', [
            `access_token=${accessToken}; HttpOnly; Path=/; SameSite=Strict; Max-Age=900${isProduction ? '; Secure' : ''}`,
            `refresh_token=${refreshToken}; HttpOnly; Path=/api/auth; SameSite=Strict; Max-Age=604800${isProduction ? '; Secure' : ''}`,
        ]);
    }

    private clearTokenCookies(response: HttpResponse) {
        const isProduction = process.env.NODE_ENV === 'production';

        response.setHeader('Set-Cookie', [
            `access_token=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0${isProduction ? '; Secure' : ''}`,
            `refresh_token=; HttpOnly; Path=/api/auth; SameSite=Strict; Max-Age=0${isProduction ? '; Secure' : ''}`,
        ]);
    }

    private getCookie(request: HttpRequest, name: string): string | undefined {
        const cookies = request.headers.cookie;
        if (!cookies) return undefined;

        const match = cookies.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
        return match ? match[1] : undefined;
    }

    @http.POST('/register')
    async register(body: HttpBody<RegisterBody>, response: HttpResponse) {
        const user = await this.authService.register(body.email, body.password, body.displayName);
        const tokens = await this.authService.generateTokens(user);

        this.setTokenCookies(response, tokens.accessToken, tokens.refreshToken);

        // Create welcome notification
        await this.notificationService.create(
            user.id,
            'success',
            'Willkommen bei YCMM!',
            'Schön, dass du dabei bist. Erkunde die App und bringe Ordnung in dein Chaos!'
        );

        // Unlock first_login achievement
        await this.gamificationService.checkAndUnlockAchievement(user.id, 'first_login');

        return this.authService.toPublicUser(user);
    }

    @http.POST('/login')
    async login(body: HttpBody<LoginBody>, response: HttpResponse) {
        const user = await this.authService.login(body.email, body.password);
        const tokens = await this.authService.generateTokens(user);

        this.setTokenCookies(response, tokens.accessToken, tokens.refreshToken);

        return this.authService.toPublicUser(user);
    }

    @http.POST('/demo')
    async createDemo(response: HttpResponse) {
        const user = await this.authService.createDemoUser();
        const tokens = await this.authService.generateTokens(user);

        this.setTokenCookies(response, tokens.accessToken, tokens.refreshToken);

        // Create demo welcome notification
        await this.notificationService.create(
            user.id,
            'info',
            'Demo-Modus aktiv',
            'Du verwendest einen temporären Demo-Account. Deine Daten werden nicht gespeichert.'
        );

        // Unlock first_login achievement for demo
        await this.gamificationService.checkAndUnlockAchievement(user.id, 'first_login');

        return this.authService.toPublicUser(user);
    }

    @http.POST('/refresh')
    async refresh(request: HttpRequest, response: HttpResponse) {
        const refreshToken = this.getCookie(request, 'refresh_token');

        if (!refreshToken) {
            this.clearTokenCookies(response);
            throw new HttpUnauthorizedError('Kein Refresh Token');
        }

        try {
            const tokens = await this.authService.refreshTokens(refreshToken);
            this.setTokenCookies(response, tokens.accessToken, tokens.refreshToken);
        } catch {
            this.clearTokenCookies(response);
            throw new HttpUnauthorizedError('Token ungültig');
        }
    }

    @http.POST('/logout')
    async logout(request: HttpRequest, response: HttpResponse) {
        const refreshToken = this.getCookie(request, 'refresh_token');

        if (refreshToken) {
            await this.authService.revokeRefreshToken(refreshToken);
        }

        this.clearTokenCookies(response);
    }

    @http.GET('/session')
    async session(request: HttpRequest, response: HttpResponse) {
        const accessToken = this.getCookie(request, 'access_token');

        if (!accessToken) {
            return { authenticated: false };
        }

        try {
            const payload = await this.authService.validateAccessToken(accessToken);
            const user = await this.authService.getUserById(payload.userId);

            if (!user) {
                this.clearTokenCookies(response);
                return { authenticated: false };
            }

            return {
                authenticated: true,
                user: this.authService.toPublicUser(user),
            };
        } catch {
            // Token expired, try refresh
            const refreshToken = this.getCookie(request, 'refresh_token');

            if (!refreshToken) {
                this.clearTokenCookies(response);
                return { authenticated: false };
            }

            try {
                const tokens = await this.authService.refreshTokens(refreshToken);
                const payload = await this.authService.validateAccessToken(tokens.accessToken);
                const user = await this.authService.getUserById(payload.userId);

                if (!user) {
                    this.clearTokenCookies(response);
                    return { authenticated: false };
                }

                this.setTokenCookies(response, tokens.accessToken, tokens.refreshToken);

                return {
                    authenticated: true,
                    user: this.authService.toPublicUser(user),
                };
            } catch {
                this.clearTokenCookies(response);
                return { authenticated: false };
            }
        }
    }

    @http.POST('/forgot-password')
    async forgotPassword(body: HttpBody<ForgotPasswordBody>) {
        const token = await this.authService.createPasswordResetToken(body.email);

        // Note: In production, this would send an email with the reset link
        // For development, we'll log the token and return success regardless
        if (token) {
            console.log(`[DEV] Password reset token for ${body.email}: ${token}`);
            console.log(`[DEV] Reset link: http://localhost:5173/reset-password?token=${token}`);
        }

        // Always return same message to prevent email enumeration
        return { message: 'Falls ein Account mit dieser E-Mail existiert, wurde ein Link zum Zurücksetzen gesendet.' };
    }

    @http.GET('/validate-reset-token')
    async validateResetToken(query: HttpQuery<ValidateResetTokenQuery>) {
        return this.authService.validatePasswordResetToken(query.token);
    }

    @http.POST('/reset-password')
    async resetPassword(body: HttpBody<ResetPasswordBody>) {
        await this.authService.resetPassword(body.token, body.password);
        return { message: 'Passwort wurde erfolgreich zurückgesetzt.' };
    }
}
