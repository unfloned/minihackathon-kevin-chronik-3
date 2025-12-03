// Modal configuration - separate file to avoid loading modal components
export const createModalTitles = {
    habitCreate: 'Neues Habit',
    expenseCreate: 'Neue Ausgabe',
    deadlineCreate: 'Neue Frist',
    subscriptionCreate: 'Neues Abo',
    listCreate: 'Neue Liste',
    projectCreate: 'Neues Projekt',
    mediaCreate: 'Neues Medium',
    mealCreate: 'Neues Rezept',
    inventoryCreate: 'Neuer Gegenstand',
    applicationCreate: 'Neue Bewerbung',
    wishlistCreate: 'Neuer Wunsch',
} as const;

export type ModalId = keyof typeof createModalTitles;
