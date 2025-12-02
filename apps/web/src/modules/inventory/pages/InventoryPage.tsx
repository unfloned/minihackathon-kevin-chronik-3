import { useState, useEffect } from 'react';
import {
    Container,
    Title,
    Text,
    SimpleGrid,
    Card,
    Group,
    Stack,
    Button,
    ActionIcon,
    Badge,
    Modal,
    TextInput,
    Textarea,
    NumberInput,
    Select,
    Menu,
    Paper,
    Skeleton,
    ThemeIcon,
    Table,
    Tabs,
    Tooltip,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import {
    IconPlus,
    IconSearch,
    IconDotsVertical,
    IconEdit,
    IconTrash,
    IconBox,
    IconMapPin,
    IconTag,
    IconUser,
    IconArrowBack,
    IconCurrencyEuro,
    IconQrcode,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useRequest, useMutation } from '../../../hooks';


interface ItemLocation {
    area: string;
    container?: string;
    details?: string;
}

interface ItemLent {
    to: string;
    since: string;
    expectedReturn?: string;
}

interface InventoryItem {
    id: string;
    name: string;
    description: string;
    photos: string[];
    category: string;
    tags: string[];
    location: ItemLocation;
    quantity: number;
    purchaseDate?: string;
    purchasePrice?: number;
    currentValue?: number;
    serialNumber: string;
    qrCode: string;
    isLent?: ItemLent;
    createdAt: string;
    updatedAt: string;
}

interface CreateItemForm {
    name: string;
    description: string;
    category: string;
    location: ItemLocation;
    quantity: number;
    purchasePrice?: number;
    currentValue?: number;
    serialNumber: string;
}

const defaultForm: CreateItemForm = {
    name: '',
    description: '',
    category: '',
    location: { area: '' },
    quantity: 1,
    serialNumber: '',
};

export default function InventoryPage() {
    const [opened, { open, close }] = useDisclosure(false);
    const [lendOpened, { open: openLend, close: closeLend }] = useDisclosure(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [lendingItem, setLendingItem] = useState<InventoryItem | null>(null);
    const [form, setForm] = useState<CreateItemForm>(defaultForm);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState<string | null>(null);
    const [filterLocation, setFilterLocation] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [lendTo, setLendTo] = useState('');
    const [lendReturn, setLendReturn] = useState<Date | null>(null);

    const { data: items, isLoading, refetch } = useRequest<InventoryItem[]>('/inventory');
    const { data: categories } = useRequest<string[]>('/inventory/categories');
    const { data: locations } = useRequest<{ area: string; containers: string[] }[]>('/inventory/locations');
    const { data: stats } = useRequest<{
        totalItems: number;
        totalValue: number;
        lentItems: number;
        categories: number;
        locations: number;
    }>('/inventory/stats');

    const { mutate: createItem, isLoading: creating } = useMutation<InventoryItem, CreateItemForm>(
        '/inventory',
        { method: 'POST' }
    );

    const { mutate: updateItem } = useMutation<InventoryItem, { id: string; data: Partial<CreateItemForm> }>(
        (vars) => `/inventory/${vars.id}`,
        { method: 'PATCH' }
    );

    const { mutate: deleteItem } = useMutation<void, { id: string }>(
        (vars) => `/inventory/${vars.id}`,
        { method: 'DELETE' }
    );

    const { mutate: lendItem } = useMutation<InventoryItem, { id: string; to: string; expectedReturn?: string }>(
        (vars) => `/inventory/${vars.id}/lend`,
        { method: 'POST' }
    );

    const { mutate: returnItem } = useMutation<InventoryItem, { id: string }>(
        (vars) => `/inventory/${vars.id}/return`,
        { method: 'POST' }
    );

    const handleOpenCreate = () => {
        setEditingItem(null);
        setForm(defaultForm);
        open();
    };


