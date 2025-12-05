import {
    Card,
    Group,
    Stack,
    Text,
    ActionIcon,
    Badge,
    Menu,
    ThemeIcon,
} from '@mantine/core';
import {
    IconDotsVertical,
    IconEdit,
    IconTrash,
    IconBox,
    IconMapPin,
    IconTag,
    IconUser,
    IconArrowBack,
    IconCurrencyEuro,
    IconQrcode,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { InventoryItem } from '../types';

interface InventoryCardProps {
    item: InventoryItem;
    onEdit: (item: InventoryItem) => void;
    onDelete: (id: string) => void;
    onLend: (item: InventoryItem) => void;
    onReturn: (id: string) => void;
}

export function InventoryCard({ item, onEdit, onDelete, onLend, onReturn }: InventoryCardProps) {
    const { t } = useTranslation();

    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="xs">
                <Text fw={700} size="lg">{item.name}</Text>
                <Menu shadow="md" width={200}>
                    <Menu.Target>
                        <ActionIcon variant="subtle">
                            <IconDotsVertical size={16} />
                        </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Item
                            leftSection={<IconEdit size={14} />}
                            onClick={() => onEdit(item)}
                        >
                            {t('common.edit')}
                        </Menu.Item>
                        {!item.isLent ? (
                            <Menu.Item
                                leftSection={<IconUser size={14} />}
                                onClick={() => onLend(item)}
                            >
                                {t('inventory.lend')}
                            </Menu.Item>
                        ) : (
                            <Menu.Item
                                leftSection={<IconArrowBack size={14} />}
                                onClick={() => onReturn(item.id)}
                            >
                                {t('inventory.return')}
                            </Menu.Item>
                        )}
                        <Menu.Divider />
                        <Menu.Item
                            leftSection={<IconTrash size={14} />}
                            color="red"
                            onClick={() => onDelete(item.id)}
                        >
                            {t('common.delete')}
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </Group>

            <Text size="sm" c="dimmed" mb="md">
                {item.description}
            </Text>

            <Stack gap="xs">
                <Group>
                    <ThemeIcon size="sm" variant="light">
                        <IconTag size={14} />
                    </ThemeIcon>
                    <Text size="sm">{item.category}</Text>
                </Group>

                <Group>
                    <ThemeIcon size="sm" variant="light">
                        <IconMapPin size={14} />
                    </ThemeIcon>
                    <Text size="sm">
                        {item.location.area}
                        {item.location.container && ` / ${item.location.container}`}
                    </Text>
                </Group>

                <Group>
                    <ThemeIcon size="sm" variant="light">
                        <IconBox size={14} />
                    </ThemeIcon>
                    <Text size="sm">{t('inventory.quantity')}: {item.quantity}</Text>
                </Group>

                {item.currentValue && (
                    <Group>
                        <ThemeIcon size="sm" variant="light">
                            <IconCurrencyEuro size={14} />
                        </ThemeIcon>
                        <Text size="sm">{item.currentValue.toFixed(2)} EUR</Text>
                    </Group>
                )}

                {item.serialNumber && (
                    <Group>
                        <ThemeIcon size="sm" variant="light">
                            <IconQrcode size={14} />
                        </ThemeIcon>
                        <Text size="sm">{item.serialNumber}</Text>
                    </Group>
                )}

                {item.isLent && (
                    <Badge color="orange" variant="filled" mt="sm">
                        {t('inventory.lentTo')} {item.isLent.to}
                    </Badge>
                )}
            </Stack>
        </Card>
    );
}
