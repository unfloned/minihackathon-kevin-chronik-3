import { Container, Stack } from '@mantine/core';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRequest, useMutation, useConfetti } from '../../../hooks';
import { notifications } from '@mantine/notifications';
import type { AchievementPublic, GamificationStats } from '@ycmm/core';

import { PageTitle } from '../../../components/PageTitle';
import {
    StatsOverview,
    ProfileSharingPanel,
    CategoryFilter,
    AchievementsGrid,
} from '../components';
import type { Achievement, ProfileSharingStatus } from '../types';

export default function AchievementsPage() {
    const { t } = useTranslation();
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const confetti = useConfetti();

    // Data fetching
    const { data: allAchievements, isLoading: loadingAll } = useRequest<Achievement[]>(
        '/gamification/achievements'
    );
    const { data: userAchievements, isLoading: loadingUser } = useRequest<AchievementPublic[]>(
        '/gamification/user-achievements'
    );
    const { data: stats, isLoading: loadingStats } = useRequest<GamificationStats>(
        '/gamification/stats'
    );
    const { data: sharingStatus, isLoading: loadingSharing, refetch: refetchSharingStatus } = useRequest<ProfileSharingStatus>(
        '/gamification/profile/sharing'
    );

    // Mutations
    const { mutate: toggleSharing, isLoading: togglingSharing } = useMutation<ProfileSharingStatus, { isPublic: boolean }>(
        '/gamification/profile/sharing',
        { method: 'POST' }
    );

    // Computed values
    const isLoading = loadingAll || loadingUser || loadingStats;
    const unlockedIds = new Set(userAchievements?.map(a => a.id) || []);
    const totalAchievements = allAchievements?.length || 0;
    const unlockedCount = userAchievements?.length || 0;
    const completionPercentage = totalAchievements > 0
        ? Math.round((unlockedCount / totalAchievements) * 100)
        : 0;
    const filteredAchievements = allAchievements?.filter(
        a => selectedCategories.length === 0 || selectedCategories.includes(a.category)
    ) || [];
    const categories = [...new Set(allAchievements?.map(a => a.category) || [])];

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

    // Effects
    useEffect(() => {
        const currentCount = userAchievements?.length ?? 0;
        const sessionKey = 'achievements_celebrated_count';
        const celebratedCount = parseInt(sessionStorage.getItem(sessionKey) || '0', 10);

        if (currentCount > celebratedCount && currentCount > 0) {
            confetti.achievementUnlock();
            sessionStorage.setItem(sessionKey, currentCount.toString());
        }
    }, [userAchievements?.length, confetti]);

    // Handlers
    const handleToggleSharing = async () => {
        const newState = !sharingStatus?.isPublic;
        try {
            await toggleSharing({ isPublic: newState });
            await refetchSharingStatus();
            notifications.show({
                title: newState ? t('achievements.sharing.enabled') : t('achievements.sharing.disabled'),
                message: newState ? t('achievements.sharing.enabledMessage') : t('achievements.sharing.disabledMessage'),
                color: newState ? 'green' : 'gray',
            });
        } catch {
            notifications.show({
                title: t('notifications.error'),
                message: t('achievements.sharing.error'),
                color: 'red',
            });
        }
    };

    return (
        <Container size="xl" py="xl">
            <Stack gap="xl">
                <PageTitle title={t('achievements.title')} subtitle={t('achievements.subtitle')} />

                <ProfileSharingPanel
                    sharingStatus={sharingStatus ?? undefined}
                    loadingSharing={loadingSharing}
                    togglingSharing={togglingSharing}
                    onToggle={handleToggleSharing}
                />

                <StatsOverview
                    stats={stats ?? undefined}
                    unlockedCount={unlockedCount}
                    totalAchievements={totalAchievements}
                    completionPercentage={completionPercentage}
                    isLoading={isLoading}
                />

                <CategoryFilter
                    selectedCategories={selectedCategories}
                    categories={categories}
                    onChange={setSelectedCategories}
                />

                <AchievementsGrid
                    achievements={filteredAchievements}
                    unlockedIds={unlockedIds}
                    userAchievements={userAchievements ?? undefined}
                    categoryLabels={categoryLabels}
                    isLoading={isLoading}
                />
            </Stack>
        </Container>
    );
}
