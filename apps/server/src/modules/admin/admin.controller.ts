import { http, HttpBody } from '@deepkit/http';
import { AdminService } from './admin.service';
import { AuthService } from '../auth/auth.service';
import { User } from '@ycmm/core';

interface SetAdminBody {
    userId: string;
    isAdmin: boolean;
}

@http.controller('/api/admin')
export class AdminController {
    constructor(
        private adminService: AdminService,
        private authService: AuthService
    ) {}

    @http.GET('/users')
    async getAllUsers(user: User) {
        await this.adminService.checkAdminAccess(user);
        const users = await this.adminService.getAllUsers();
        return users.map(u => this.authService.toPublicUser(u));
    }

    @http.POST('/users/set-admin')
    async setUserAdmin(user: User, body: HttpBody<SetAdminBody>) {
        await this.adminService.checkAdminAccess(user);
        const updatedUser = await this.adminService.setUserAdmin(body.userId, body.isAdmin);
        return this.authService.toPublicUser(updatedUser);
    }

    @http.POST('/demo/reset')
    async resetDemoData(user: User) {
        await this.adminService.checkAdminAccess(user);
        await this.adminService.resetDemoData();
        return { success: true, message: 'Demo-Daten wurden zurückgesetzt' };
    }

    @http.DELETE('/users/:userId/data')
    async deleteUserData(user: User, userId: string) {
        await this.adminService.checkAdminAccess(user);
        await this.adminService.deleteUserData(userId);
        return { success: true, message: 'Benutzerdaten wurden gelöscht' };
    }

    @http.GET('/stats')
    async getAdminStats(user: User) {
        await this.adminService.checkAdminAccess(user);
        const users = await this.adminService.getAllUsers();

        return {
            totalUsers: users.length,
            demoUsers: users.filter(u => u.isDemo).length,
            adminUsers: users.filter(u => u.isAdmin).length,
            regularUsers: users.filter(u => !u.isDemo && !u.isAdmin).length,
        };
    }
}
