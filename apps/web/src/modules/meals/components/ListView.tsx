import {
    Paper,
    Table,
    Group,
    Text,
    Image,
    ThemeIcon,
    Badge,
    ActionIcon,
    Menu,
} from '@mantine/core';
import {
    IconChefHat,
    IconStarFilled,
    IconFlame,
    IconDotsVertical,
    IconCheck,
    IconStar,
    IconEdit,
    IconTrash,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { MealWithDetails } from '@ycmm/core';
import { mealTypeOptions, formatTime } from '../types';

interface ListViewProps {
    meals: MealWithDetails[];
    onToggleFavorite: (id: string) => void;
    onMarkCooked: (id: string) => void;
    onEdit: (meal: MealWithDetails) => void;
    onDelete: (id: string) => void;
}

export function ListView({ meals, onToggleFavorite, onMarkCooked, onEdit, onDelete }: ListViewProps) {
    const { t } = useTranslation();

    return (
        <Paper shadow="sm" withBorder radius="md">
            <Table striped highlightOnHover>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>{t('meals.table.recipe')}</Table.Th>
                        <Table.Th>{t('meals.table.type')}</Table.Th>
                        <Table.Th>{t('meals.table.cuisine')}</Table.Th>
                        <Table.Th>{t('meals.table.time')}</Table.Th>
                        <Table.Th>{t('meals.table.servings')}</Table.Th>
                        <Table.Th>{t('meals.table.cooked')}</Table.Th>
                        <Table.Th>{t('meals.table.actions')}</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {meals.map(meal => (
                        <Table.Tr key={meal.id}>
                            <Table.Td>
                                <Group gap="sm">
                                    {meal.imageUrl ? (
                                        <Image src={meal.imageUrl} width={40} height={40} radius="sm" fit="cover" />
                                    ) : (
                                        <ThemeIcon size={40} variant="light" color="grape">
                                            <IconChefHat size={20} />
                                        </ThemeIcon>
                                    )}
                                    <div>
                                        <Group gap={4}>
                                            <Text fw={500} size="sm">{meal.name}</Text>
                                            {meal.isFavorite && <IconStarFilled size={14} style={{ color: 'gold' }} />}
                                        </Group>
                                        {meal.description && <Text size="xs" c="dimmed" lineClamp={1}>{meal.description}</Text>}
                                    </div>
                                </Group>
                            </Table.Td>
                            <Table.Td>
                                <Group gap={4}>
                                    {meal.mealType.map(type => (
                                        <Badge key={type} size="xs" variant="light">
                                            {t(mealTypeOptions.find(opt => opt.value === type)?.label || '')}
                                        </Badge>
                                    ))}
                                </Group>
                            </Table.Td>
                            <Table.Td>{meal.cuisine || '-'}</Table.Td>
                            <Table.Td>{formatTime((meal.prepTime || 0) + (meal.cookTime || 0))}</Table.Td>
                            <Table.Td>{meal.servings || '-'}</Table.Td>
                            <Table.Td>
                                {meal.timesCooked > 0 ? (
                                    <Group gap={4}>
                                        <IconFlame size={14} />
                                        <Text size="sm">{meal.timesCooked}x</Text>
                                    </Group>
                                ) : '-'}
                            </Table.Td>
                            <Table.Td>
                                <Menu shadow="md" position="bottom-end">
                                    <Menu.Target>
                                        <ActionIcon variant="subtle" size="sm">
                                            <IconDotsVertical size={16} />
                                        </ActionIcon>
                                    </Menu.Target>
                                    <Menu.Dropdown>
                                        <Menu.Item
                                            leftSection={<IconCheck size={16} />}
                                            onClick={() => onMarkCooked(meal.id)}
                                        >
                                            {t('meals.markAsCooked')}
                                        </Menu.Item>
                                        <Menu.Item
                                            leftSection={meal.isFavorite ? <IconStarFilled size={16} /> : <IconStar size={16} />}
                                            onClick={() => onToggleFavorite(meal.id)}
                                        >
                                            {meal.isFavorite ? t('meals.removeFavorite') : t('meals.addFavorite')}
                                        </Menu.Item>
                                        <Menu.Divider />
                                        <Menu.Item
                                            leftSection={<IconEdit size={16} />}
                                            onClick={() => onEdit(meal)}
                                        >
                                            {t('meals.edit')}
                                        </Menu.Item>
                                        <Menu.Item
                                            leftSection={<IconTrash size={16} />}
                                            color="red"
                                            onClick={() => onDelete(meal.id)}
                                        >
                                            {t('meals.delete')}
                                        </Menu.Item>
                                    </Menu.Dropdown>
                                </Menu>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
        </Paper>
    );
}
