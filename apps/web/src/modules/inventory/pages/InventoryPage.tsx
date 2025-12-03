import { useState } from 'react';
import {
    Text,
    SimpleGrid,
    Card,
    Group,
    Stack,
    Button,
    ActionIcon,
    Badge,
    Modal,
    TextInput,
    Textarea,
    NumberInput,
    Select,
    Menu,
    Paper,
    Skeleton,
    ThemeIcon,
    Table,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
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
import { notifications } from '@mantine/notifications';
import { useRequest, useMutation } from '../../../hooks';
import PageLayout, { StatsGrid } from '../../../components/PageLayout';


interface ItemLocation {
    area: string;
    container?: string;
    details?: string;
}

interface ItemLent {
    to: string;
    since: string;
    expectedReturn?: string;
}

interface InventoryItem {
    id: string;
    name: string;
    description: string;
    photos: string[];
    category: string;
    tags: string[];
    location: ItemLocation;
    quantity: number;
    purchaseDate?: string;
    purchasePrice?: number;
    currentValue?: number;
    serialNumber: string;
    qrCode: string;
    isLent?: ItemLent;
    createdAt: string;
    updatedAt: string;
}

interface CreateItemForm {
    name: string;
    description: string;
    category: string;
    location: ItemLocation;
    quantity: number;
    purchasePrice?: number;
    currentValue?: number;
    serialNumber: string;
}

const defaultForm: CreateItemForm = {
    name: '',
    description: '',
    category: '',
    location: { area: '' },
    quantity: 1,
    serialNumber: '',
};

export default function InventoryPage() {
    const [opened, { open, close }] = useDisclosure(false);
    const [lendOpened, { open: openLend, close: closeLend }] = useDisclosure(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [lendingItem, setLendingItem] = useState<InventoryItem | null>(null);
    const [form, setForm] = useState<CreateItemForm>(defaultForm);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState<string | null>(null);
    const [filterLocation, setFilterLocation] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [lendTo, setLendTo] = useState('');
    const [lendReturn, setLendReturn] = useState<Date | null>(null);

    const { data: items, isLoading, refetch } = useRequest<InventoryItem[]>('/inventory');
    const { data: categories } = useRequest<string[]>('/inventory/categories');
    const { data: locations } = useRequest<{ area: string; containers: string[] }[]>('/inventory/locations');
    const { data: stats } = useRequest<{
        totalItems: number;
        totalValue: number;
        lentItems: number;
        categories: number;
        locations: number;
    }>('/inventory/stats');

    const { mutate: createItem, isLoading: creating } = useMutation<InventoryItem, CreateItemForm>(
        '/inventory',
        { method: 'POST' }
    );

    const { mutate: updateItem } = useMutation<InventoryItem, { id: string; data: Partial<CreateItemForm> }>(
        (vars) => `/inventory/${vars.id}`,
        { method: 'PATCH' }
    );

    const { mutate: deleteItem } = useMutation<void, { id: string }>(
        (vars) => `/inventory/${vars.id}`,
        { method: 'DELETE' }
    );

    const { mutate: lendItem } = useMutation<InventoryItem, { id: string; to: string; expectedReturn?: string }>(
        (vars) => `/inventory/${vars.id}/lend`,
        { method: 'POST' }
    );

    const { mutate: returnItem } = useMutation<InventoryItem, { id: string }>(
        (vars) => `/inventory/${vars.id}/return`,
        { method: 'POST' }
    );

    const handleOpenCreate = () => {
        setEditingItem(null);
        setForm(defaultForm);
        open();
    };

    const handleOpenEdit = (item: InventoryItem) => {
        setEditingItem(item);
        setForm({
            name: item.name,
            description: item.description,
            category: item.category,
            location: item.location,
            quantity: item.quantity,
            purchasePrice: item.purchasePrice,
            currentValue: item.currentValue,
            serialNumber: item.serialNumber,
        });
        open();
    };

    const handleOpenLend = (item: InventoryItem) => {
        setLendingItem(item);
        setLendTo('');
        setLendReturn(null);
        openLend();
    };

    const handleSubmit = async () => {
        try {
            if (editingItem) {
                await updateItem({ id: editingItem.id, data: form });
                notifications.show({
                    title: 'Erfolg',
                    message: 'Artikel wurde aktualisiert',
                    color: 'green',
                });
            } else {
                await createItem(form);
                notifications.show({
                    title: 'Erfolg',
                    message: 'Artikel wurde erstellt',
                    color: 'green',
                });
            }
            close();
            refetch();
        } catch (error) {
            notifications.show({
                title: 'Fehler',
                message: 'Ein Fehler ist aufgetreten',
                color: 'red',
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Wirklich löschen?')) return;

        try {
            await deleteItem({ id });
            notifications.show({
                title: 'Erfolg',
                message: 'Artikel wurde gelöscht',
                color: 'green',
            });
            refetch();
        } catch (error) {
            notifications.show({
                title: 'Fehler',
                message: 'Artikel konnte nicht gelöscht werden',
                color: 'red',
            });
        }
    };

    const handleLendSubmit = async () => {
        if (!lendingItem || !lendTo) return;

        try {
            await lendItem({
                id: lendingItem.id,
                to: lendTo,
                expectedReturn: lendReturn?.toISOString(),
            });
            notifications.show({
                title: 'Erfolg',
                message: 'Artikel wurde verliehen',
                color: 'green',
            });
            closeLend();
            refetch();
        } catch (error) {
            notifications.show({
                title: 'Fehler',
                message: 'Artikel konnte nicht verliehen werden',
                color: 'red',
            });
        }
    };

    const handleReturn = async (id: string) => {
        try {
            await returnItem({ id });
            notifications.show({
                title: 'Erfolg',
                message: 'Artikel wurde zurückgegeben',
                color: 'green',
            });
            refetch();
        } catch (error) {
            notifications.show({
                title: 'Fehler',
                message: 'Artikel konnte nicht zurückgegeben werden',
                color: 'red',
            });
        }
    };

    // Filter items
    const filteredItems = items?.filter((item) => {
        const matchesSearch = !searchQuery ||
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.serialNumber.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = !filterCategory || item.category === filterCategory;
        const matchesLocation = !filterLocation || item.location.area === filterLocation;

        return matchesSearch && matchesCategory && matchesLocation;
    }) || [];

    // Render item card
    const renderItemCard = (item: InventoryItem) => (
        <Card key={item.id} shadow="sm" padding="lg" radius="md" withBorder>
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
                            onClick={() => handleOpenEdit(item)}
                        >
                            Bearbeiten
                        </Menu.Item>
                        {!item.isLent ? (
                            <Menu.Item
                                leftSection={<IconUser size={14} />}
                                onClick={() => handleOpenLend(item)}
                            >
                                Verleihen
                            </Menu.Item>
                        ) : (
                            <Menu.Item
                                leftSection={<IconArrowBack size={14} />}
                                onClick={() => handleReturn(item.id)}
                            >
                                Zurücknehmen
                            </Menu.Item>
                        )}
                        <Menu.Divider />
                        <Menu.Item
                            leftSection={<IconTrash size={14} />}
                            color="red"
                            onClick={() => handleDelete(item.id)}
                        >
                            Löschen
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
                    <Text size="sm">Menge: {item.quantity}</Text>
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
                        Verliehen an {item.isLent.to}
                    </Badge>
                )}
            </Stack>
        </Card>
    );

    // Render item table row
    const renderTableRow = (item: InventoryItem) => (
        <Table.Tr key={item.id}>
            <Table.Td>{item.name}</Table.Td>
            <Table.Td>{item.category}</Table.Td>
            <Table.Td>
                {item.location.area}
                {item.location.container && ` / ${item.location.container}`}
            </Table.Td>
            <Table.Td>{item.quantity}</Table.Td>
            <Table.Td>
                {item.currentValue ? `${item.currentValue.toFixed(2)} EUR` : '-'}
            </Table.Td>
            <Table.Td>
                {item.isLent ? (
                    <Badge color="orange" variant="filled">
                        Verliehen
                    </Badge>
                ) : (
                    <Badge color="green" variant="light">
                        Verfügbar
                    </Badge>
                )}
            </Table.Td>
            <Table.Td>
                <Menu shadow="md" width={200}>
                    <Menu.Target>
                        <ActionIcon variant="subtle">
                            <IconDotsVertical size={16} />
                        </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Item
                            leftSection={<IconEdit size={14} />}
                            onClick={() => handleOpenEdit(item)}
                        >
                            Bearbeiten
                        </Menu.Item>
                        {!item.isLent ? (
                            <Menu.Item
                                leftSection={<IconUser size={14} />}
                                onClick={() => handleOpenLend(item)}
                            >
                                Verleihen
                            </Menu.Item>
                        ) : (
                            <Menu.Item
                                leftSection={<IconArrowBack size={14} />}
                                onClick={() => handleReturn(item.id)}
                            >
                                Zurücknehmen
                            </Menu.Item>
                        )}
                        <Menu.Divider />
                        <Menu.Item
                            leftSection={<IconTrash size={14} />}
                            color="red"
                            onClick={() => handleDelete(item.id)}
                        >
                            Löschen
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </Table.Td>
        </Table.Tr>
    );

    return (
        <PageLayout
            header={{
                title: 'Inventar',
                subtitle: 'Verwalten Sie Ihre Gegenstände',
                actionLabel: 'Neuer Artikel',
                onAction: handleOpenCreate,
            }}
            stats={
                stats && (
                    <StatsGrid
                        stats={[
                            { value: stats.totalItems, label: 'Artikel' },
                            { value: `${stats.totalValue.toFixed(2)} EUR`, label: 'Gesamtwert' },
                            { value: stats.lentItems, label: 'Verliehen' },
                            { value: stats.categories, label: 'Kategorien' },
                        ]}
                    />
                )
            }
            searchBar={{
                value: searchQuery,
                onChange: setSearchQuery,
                placeholder: 'Artikel suchen...',
                rightSection: (
                    <Group>
                        <Select
                            placeholder="Kategorie"
                            data={categories || []}
                            value={filterCategory}
                            onChange={setFilterCategory}
                            clearable
                            style={{ width: 200 }}
                        />
                        <Select
                            placeholder="Standort"
                            data={locations?.map(l => l.area) || []}
                            value={filterLocation}
                            onChange={setFilterLocation}
                            clearable
                            style={{ width: 200 }}
                        />
                        <Button.Group>
                            <Button
                                variant={viewMode === 'grid' ? 'filled' : 'default'}
                                onClick={() => setViewMode('grid')}
                            >
                                Kacheln
                            </Button>
                            <Button
                                variant={viewMode === 'table' ? 'filled' : 'default'}
                                onClick={() => setViewMode('table')}
                            >
                                Tabelle
                            </Button>
                        </Button.Group>
                    </Group>
                ),
            }}
        >
            {isLoading ? (
                <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} height={200} />
                    ))}
                </SimpleGrid>
            ) : filteredItems.length === 0 ? (
                <Paper withBorder p="xl" ta="center">
                    <Text c="dimmed">Keine Artikel gefunden</Text>
                </Paper>
            ) : viewMode === 'grid' ? (
                <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
                    {filteredItems.map(renderItemCard)}
                </SimpleGrid>
            ) : (
                <Paper withBorder>
                    <Table striped highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Name</Table.Th>
                                <Table.Th>Kategorie</Table.Th>
                                <Table.Th>Standort</Table.Th>
                                <Table.Th>Menge</Table.Th>
                                <Table.Th>Wert</Table.Th>
                                <Table.Th>Status</Table.Th>
                                <Table.Th>Aktionen</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {filteredItems.map(renderTableRow)}
                        </Table.Tbody>
                    </Table>
                </Paper>
            )}

            {/* Create/Edit Modal */}
            <Modal
                opened={opened}
                onClose={close}
                title={editingItem ? 'Artikel bearbeiten' : 'Neuer Artikel'}
                size="lg"
            >
                <Stack gap="md">
                    <TextInput
                        label="Name"
                        placeholder="Artikelname"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.currentTarget.value })}
                        required
                    />

                    <Textarea
                        label="Beschreibung"
                        placeholder="Beschreibung des Artikels"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.currentTarget.value })}
                        minRows={3}
                    />

                    <Select
                        label="Kategorie"
                        placeholder="Kategorie auswählen"
                        data={categories || []}
                        value={form.category}
                        onChange={(value) => setForm({ ...form, category: value || '' })}
                        searchable
                        allowDeselect={false}
                        required
                    />

                    <TextInput
                        label="Standort (Bereich)"
                        placeholder="z.B. Keller, Garage"
                        value={form.location.area}
                        onChange={(e) => setForm({
                            ...form,
                            location: { ...form.location, area: e.currentTarget.value }
                        })}
                        required
                    />

                    <TextInput
                        label="Standort (Container)"
                        placeholder="z.B. Regal A, Kiste 3"
                        value={form.location.container || ''}
                        onChange={(e) => setForm({
                            ...form,
                            location: { ...form.location, container: e.currentTarget.value }
                        })}
                    />

                    <TextInput
                        label="Standort (Details)"
                        placeholder="Zusätzliche Details"
                        value={form.location.details || ''}
                        onChange={(e) => setForm({
                            ...form,
                            location: { ...form.location, details: e.currentTarget.value }
                        })}
                    />

                    <NumberInput
                        label="Menge"
                        placeholder="1"
                        value={form.quantity}
                        onChange={(value) => setForm({ ...form, quantity: Number(value) || 1 })}
                        min={1}
                        required
                    />

                    <NumberInput
                        label="Kaufpreis (EUR)"
                        placeholder="0.00"
                        value={form.purchasePrice}
                        onChange={(value) => setForm({ ...form, purchasePrice: Number(value) })}
                        decimalScale={2}
                        min={0}
                    />

                    <NumberInput
                        label="Aktueller Wert (EUR)"
                        placeholder="0.00"
                        value={form.currentValue}
                        onChange={(value) => setForm({ ...form, currentValue: Number(value) })}
                        decimalScale={2}
                        min={0}
                    />

                    <TextInput
                        label="Seriennummer"
                        placeholder="Seriennummer oder ID"
                        value={form.serialNumber}
                        onChange={(e) => setForm({ ...form, serialNumber: e.currentTarget.value })}
                    />

                    <Group justify="flex-end">
                        <Button variant="default" onClick={close}>
                            Abbrechen
                        </Button>
                        <Button onClick={handleSubmit} loading={creating}>
                            {editingItem ? 'Speichern' : 'Erstellen'}
                        </Button>
                    </Group>
                </Stack>
            </Modal>

            {/* Lend Modal */}
            <Modal
                opened={lendOpened}
                onClose={closeLend}
                title={`Artikel verleihen: ${lendingItem?.name}`}
            >
                <Stack gap="md">
                    <TextInput
                        label="Verliehen an"
                        placeholder="Name der Person"
                        value={lendTo}
                        onChange={(e) => setLendTo(e.currentTarget.value)}
                        required
                    />

                    <DateInput
                        label="Erwartete Rückgabe"
                        placeholder="Datum auswählen"
                        value={lendReturn}
                        onChange={setLendReturn}
                        clearable
                    />

                    <Group justify="flex-end">
                        <Button variant="default" onClick={closeLend}>
                            Abbrechen
                        </Button>
                        <Button onClick={handleLendSubmit} disabled={!lendTo}>
                            Verleihen
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </PageLayout>
    );
}
