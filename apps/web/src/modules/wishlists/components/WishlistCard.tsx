import {
    Card,
    Image,
    Group,
    Stack,
    Text,
    ThemeIcon,
    Badge,
    ActionIcon,
    Menu,
    Anchor,
    Button,
} from '@mantine/core';
import {
    IconDots,
    IconEdit,
    IconTrash,
    IconGift,
    IconCurrencyEuro,
    IconExternalLink,
    IconCheck,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { WishlistItem, WishlistCategory, WishlistPriority } from '../types';
import { categoryOptions, priorityOptions, formatPrice } from '../types';

interface WishlistCardProps {
    item: WishlistItem;
    onEdit: (item: WishlistItem) => void;
    onDelete: (id: string) => void;
    onPurchase: (id: string) => void;
    showPurchaseButton?: boolean;
}

export function WishlistCard({ item, onEdit, onDelete, onPurchase, showPurchaseButton = true }: WishlistCardProps) {
    const { t } = useTranslation();

    const getCategoryIcon = (category: WishlistCategory) => {
        const config = categoryOptions.find(c => c.value === category);
        const Icon = config?.icon || IconDots;
        return <Icon size={16} />;
    };

    const getPriorityBadge = (priority: WishlistPriority) => {
        const config = priorityOptions.find(p => p.value === priority);
        return (
            <Badge size="xs" color={config?.color || 'gray'}>
                {t(config?.label || priority)}
            </Badge>
        );
    };

    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Card.Section>
                {item.imageUrl ? (
                    <Image
                        src={item.imageUrl}
                        height={180}
                        alt={item.name}
                        fit="cover"
                    />
                ) : (
                    <Group
                        h={180}
                        align="center"
                        justify="center"
                        style={{ background: 'var(--mantine-color-gray-1)' }}
                    >
                        <ThemeIcon size={60} variant="light" radius="xl">
                            {getCategoryIcon(item.category)}
                        </ThemeIcon>
                    </Group>
                )}
            </Card.Section>

            <Stack gap="xs" mt="md">
                <Group justify="space-between" align="flex-start">
                    <div style={{ flex: 1 }}>
                        <Text fw={500} lineClamp={1}>{item.name}</Text>
                        {item.store && (
                            <Text size="xs" c="dimmed">{item.store}</Text>
                        )}
                    </div>
                    <Menu shadow="md" width={200}>
                        <Menu.Target>
                            <ActionIcon variant="subtle" color="gray">
                                <IconDots size={16} />
                            </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Item
                                leftSection={<IconEdit size={14} />}
                                onClick={() => onEdit(item)}
                            >
                                {t('wishlists.modal.edit')}
                            </Menu.Item>
                            <Menu.Item
                                leftSection={<IconTrash size={14} />}
                                color="red"
                                onClick={() => onDelete(item.id)}
                            >
                                {t('wishlists.modal.delete')}
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </Group>

                {item.description && (
                    <Text size="sm" c="dimmed" lineClamp={2}>
                        {item.description}
                    </Text>
                )}

                <Group gap="xs">
                    {getPriorityBadge(item.priority)}
                    <Badge size="xs" variant="light" leftSection={getCategoryIcon(item.category)}>
                        {t(categoryOptions.find(c => c.value === item.category)?.label || '')}
                    </Badge>
                    {item.isGiftIdea && (
                        <Badge size="xs" color="pink" leftSection={<IconGift size={12} />}>
                            {t('wishlists.labels.gift')}
                        </Badge>
                    )}
                </Group>

                {item.price && (
                    <Group gap="xs">
                        <IconCurrencyEuro size={16} />
                        <Text fw={600}>{formatPrice(item.price)}</Text>
                    </Group>
                )}

                {item.giftFor && (
                    <Text size="xs" c="dimmed">
                        {t('wishlists.labels.for')} {item.giftFor}
                        {item.occasion && ` (${item.occasion})`}
                    </Text>
                )}

                {item.purchasedAt && (
                    <Badge size="xs" color="green" leftSection={<IconCheck size={12} />}>
                        {t('wishlists.labels.purchasedOn')} {new Date(item.purchasedAt).toLocaleDateString('de-DE')}
                    </Badge>
                )}

                <Group gap="xs" mt="xs">
                    {item.productUrl && (
                        <Anchor
                            href={item.productUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            size="sm"
                        >
                            <Group gap={4}>
                                <IconExternalLink size={14} />
                                {t('wishlists.actions.toProduct')}
                            </Group>
                        </Anchor>
                    )}
                </Group>

                {showPurchaseButton && (
                    <Button
                        fullWidth
                        variant="light"
                        color="green"
                        leftSection={<IconCheck size={16} />}
                        onClick={() => onPurchase(item.id)}
                        mt="xs"
                    >
                        {t('wishlists.actions.markPurchased')}
                    </Button>
                )}
            </Stack>
        </Card>
    );
}
