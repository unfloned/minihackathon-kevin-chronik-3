import { useMemo, useState } from 'react';
import {
    Paper,
    SimpleGrid,
    Text,
    Group,
    Stack,
    Progress,
    Collapse,
    UnstyledButton,
    Box,
    useMantineTheme,
} from '@mantine/core';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import type { Application, ApplicationStatus } from '../types';

interface AnalyticsDashboardProps {
    applications: Application[];
}

function CompactMetric({ label, value, color }: { label: string; value: string | number; color: string }) {
    return (
        <Paper withBorder p="sm" radius="md">
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                {label}
            </Text>
            <Text size="xl" fw={700} c={color}>
                {value}
            </Text>
        </Paper>
    );
}

const FUNNEL_STATUSES: { key: ApplicationStatus | 'applied_plus'; labelKey: string; color: string }[] = [
    { key: 'applied_plus', labelKey: 'applications.analytics.applied', color: 'blue' },
    { key: 'in_review', labelKey: 'applications.analytics.inReview', color: 'cyan' },
    { key: 'interview_scheduled', labelKey: 'applications.analytics.interview', color: 'violet' },
    { key: 'offer_received', labelKey: 'applications.analytics.offer', color: 'green' },
    { key: 'accepted', labelKey: 'applications.analytics.accepted', color: 'teal' },
];

export function AnalyticsDashboard({ applications }: AnalyticsDashboardProps) {
    const { t } = useTranslation();
    const theme = useMantineTheme();
    const [showMore, setShowMore] = useState(false);

    const metrics = useMemo(() => {
        const total = applications.length;
        const nonDraft = applications.filter((a) => a.status !== 'draft');
        const totalApplied = nonDraft.length;

        const responded = nonDraft.filter((a) =>
            ['in_review', 'interview_scheduled', 'interviewed', 'offer_received', 'accepted', 'rejected'].includes(a.status)
        );
        const interviewed = nonDraft.filter((a) =>
            ['interview_scheduled', 'interviewed', 'offer_received', 'accepted'].includes(a.status)
        );
        const offers = nonDraft.filter((a) =>
            ['offer_received', 'accepted'].includes(a.status)
        );
        const accepted = applications.filter((a) => a.status === 'accepted');

        const responseRate = totalApplied > 0 ? Math.round((responded.length / totalApplied) * 100) : 0;
        const interviewRate = totalApplied > 0 ? Math.round((interviewed.length / totalApplied) * 100) : 0;
        const offerRate = totalApplied > 0 ? Math.round((offers.length / totalApplied) * 100) : 0;

        // Funnel counts
        const funnelCounts = {
            applied_plus: totalApplied,
            in_review: responded.length,
            interview_scheduled: interviewed.length,
            offer_received: offers.length,
            accepted: accepted.length,
        };

        return { total, totalApplied, responseRate, interviewRate, offerRate, funnelCounts };
    }, [applications]);

    const sourceData = useMemo(() => {
        const sourceMap = new Map<string, { total: number; responded: number }>();
        applications
            .filter((a) => a.status !== 'draft' && a.source)
            .forEach((a) => {
                const entry = sourceMap.get(a.source) || { total: 0, responded: 0 };
                entry.total++;
                if (['in_review', 'interview_scheduled', 'interviewed', 'offer_received', 'accepted', 'rejected'].includes(a.status)) {
                    entry.responded++;
                }
                sourceMap.set(a.source, entry);
            });

        return Array.from(sourceMap.entries())
            .map(([source, data]) => ({
                source,
                rate: data.total > 0 ? Math.round((data.responded / data.total) * 100) : 0,
                total: data.total,
            }))
            .sort((a, b) => b.rate - a.rate);
    }, [applications]);

    const monthlyData = useMemo(() => {
        const now = new Date();
        const months: { month: string; count: number }[] = [];

        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const label = d.toLocaleDateString('de-DE', { month: 'short', year: '2-digit' });

            const count = applications.filter((a) => {
                const date = a.appliedAt ? new Date(a.appliedAt) : new Date(a.createdAt);
                return (
                    date.getFullYear() === d.getFullYear() &&
                    date.getMonth() === d.getMonth()
                );
            }).length;

            months.push({ month: label, count });
        }
        return months;
    }, [applications]);

    const funnelMax = metrics.funnelCounts.applied_plus || 1;

    return (
        <Paper shadow="sm" withBorder p="md" radius="md">
            <Stack gap="md">
                {/* Row 1: Metrics + Funnel */}
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                    {/* Left: 4 compact metrics */}
                    <SimpleGrid cols={2} spacing="sm">
                        <CompactMetric
                            label={t('applications.analytics.total')}
                            value={metrics.total}
                            color="blue"
                        />
                        <CompactMetric
                            label={t('applications.analytics.responseRate')}
                            value={`${metrics.responseRate}%`}
                            color="cyan"
                        />
                        <CompactMetric
                            label={t('applications.analytics.interviewRate')}
                            value={`${metrics.interviewRate}%`}
                            color="violet"
                        />
                        <CompactMetric
                            label={t('applications.analytics.offerRate')}
                            value={`${metrics.offerRate}%`}
                            color="green"
                        />
                    </SimpleGrid>

                    {/* Right: Conversion Funnel */}
                    <Paper withBorder p="sm" radius="md">
                        <Text size="sm" fw={600} mb="xs">
                            {t('applications.analytics.conversionFunnel')}
                        </Text>
                        <Stack gap={6}>
                            {FUNNEL_STATUSES.map((stage) => {
                                const count = metrics.funnelCounts[stage.key as keyof typeof metrics.funnelCounts];
                                const pct = funnelMax > 0 ? Math.round((count / funnelMax) * 100) : 0;
                                return (
                                    <Box key={stage.key}>
                                        <Group justify="space-between" mb={2}>
                                            <Text size="xs">{t(stage.labelKey)}</Text>
                                            <Text size="xs" fw={600}>{count}</Text>
                                        </Group>
                                        <Progress
                                            value={pct}
                                            color={stage.color}
                                            size="sm"
                                            radius="xl"
                                        />
                                    </Box>
                                );
                            })}
                        </Stack>
                    </Paper>
                </SimpleGrid>

                {/* Show More button */}
                <UnstyledButton onClick={() => setShowMore((v) => !v)}>
                    <Group gap={4} justify="center">
                        <Text size="xs" c="dimmed">
                            {showMore ? t('applications.analytics.showLess') : t('applications.analytics.showMore')}
                        </Text>
                        {showMore ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
                    </Group>
                </UnstyledButton>

                {/* Row 2: Charts (collapsed) */}
                <Collapse in={showMore}>
                    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                        {/* Source Effectiveness */}
                        <Paper withBorder p="sm" radius="md">
                            <Text size="sm" fw={600} mb="xs">
                                {t('applications.analytics.sourceEffectiveness')}
                            </Text>
                            {sourceData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart
                                        data={sourceData}
                                        layout="vertical"
                                        margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" domain={[0, 100]} unit="%" />
                                        <YAxis type="category" dataKey="source" width={80} tick={{ fontSize: 12 }} />
                                        <Tooltip
                                            formatter={(value: number) => [`${value}%`, t('applications.analytics.responseRateShort')]}
                                        />
                                        <Bar dataKey="rate" fill={theme.colors.blue[6]} radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <Text size="sm" c="dimmed" ta="center" py="lg">{t('common.noResults')}</Text>
                            )}
                        </Paper>

                        {/* Monthly Activity */}
                        <Paper withBorder p="sm" radius="md">
                            <Text size="sm" fw={600} mb="xs">
                                {t('applications.analytics.monthlyActivity')}
                            </Text>
                            <ResponsiveContainer width="100%" height={200}>
                                <AreaChart data={monthlyData} margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        formatter={(value: number) => [value, t('applications.analytics.applications')]}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="count"
                                        stroke={theme.colors.violet[6]}
                                        fill={theme.colors.violet[1]}
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Paper>
                    </SimpleGrid>
                </Collapse>
            </Stack>
        </Paper>
    );
}
