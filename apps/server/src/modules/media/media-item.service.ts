import { MediaItem, MediaType, MediaStatus, MediaProgress, SeriesSeason, ExternalIds, User } from '@ycmm/core';
import { AppDatabase } from '../../app/database';
import { v4 as uuidv4 } from 'uuid';

export interface CreateMediaItemDto {
    type: MediaType;
    title: string;
    originalTitle?: string;
    year?: number;
    creator?: string;
    coverUrl?: string;
    description?: string;
    status?: MediaStatus;
    progress?: MediaProgress;
    seasons?: SeriesSeason[];
    rating?: number;
    review?: string;
    genre?: string[];
    tags?: string[];
    source?: string;
    externalIds?: ExternalIds;
}

export interface UpdateMediaItemDto {
    title?: string;
    originalTitle?: string;
    year?: number;
    creator?: string;
    coverUrl?: string;
    description?: string;
    status?: MediaStatus;
    startedAt?: Date;
    finishedAt?: Date;
    progress?: MediaProgress;
    seasons?: SeriesSeason[];
    rating?: number;
    review?: string;
    genre?: string[];
    tags?: string[];
    source?: string;
    externalIds?: ExternalIds;
}

export class MediaItemService {
    constructor(private database: AppDatabase) {}

    async getAll(userId: string): Promise<MediaItem[]> {
        return this.database.query(MediaItem)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .orderBy('updatedAt', 'desc')
            .find();
    }

    async getByType(userId: string, type: MediaType): Promise<MediaItem[]> {
        return this.database.query(MediaItem)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .filter({ type })
            .orderBy('updatedAt', 'desc')
            .find();
    }

    async getByStatus(userId: string, status: MediaStatus): Promise<MediaItem[]> {
        return this.database.query(MediaItem)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .filter({ status })
            .orderBy('updatedAt', 'desc')
            .find();
    }

    async getById(id: string, userId: string): Promise<MediaItem | undefined> {
        return this.database.query(MediaItem)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .filter({ id })
            .findOneOrUndefined();
    }

    async create(userId: string, dto: CreateMediaItemDto): Promise<MediaItem> {
        const item = new MediaItem();
        item.user = this.database.getReference(User, userId);
        item.type = dto.type;
        item.title = dto.title;
        item.originalTitle = dto.originalTitle || '';
        item.year = dto.year;
        item.creator = dto.creator || '';
        item.coverUrl = dto.coverUrl || '';
        item.description = dto.description || '';
        item.status = dto.status || 'wishlist';
        item.progress = dto.progress;
        item.seasons = dto.seasons;
        item.rating = dto.rating;
        item.review = dto.review || '';
        item.genre = dto.genre || [];
        item.tags = dto.tags || [];
        item.source = dto.source || '';
        item.externalIds = dto.externalIds;
        item.createdAt = new Date();
        item.updatedAt = new Date();

        await this.database.persist(item);
        return item;
    }

    async update(id: string, userId: string, dto: UpdateMediaItemDto): Promise<MediaItem | null> {
        const item = await this.getById(id, userId);
        if (!item) return null;

        if (dto.title !== undefined) item.title = dto.title;
        if (dto.originalTitle !== undefined) item.originalTitle = dto.originalTitle;
        if (dto.year !== undefined) item.year = dto.year;
        if (dto.creator !== undefined) item.creator = dto.creator;
        if (dto.coverUrl !== undefined) item.coverUrl = dto.coverUrl;
        if (dto.description !== undefined) item.description = dto.description;
        if (dto.status !== undefined) {
            const oldStatus = item.status;
            item.status = dto.status;
            // Track start and finish dates
            if (dto.status === 'in_progress' && oldStatus === 'wishlist') {
                item.startedAt = new Date();
            }
            if (dto.status === 'completed' && !item.finishedAt) {
                item.finishedAt = new Date();
            }
        }
        if (dto.startedAt !== undefined) item.startedAt = dto.startedAt;
        if (dto.finishedAt !== undefined) item.finishedAt = dto.finishedAt;
        if (dto.progress !== undefined) item.progress = dto.progress;
        if (dto.seasons !== undefined) item.seasons = dto.seasons;
        if (dto.rating !== undefined) item.rating = dto.rating;
        if (dto.review !== undefined) item.review = dto.review;
        if (dto.genre !== undefined) item.genre = dto.genre;
        if (dto.tags !== undefined) item.tags = dto.tags;
        if (dto.source !== undefined) item.source = dto.source;
        if (dto.externalIds !== undefined) item.externalIds = dto.externalIds;
        item.updatedAt = new Date();

        await this.database.persist(item);
        return item;
    }

    async delete(id: string, userId: string): Promise<boolean> {
        const item = await this.getById(id, userId);
        if (!item) return false;

        await this.database.remove(item);
        return true;
    }

    async updateProgress(id: string, userId: string, current: number): Promise<MediaItem | null> {
        const item = await this.getById(id, userId);
        if (!item || !item.progress) return null;

        item.progress.current = current;

        // Auto-complete if progress reaches total
        if (current >= item.progress.total && item.status === 'in_progress') {
            item.status = 'completed';
            item.finishedAt = new Date();
        }

        item.updatedAt = new Date();

        await this.database.persist(item);
        return item;
    }

    async getStats(userId: string): Promise<{
        total: number;
        byType: { type: MediaType; count: number }[];
        byStatus: { status: MediaStatus; count: number }[];
        completedThisYear: number;
        averageRating: number | null;
        totalWatchTime?: number;
        totalPagesRead?: number;
    }> {
        const all = await this.database.query(MediaItem)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .find();

        const byType: { type: MediaType; count: number }[] = [];
        const byStatus: { status: MediaStatus; count: number }[] = [];
        const typeCounts: Record<string, number> = {};
        const statusCounts: Record<string, number> = {};

        const currentYear = new Date().getFullYear();
        let completedThisYear = 0;
        let totalRating = 0;
        let ratingCount = 0;

        all.forEach(item => {
            typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;
            statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;

            if (item.finishedAt && new Date(item.finishedAt).getFullYear() === currentYear) {
                completedThisYear++;
            }

            if (item.rating) {
                totalRating += item.rating;
                ratingCount++;
            }
        });

        Object.entries(typeCounts).forEach(([type, count]) => {
            byType.push({ type: type as MediaType, count });
        });

        Object.entries(statusCounts).forEach(([status, count]) => {
            byStatus.push({ status: status as MediaStatus, count });
        });

        return {
            total: all.length,
            byType,
            byStatus,
            completedThisYear,
            averageRating: ratingCount > 0 ? Math.round((totalRating / ratingCount) * 10) / 10 : null,
        };
    }

    // For public profile
    async getPublicProfile(userId: string): Promise<{
        completed: MediaItem[];
        inProgress: MediaItem[];
        stats: {
            totalCompleted: number;
            byType: { type: MediaType; count: number }[];
        };
    }> {
        const all = await this.database.query(MediaItem)
            .useInnerJoinWith('user').filter({ id: userId }).end()
            .find();

        const completed = all.filter(i => i.status === 'completed');
        const inProgress = all.filter(i => i.status === 'in_progress');

        const typeCounts: Record<string, number> = {};
        completed.forEach(item => {
            typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;
        });

        return {
            completed: completed.slice(0, 20), // Last 20
            inProgress: inProgress.slice(0, 5), // Currently watching/reading
            stats: {
                totalCompleted: completed.length,
                byType: Object.entries(typeCounts).map(([type, count]) => ({
                    type: type as MediaType,
                    count,
                })),
            },
        };
    }
}
