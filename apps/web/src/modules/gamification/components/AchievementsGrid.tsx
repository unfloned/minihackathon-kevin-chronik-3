import { SimpleGrid, Skeleton, Paper, ThemeIcon, Text } from '@mantine/core';
import { IconTrophy } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { AchievementCard } from './AchievementCard';
import type { Achievement } from '../types';
import type { AchievementPublic } from '@ycmm/core';

interface AchievementsGridProps {
    achievements: Achievement[];
    unlockedIds: Set<string>;
    userAchievements?: AchievementPublic[];
    categoryLabels: Record<string, string>;
    isLoading: boolean;
}

export function AchievementsGrid({
    achievements,
    unlockedIds,
    userAchievements,
    categoryLabels,
    isLoading,
}: AchievementsGridProps) {
    const { t } = useTranslation();

    if (isLoading) {
        return (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} height={140} radius="md" />
                ))}
            </SimpleGrid>
        );
    }

    if (achievements.length === 0) {
        return (
            <Paper withBorder p="xl" ta="center">
                <ThemeIcon size={64} variant="light" color="gray" radius="xl" mx="auto">
                    <IconTrophy size={32} />
                </ThemeIcon>
                <Text mt="md" c="dimmed">
                    {t('achievements.noAchievements')}
                </Text>
            </Paper>
        );
    }

    return (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
            {achievements.map(achievement => {
                const isUnlocked = unlockedIds.has(achievement.id);
                const userAchievement = userAchievements?.find(a => a.id === achievement.id);

                return (
                    <AchievementCard
                        key={achievement.id}
                        achievement={achievement}
                        isUnlocked={isUnlocked}
                        userAchievement={userAchievement}
                        categoryLabels={categoryLabels}
                    />
                );
            })}
        </SimpleGrid>
    );
}
