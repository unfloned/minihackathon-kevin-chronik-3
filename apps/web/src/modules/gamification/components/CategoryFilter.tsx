import { MultiSelect } from '@mantine/core';
import { useTranslation } from 'react-i18next';

interface CategoryFilterProps {
    selectedCategories: string[];
    categories: string[];
    onChange: (value: string[]) => void;
}

export function CategoryFilter({
    selectedCategories,
    categories,
    onChange,
}: CategoryFilterProps) {
    const { t } = useTranslation();

    const categoryLabels: Record<string, string> = {
        all: t('achievements.categories.all'),
        general: t('achievements.categories.general'),
        streaks: t('achievements.categories.streaks'),
        habits: t('achievements.categories.habits'),
        deadlines: t('achievements.categories.deadlines'),
        subscriptions: t('nav.subscriptions'),
        applications: t('nav.applications'),
        expenses: t('achievements.categories.expenses'),
        notes: t('nav.notes'),
        lists: t('nav.lists'),
        projects: t('achievements.categories.projects'),
        inventory: t('nav.inventory'),
        media: t('nav.media'),
        meals: t('nav.meals'),
        wishlists: t('nav.wishlists'),
        legendary: 'Legendär',
    };

    return (
        <MultiSelect
            placeholder={t('achievements.categories.all')}
            value={selectedCategories}
            onChange={onChange}
            data={categories.map(cat => ({
                label: categoryLabels[cat] || cat,
                value: cat,
            }))}
            clearable
            searchable
        />
    );
}
