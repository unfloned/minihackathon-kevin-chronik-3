import { useState, useMemo, useEffect } from 'react';
import {
    Container,
    Title,
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
    Image,
    Tabs,
    ThemeIcon,
    Switch,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
    IconPlus,
    IconSearch,
    IconHeart,
    IconShoppingCart,
    IconGift,
    IconCheck,
    IconEdit,
    IconTrash,
    IconExternalLink,
    IconCurrencyEuro,
    IconDevices,
    IconShirt,
    IconHome,
    IconPalette,
    IconBook,
    IconPlane,
    IconStar,
    IconDots,
} from '@tabler/icons-react';
import { useRequest, useMutation } from '../../../hooks';

import type { WishlistPriority, WishlistCategory, PriceInfo } from '@ycmm/core';

interface WishlistItem {
    id: string;
    userId: string;
    name: string;
    description: string;
    imageUrl: string;
    productUrl: string;
    category: WishlistCategory;
    tags: string[];
    priority: WishlistPriority;
    isPurchased: boolean;
    purchasedAt?: string;
    price?: PriceInfo;
    targetPrice?: number;
    isGiftIdea: boolean;
    giftFor?: string;
    occasion?: string;
    notes: string;
    store: string;
    createdAt: string;
    updatedAt: string;
}

interface WishlistStats {
    totalItems: number;
    totalWishlists: number;
    purchased: number;
    totalValue: number;
    byCategory: { category: WishlistCategory; count: number }[];
    byPriority: { priority: WishlistPriority; count: number }[];
    giftIdeas: number;
}

interface CreateWishlistItemDto {
    name: string;
    description?: string;
    imageUrl?: string;
    productUrl?: string;
    category?: WishlistCategory;
    priority?: WishlistPriority;
    price?: PriceInfo;
    targetPrice?: number;
    isGiftIdea?: boolean;
    giftFor?: string;
    occasion?: string;
    notes?: string;
    store?: string;
}

const categoryOptions: { value: WishlistCategory; label: string; icon: typeof IconDevices }[] = [
    { value: 'tech', label: 'Technik', icon: IconDevices },
    { value: 'fashion', label: 'Mode', icon: IconShirt },
    { value: 'home', label: 'Zuhause', icon: IconHome },
    { value: 'hobby', label: 'Hobby', icon: IconPalette },
    { value: 'books', label: 'Bücher', icon: IconBook },
    { value: 'travel', label: 'Reisen', icon: IconPlane },
    { value: 'experience', label: 'Erlebnis', icon: IconStar },
    { value: 'other', label: 'Sonstiges', icon: IconDots },
];

const priorityOptions: { value: WishlistPriority; label: string; color: string }[] = [
    { value: 'low', label: 'Niedrig', color: 'gray' },
    { value: 'medium', label: 'Mittel', color: 'blue' },
    { value: 'high', label: 'Hoch', color: 'orange' },
    { value: 'must_have', label: 'Must-Have', color: 'red' },
];

function getCategoryIcon(category: WishlistCategory) {
    const config = categoryOptions.find(c => c.value === category);
    const Icon = config?.icon || IconDots;
    return <Icon size={16} />;
}

function getPriorityBadge(priority: WishlistPriority) {
    const config = priorityOptions.find(p => p.value === priority);
    return (
        <Badge size="xs" color={config?.color || 'gray'}>
            {config?.label || priority}
        </Badge>
    );
}

function formatPrice(price?: PriceInfo): string {
    if (!price) return '-';
    return `${price.amount.toFixed(2)} ${price.currency}`;
}

export default function WishlistsPage() {
    const [activeTab, setActiveTab] = useState<string | null>('all');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<WishlistItem | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');

    const { data: items, isLoading, refetch } = useRequest<WishlistItem[]>('/wishlist-items');
    const { data: stats } = useRequest<WishlistStats>('/wishlist-items/stats');

    const { mutate: createItem } = useMutation<WishlistItem, CreateWishlistItemDto>(
        '/wishlist-items',
        { method: 'POST' }
    );

    const { mutate: updateItem } = useMutation<WishlistItem, { id: string; data: Partial<CreateWishlistItemDto> }>(
        (vars) => `/wishlist-items/${vars.id}`,
        { method: 'PATCH' }
    );

    const { mutate: deleteItem } = useMutation<{ success: boolean }, { id: string }>(
        (vars) => `/wishlist-items/${vars.id}`,
        { method: 'DELETE' }
    );

    const { mutate: purchaseItem } = useMutation<WishlistItem, { id: string }>(
        (vars) => `/wishlist-items/${vars.id}/purchase`,
        { method: 'POST' }
    );

    const form = useForm({
        initialValues: {
            name: '',
            description: '',
            imageUrl: '',
            productUrl: '',
            category: 'other' as WishlistCategory,
            priority: 'medium' as WishlistPriority,
            priceAmount: undefined as number | undefined,
            priceCurrency: 'EUR',
            targetPrice: undefined as number | undefined,
            isGiftIdea: false,
            giftFor: '',
            occasion: '',
            notes: '',
            store: '',
        },
    });

    const filteredItems = useMemo(() => {
        if (!items) return [];
        let filtered = items.filter(item => {
            // Tab filter
            if (activeTab === 'gifts' && !item.isGiftIdea) return false;
            if (activeTab === 'purchased' && !item.isPurchased) return false;
            if (activeTab === 'all' && item.isPurchased) return false;

            // Search
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.store.toLowerCase().includes(searchQuery.toLowerCase());

            // Filters
            const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
            const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;

            return matchesSearch && matchesCategory && matchesPriority;
        });

        // Sort by priority
        const priorityOrder: Record<WishlistPriority, number> = { must_have: 0, high: 1, medium: 2, low: 3 };
        filtered.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

        return filtered;
    }, [items, activeTab, searchQuery, categoryFilter, priorityFilter]);

    const openCreateModal = () => {
        setEditingItem(null);
        form.reset();
        setModalOpen(true);
    };


