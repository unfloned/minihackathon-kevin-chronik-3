import { ReactNode } from 'react';
import {
    Container,
    Title,
    Text,
    Group,
    Stack,
    Button,
    Paper,
    Card,
    TextInput,
    SimpleGrid,
    ThemeIcon,
} from '@mantine/core';
import { IconSearch, IconPlus, IconHash } from '@tabler/icons-react';

export interface PageHeaderProps {
    title: string;
    subtitle?: string;
    actionLabel?: string;
    actionIcon?: ReactNode;
    onAction?: () => void;
    rightSection?: ReactNode;
}

export interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    rightSection?: ReactNode;
}

export interface PageLayoutProps {
    children: ReactNode;
    header?: PageHeaderProps;
    searchBar?: SearchBarProps;
    stats?: ReactNode;
}

export function PageHeader({
    title,
    subtitle,
    actionLabel,
    actionIcon = <IconPlus size={18} />,
    onAction,
    rightSection,
}: PageHeaderProps) {
    return (
        <Group justify="space-between">
            <div>
                <Title order={2}>{title}</Title>
                {subtitle && <Text c="dimmed">{subtitle}</Text>}
            </div>
            {rightSection || (actionLabel && onAction && (
                <Button leftSection={actionIcon} onClick={onAction}>
                    {actionLabel}
                </Button>
            ))}
        </Group>
    );
}

export function SearchBar({
    value,
    onChange,
    placeholder = 'Suchen...',
    rightSection,
}: SearchBarProps) {
    return (
        <Paper withBorder p="md">
            <Group>
                <TextInput
                    placeholder={placeholder}
                    leftSection={<IconSearch size={16} />}
                    value={value}
                    onChange={(e) => onChange(e.currentTarget.value)}
                    style={{ flex: 1 }}
                />
                {rightSection}
            </Group>
        </Paper>
    );
}

export interface StatCardProps {
    value: string | number;
    label: string;
    icon?: React.ComponentType<{ size?: number | string }>;
    color?: string;
}

export function StatCard({ value, label, icon: Icon, color = 'blue' }: StatCardProps) {
    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="md">
                <Text size="sm" c="dimmed" fw={500}>{label}</Text>
                <ThemeIcon color={color} variant="light" size="lg" radius="md">
                    {Icon ? <Icon size={20} /> : <IconHash size={20} />}
                </ThemeIcon>
            </Group>
            <Text size="xl" fw={700}>{value}</Text>
        </Card>
    );
}

export interface StatsGridProps {
    stats: StatCardProps[];
    columns?: { base?: number; sm?: number; md?: number; lg?: number };
}

export function StatsGrid({ stats, columns = { base: 2, sm: 4 } }: StatsGridProps) {
    return (
        <SimpleGrid cols={columns} spacing="md">
            {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
            ))}
        </SimpleGrid>
    );
}

export function PageLayout({
    children,
    header,
    searchBar,
    stats,
}: PageLayoutProps) {
    return (
        <Container size="xl" py="xl">
            <Stack gap="lg">
                {header && <PageHeader {...header} />}
                {stats}
                {searchBar && <SearchBar {...searchBar} />}
                {children}
            </Stack>
        </Container>
    );
}

export default PageLayout;
