import { lazy, Suspense, FC } from 'react';
import { ContextModalProps } from '@mantine/modals';
import { Center, Loader } from '@mantine/core';

// Wrapper to add Suspense to lazy components - returns FC type for Mantine compatibility
function createLazyModal(
    importFn: () => Promise<{ default: FC<ContextModalProps<any>> }>
): FC<ContextModalProps<any>> {
    const LazyComponent = lazy(importFn);

    const SuspenseWrapper: FC<ContextModalProps<any>> = (props) => (
        <Suspense fallback={<Center p="xl"><Loader /></Center>}>
            <LazyComponent {...props} />
        </Suspense>
    );

    return SuspenseWrapper;
}

// Export lazy-loaded modals with Suspense wrapper
export const lazyCreateModals: Record<string, FC<ContextModalProps<any>>> = {
    habitCreate: createLazyModal(() =>
        import('./CreateModals').then(m => ({ default: m.HabitCreateModal }))
    ),
    expenseCreate: createLazyModal(() =>
        import('./CreateModals').then(m => ({ default: m.ExpenseCreateModal }))
    ),
    deadlineCreate: createLazyModal(() =>
        import('./CreateModals').then(m => ({ default: m.DeadlineCreateModal }))
    ),
    subscriptionCreate: createLazyModal(() =>
        import('./CreateModals').then(m => ({ default: m.SubscriptionCreateModal }))
    ),
    listCreate: createLazyModal(() =>
        import('./CreateModals').then(m => ({ default: m.ListCreateModal }))
    ),
    projectCreate: createLazyModal(() =>
        import('./CreateModals').then(m => ({ default: m.ProjectCreateModal }))
    ),
    mediaCreate: createLazyModal(() =>
        import('./CreateModals').then(m => ({ default: m.MediaCreateModal }))
    ),
    mealCreate: createLazyModal(() =>
        import('./CreateModals').then(m => ({ default: m.MealCreateModal }))
    ),
    inventoryCreate: createLazyModal(() =>
        import('./CreateModals').then(m => ({ default: m.InventoryCreateModal }))
    ),
    applicationCreate: createLazyModal(() =>
        import('./CreateModals').then(m => ({ default: m.ApplicationCreateModal }))
    ),
    wishlistCreate: createLazyModal(() =>
        import('./CreateModals').then(m => ({ default: m.WishlistCreateModal }))
    ),
};

// Re-export titles from modalConfig (no heavy dependencies)
export { createModalTitles } from './modalConfig';
