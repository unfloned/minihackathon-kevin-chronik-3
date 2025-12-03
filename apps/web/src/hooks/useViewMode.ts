import { useLocalStorage } from '@mantine/hooks';

export type ViewMode = 'grid' | 'list' | 'table' | 'kanban' | 'cards';

const STORAGE_KEY = 'ycmm-view-mode';
const DEFAULT_VIEW_MODE: ViewMode = 'grid';

/**
 * Global view mode hook - shared across all pages.
 * Pages that don't support the current mode (e.g. kanban) should fallback to 'grid'.
 */
export function useViewMode(): [ViewMode, (value: ViewMode) => void] {
    const [viewMode, setViewMode] = useLocalStorage<ViewMode>({
        key: STORAGE_KEY,
        defaultValue: DEFAULT_VIEW_MODE,
    });

    return [viewMode, setViewMode];
}
