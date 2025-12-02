import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { LevelUpModal } from '../components/LevelUpModal';
import { useAuth } from './AuthContext';

interface LevelUpContextType {
    triggerLevelUp: (newLevel: number) => void;
}

const LevelUpContext = createContext<LevelUpContextType | undefined>(undefined);

export function LevelUpProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [newLevel, setNewLevel] = useState(1);
    const { user, refreshUser } = useAuth();
    const previousLevel = useRef<number | null>(null);

    // Track level changes from user context
    useEffect(() => {
        if (user && previousLevel.current !== null) {
            if (user.level > previousLevel.current) {
                setNewLevel(user.level);
                setIsOpen(true);
            }
        }
        if (user) {
            previousLevel.current = user.level;
        }
    }, [user?.level]);

    const triggerLevelUp = useCallback((level: number) => {
        setNewLevel(level);
        setIsOpen(true);
        // Refresh user data to sync XP/level
        refreshUser();
    }, [refreshUser]);

    const handleClose = () => {
        setIsOpen(false);
    };

    return (
        <LevelUpContext.Provider value={{ triggerLevelUp }}>
            {children}
            <LevelUpModal
                opened={isOpen}
                onClose={handleClose}
                newLevel={newLevel}
            />
        </LevelUpContext.Provider>
    );
}

export function useLevelUp() {
    const context = useContext(LevelUpContext);
    if (!context) {
        throw new Error('useLevelUp must be used within LevelUpProvider');
    }
    return context;
}
