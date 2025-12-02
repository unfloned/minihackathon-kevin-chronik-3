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
    Select,
    ColorInput,
    Menu,
    Paper,
    Skeleton,
    Progress,
    Checkbox,
    ThemeIcon,
    SegmentedControl,
    Divider,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
    IconPlus,
    IconSearch,
    IconDotsVertical,
    IconEdit,
    IconTrash,
    IconArchive,
    IconArchiveOff,
    IconList,
    IconShoppingCart,
    IconChecklist,
    IconBriefcase,
    IconShare,
    IconCheck,
    IconX,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useRequest, useMutation } from '../../../hooks';


type ListType = 'shopping' | 'todo' | 'packing' | 'checklist' | 'custom';
type ListItemPriority = 'low' | 'medium' | 'high';

interface ListItem {
    id: string;
    text: string;
    completed: boolean;
    quantity?: number;
    unit?: string;
    note?: string;
    priority?: ListItemPriority;
    order: number;
}

interface List {
    id: string;
    name: string;
    description: string;
    type: ListType;
    icon: string;
    color: string;
    items: ListItem[];
    isPublic: boolean;
    publicSlug: string;
    isArchived: boolean;
    createdAt: string;
    updatedAt: string;
}

interface CreateListForm {
    name: string;
    description: string;
    type: ListType;
    color: string;
}

const defaultForm: CreateListForm = {
    name: '',
    description: '',
    type: 'todo',
    color: '#228be6',
};

const listTypeOptions = [
    { value: 'shopping', label: 'Einkaufsliste' },
    { value: 'todo', label: 'To-Do Liste' },
    { value: 'packing', label: 'Packliste' },
    { value: 'checklist', label: 'Checkliste' },
    { value: 'custom', label: 'Benutzerdefiniert' },
];

const getTypeIcon = (type: ListType) => {
    switch (type) {
        case 'shopping': return IconShoppingCart;
        case 'todo': return IconChecklist;
        case 'packing': return IconBriefcase;
        case 'checklist': return IconCheck;
        default: return IconList;
    }
};

export default function ListsPage() {
    const [opened, { open, close }] = useDisclosure(false);
    const [editingList, setEditingList] = useState<List | null>(null);
    const [selectedList, setSelectedList] = useState<List | null>(null);
    const [form, setForm] = useState<CreateListForm>(defaultForm);
    const [searchQuery, setSearchQuery] = useState('');
    const [view, setView] = useState<'active' | 'archived'>('active');
    const [newItemText, setNewItemText] = useState('');


    const { data: lists, isLoading, refetch } = useRequest<List[]>('/lists');
    const { data: archivedLists, refetch: refetchArchived } = useRequest<List[]>('/lists/archived');

