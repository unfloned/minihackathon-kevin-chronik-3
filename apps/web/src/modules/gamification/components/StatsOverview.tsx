import { SimpleGrid, Text } from '@mantine/core';
import { IconStar, IconCoin } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { CardStatistic } from '../../../components/CardStatistic';
import type { GamificationStats } from '@ycmm/core';

interface StatsOverviewProps {
    stats?: GamificationStats;
    unlockedCount: number;
    totalAchievements: number;
    completionPercentage: number;
    isLoading: boolean;
}

export function StatsOverview({
    stats,
    unlockedCount,
    totalAchievements,
    completionPercentage,
    isLoading,
}: StatsOverviewProps) {
    const { t } = useTranslation();

    return (
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
            <CardStatistic
                type="progress"
                title={t('dashboard.level')}
                value={stats?.level ?? 1}
                icon={IconStar}
                color="violet"
                progress={stats?.xpProgress?.percentage ?? 0}
                progressTooltip={`${stats?.xpProgress?.current ?? 0} / ${stats?.xpProgress?.required ?? 100} XP`}
                isLoading={isLoading}
            />

            <CardStatistic
                type="icon"
                title={t('achievements.stats.xpEarned')}
                value={stats?.xp?.toLocaleString() ?? 0}
                icon={IconCoin}
                color="yellow"
                isLoading={isLoading}
            />

            <CardStatistic
                type="circular"
                title={t('achievements.title')}
                value={`${unlockedCount} / ${totalAchievements}`}
                progress={completionPercentage}
                progressLabel={
                    <Text ta="center" size="xs" fw={700}>
                        {completionPercentage}%
                    </Text>
                }
                color="teal"
                isLoading={isLoading}
            />
        </SimpleGrid>
    );
}
