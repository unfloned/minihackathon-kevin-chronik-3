import { useState, useMemo, useEffect } from 'react';
import {
    Text,
    Button,
    Group,
    Stack,
    Card,
    Badge,
    TextInput,
    Select,
    Textarea,
    NumberInput,
    Modal,
    ActionIcon,
    SimpleGrid,
    Progress,
    Image,
    SegmentedControl,
    Rating,
    MultiSelect,
    Paper,
} from '@mantine/core';
import { PageLayout, StatsGrid } from '../../../components/PageLayout';
import { useForm } from '@mantine/form';
import {
    IconMovie,
    IconBook,
    IconDeviceGamepad,
    IconDeviceTv,
    IconMicrophone,
    IconEdit,
    IconTrash,
    IconPlayerPlay,
    IconCheck,
    IconClock,
    IconX,
    IconLayoutGrid,
    IconList,
} from '@tabler/icons-react';
import { useRequest, useMutation } from '../../../hooks';

import type { MediaType, MediaStatus, MediaProgress, SeriesSeason, ExternalIds } from '@ycmm/core';

interface MediaItem {
    id: string;
    userId: string;
    type: MediaType;
    title: string;
    originalTitle: string;
    year?: number;
    creator: string;
    coverUrl: string;
    description: string;
    status: MediaStatus;
    startedAt?: string;
    finishedAt?: string;
    progress?: MediaProgress;
    seasons?: SeriesSeason[];
    rating?: number;
    review: string;
    genre: string[];
    tags: string[];
    source: string;
    externalIds?: ExternalIds;
    createdAt: string;
    updatedAt: string;
}

interface MediaStats {
    total: number;
    byType: { type: MediaType; count: number }[];
    byStatus: { status: MediaStatus; count: number }[];
    completedThisYear: number;
    averageRating: number | null;
}

interface CreateMediaDto {
    type: MediaType;
    title: string;
    originalTitle?: string;
    year?: number;
    creator?: string;
    coverUrl?: string;
    description?: string;
    status?: MediaStatus;
    rating?: number;
    review?: string;
    genre?: string[];
    tags?: string[];
    source?: string;
    progress?: MediaProgress;
}

const mediaTypes: { value: MediaType; label: string; icon: typeof IconMovie }[] = [
    { value: 'movie', label: 'Film', icon: IconMovie },
    { value: 'series', label: 'Serie', icon: IconDeviceTv },
    { value: 'book', label: 'Buch', icon: IconBook },
    { value: 'game', label: 'Spiel', icon: IconDeviceGamepad },
    { value: 'podcast', label: 'Podcast', icon: IconMicrophone },
    { value: 'anime', label: 'Anime', icon: IconDeviceTv },
];

const statusOptions: { value: MediaStatus; label: string; color: string; icon: typeof IconClock }[] = [
    { value: 'wishlist', label: 'Watchlist', color: 'blue', icon: IconClock },
    { value: 'in_progress', label: 'In Bearbeitung', color: 'yellow', icon: IconPlayerPlay },
    { value: 'completed', label: 'Abgeschlossen', color: 'green', icon: IconCheck },
    { value: 'on_hold', label: 'Pausiert', color: 'orange', icon: IconClock },
    { value: 'dropped', label: 'Abgebrochen', color: 'red', icon: IconX },
];

const genreOptions = [
    'Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime',
    'Documentary', 'Drama', 'Fantasy', 'Historical', 'Horror', 'Mystery',
    'Romance', 'Sci-Fi', 'Thriller', 'War', 'Western',
];

function getMediaIcon(type: MediaType) {
    const typeConfig = mediaTypes.find(t => t.value === type);
    const Icon = typeConfig?.icon || IconMovie;
    return <Icon size={18} />;
}

function getStatusBadge(status: MediaStatus) {
    const config = statusOptions.find(s => s.value === status);
    return (
        <Badge color={config?.color || 'gray'} size="sm">
            {config?.label || status}
        </Badge>
    );
}

export default function MediaPage() {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');


    const { data: items, isLoading, refetch } = useRequest<MediaItem[]>('/media');
    const { data: stats } = useRequest<MediaStats>('/media/stats');

    const { mutate: createItem } = useMutation<MediaItem, CreateMediaDto>(
        '/media',
        { method: 'POST' }
    );

    const { mutate: updateItem } = useMutation<MediaItem, { id: string } & Partial<CreateMediaDto>>(
        (vars) => `/media/${vars.id}`,
        { method: 'PATCH' }
    );

    const { mutate: deleteItem } = useMutation<{ success: boolean }, { id: string }>(
        (vars) => `/media/${vars.id}`,
        { method: 'DELETE' }
    );

    const form = useForm({
        initialValues: {
            type: 'movie' as MediaType,
            title: '',
            originalTitle: '',
            year: undefined as number | undefined,
            creator: '',
            coverUrl: '',
            description: '',
            status: 'wishlist' as MediaStatus,
            rating: undefined as number | undefined,
            review: '',
            genre: [] as string[],
            tags: [] as string[],
            source: '',
            progressCurrent: 0,
            progressTotal: 0,
            progressUnit: '',
        },
    });

    const filteredItems = useMemo(() => {
        if (!items) return [];
        return items.filter(item => {
            const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.creator.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = typeFilter === 'all' || item.type === typeFilter;
            const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
            return matchesSearch && matchesType && matchesStatus;
        });
    }, [items, searchQuery, typeFilter, statusFilter]);

    const openCreateModal = () => {
        setEditingItem(null);
        form.reset();
        setModalOpen(true);
    };

