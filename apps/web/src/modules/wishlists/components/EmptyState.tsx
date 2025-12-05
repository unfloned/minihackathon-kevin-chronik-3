import { Paper, Stack, ThemeIcon, Text, Button } from '@mantine/core';
import { IconHeart, IconGift, IconShoppingCart, IconPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

interface EmptyStateProps {
    variant: 'all' | 'gifts' | 'purchased';
    onCreateClick?: () => void;
}

export function EmptyState({ variant, onCreateClick }: EmptyStateProps) {
    const { t } = useTranslation();

    const config = {
        all: {
            icon: IconHeart,
            color: undefined,
            title: t('wishlists.emptyState'),
            description: t('wishlists.emptyStateDesc'),
            showButton: true,
        },
        gifts: {
            icon: IconGift,
            color: 'pink',
            title: t('wishlists.emptyGifts'),
            description: t('wishlists.emptyGiftsDesc'),
            showButton: false,
        },
        purchased: {
            icon: IconShoppingCart,
            color: 'green',
            title: t('wishlists.emptyPurchased'),
            description: t('wishlists.emptyPurchasedDesc'),
            showButton: false,
        },
    }[variant];

    return (
        <Paper shadow="sm" p="xl" radius="md" withBorder>
            <Stack align="center" gap="md">
                <ThemeIcon size={60} radius="xl" variant="light" color={config.color}>
                    <config.icon size={32} />
                </ThemeIcon>
                <Text size="lg" fw={500}>{config.title}</Text>
                <Text c="dimmed" ta="center">
                    {config.description}
                </Text>
                {config.showButton && onCreateClick && (
                    <Button onClick={onCreateClick} leftSection={<IconPlus size={18} />}>
                        {t('wishlists.newItem')}
                    </Button>
                )}
            </Stack>
        </Paper>
    );
}
