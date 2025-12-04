import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Container,
    Title,
    Text,
    Card,
    Badge,
    Group,
    Stack,
    SimpleGrid,
    Image,
    ThemeIcon,
    Paper,
    Button,
    Anchor,
    Modal,
    TextInput,
    Skeleton,
    Alert,
} from '@mantine/core';
import {
    IconGift,
    IconHeart,
    IconCurrencyEuro,
    IconExternalLink,
    IconDevices,
    IconShirt,
    IconHome,
    IconPalette,
    IconBook,
    IconPlane,
    IconStar,
    IconDots,
    IconCheck,
    IconLock,
    IconArrowLeft,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useRequest, useMutation } from '../hooks';
import type { WishlistCategory, WishlistPriority, PriceInfo } from '@ycmm/core';

interface PublicWishlistItem {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    productUrl: string;
    category: WishlistCategory;
    priority: WishlistPriority;
    price?: PriceInfo;
    store: string;
    isReserved: boolean;
}

interface PublicWishlistData {
    wishlist: {
        name: string;
        description: string;
    };
    items: PublicWishlistItem[];
    ownerName: string;
}

function formatPrice(price?: PriceInfo): string {
    if (!price) return '-';
    return `${price.amount.toFixed(2)} ${price.currency}`;
}

const categoryIcons: Record<WishlistCategory, typeof IconDevices> = {
    tech: IconDevices,
    fashion: IconShirt,
    home: IconHome,
    hobby: IconPalette,
    books: IconBook,
    travel: IconPlane,
    experience: IconStar,
    other: IconDots,
};

const priorityColors: Record<WishlistPriority, string> = {
    low: 'gray',
    medium: 'blue',
    high: 'orange',
    must_have: 'red',
};

export default function SharedWishlistPage() {
    const { t } = useTranslation();
    const { slug } = useParams<{ slug: string }>();
    const [reserveModalOpen, setReserveModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<PublicWishlistItem | null>(null);
    const [reserverName, setReserverName] = useState('');

    const { data, isLoading, error, refetch } = useRequest<PublicWishlistData>(
        `/public/wishlists/${slug}`
    );

    const { mutate: reserveItem, isLoading: reserving } = useMutation<{ success: boolean }, { name: string }>(
        `/public/wishlists/${slug}/items/${selectedItem?.id}/reserve`,
        { method: 'POST' }
    );

    const handleReserveClick = (item: PublicWishlistItem) => {
        setSelectedItem(item);
        setReserverName('');
        setReserveModalOpen(true);
    };

    const handleReserve = async () => {
        if (!reserverName.trim()) return;
        await reserveItem({ name: reserverName.trim() });
        setReserveModalOpen(false);
        await refetch();
    };

    if (isLoading) {
        return (
            <Container size="lg" py="xl">
                <Stack gap="lg">
                    <Skeleton height={60} />
                    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Skeleton key={i} height={300} radius="md" />
                        ))}
                    </SimpleGrid>
                </Stack>
            </Container>
        );
    }

    if (error || !data) {
        return (
            <Container size="md" py={80}>
                <Paper withBorder p="xl" radius="md" ta="center">
                    <ThemeIcon size={60} radius="xl" variant="light" color="gray" mx="auto" mb="md">
                        <IconLock size={30} />
                    </ThemeIcon>
                    <Title order={2} mb="sm">{t('wishlists.public.notFound')}</Title>
                    <Text c="dimmed" mb="lg">
                        {t('wishlists.public.notFoundDesc')}
                    </Text>
                    <Button component={Link} to="/" leftSection={<IconArrowLeft size={16} />}>
                        {t('wishlists.public.backHome')}
                    </Button>
                </Paper>
            </Container>
        );
    }

    const availableItems = data.items.filter(item => !item.isReserved);
    const reservedItems = data.items.filter(item => item.isReserved);

    return (
        <Container size="lg" py="xl">
            <Stack gap="lg">
                {/* Header */}
                <Paper
                    withBorder
                    p="xl"
                    radius="md"
                    style={{
                        background: 'linear-gradient(135deg, rgba(190, 75, 219, 0.1) 0%, rgba(250, 82, 82, 0.1) 100%)',
                    }}
                >
                    <Group justify="center" gap="md">
                        <ThemeIcon
                            size={60}
                            radius="xl"
                            variant="gradient"
                            gradient={{ from: 'grape', to: 'pink' }}
                        >
                            <IconGift size={30} />
                        </ThemeIcon>
                        <Stack gap={4} align="center">
                            <Title order={2}>{data.ownerName}'s {t('wishlists.public.wishlist')}</Title>
                            {data.wishlist.description && (
                                <Text c="dimmed">{data.wishlist.description}</Text>
                            )}
                            <Badge size="lg" variant="light" color="pink">
                                {data.items.length} {t('wishlists.public.items')} • {availableItems.length} {t('wishlists.public.available')}
                            </Badge>
                        </Stack>
                    </Group>
                </Paper>

                {/* Info Alert */}
                <Alert variant="light" color="blue" icon={<IconHeart size={20} />}>
                    {t('wishlists.public.reserveHint')}
                </Alert>

                {/* Available Items */}
                {availableItems.length > 0 && (
                    <>
                        <Title order={3}>{t('wishlists.public.availableItems')}</Title>
                        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                            {availableItems.map((item) => {
                                const CategoryIcon = categoryIcons[item.category];
                                return (
                                    <Card key={item.id} shadow="sm" padding="lg" radius="md" withBorder>
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
                                                        <CategoryIcon size={30} />
                                                    </ThemeIcon>
                                                </Group>
                                            )}
                                        </Card.Section>

                                        <Stack gap="xs" mt="md">
                                            <Group justify="space-between">
                                                <Text fw={500} lineClamp={1}>{item.name}</Text>
                                                <Badge size="xs" color={priorityColors[item.priority]}>
                                                    {item.priority === 'must_have' ? 'Must Have' : item.priority}
                                                </Badge>
                                            </Group>

                                            {item.description && (
                                                <Text size="sm" c="dimmed" lineClamp={2}>
                                                    {item.description}
                                                </Text>
                                            )}

                                            {item.price && (
                                                <Group gap="xs">
                                                    <IconCurrencyEuro size={16} />
                                                    <Text fw={600}>{formatPrice(item.price)}</Text>
                                                </Group>
                                            )}

                                            {item.store && (
                                                <Text size="xs" c="dimmed">{item.store}</Text>
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
                                                            {t('wishlists.public.viewProduct')}
                                                        </Group>
                                                    </Anchor>
                                                )}
                                            </Group>

                                            <Button
                                                fullWidth
                                                variant="gradient"
                                                gradient={{ from: 'grape', to: 'pink' }}
                                                leftSection={<IconGift size={16} />}
                                                onClick={() => handleReserveClick(item)}
                                                mt="xs"
                                            >
                                                {t('wishlists.public.reserveThis')}
                                            </Button>
                                        </Stack>
                                    </Card>
                                );
                            })}
                        </SimpleGrid>
                    </>
                )}

                {/* Reserved Items */}
                {reservedItems.length > 0 && (
                    <>
                        <Title order={3} c="dimmed">{t('wishlists.public.alreadyReserved')}</Title>
                        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                            {reservedItems.map((item) => {
                                const CategoryIcon = categoryIcons[item.category];
                                return (
                                    <Card key={item.id} shadow="sm" padding="lg" radius="md" withBorder opacity={0.6}>
                                        <Card.Section>
                                            {item.imageUrl ? (
                                                <Image
                                                    src={item.imageUrl}
                                                    height={180}
                                                    alt={item.name}
                                                    fit="cover"
                                                    style={{ filter: 'grayscale(50%)' }}
                                                />
                                            ) : (
                                                <Group
                                                    h={180}
                                                    align="center"
                                                    justify="center"
                                                    style={{ background: 'var(--mantine-color-gray-2)' }}
                                                >
                                                    <ThemeIcon size={60} variant="light" radius="xl" color="gray">
                                                        <CategoryIcon size={30} />
                                                    </ThemeIcon>
                                                </Group>
                                            )}
                                        </Card.Section>

                                        <Stack gap="xs" mt="md">
                                            <Text fw={500} lineClamp={1}>{item.name}</Text>
                                            <Badge size="sm" color="green" leftSection={<IconCheck size={12} />}>
                                                {t('wishlists.public.reserved')}
                                            </Badge>
                                        </Stack>
                                    </Card>
                                );
                            })}
                        </SimpleGrid>
                    </>
                )}

                {/* Empty State */}
                {data.items.length === 0 && (
                    <Paper withBorder p="xl" radius="md" ta="center">
                        <ThemeIcon size={60} radius="xl" variant="light" color="pink" mx="auto" mb="md">
                            <IconHeart size={30} />
                        </ThemeIcon>
                        <Title order={3} mb="sm">{t('wishlists.public.empty')}</Title>
                        <Text c="dimmed">{t('wishlists.public.emptyDesc')}</Text>
                    </Paper>
                )}
            </Stack>

            {/* Reserve Modal */}
            <Modal
                opened={reserveModalOpen}
                onClose={() => setReserveModalOpen(false)}
                title={t('wishlists.public.reserveTitle')}
            >
                <Stack gap="md">
                    <Text size="sm" c="dimmed">
                        {t('wishlists.public.reserveDesc', { item: selectedItem?.name })}
                    </Text>
                    <TextInput
                        label={t('wishlists.public.yourName')}
                        placeholder={t('wishlists.public.yourNamePlaceholder')}
                        value={reserverName}
                        onChange={(e) => setReserverName(e.currentTarget.value)}
                        required
                    />
                    <Text size="xs" c="dimmed">
                        {t('wishlists.public.reserveNote')}
                    </Text>
                    <Group justify="flex-end" gap="sm">
                        <Button variant="subtle" onClick={() => setReserveModalOpen(false)}>
                            {t('common.cancel')}
                        </Button>
                        <Button
                            onClick={handleReserve}
                            loading={reserving}
                            disabled={!reserverName.trim()}
                            leftSection={<IconGift size={16} />}
                        >
                            {t('wishlists.public.confirmReserve')}
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </Container>
    );
}
