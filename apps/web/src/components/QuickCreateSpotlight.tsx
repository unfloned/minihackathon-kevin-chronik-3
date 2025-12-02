import { ReactNode, useEffect, useState } from 'react';
import { Modal, Stack, UnstyledButton, Group, ThemeIcon, Text, TextInput, Kbd } from '@mantine/core';
import { useHotkeys } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { useNavigate } from 'react-router-dom';
import {
    IconPlus,
    IconTarget,
    IconCoin,
    IconCalendarDue,
    IconCreditCard,
    IconNote,
    IconListCheck,
    IconFolderCode,
    IconMovie,
    IconToolsKitchen2,
    IconBox,
    IconBriefcase,
    IconGift,
    IconSearch,
} from '@tabler/icons-react';
import { useQuickCreate, QuickCreateType } from '../contexts/QuickCreateContext';
import { createModalTitles } from './CreateModals';

interface CreateOption {
    type: QuickCreateType;
    label: string;
    description: string;
    icon: typeof IconPlus;
    color: string;
    keywords: string[];
}

const createOptions: CreateOption[] = [
    {
        type: 'habit',
        label: 'Neues Habit',
        description: 'Tägliche Gewohnheit erstellen',
        icon: IconTarget,
        color: 'green',
        keywords: ['habit', 'gewohnheit', 'routine', 'täglich'],
    },
    {
        type: 'expense',
        label: 'Neue Ausgabe',
        description: 'Ausgabe erfassen',
        icon: IconCoin,
        color: 'yellow',
        keywords: ['ausgabe', 'geld', 'kosten', 'bezahlt'],
    },
    {
        type: 'deadline',
        label: 'Neue Frist',
        description: 'Deadline oder Termin',
        icon: IconCalendarDue,
        color: 'red',
        keywords: ['frist', 'deadline', 'termin', 'datum'],
    },
    {
        type: 'subscription',
        label: 'Neues Abo',
        description: 'Abonnement hinzufügen',
        icon: IconCreditCard,
        color: 'violet',
        keywords: ['abo', 'abonnement', 'subscription', 'monatlich'],
    },
    {
        type: 'project',
        label: 'Neues Projekt',
        description: 'Projekt oder Ziel anlegen',
        icon: IconFolderCode,
        color: 'blue',
        keywords: ['projekt', 'project', 'ziel', 'goal'],
    },
    {
        type: 'note',
        label: 'Neue Notiz',
        description: 'Notiz schreiben',
        icon: IconNote,
        color: 'orange',
        keywords: ['notiz', 'note', 'memo', 'text'],
    },
    {
        type: 'list',
        label: 'Neue Liste',
        description: 'To-Do Liste erstellen',
        icon: IconListCheck,
        color: 'teal',
        keywords: ['liste', 'list', 'todo', 'aufgaben'],
    },
    {
        type: 'media',
        label: 'Neues Medium',
        description: 'Film, Serie, Buch hinzufügen',
        icon: IconMovie,
        color: 'pink',
        keywords: ['media', 'film', 'serie', 'buch', 'game'],
    },
    {
        type: 'meal',
        label: 'Neues Rezept',
        description: 'Rezept hinzufügen',
        icon: IconToolsKitchen2,
        color: 'lime',
        keywords: ['rezept', 'meal', 'essen', 'kochen'],
    },
    {
        type: 'inventory',
        label: 'Neuer Gegenstand',
        description: 'Inventar erweitern',
        icon: IconBox,
        color: 'gray',
        keywords: ['inventar', 'gegenstand', 'sache', 'besitz'],
    },
    {
        type: 'application',
        label: 'Neue Bewerbung',
        description: 'Bewerbung tracken',
        icon: IconBriefcase,
        color: 'cyan',
        keywords: ['bewerbung', 'job', 'application', 'stelle'],
    },
    {
        type: 'wishlist',
        label: 'Neuer Wunsch',
        description: 'Zur Wunschliste hinzufügen',
        icon: IconGift,
        color: 'grape',
        keywords: ['wunsch', 'wishlist', 'geschenk', 'kaufen'],
    },
];

interface QuickCreateSpotlightProps {
    children: ReactNode;
}

// Map QuickCreateType to modal ID
const typeToModalId: Record<Exclude<QuickCreateType, null>, string> = {
    habit: 'habitCreate',
    expense: 'expenseCreate',
    deadline: 'deadlineCreate',
    subscription: 'subscriptionCreate',
    note: 'note', // Special case - navigates to page
    list: 'listCreate',
    project: 'projectCreate',
    media: 'mediaCreate',
    meal: 'mealCreate',
    inventory: 'inventoryCreate',
    application: 'applicationCreate',
    wishlist: 'wishlistCreate',
};

export function QuickCreateSpotlight({ children }: QuickCreateSpotlightProps) {
    const [search, setSearch] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const { isSpotlightOpen, openSpotlight, closeSpotlight } = useQuickCreate();
    const navigate = useNavigate();

    // Filter options based on search
    const filteredOptions = createOptions.filter((option) => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        return (
            option.label.toLowerCase().includes(searchLower) ||
            option.description.toLowerCase().includes(searchLower) ||
            option.keywords.some((kw) => kw.includes(searchLower))
        );
    });

    // Reset selection when filtered list changes
    useEffect(() => {
        setSelectedIndex(0);
    }, [search]);

    // Reset search when opening
    useEffect(() => {
        if (isSpotlightOpen) {
            setSearch('');
            setSelectedIndex(0);
        }
    }, [isSpotlightOpen]);

    // Open with CMD+J
    useHotkeys([
        ['mod+j', (e) => {
            e.preventDefault();
            openSpotlight();
        }],
    ]);

    const handleSelect = (type: QuickCreateType) => {
        closeSpotlight();
        setSearch('');

        if (!type) return;

        // Special case for notes - navigate to new page
        if (type === 'note') {
            navigate('/app/notes/new');
            return;
        }

        // Open the context modal directly
        const modalId = typeToModalId[type];
        modals.openContextModal({
            modal: modalId,
            title: createModalTitles[modalId as keyof typeof createModalTitles],
            innerProps: {
                onSuccess: () => {
                    // Optionally refresh data or navigate
                },
            },
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((i) => Math.min(i + 1, filteredOptions.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === 'Enter' && filteredOptions[selectedIndex]) {
            e.preventDefault();
            handleSelect(filteredOptions[selectedIndex].type);
        }
    };

    return (
        <>
            <Modal
                opened={isSpotlightOpen}
                onClose={closeSpotlight}
                title={
                    <Group gap="xs">
                        <IconPlus size={20} />
                        <Text fw={600}>Schnell erstellen</Text>
                        <Kbd size="xs">⌘J</Kbd>
                    </Group>
                }
                size="md"
                padding="md"
            >
                <Stack gap="sm">
                    <TextInput
                        placeholder="Suchen..."
                        leftSection={<IconSearch size={16} />}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        data-autofocus
                    />

                    <Stack gap={4}>
                        {filteredOptions.length === 0 ? (
                            <Text c="dimmed" ta="center" py="md">
                                Keine Ergebnisse
                            </Text>
                        ) : (
                            filteredOptions.map((option, index) => {
                                const Icon = option.icon;
                                const isSelected = index === selectedIndex;

                                return (
                                    <UnstyledButton
                                        key={option.type}
                                        onClick={() => handleSelect(option.type)}
                                        style={(theme) => ({
                                            padding: theme.spacing.sm,
                                            borderRadius: theme.radius.md,
                                            backgroundColor: isSelected
                                                ? `var(--mantine-color-${option.color}-light)`
                                                : undefined,
                                            '&:hover': {
                                                backgroundColor: `var(--mantine-color-${option.color}-light)`,
                                            },
                                        })}
                                        onMouseEnter={() => setSelectedIndex(index)}
                                    >
                                        <Group gap="sm">
                                            <ThemeIcon
                                                size={36}
                                                radius="md"
                                                variant="light"
                                                color={option.color}
                                            >
                                                <Icon size={20} />
                                            </ThemeIcon>
                                            <div>
                                                <Text size="sm" fw={500}>
                                                    {option.label}
                                                </Text>
                                                <Text size="xs" c="dimmed">
                                                    {option.description}
                                                </Text>
                                            </div>
                                        </Group>
                                    </UnstyledButton>
                                );
                            })
                        )}
                    </Stack>
                </Stack>
            </Modal>
            {children}
        </>
    );
}
