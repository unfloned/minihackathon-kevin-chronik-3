import { ReactNode, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spotlight, SpotlightActionData } from '@mantine/spotlight';
import {
    IconHome,
    IconTarget,
    IconWallet,
    IconCalendarDue,
    IconReceipt,
    IconTrophy,
    IconNote,
    IconListCheck,
    IconFolderCode,
    IconBox,
    IconBriefcase,
    IconMovie,
    IconToolsKitchen2,
    IconGift,
    IconSettings,
    IconSearch,
    IconSubtask,
    IconBook,
    IconDeviceTv,
    IconDeviceGamepad,
    IconMusic,
    IconChecklist,
} from '@tabler/icons-react';
import { api } from '../config/api';
import { useAuth } from '../contexts/AuthContext';

// Types for fetched data
interface ProjectTask {
    id: string;
    title: string;
    completed: boolean;
    priority: string;
}

interface Project {
    id: string;
    name: string;
    description: string;
    type: 'project' | 'goal';
    status: string;
    tasks: ProjectTask[];
}

interface MediaItem {
    id: string;
    title: string;
    type: 'movie' | 'series' | 'book' | 'game' | 'music';
    status: string;
}

interface Note {
    id: string;
    title: string;
    content: string;
}

interface List {
    id: string;
    name: string;
    items: { id: string; text: string; completed: boolean }[];
}

interface Habit {
    id: string;
    name: string;
    description?: string;
}

interface Deadline {
    id: string;
    title: string;
    dueDate: string;
}

interface Application {
    id: string;
    company: string;
    position: string;
    status: string;
}

interface InventoryItem {
    id: string;
    name: string;
    category: string;
}

// Navigation actions (static)
const navigationActions: SpotlightActionData[] = [
    {
        id: 'nav-dashboard',
        label: 'Dashboard',
        description: 'Zur Übersicht',
        leftSection: <IconHome size={20} />,
        keywords: ['home', 'start', 'übersicht', 'main'],
    },
    {
        id: 'nav-habits',
        label: 'Habits',
        description: 'Gewohnheiten verwalten',
        leftSection: <IconTarget size={20} />,
        keywords: ['gewohnheiten', 'tracking', 'täglich', 'routine'],
    },
    {
        id: 'nav-expenses',
        label: 'Ausgaben',
        description: 'Finanzen verwalten',
        leftSection: <IconWallet size={20} />,
        keywords: ['finanzen', 'geld', 'budget', 'kosten', 'money'],
    },
    {
        id: 'nav-deadlines',
        label: 'Fristen',
        description: 'Termine und Deadlines',
        leftSection: <IconCalendarDue size={20} />,
        keywords: ['termine', 'kalender', 'wichtig', 'erinnerung'],
    },
    {
        id: 'nav-subscriptions',
        label: 'Abonnements',
        description: 'Abos verwalten',
        leftSection: <IconReceipt size={20} />,
        keywords: ['abo', 'netflix', 'spotify', 'monatlich'],
    },
    {
        id: 'nav-achievements',
        label: 'Achievements',
        description: 'Erfolge und XP',
        leftSection: <IconTrophy size={20} />,
        keywords: ['erfolge', 'punkte', 'level', 'gamification'],
    },
    {
        id: 'nav-notes',
        label: 'Notizen',
        description: 'Notizen und Ideen',
        leftSection: <IconNote size={20} />,
        keywords: ['ideen', 'memo', 'schreiben', 'text'],
    },
    {
        id: 'nav-lists',
        label: 'Listen',
        description: 'To-Do Listen',
        leftSection: <IconListCheck size={20} />,
        keywords: ['todo', 'aufgaben', 'tasks', 'einkauf'],
    },
    {
        id: 'nav-projects',
        label: 'Projekte',
        description: 'Projektmanagement',
        leftSection: <IconFolderCode size={20} />,
        keywords: ['arbeit', 'tasks', 'planning', 'kanban'],
    },
    {
        id: 'nav-inventory',
        label: 'Inventar',
        description: 'Besitz verwalten',
        leftSection: <IconBox size={20} />,
        keywords: ['sachen', 'besitz', 'gegenstände', 'lager'],
    },
    {
        id: 'nav-applications',
        label: 'Bewerbungen',
        description: 'Bewerbungen tracken',
        leftSection: <IconBriefcase size={20} />,
        keywords: ['job', 'arbeit', 'career', 'interview'],
    },
    {
        id: 'nav-media',
        label: 'Mediathek',
        description: 'Filme, Serien, Bücher',
        leftSection: <IconMovie size={20} />,
        keywords: ['filme', 'serien', 'bücher', 'games', 'watchlist'],
    },
    {
        id: 'nav-meals',
        label: 'Mahlzeiten',
        description: 'Rezepte und Planung',
        leftSection: <IconToolsKitchen2 size={20} />,
        keywords: ['essen', 'kochen', 'rezepte', 'wochenplan'],
    },
    {
        id: 'nav-wishlists',
        label: 'Wunschlisten',
        description: 'Wünsche und Geschenke',
        leftSection: <IconGift size={20} />,
        keywords: ['wünsche', 'geschenke', 'kaufen', 'shop'],
    },
    {
        id: 'nav-settings',
        label: 'Einstellungen',
        description: 'App konfigurieren',
        leftSection: <IconSettings size={20} />,
        keywords: ['config', 'profil', 'account', 'theme'],
    },
];

const getMediaIcon = (type: string) => {
    switch (type) {
        case 'movie': return <IconMovie size={18} />;
        case 'series': return <IconDeviceTv size={18} />;
        case 'book': return <IconBook size={18} />;
        case 'game': return <IconDeviceGamepad size={18} />;
        case 'music': return <IconMusic size={18} />;
        default: return <IconMovie size={18} />;
    }
};

const getMediaTypeLabel = (type: string) => {
    switch (type) {
        case 'movie': return 'Film';
        case 'series': return 'Serie';
        case 'book': return 'Buch';
        case 'game': return 'Spiel';
        case 'music': return 'Musik';
        default: return type;
    }
};

interface AppSpotlightProps {
    children: ReactNode;
}

export function AppSpotlight({ children }: AppSpotlightProps) {
    const navigate = useNavigate();
    const { user } = useAuth();

    // State for fetched data
    const [projects, setProjects] = useState<Project[]>([]);
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [lists, setLists] = useState<List[]>([]);
    const [habits, setHabits] = useState<Habit[]>([]);
    const [deadlines, setDeadlines] = useState<Deadline[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Fetch all data when user is logged in
    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                const [
                    projectsData,
                    mediaData,
                    notesData,
                    listsData,
                    habitsData,
                    deadlinesData,
                    applicationsData,
                    inventoryData,
                ] = await Promise.all([
                    api.get<Project[]>('/projects').catch(() => []),
                    api.get<MediaItem[]>('/media').catch(() => []),
                    api.get<Note[]>('/notes').catch(() => []),
                    api.get<List[]>('/lists').catch(() => []),
                    api.get<Habit[]>('/habits').catch(() => []),
                    api.get<Deadline[]>('/deadlines').catch(() => []),
                    api.get<Application[]>('/applications').catch(() => []),
                    api.get<InventoryItem[]>('/inventory').catch(() => []),
                ]);

                setProjects(projectsData || []);
                setMedia(mediaData || []);
                setNotes(notesData || []);
                setLists(listsData || []);
                setHabits(habitsData || []);
                setDeadlines(deadlinesData || []);
                setApplications(applicationsData || []);
                setInventory(inventoryData || []);
                setIsLoaded(true);
            } catch (error) {
                console.error('Failed to fetch spotlight data:', error);
                setIsLoaded(true);
            }
        };

        fetchData();
    }, [user]);

    // Build all actions as flat array (groups don't filter well)
    const allActions = useMemo(() => {
        const actions: SpotlightActionData[] = [];

        if (!isLoaded) {
            // Only show navigation when data isn't loaded yet
            navigationActions.forEach((action) => {
                actions.push({
                    ...action,
                    group: 'Navigation',
                    onClick: () => {
                        const id = action.id.replace('nav-', '');
                        const path = id === 'dashboard' ? '/app' : `/app/${id}`;
                        navigate(path);
                    },
                });
            });
            return actions;
        }

        // Projects
        projects.forEach((project) => {
            actions.push({
                id: `project-${project.id}`,
                label: project.name,
                description: project.description || `${project.type === 'goal' ? 'Ziel' : 'Projekt'} - ${project.status}`,
                leftSection: project.type === 'goal' ? <IconTarget size={18} /> : <IconFolderCode size={18} />,
                keywords: [project.name, project.type, project.status],
                group: 'Projekte',
                onClick: () => navigate(`/app/projects/${project.id}`),
            });

            // Tasks from this project
            (project.tasks || [])
                .filter((task) => !task.completed)
                .forEach((task) => {
                    actions.push({
                        id: `task-${project.id}-${task.id}`,
                        label: task.title,
                        description: `in ${project.name} • ${task.priority === 'high' ? 'Hoch' : task.priority === 'medium' ? 'Mittel' : 'Niedrig'}`,
                        leftSection: <IconSubtask size={18} />,
                        keywords: [task.title, project.name, task.priority],
                        group: 'Aufgaben',
                        onClick: () => navigate(`/app/projects/${project.id}`),
                    });
                });
        });

        // Media
        media.forEach((item) => {
            actions.push({
                id: `media-${item.id}`,
                label: item.title,
                description: `${getMediaTypeLabel(item.type)} • ${item.status}`,
                leftSection: getMediaIcon(item.type),
                keywords: [item.title, item.type, item.status, getMediaTypeLabel(item.type)],
                group: 'Medien',
                onClick: () => navigate('/app/media'),
            });
        });

        // Notes
        notes.forEach((note) => {
            actions.push({
                id: `note-${note.id}`,
                label: note.title,
                description: note.content?.substring(0, 50) + (note.content?.length > 50 ? '...' : '') || '',
                leftSection: <IconNote size={18} />,
                keywords: [note.title, note.content || ''],
                group: 'Notizen',
                onClick: () => navigate('/app/notes'),
            });
        });

        // Lists
        lists.forEach((list) => {
            actions.push({
                id: `list-${list.id}`,
                label: list.name,
                description: `${list.items?.length || 0} Einträge`,
                leftSection: <IconListCheck size={18} />,
                keywords: [list.name, ...(list.items?.map(i => i.text) || [])],
                group: 'Listen',
                onClick: () => navigate('/app/lists'),
            });
        });

        // Habits
        habits.forEach((habit) => {
            actions.push({
                id: `habit-${habit.id}`,
                label: habit.name,
                description: habit.description || 'Gewohnheit',
                leftSection: <IconChecklist size={18} />,
                keywords: [habit.name, habit.description || ''],
                group: 'Habits',
                onClick: () => navigate('/app/habits'),
            });
        });

        // Deadlines
        deadlines.forEach((deadline) => {
            actions.push({
                id: `deadline-${deadline.id}`,
                label: deadline.title,
                description: `Fällig: ${new Date(deadline.dueDate).toLocaleDateString('de-DE')}`,
                leftSection: <IconCalendarDue size={18} />,
                keywords: [deadline.title],
                group: 'Fristen',
                onClick: () => navigate('/app/deadlines'),
            });
        });

        // Applications
        applications.forEach((app) => {
            actions.push({
                id: `application-${app.id}`,
                label: `${app.position} @ ${app.company}`,
                description: app.status,
                leftSection: <IconBriefcase size={18} />,
                keywords: [app.company, app.position, app.status],
                group: 'Bewerbungen',
                onClick: () => navigate('/app/applications'),
            });
        });

        // Inventory
        inventory.forEach((item) => {
            actions.push({
                id: `inventory-${item.id}`,
                label: item.name,
                description: item.category,
                leftSection: <IconBox size={18} />,
                keywords: [item.name, item.category],
                group: 'Inventar',
                onClick: () => navigate('/app/inventory'),
            });
        });

        // Navigation (at the end)
        navigationActions.forEach((action) => {
            actions.push({
                ...action,
                group: 'Navigation',
                onClick: () => {
                    const id = action.id.replace('nav-', '');
                    const path = id === 'dashboard' ? '/app' : `/app/${id}`;
                    navigate(path);
                },
            });
        });

        return actions;
    }, [navigate, isLoaded, projects, media, notes, lists, habits, deadlines, applications, inventory]);

    return (
        <>
            <Spotlight
                actions={allActions}
                nothingFound="Keine Ergebnisse gefunden..."
                highlightQuery
                searchProps={{
                    leftSection: <IconSearch size={20} />,
                    placeholder: 'Suche nach Seiten, Projekten, Medien...',
                }}
                shortcut={['mod + K', 'mod + P']}
                limit={10}
            />
            {children}
        </>
    );
}

export default AppSpotlight;
