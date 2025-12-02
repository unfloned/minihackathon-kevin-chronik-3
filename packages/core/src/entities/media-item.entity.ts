import { entity, PrimaryKey, Index } from '@deepkit/type';

export type MediaType = 'book' | 'movie' | 'series' | 'game' | 'podcast' | 'anime';

export type MediaStatus =
    | 'wishlist'
    | 'in_progress'
    | 'completed'
    | 'dropped'
    | 'on_hold';

export interface MediaProgress {
    current: number;
    total: number;
    unit: string; // "Seiten", "Episoden", "Stunden"
}

export interface SeriesSeason {
    number: number;
    episodes: number;
    watched: number;
}

export interface ExternalIds {
    imdb?: string;
    tmdb?: string;
    isbn?: string;
    steam?: string;
}

@entity.name('media_items')
export class MediaItem {
    id: string & PrimaryKey = '';
    userId: string & Index = '';
    type: MediaType = 'movie';

    // Basic Info
    title: string = '';
    originalTitle: string = '';
    year?: number;
    creator: string = ''; // Author, Director, Studio
    coverUrl: string = '';
    description: string = '';

    // Status
    status: MediaStatus = 'wishlist';
    startedAt?: Date;
    finishedAt?: Date;

    // Progress
    progress?: MediaProgress;

    // For series
    seasons?: SeriesSeason[];

    // Rating
    rating?: number; // 1-10
    review: string = '';

    // Categorization
    genre: string[] = [];
    tags: string[] = [];
    source: string = ''; // Netflix, Kindle, Steam

    // External IDs
    externalIds?: ExternalIds;

    // Meta
    createdAt: Date = new Date();
    updatedAt: Date = new Date();
}
