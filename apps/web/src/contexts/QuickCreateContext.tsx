import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export type QuickCreateType =
    | 'habit'
    | 'expense'
    | 'deadline'
    | 'subscription'
    | 'note'
    | 'list'
    | 'project'
    | 'media'
    | 'meal'
    | 'inventory'
    | 'application'
    | 'wishlist'
    | null;

interface QuickCreateContextValue {
    pendingCreate: QuickCreateType;
    triggerCreate: (type: QuickCreateType) => void;
    consumeCreate: () => QuickCreateType;
    isSpotlightOpen: boolean;
    openSpotlight: () => void;
    closeSpotlight: () => void;
}

const QuickCreateContext = createContext<QuickCreateContextValue | null>(null);

const moduleRoutes: Record<Exclude<QuickCreateType, null>, string> = {
    habit: '/app/habits',
    expense: '/app/expenses',
    deadline: '/app/deadlines',
    subscription: '/app/subscriptions',
    note: '/app/notes',
    list: '/app/lists',
    project: '/app/projects',
    media: '/app/media',
    meal: '/app/meals',
    inventory: '/app/inventory',
    application: '/app/applications',
    wishlist: '/app/wishlists',
};

// Types that have dedicated "new" pages instead of modals
const directCreateRoutes: Partial<Record<Exclude<QuickCreateType, null>, string>> = {
    note: '/app/notes/new',
};

export function QuickCreateProvider({ children }: { children: ReactNode }) {
    const [pendingCreate, setPendingCreate] = useState<QuickCreateType>(null);
    const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const triggerCreate = useCallback((type: QuickCreateType) => {
        if (!type) return;

        // Check if this type has a direct create route
        const directRoute = directCreateRoutes[type];
        if (directRoute) {
            navigate(directRoute);
            return;
        }

        const targetRoute = moduleRoutes[type];

        // If already on the target page, just set the pending create
        if (location.pathname === targetRoute) {
            setPendingCreate(type);
        } else {
            // Navigate first, then set pending create
            setPendingCreate(type);
            navigate(targetRoute);
        }
    }, [navigate, location.pathname]);

    const consumeCreate = useCallback(() => {
        const current = pendingCreate;
        setPendingCreate(null);
        return current;
    }, [pendingCreate]);

    const openSpotlight = useCallback(() => {
        setIsSpotlightOpen(true);
    }, []);

    const closeSpotlight = useCallback(() => {
        setIsSpotlightOpen(false);
    }, []);

    return (
        <QuickCreateContext.Provider value={{
            pendingCreate,
            triggerCreate,
            consumeCreate,
            isSpotlightOpen,
            openSpotlight,
            closeSpotlight,
        }}>
            {children}
        </QuickCreateContext.Provider>
    );
}

export function useQuickCreate() {
    const context = useContext(QuickCreateContext);
    if (!context) {
        throw new Error('useQuickCreate must be used within QuickCreateProvider');
    }
    return context;
}
