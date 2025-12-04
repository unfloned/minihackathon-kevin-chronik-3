import { http, HttpNotFoundError, HttpBody } from '@deepkit/http';
import { GamificationService } from './gamification.service';
import { User } from '@ycmm/core';

@http.controller('/api/gamification')
export class GamificationController {
    constructor(private gamificationService: GamificationService) {}

    @http.GET('/achievements')
    async getAllAchievements() {
        return this.gamificationService.getAllAchievements();
    }

    @(http.GET('/user-achievements').group('auth-required'))
    async getUserAchievements(user: User) {
        return this.gamificationService.getUserAchievements(user.id);
    }

    @(http.GET('/recent-achievements').group('auth-required'))
    async getRecentAchievements(user: User) {
        return this.gamificationService.getRecentAchievements(user.id);
    }

    @(http.GET('/stats').group('auth-required'))
    async getStats(user: User) {
        const xpProgress = this.gamificationService.getXpProgress(user.xp, user.level);
        const userAchievements = await this.gamificationService.getUserAchievements(user.id);

        return {
            level: user.level,
            xp: user.xp,
            xpProgress,
            achievementsUnlocked: userAchievements.length,
        };
    }

    // Profile Sharing endpoints
    @(http.GET('/profile/sharing').group('auth-required'))
    async getProfileSharingStatus(user: User) {
        return this.gamificationService.getProfileSharingStatus(user.id);
    }

    @(http.POST('/profile/sharing').group('auth-required'))
    async toggleProfileSharing(user: User, body: HttpBody<{ isPublic: boolean }>) {
        return this.gamificationService.toggleProfileSharing(user.id, body.isPublic);
    }
}

// Public profile controller (no auth required)
@http.controller('/api/public')
export class PublicProfileController {
    constructor(private gamificationService: GamificationService) {}

    @http.GET('/profile/:slug')
    async getPublicProfile(slug: string) {
        const profile = await this.gamificationService.getPublicProfile(slug);
        if (!profile) {
            throw new HttpNotFoundError('Profile not found');
        }
        return profile;
    }
}
