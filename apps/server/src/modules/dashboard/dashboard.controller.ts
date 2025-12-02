import { http } from '@deepkit/http';
import { DashboardService } from './dashboard.service';
import { User } from '@ycmm/core';

@http.controller('/api/dashboard')
export class DashboardController {
    constructor(private dashboardService: DashboardService) {}

    @(http.GET('/stats').group('auth-required'))
    async getStats(user: User) {
        return this.dashboardService.getStats(user.id);
    }
}
