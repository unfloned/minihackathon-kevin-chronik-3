import { ReactNode } from 'react';
import {
    Card,
    Text,
    Group,
    ThemeIcon,
    Progress,
    RingProgress,
    Skeleton,
    Tooltip,
} from '@mantine/core';

// Base props shared by all types
interface BaseStatisticProps {
    title: string;
    value: string | number;
    subtitle?: string;
    isLoading?: boolean;
    color?: string;
    tooltip?: string;
}

// Icon type - Card with ThemeIcon
interface IconStatisticProps extends BaseStatisticProps {
    type: 'icon';
    icon: React.ComponentType<{ size?: number | string }>;
}

// CircularProgress type - Card with RingProgress
interface CircularProgressStatisticProps extends BaseStatisticProps {
    type: 'circular';
    progress: number;
    progressLabel?: ReactNode;
    ringSize?: number;
    ringThickness?: number;
    trend?: {
        value: number;
        label: string;
        icon?: ReactNode;
        color?: string;
    };
}

// Progress type - Card with linear Progress bar below
interface ProgressStatisticProps extends BaseStatisticProps {
    type: 'progress';
    icon?: React.ComponentType<{ size?: number | string }>;
    progress: number;
    progressTooltip?: string;
}

// ExtendedProgress type - Card with Progress and trend info
interface ExtendedProgressStatisticProps extends BaseStatisticProps {
    type: 'extended';
    icon?: React.ComponentType<{ size?: number | string }>;
    progress: number;
    progressTooltip?: string;
    trend?: {
        value: number;
        label: string;
        icon?: ReactNode;
        color?: string;
    };
}

// Simple type - Just value and label
interface SimpleStatisticProps extends BaseStatisticProps {
    type: 'simple';
}

export type CardStatisticProps =
    | IconStatisticProps
    | CircularProgressStatisticProps
    | ProgressStatisticProps
    | ExtendedProgressStatisticProps
    | SimpleStatisticProps;

export function CardStatistic(props: CardStatisticProps) {
    const { title, value, subtitle, isLoading, color = 'blue', tooltip } = props;

    const renderContent = () => {
        switch (props.type) {
            case 'icon': {
                const Icon = props.icon;
                return (
                    <Group justify="space-between" align="flex-start">
                        <div>
                            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                                {title}
                            </Text>
                            {isLoading ? (
                                <Skeleton height={36} width={80} mt="xs" />
                            ) : (
                                <Text size="2rem" fw={700} mt="xs">
                                    {value}
                                </Text>
                            )}
                            {subtitle && !isLoading && (
                                <Text size="xs" c="dimmed" mt={4}>
                                    {subtitle}
                                </Text>
                            )}
                        </div>
                        {isLoading ? (
                            <Skeleton height={56} width={56} radius="xl" />
                        ) : (
                            <ThemeIcon size={56} variant="light" color={color} radius="xl">
                                <Icon size={28} />
                            </ThemeIcon>
                        )}
                    </Group>
                );
            }

            case 'circular': {
                const ringSize = props.ringSize ?? 56;
                const ringThickness = props.ringThickness ?? 6;
                return (
                    <Group justify="space-between" align="flex-start">
                        <div>
                            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                                {title}
                            </Text>
                            {isLoading ? (
                                <Skeleton height={36} width={80} mt="xs" />
                            ) : (
                                <>
                                    <Text size="2rem" fw={700} mt="xs">
                                        {value}
                                    </Text>
                                    {props.trend && (
                                        <Group gap={4} mt={4}>
                                            {props.trend.icon}
                                            <Text size="xs" c={props.trend.color || 'dimmed'}>
                                                {props.trend.label}
                                            </Text>
                                        </Group>
                                    )}
                                </>
                            )}
                            {subtitle && !isLoading && (
                                <Text size="xs" c="dimmed" mt={4}>
                                    {subtitle}
                                </Text>
                            )}
                        </div>
                        {isLoading ? (
                            <Skeleton height={ringSize} width={ringSize} radius="xl" />
                        ) : (
                            <RingProgress
                                size={ringSize}
                                thickness={ringThickness}
                                roundCaps
                                sections={[{ value: props.progress, color }]}
                                label={props.progressLabel}
                            />
                        )}
                    </Group>
                );
            }

            case 'progress': {
                const Icon = props.icon;
                const progressBar = (
                    <Progress
                        value={props.progress}
                        size="md"
                        mt="md"
                        color={color}
                        radius="xl"
                    />
                );
                return (
                    <>
                        <Group justify="space-between" align="flex-start">
                            <div>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                                    {title}
                                </Text>
                                {isLoading ? (
                                    <Skeleton height={36} width={80} mt="xs" />
                                ) : (
                                    <Text size="2rem" fw={700} mt="xs">
                                        {value}
                                    </Text>
                                )}
                            </div>
                            {Icon && (
                                isLoading ? (
                                    <Skeleton height={56} width={56} radius="xl" />
                                ) : (
                                    <ThemeIcon size={56} variant="light" color={color} radius="xl">
                                        <Icon size={28} />
                                    </ThemeIcon>
                                )
                            )}
                        </Group>
                        {!isLoading && (
                            props.progressTooltip ? (
                                <Tooltip label={props.progressTooltip}>
                                    {progressBar}
                                </Tooltip>
                            ) : progressBar
                        )}
                        {subtitle && !isLoading && (
                            <Text size="xs" c="dimmed" mt={4}>
                                {subtitle}
                            </Text>
                        )}
                    </>
                );
            }

            case 'extended': {
                const Icon = props.icon;
                const progressBar = (
                    <Progress
                        value={props.progress}
                        size="sm"
                        mt="xs"
                        color={color}
                    />
                );
                return (
                    <Group justify="space-between" align="flex-start">
                        <div style={{ flex: 1 }}>
                            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                                {title}
                            </Text>
                            {isLoading ? (
                                <Skeleton height={32} width={60} mt="xs" />
                            ) : (
                                <>
                                    <Text size="xl" fw={700} mt="xs">
                                        {value}
                                    </Text>
                                    {props.progressTooltip ? (
                                        <Tooltip label={props.progressTooltip}>
                                            {progressBar}
                                        </Tooltip>
                                    ) : progressBar}
                                    {subtitle && (
                                        <Text size="xs" c="dimmed" mt={4}>
                                            {subtitle}
                                        </Text>
                                    )}
                                    {props.trend && (
                                        <Group gap={4} mt={4}>
                                            {props.trend.icon}
                                            <Text size="xs" c={props.trend.color || 'dimmed'}>
                                                {props.trend.label}
                                            </Text>
                                        </Group>
                                    )}
                                </>
                            )}
                        </div>
                        {Icon && (
                            isLoading ? (
                                <Skeleton height={48} width={48} radius="md" />
                            ) : (
                                <ThemeIcon size={48} radius="md" variant="light" color={color}>
                                    <Icon size={28} />
                                </ThemeIcon>
                            )
                        )}
                    </Group>
                );
            }

            case 'simple': {
                return (
                    <div>
                        <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                            {title}
                        </Text>
                        {isLoading ? (
                            <Skeleton height={36} width={80} mt="xs" />
                        ) : (
                            <Text size="2rem" fw={700} mt="xs">
                                {value}
                            </Text>
                        )}
                        {subtitle && !isLoading && (
                            <Text size="xs" c="dimmed" mt={4}>
                                {subtitle}
                            </Text>
                        )}
                    </div>
                );
            }
        }
    };

    const cardContent = renderContent();

    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            {tooltip ? (
                <Tooltip label={tooltip} multiline w={280} withArrow position="top">
                    <div>{cardContent}</div>
                </Tooltip>
            ) : (
                cardContent
            )}
        </Card>
    );
}

export default CardStatistic;
