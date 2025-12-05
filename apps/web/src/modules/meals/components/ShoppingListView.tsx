import {
    Stack,
    Group,
    Text,
    Paper,
    Checkbox,
} from '@mantine/core';
import { IconShoppingCart } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { ShoppingListItem } from '@ycmm/core';

interface ShoppingListViewProps {
    weekStart: Date;
    weekEnd: Date;
    shoppingList: ShoppingListItem[] | undefined;
}

export function ShoppingListView({ weekStart, weekEnd, shoppingList }: ShoppingListViewProps) {
    const { t } = useTranslation();

    return (
        <Stack gap="lg">
            <Group justify="space-between">
                <div>
                    <Text size="lg" fw={500}>{t('meals.shopping.title')}</Text>
                    <Text size="sm" c="dimmed">
                        {t('meals.shopping.weekRange', {
                            start: weekStart.toLocaleDateString('de-DE'),
                            end: weekEnd.toLocaleDateString('de-DE')
                        })}
                    </Text>
                </div>
            </Group>

            {shoppingList && shoppingList.length > 0 ? (
                <Paper shadow="sm" p="lg" radius="md" withBorder>
                    <Stack gap="md">
                        {shoppingList.map((item, idx) => (
                            <Group key={idx} gap="md">
                                <Checkbox />
                                <div style={{ flex: 1 }}>
                                    <Text>
                                        {item.amount} {item.ingredient}
                                    </Text>
                                    <Text size="xs" c="dimmed">
                                        {item.meals.join(', ')}
                                    </Text>
                                </div>
                            </Group>
                        ))}
                    </Stack>
                </Paper>
            ) : (
                <Paper shadow="sm" p="xl" radius="md" withBorder>
                    <Stack align="center" gap="md">
                        <IconShoppingCart size={60} opacity={0.3} />
                        <Text size="lg" c="dimmed">{t('meals.shopping.noList')}</Text>
                        <Text size="sm" c="dimmed" ta="center">
                            {t('meals.shopping.noListHint')}
                        </Text>
                    </Stack>
                </Paper>
            )}
        </Stack>
    );
}
