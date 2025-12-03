import { entity, PrimaryKey, Reference, uuid, UUID } from '@deepkit/type';
import { User } from './user.entity.js';

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
    unit: string;
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
    id: UUID & PrimaryKey = uuid();
    user!: User & Reference;

    type: MediaType = 'movie';

    title: string = '';
    originalTitle: string = '';
    year?: number;
    creator: string = '';
    coverUrl: string = '';
    description: string = '';

    status: MediaStatus = 'wishlist';
    startedAt?: Date;
    finishedAt?: Date;

    progress?: MediaProgress;

    seasons?: SeriesSeason[];

    rating?: number;
    review: string = '';

    genre: string[] = [];
    tags: string[] = [];
    source: string = '';

    externalIds?: ExternalIds;

    createdAt: Date = new Date();
    updatedAt: Date = new Date();
}

export type MediaItemFrontend = Readonly<MediaItem>;
