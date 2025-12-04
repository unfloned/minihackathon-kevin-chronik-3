import { Application, ApplicationStatus, RemoteType, SalaryRange, StatusChange, Interview, User } from '@ycmm/core';
import { AppDatabase } from '../../app/database';
import crypto from 'crypto';

export interface CreateApplicationDto {
    companyName: string;
    jobTitle: string;
    companyWebsite?: string;
    jobUrl?: string;
    jobDescription?: string;
    salary?: SalaryRange;
    location?: string;
    remote?: RemoteType;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
    notes?: string;
    source?: string;
}

export interface UpdateApplicationDto {
    companyName?: string;
    companyWebsite?: string;
    jobTitle?: string;
    jobUrl?: string;
    jobDescription?: string;
    salary?: SalaryRange;
    location?: string;
    remote?: RemoteType;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
    notes?: string;
    source?: string;
}

export interface AddInterviewDto {
    type: Interview['type'];
    scheduledAt: Date;
    duration?: number;
    location?: string;
    interviewers?: string[];
    notes?: string;
}

export interface UpdateInterviewDto {
    type?: Interview['type'];
    scheduledAt?: Date;
    duration?: number;
    location?: string;
    interviewers?: string[];
    notes?: string;
    completed?: boolean;
    feedback?: string;
}

// Helper to fix dates in nested objects after database retrieval
function fixApplicationDates(app: Application): Application {
    // Fix statusHistory dates
    if (app.statusHistory) {
        app.statusHistory = app.statusHistory.map(sh => ({
            ...sh,
            date: sh.date instanceof Date ? sh.date : new Date(sh.date),
        }));
    }
    // Fix interview dates
    if (app.interviews) {
        app.interviews = app.interviews.map(interview => ({
            ...interview,
            scheduledAt: interview.scheduledAt instanceof Date ? interview.scheduledAt : new Date(interview.scheduledAt),
        }));
    }
    return app;
}

export class ApplicationService {
    constructor(private database: AppDatabase) {}

    async getAll(userId: string): Promise<Application[]> {
        const apps = await this.database.query(Application)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .orderBy('updatedAt', 'desc')
            .find();
        return apps.map(fixApplicationDates);
    }

    async getByStatus(userId: string, status: ApplicationStatus): Promise<Application[]> {
        const apps = await this.database.query(Application)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .filter({ status })
            .orderBy('updatedAt', 'desc')
            .find();
        return apps.map(fixApplicationDates);
    }

    async getById(id: string, userId: string): Promise<Application | undefined> {
        const app = await this.database.query(Application)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .filter({ id })
            .findOneOrUndefined();
        return app ? fixApplicationDates(app) : undefined;
    }

    async create(userId: string, dto: CreateApplicationDto): Promise<Application> {
        const app = new Application();
        app.user = this.database.getReference(User, userId);
        app.companyName = dto.companyName;
        app.jobTitle = dto.jobTitle;
        app.companyWebsite = dto.companyWebsite || '';
        app.jobUrl = dto.jobUrl || '';
        app.jobDescription = dto.jobDescription || '';
        app.salary = dto.salary;
        app.location = dto.location || '';
        app.remote = dto.remote || 'onsite';
        app.contactName = dto.contactName || '';
        app.contactEmail = dto.contactEmail || '';
        app.contactPhone = dto.contactPhone || '';
        app.notes = dto.notes || '';
        app.source = dto.source || '';
        app.status = 'draft';
        app.statusHistory = [{ status: 'draft', date: new Date() }];
        app.interviews = [];
        app.createdAt = new Date();
        app.updatedAt = new Date();

        await this.database.persist(app);
        return app;
    }

    async update(id: string, userId: string, dto: UpdateApplicationDto): Promise<Application | null> {
        const app = await this.getById(id, userId);
        if (!app) return null;

        if (dto.companyName !== undefined) app.companyName = dto.companyName;
        if (dto.companyWebsite !== undefined) app.companyWebsite = dto.companyWebsite;
        if (dto.jobTitle !== undefined) app.jobTitle = dto.jobTitle;
        if (dto.jobUrl !== undefined) app.jobUrl = dto.jobUrl;
        if (dto.jobDescription !== undefined) app.jobDescription = dto.jobDescription;
        if (dto.salary !== undefined) app.salary = dto.salary;
        if (dto.location !== undefined) app.location = dto.location;
        if (dto.remote !== undefined) app.remote = dto.remote;
        if (dto.contactName !== undefined) app.contactName = dto.contactName;
        if (dto.contactEmail !== undefined) app.contactEmail = dto.contactEmail;
        if (dto.contactPhone !== undefined) app.contactPhone = dto.contactPhone;
        if (dto.notes !== undefined) app.notes = dto.notes;
        if (dto.source !== undefined) app.source = dto.source;
        app.updatedAt = new Date();

        await this.database.persist(app);
        return app;
    }

    async delete(id: string, userId: string): Promise<boolean> {
        const app = await this.getById(id, userId);
        if (!app) return false;

        await this.database.remove(app);
        return true;
    }

    async updateStatus(id: string, userId: string, status: ApplicationStatus, note?: string): Promise<Application | null> {
        const app = await this.getById(id, userId);
        if (!app) return null;

        const statusChange: StatusChange = {
            status,
            date: new Date(),
            note,
        };

        app.status = status;
        app.statusHistory.push(statusChange);

        // Set appliedAt when first applying
        if (status === 'applied' && !app.appliedAt) {
            app.appliedAt = new Date();
        }

        app.updatedAt = new Date();

        await this.database.persist(app);
        return app;
    }

    // Interview operations
    async addInterview(id: string, userId: string, dto: AddInterviewDto): Promise<Application | null> {
        const app = await this.getById(id, userId);
        if (!app) return null;

        const interview: Interview = {
            id: crypto.randomUUID(),
            type: dto.type,
            scheduledAt: dto.scheduledAt,
            duration: dto.duration,
            location: dto.location,
            interviewers: dto.interviewers,
            notes: dto.notes,
            completed: false,
        };

        app.interviews.push(interview);
        app.updatedAt = new Date();

        await this.database.persist(app);
        return app;
    }

    async updateInterview(appId: string, userId: string, interviewId: string, dto: UpdateInterviewDto): Promise<Application | null> {
        const app = await this.getById(appId, userId);
        if (!app) return null;

        const interview = app.interviews.find(i => i.id === interviewId);
        if (!interview) return null;

        if (dto.type !== undefined) interview.type = dto.type;
        if (dto.scheduledAt !== undefined) interview.scheduledAt = dto.scheduledAt;
        if (dto.duration !== undefined) interview.duration = dto.duration;
        if (dto.location !== undefined) interview.location = dto.location;
        if (dto.interviewers !== undefined) interview.interviewers = dto.interviewers;
        if (dto.notes !== undefined) interview.notes = dto.notes;
        if (dto.completed !== undefined) interview.completed = dto.completed;
        if (dto.feedback !== undefined) interview.feedback = dto.feedback;

        app.updatedAt = new Date();

        await this.database.persist(app);
        return app;
    }

    async deleteInterview(appId: string, userId: string, interviewId: string): Promise<Application | null> {
        const app = await this.getById(appId, userId);
        if (!app) return null;

        const idx = app.interviews.findIndex(i => i.id === interviewId);
        if (idx === -1) return null;

        app.interviews.splice(idx, 1);
        app.updatedAt = new Date();

        await this.database.persist(app);
        return app;
    }

    async getStats(userId: string): Promise<{
        total: number;
        byStatus: { status: ApplicationStatus; count: number }[];
        responseRate: number;
        interviewRate: number;
        offerRate: number;
        averageResponseDays: number | null;
    }> {
        const allRaw = await this.database.query(Application)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .find();
        const all = allRaw.map(fixApplicationDates);

        const byStatus: { status: ApplicationStatus; count: number }[] = [];
        const statusCounts: Record<string, number> = {};

        all.forEach(app => {
            statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
        });

        Object.entries(statusCounts).forEach(([status, count]) => {
            byStatus.push({ status: status as ApplicationStatus, count });
        });

        const applied = all.filter(a => a.appliedAt !== undefined);
        const responses = all.filter(a =>
            ['in_review', 'interview_scheduled', 'interviewed', 'offer_received', 'accepted', 'rejected'].includes(a.status)
        );
        const interviews = all.filter(a =>
            ['interview_scheduled', 'interviewed', 'offer_received', 'accepted'].includes(a.status)
        );
        const offers = all.filter(a =>
            ['offer_received', 'accepted'].includes(a.status)
        );

        // Calculate average response time
        let totalResponseDays = 0;
        let responseCount = 0;

        responses.forEach(app => {
            if (app.appliedAt && app.statusHistory.length > 1) {
                const firstResponse = app.statusHistory.find(sh =>
                    sh.status !== 'draft' && sh.status !== 'applied'
                );
                if (firstResponse) {
                    const days = Math.floor(
                        (new Date(firstResponse.date).getTime() - new Date(app.appliedAt).getTime()) /
                        (1000 * 60 * 60 * 24)
                    );
                    totalResponseDays += days;
                    responseCount++;
                }
            }
        });

        return {
            total: all.length,
            byStatus,
            responseRate: applied.length > 0 ? Math.round((responses.length / applied.length) * 100) : 0,
            interviewRate: applied.length > 0 ? Math.round((interviews.length / applied.length) * 100) : 0,
            offerRate: applied.length > 0 ? Math.round((offers.length / applied.length) * 100) : 0,
            averageResponseDays: responseCount > 0 ? Math.round(totalResponseDays / responseCount) : null,
        };
    }
}
