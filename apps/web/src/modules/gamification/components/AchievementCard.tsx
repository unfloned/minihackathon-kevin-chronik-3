import { Card, Group, ThemeIcon, Text, Badge } from '@mantine/core';
import { IconTrophy, IconLock, IconCoin } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { Achievement } from '../types';
import { iconMap, categoryColors } from '../types';
import type { AchievementPublic } from '@ycmm/core';

interface AchievementCardProps {
    achievement: Achievement;
    isUnlocked: boolean;
    userAchievement?: AchievementPublic;
    categoryLabels: Record<string, string>;
}

export function AchievementCard({
    achievement,
    isUnlocked,
    userAchievement,
    categoryLabels,
}: AchievementCardProps) {
    const { t } = useTranslation();
    const IconComponent = iconMap[achievement.icon] || IconTrophy;

    return (
        <Card
            withBorder
            padding="lg"
            style={{
                opacity: isUnlocked ? 1 : 0.6,
                borderColor: isUnlocked
                    ? `var(--mantine-color-${categoryColors[achievement.category]}-5)`
                    : undefined,
                transition: 'transform 0.2s ease, opacity 0.2s ease',
            }}
        >
            <Group justify="space-between" align="flex-start">
                <Group gap="md">
                    <ThemeIcon
                        size={48}
                        variant={isUnlocked ? 'filled' : 'light'}
                        color={isUnlocked ? categoryColors[achievement.category] : 'gray'}
                        radius="xl"
                    >
                        {isUnlocked ? (
                            <IconComponent size={24} />
                        ) : (
                            <IconLock size={24} />
                        )}
                    </ThemeIcon>
                    <div>
                        <Text fw={600}>{achievement.name}</Text>
                        <Text size="sm" c="dimmed">
                            {achievement.description}
                        </Text>
                    </div>
                </Group>
            </Group>

            <Group justify="space-between" mt="md">
                <Badge
                    variant="light"
                    color={categoryColors[achievement.category]}
                >
                    {categoryLabels[achievement.category]}
                </Badge>
                <Badge
                    variant={isUnlocked ? 'filled' : 'outline'}
                    color="yellow"
                    leftSection={<IconCoin size={12} />}
                >
                    +{achievement.xpReward} XP
                </Badge>
            </Group>

            {isUnlocked && userAchievement?.unlockedAt && (
                <Text size="xs" c="dimmed" mt="sm">
                    {t('achievements.unlockedOn', { date: new Date(userAchievement.unlockedAt).toLocaleDateString('de-DE') })}
                </Text>
            )}
        </Card>
    );
}
