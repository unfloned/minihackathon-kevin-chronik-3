import { Title, Text } from '@mantine/core';

export interface PageTitleProps {
    title: string;
    subtitle?: string;
}

export function PageTitle({ title, subtitle }: PageTitleProps) {
    return (
        <div>
            <Title order={1}>{title}</Title>
            {subtitle && <Text c="dimmed">{subtitle}</Text>}
        </div>
    );
}

export default PageTitle;
