import type {
    MediaType,
    MediaStatus,
    MediaItemWithDetails,
    CreateMediaItemDto,
} from '@ycmm/core';
import {
    IconMovie,
    IconBook,
    IconDeviceGamepad,
    IconDeviceTv,
    IconMicrophone,
} from '@tabler/icons-react';

// Type aliases for component usage
export type MediaItem = MediaItemWithDetails;
export type CreateMediaDto = CreateMediaItemDto;

// Export core types from @ycmm/core
export type { MediaType, MediaStatus };

// Icon mapping
export const mediaTypeIcons: Record<MediaType, typeof IconMovie> = {
    movie: IconMovie,
    series: IconDeviceTv,
    book: IconBook,
    game: IconDeviceGamepad,
    podcast: IconMicrophone,
    anime: IconDeviceTv,
};

// Type and status keys
export const mediaTypeKeys: MediaType[] = ['movie', 'series', 'book', 'game', 'podcast', 'anime'];
export const statusKeys: MediaStatus[] = ['wishlist', 'in_progress', 'completed', 'on_hold', 'dropped'];

// Status colors
export const statusColors: Record<MediaStatus, string> = {
    wishlist: 'blue',
    in_progress: 'yellow',
    completed: 'green',
    on_hold: 'orange',
    dropped: 'red',
};

// Genre options
export const genreOptions = [
    'Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime',
    'Documentary', 'Drama', 'Fantasy', 'Historical', 'Horror', 'Mystery',
    'Romance', 'Sci-Fi', 'Thriller', 'War', 'Western',
];

// Default form values
export interface MediaFormValues {
    type: MediaType;
    title: string;
    originalTitle: string;
    year: number | undefined;
    creator: string;
    coverUrl: string;
    description: string;
    status: MediaStatus;
    rating: number | undefined;
    review: string;
    genre: string[];
    tags: string[];
    source: string;
    progressCurrent: number;
    progressTotal: number;
    progressUnit: string;
}

export const defaultFormValues: MediaFormValues = {
    type: 'movie',
    title: '',
    originalTitle: '',
    year: undefined,
    creator: '',
    coverUrl: '',
    description: '',
    status: 'wishlist',
    rating: undefined,
    review: '',
    genre: [],
    tags: [],
    source: '',
    progressCurrent: 0,
    progressTotal: 0,
    progressUnit: '',
};
