import { useState } from 'react';
import { ContextModalProps } from '@mantine/modals';
import {
    Stack,
    TextInput,
    Textarea,
    Select,
    ColorInput,
    NumberInput,
    Group,
    Button,
    SegmentedControl,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { useMutation } from '../hooks';

// ============ HABIT CREATE MODAL ============
interface HabitForm {
    name: string;
    description: string;
    icon: string;
    color: string;
    type: 'boolean' | 'quantity' | 'duration';
    targetValue?: number;
    unit?: string;
    frequency: 'daily' | 'weekly' | 'custom';
}

const defaultHabitForm: HabitForm = {
    name: '',
    description: '',
    icon: 'check',
    color: '#228be6',
    type: 'boolean',
    frequency: 'daily',
};

export function HabitCreateModal({ context, id, innerProps }: ContextModalProps<{ onSuccess?: () => void }>) {
    const [form, setForm] = useState<HabitForm>(defaultHabitForm);
    const { mutate: createHabit, isLoading } = useMutation('/habits', { method: 'POST' });

    const handleSubmit = async () => {
        if (!form.name.trim()) {
            notifications.show({ title: 'Fehler', message: 'Bitte gib einen Namen ein', color: 'red' });
            return;
        }
        await createHabit(form);
        notifications.show({ title: 'Erfolg', message: 'Habit erstellt', color: 'green' });
        innerProps.onSuccess?.();
        context.closeModal(id);
    };

    return (
        <Stack>
            <TextInput
                label="Name"
                placeholder="z.B. Wasser trinken"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.currentTarget.value })}
                required
                data-autofocus
            />
            <Textarea
                label="Beschreibung"
                placeholder="Optional"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.currentTarget.value })}
            />
            <Select
                label="Typ"
                data={[
                    { value: 'boolean', label: 'Ja/Nein' },
                    { value: 'quantity', label: 'Menge' },
                    { value: 'duration', label: 'Dauer' },
                ]}
                value={form.type}
                onChange={(v) => setForm({ ...form, type: (v as HabitForm['type']) || 'boolean' })}
            />
            {form.type !== 'boolean' && (
                <Group grow>
                    <NumberInput
                        label="Zielwert"
                        value={form.targetValue}
                        onChange={(v) => setForm({ ...form, targetValue: Number(v) || undefined })}
                    />
                    <TextInput
                        label="Einheit"
                        placeholder={form.type === 'duration' ? 'Minuten' : 'Stück'}
                        value={form.unit || ''}
                        onChange={(e) => setForm({ ...form, unit: e.currentTarget.value })}
                    />
                </Group>
            )}
            <ColorInput
                label="Farbe"
                value={form.color}
                onChange={(color) => setForm({ ...form, color })}
            />
            <Button onClick={handleSubmit} loading={isLoading} fullWidth mt="md">
                Erstellen
            </Button>
        </Stack>
    );
}

// ============ EXPENSE CREATE MODAL ============
interface ExpenseForm {
    amount: number;
    description: string;
    categoryId: string;
    date: Date;
}

export function ExpenseCreateModal({ context, id, innerProps }: ContextModalProps<{ onSuccess?: () => void; categories?: { id: string; name: string }[] }>) {
    const [form, setForm] = useState<ExpenseForm>({
        amount: 0,
        description: '',
        categoryId: '',
        date: new Date(),
    });
    const { mutate: createExpense, isLoading } = useMutation('/expenses', { method: 'POST' });

    const handleSubmit = async () => {
        if (form.amount <= 0) {
            notifications.show({ title: 'Fehler', message: 'Bitte gib einen Betrag ein', color: 'red' });
            return;
        }
        await createExpense({ ...form, date: form.date.toISOString() });
        notifications.show({ title: 'Erfolg', message: 'Ausgabe erfasst', color: 'green' });
        innerProps.onSuccess?.();
        context.closeModal(id);
    };

    return (
        <Stack>
            <NumberInput
                label="Betrag"
                placeholder="0.00"
                min={0}
                decimalScale={2}
                value={form.amount}
                onChange={(v) => setForm({ ...form, amount: Number(v) || 0 })}
                required
                data-autofocus
            />
            <TextInput
                label="Beschreibung"
                placeholder="Wofür?"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.currentTarget.value })}
            />
            <DateInput
                label="Datum"
                value={form.date}
                onChange={(d) => setForm({ ...form, date: d || new Date() })}
            />
            <Button onClick={handleSubmit} loading={isLoading} fullWidth mt="md">
                Erstellen
            </Button>
        </Stack>
    );
}

// ============ DEADLINE CREATE MODAL ============
interface DeadlineForm {
    title: string;
    description: string;
    dueDate: Date;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category: string;
}

export function DeadlineCreateModal({ context, id, innerProps }: ContextModalProps<{ onSuccess?: () => void }>) {
    const [form, setForm] = useState<DeadlineForm>({
        title: '',
        description: '',
        dueDate: new Date(),
        priority: 'medium',
        category: '',
    });
    const { mutate: createDeadline, isLoading } = useMutation('/deadlines', { method: 'POST' });

    const handleSubmit = async () => {
        if (!form.title.trim()) {
            notifications.show({ title: 'Fehler', message: 'Bitte gib einen Titel ein', color: 'red' });
            return;
        }
        await createDeadline({ ...form, dueDate: form.dueDate.toISOString() });
        notifications.show({ title: 'Erfolg', message: 'Frist erstellt', color: 'green' });
        innerProps.onSuccess?.();
        context.closeModal(id);
    };

    return (
        <Stack>
            <TextInput
                label="Titel"
                placeholder="Was ist zu erledigen?"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.currentTarget.value })}
                required
                data-autofocus
            />
            <Textarea
                label="Beschreibung"
                placeholder="Optional"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.currentTarget.value })}
            />
            <DateInput
                label="Fällig am"
                value={form.dueDate}
                onChange={(d) => setForm({ ...form, dueDate: d || new Date() })}
                required
            />
            <Select
                label="Priorität"
                data={[
                    { value: 'low', label: 'Niedrig' },
                    { value: 'medium', label: 'Mittel' },
                    { value: 'high', label: 'Hoch' },
                    { value: 'urgent', label: 'Dringend' },
                ]}
                value={form.priority}
                onChange={(v) => setForm({ ...form, priority: (v as DeadlineForm['priority']) || 'medium' })}
            />
            <Button onClick={handleSubmit} loading={isLoading} fullWidth mt="md">
                Erstellen
            </Button>
        </Stack>
    );
}

// ============ SUBSCRIPTION CREATE MODAL ============
interface SubscriptionForm {
    name: string;
    description: string;
    amount: number;
    billingCycle: 'monthly' | 'yearly' | 'weekly' | 'quarterly';
    billingDay: number;
    category: string;
    website: string;
}

export function SubscriptionCreateModal({ context, id, innerProps }: ContextModalProps<{ onSuccess?: () => void }>) {
    const [form, setForm] = useState<SubscriptionForm>({
        name: '',
        description: '',
        amount: 0,
        billingCycle: 'monthly',
        billingDay: new Date().getDate(),
        category: '',
        website: '',
    });
    const { mutate: createSubscription, isLoading } = useMutation('/subscriptions', { method: 'POST' });

    const handleSubmit = async () => {
        if (!form.name.trim() || form.amount <= 0) {
            notifications.show({ title: 'Fehler', message: 'Name und Betrag erforderlich', color: 'red' });
            return;
        }
        await createSubscription(form);
        notifications.show({ title: 'Erfolg', message: 'Abo erstellt', color: 'green' });
        innerProps.onSuccess?.();
        context.closeModal(id);
    };

    return (
        <Stack>
            <TextInput
                label="Name"
                placeholder="z.B. Netflix"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.currentTarget.value })}
                required
                data-autofocus
            />
            <NumberInput
                label="Betrag"
                min={0}
                decimalScale={2}
                value={form.amount}
                onChange={(v) => setForm({ ...form, amount: Number(v) || 0 })}
                required
            />
            <Select
                label="Abrechnungszyklus"
                data={[
                    { value: 'weekly', label: 'Wöchentlich' },
                    { value: 'monthly', label: 'Monatlich' },
                    { value: 'quarterly', label: 'Vierteljährlich' },
                    { value: 'yearly', label: 'Jährlich' },
                ]}
                value={form.billingCycle}
                onChange={(v) => setForm({ ...form, billingCycle: (v as SubscriptionForm['billingCycle']) || 'monthly' })}
            />
            <TextInput
                label="Website"
                placeholder="https://..."
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.currentTarget.value })}
            />
            <Button onClick={handleSubmit} loading={isLoading} fullWidth mt="md">
                Erstellen
            </Button>
        </Stack>
    );
}

// ============ LIST CREATE MODAL ============
interface ListForm {
    name: string;
    description: string;
    type: 'shopping' | 'todo' | 'packing' | 'checklist' | 'custom';
    color: string;
}

export function ListCreateModal({ context, id, innerProps }: ContextModalProps<{ onSuccess?: () => void }>) {
    const [form, setForm] = useState<ListForm>({
        name: '',
        description: '',
        type: 'todo',
        color: '#228be6',
    });
    const { mutate: createList, isLoading } = useMutation('/lists', { method: 'POST' });

    const handleSubmit = async () => {
        if (!form.name.trim()) {
            notifications.show({ title: 'Fehler', message: 'Bitte gib einen Namen ein', color: 'red' });
            return;
        }
        await createList(form);
        notifications.show({ title: 'Erfolg', message: 'Liste erstellt', color: 'green' });
        innerProps.onSuccess?.();
        context.closeModal(id);
    };

    return (
        <Stack>
            <TextInput
                label="Name"
                placeholder="z.B. Einkaufsliste"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.currentTarget.value })}
                required
                data-autofocus
            />
            <Textarea
                label="Beschreibung"
                placeholder="Optional"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.currentTarget.value })}
            />
            <Select
                label="Typ"
                data={[
                    { value: 'todo', label: 'To-Do' },
                    { value: 'shopping', label: 'Einkaufsliste' },
                    { value: 'packing', label: 'Packliste' },
                    { value: 'checklist', label: 'Checkliste' },
                    { value: 'custom', label: 'Benutzerdefiniert' },
                ]}
                value={form.type}
                onChange={(v) => setForm({ ...form, type: (v as ListForm['type']) || 'todo' })}
            />
            <ColorInput
                label="Farbe"
                value={form.color}
                onChange={(color) => setForm({ ...form, color })}
            />
            <Button onClick={handleSubmit} loading={isLoading} fullWidth mt="md">
                Erstellen
            </Button>
        </Stack>
    );
}

// ============ PROJECT CREATE MODAL ============
interface ProjectForm {
    name: string;
    description: string;
    type: 'project' | 'goal';
    color: string;
    targetDate?: Date;
}

export function ProjectCreateModal({ context, id, innerProps }: ContextModalProps<{ onSuccess?: () => void }>) {
    const [form, setForm] = useState<ProjectForm>({
        name: '',
        description: '',
        type: 'project',
        color: '#228be6',
    });
    const { mutate: createProject, isLoading } = useMutation('/projects', { method: 'POST' });

    const handleSubmit = async () => {
        if (!form.name.trim()) {
            notifications.show({ title: 'Fehler', message: 'Bitte gib einen Namen ein', color: 'red' });
            return;
        }
        await createProject({
            ...form,
            targetDate: form.targetDate?.toISOString(),
        });
        notifications.show({ title: 'Erfolg', message: 'Projekt erstellt', color: 'green' });
        innerProps.onSuccess?.();
        context.closeModal(id);
    };

    return (
        <Stack>
            <TextInput
                label="Name"
                placeholder="Name des Projekts"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.currentTarget.value })}
                required
                data-autofocus
            />
            <Textarea
                label="Beschreibung"
                placeholder="Optional"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.currentTarget.value })}
            />
            <SegmentedControl
                fullWidth
                data={[
                    { value: 'project', label: 'Projekt' },
                    { value: 'goal', label: 'Ziel' },
                ]}
                value={form.type}
                onChange={(v) => setForm({ ...form, type: v as 'project' | 'goal' })}
            />
            <DateInput
                label="Zieldatum"
                placeholder="Optional"
                value={form.targetDate}
                onChange={(d) => setForm({ ...form, targetDate: d || undefined })}
                clearable
            />
            <ColorInput
                label="Farbe"
                value={form.color}
                onChange={(color) => setForm({ ...form, color })}
            />
            <Button onClick={handleSubmit} loading={isLoading} fullWidth mt="md">
                Erstellen
            </Button>
        </Stack>
    );
}

// ============ MEDIA CREATE MODAL ============
interface MediaForm {
    type: 'movie' | 'series' | 'book' | 'game' | 'anime' | 'manga';
    title: string;
    creator: string;
    year?: number;
    status: 'planned' | 'in_progress' | 'completed' | 'dropped' | 'on_hold';
}

export function MediaCreateModal({ context, id, innerProps }: ContextModalProps<{ onSuccess?: () => void }>) {
    const [form, setForm] = useState<MediaForm>({
        type: 'movie',
        title: '',
        creator: '',
        status: 'planned',
    });
    const { mutate: createMedia, isLoading } = useMutation('/media', { method: 'POST' });

    const handleSubmit = async () => {
        if (!form.title.trim()) {
            notifications.show({ title: 'Fehler', message: 'Bitte gib einen Titel ein', color: 'red' });
            return;
        }
        await createMedia(form);
        notifications.show({ title: 'Erfolg', message: 'Medium hinzugefügt', color: 'green' });
        innerProps.onSuccess?.();
        context.closeModal(id);
    };

    return (
        <Stack>
            <Select
                label="Typ"
                data={[
                    { value: 'movie', label: 'Film' },
                    { value: 'series', label: 'Serie' },
                    { value: 'book', label: 'Buch' },
                    { value: 'game', label: 'Spiel' },
                    { value: 'anime', label: 'Anime' },
                    { value: 'manga', label: 'Manga' },
                ]}
                value={form.type}
                onChange={(v) => setForm({ ...form, type: (v as MediaForm['type']) || 'movie' })}
            />
            <TextInput
                label="Titel"
                placeholder="Titel des Mediums"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.currentTarget.value })}
                required
                data-autofocus
            />
            <TextInput
                label="Ersteller"
                placeholder="Regisseur, Autor, etc."
                value={form.creator}
                onChange={(e) => setForm({ ...form, creator: e.currentTarget.value })}
            />
            <NumberInput
                label="Jahr"
                placeholder="Erscheinungsjahr"
                value={form.year}
                onChange={(v) => setForm({ ...form, year: Number(v) || undefined })}
            />
            <Select
                label="Status"
                data={[
                    { value: 'planned', label: 'Geplant' },
                    { value: 'in_progress', label: 'Am Schauen/Lesen' },
                    { value: 'completed', label: 'Abgeschlossen' },
                    { value: 'on_hold', label: 'Pausiert' },
                    { value: 'dropped', label: 'Abgebrochen' },
                ]}
                value={form.status}
                onChange={(v) => setForm({ ...form, status: (v as MediaForm['status']) || 'planned' })}
            />
            <Button onClick={handleSubmit} loading={isLoading} fullWidth mt="md">
                Erstellen
            </Button>
        </Stack>
    );
}

// ============ MEAL CREATE MODAL ============
interface MealForm {
    name: string;
    description: string;
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert' | 'drink';
    prepTime?: number;
    cookTime?: number;
}

export function MealCreateModal({ context, id, innerProps }: ContextModalProps<{ onSuccess?: () => void }>) {
    const [form, setForm] = useState<MealForm>({
        name: '',
        description: '',
        type: 'dinner',
    });
    const { mutate: createMeal, isLoading } = useMutation('/meals', { method: 'POST' });

    const handleSubmit = async () => {
        if (!form.name.trim()) {
            notifications.show({ title: 'Fehler', message: 'Bitte gib einen Namen ein', color: 'red' });
            return;
        }
        await createMeal(form);
        notifications.show({ title: 'Erfolg', message: 'Rezept hinzugefügt', color: 'green' });
        innerProps.onSuccess?.();
        context.closeModal(id);
    };

    return (
        <Stack>
            <TextInput
                label="Name"
                placeholder="Name des Gerichts"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.currentTarget.value })}
                required
                data-autofocus
            />
            <Textarea
                label="Beschreibung"
                placeholder="Optional"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.currentTarget.value })}
            />
            <Select
                label="Typ"
                data={[
                    { value: 'breakfast', label: 'Frühstück' },
                    { value: 'lunch', label: 'Mittagessen' },
                    { value: 'dinner', label: 'Abendessen' },
                    { value: 'snack', label: 'Snack' },
                    { value: 'dessert', label: 'Dessert' },
                    { value: 'drink', label: 'Getränk' },
                ]}
                value={form.type}
                onChange={(v) => setForm({ ...form, type: (v as MealForm['type']) || 'dinner' })}
            />
            <Group grow>
                <NumberInput
                    label="Vorbereitungszeit (Min)"
                    min={0}
                    value={form.prepTime}
                    onChange={(v) => setForm({ ...form, prepTime: Number(v) || undefined })}
                />
                <NumberInput
                    label="Kochzeit (Min)"
                    min={0}
                    value={form.cookTime}
                    onChange={(v) => setForm({ ...form, cookTime: Number(v) || undefined })}
                />
            </Group>
            <Button onClick={handleSubmit} loading={isLoading} fullWidth mt="md">
                Erstellen
            </Button>
        </Stack>
    );
}

// ============ INVENTORY CREATE MODAL ============
interface InventoryForm {
    name: string;
    description: string;
    category: string;
    location: { area: string; container?: string };
    quantity: number;
}

export function InventoryCreateModal({ context, id, innerProps }: ContextModalProps<{ onSuccess?: () => void }>) {
    const [form, setForm] = useState<InventoryForm>({
        name: '',
        description: '',
        category: '',
        location: { area: '' },
        quantity: 1,
    });
    const { mutate: createItem, isLoading } = useMutation('/inventory', { method: 'POST' });

    const handleSubmit = async () => {
        if (!form.name.trim() || !form.location.area.trim()) {
            notifications.show({ title: 'Fehler', message: 'Name und Standort erforderlich', color: 'red' });
            return;
        }
        await createItem(form);
        notifications.show({ title: 'Erfolg', message: 'Item erstellt', color: 'green' });
        innerProps.onSuccess?.();
        context.closeModal(id);
    };

    return (
        <Stack>
            <TextInput
                label="Name"
                placeholder="Name des Items"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.currentTarget.value })}
                required
                data-autofocus
            />
            <Textarea
                label="Beschreibung"
                placeholder="Optional"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.currentTarget.value })}
            />
            <TextInput
                label="Kategorie"
                placeholder="z.B. Elektronik, Bücher"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.currentTarget.value })}
            />
            <Group grow>
                <TextInput
                    label="Standort"
                    placeholder="z.B. Wohnzimmer"
                    value={form.location.area}
                    onChange={(e) => setForm({ ...form, location: { ...form.location, area: e.currentTarget.value } })}
                    required
                />
                <TextInput
                    label="Container"
                    placeholder="z.B. Regal 1"
                    value={form.location.container || ''}
                    onChange={(e) => setForm({ ...form, location: { ...form.location, container: e.currentTarget.value } })}
                />
            </Group>
            <NumberInput
                label="Anzahl"
                min={1}
                value={form.quantity}
                onChange={(v) => setForm({ ...form, quantity: Number(v) || 1 })}
            />
            <Button onClick={handleSubmit} loading={isLoading} fullWidth mt="md">
                Erstellen
            </Button>
        </Stack>
    );
}

// ============ APPLICATION CREATE MODAL ============
interface ApplicationForm {
    companyName: string;
    jobTitle: string;
    location: string;
    remote: 'onsite' | 'hybrid' | 'remote';
}

export function ApplicationCreateModal({ context, id, innerProps }: ContextModalProps<{ onSuccess?: () => void }>) {
    const [form, setForm] = useState<ApplicationForm>({
        companyName: '',
        jobTitle: '',
        location: '',
        remote: 'onsite',
    });
    const { mutate: createApp, isLoading } = useMutation('/applications', { method: 'POST' });

    const handleSubmit = async () => {
        if (!form.companyName.trim() || !form.jobTitle.trim()) {
            notifications.show({ title: 'Fehler', message: 'Firma und Stelle erforderlich', color: 'red' });
            return;
        }
        await createApp(form);
        notifications.show({ title: 'Erfolg', message: 'Bewerbung erstellt', color: 'green' });
        innerProps.onSuccess?.();
        context.closeModal(id);
    };

    return (
        <Stack>
            <TextInput
                label="Unternehmen"
                placeholder="Name des Unternehmens"
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.currentTarget.value })}
                required
                data-autofocus
            />
            <TextInput
                label="Stelle"
                placeholder="Jobtitel"
                value={form.jobTitle}
                onChange={(e) => setForm({ ...form, jobTitle: e.currentTarget.value })}
                required
            />
            <TextInput
                label="Standort"
                placeholder="z.B. Berlin"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.currentTarget.value })}
            />
            <Select
                label="Arbeitsmodell"
                data={[
                    { value: 'onsite', label: 'Vor Ort' },
                    { value: 'hybrid', label: 'Hybrid' },
                    { value: 'remote', label: 'Remote' },
                ]}
                value={form.remote}
                onChange={(v) => setForm({ ...form, remote: (v as ApplicationForm['remote']) || 'onsite' })}
            />
            <Button onClick={handleSubmit} loading={isLoading} fullWidth mt="md">
                Erstellen
            </Button>
        </Stack>
    );
}

// ============ WISHLIST CREATE MODAL ============
interface WishlistForm {
    name: string;
    description: string;
    category: 'tech' | 'fashion' | 'home' | 'hobby' | 'books' | 'travel' | 'experience' | 'other';
    priority: 'low' | 'medium' | 'high' | 'must_have';
    priceAmount?: number;
}

export function WishlistCreateModal({ context, id, innerProps }: ContextModalProps<{ onSuccess?: () => void }>) {
    const [form, setForm] = useState<WishlistForm>({
        name: '',
        description: '',
        category: 'other',
        priority: 'medium',
    });
    const { mutate: createItem, isLoading } = useMutation('/wishlist-items', { method: 'POST' });

    const handleSubmit = async () => {
        if (!form.name.trim()) {
            notifications.show({ title: 'Fehler', message: 'Bitte gib einen Namen ein', color: 'red' });
            return;
        }
        await createItem({
            ...form,
            price: form.priceAmount ? { amount: form.priceAmount, currency: 'EUR' } : undefined,
        });
        notifications.show({ title: 'Erfolg', message: 'Wunsch hinzugefügt', color: 'green' });
        innerProps.onSuccess?.();
        context.closeModal(id);
    };

    return (
        <Stack>
            <TextInput
                label="Name"
                placeholder="z.B. iPhone 15 Pro"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.currentTarget.value })}
                required
                data-autofocus
            />
            <Textarea
                label="Beschreibung"
                placeholder="Optional"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.currentTarget.value })}
            />
            <Group grow>
                <Select
                    label="Kategorie"
                    data={[
                        { value: 'tech', label: 'Technik' },
                        { value: 'fashion', label: 'Mode' },
                        { value: 'home', label: 'Zuhause' },
                        { value: 'hobby', label: 'Hobby' },
                        { value: 'books', label: 'Bücher' },
                        { value: 'travel', label: 'Reisen' },
                        { value: 'experience', label: 'Erlebnis' },
                        { value: 'other', label: 'Sonstiges' },
                    ]}
                    value={form.category}
                    onChange={(v) => setForm({ ...form, category: (v as WishlistForm['category']) || 'other' })}
                />
                <Select
                    label="Priorität"
                    data={[
                        { value: 'low', label: 'Niedrig' },
                        { value: 'medium', label: 'Mittel' },
                        { value: 'high', label: 'Hoch' },
                        { value: 'must_have', label: 'Must-Have' },
                    ]}
                    value={form.priority}
                    onChange={(v) => setForm({ ...form, priority: (v as WishlistForm['priority']) || 'medium' })}
                />
            </Group>
            <NumberInput
                label="Preis (€)"
                min={0}
                decimalScale={2}
                value={form.priceAmount}
                onChange={(v) => setForm({ ...form, priceAmount: Number(v) || undefined })}
            />
            <Button onClick={handleSubmit} loading={isLoading} fullWidth mt="md">
                Erstellen
            </Button>
        </Stack>
    );
}

// Export all modals for registration
export const createModals = {
    habitCreate: HabitCreateModal,
    expenseCreate: ExpenseCreateModal,
    deadlineCreate: DeadlineCreateModal,
    subscriptionCreate: SubscriptionCreateModal,
    listCreate: ListCreateModal,
    projectCreate: ProjectCreateModal,
    mediaCreate: MediaCreateModal,
    mealCreate: MealCreateModal,
    inventoryCreate: InventoryCreateModal,
    applicationCreate: ApplicationCreateModal,
    wishlistCreate: WishlistCreateModal,
};

// Modal titles for ModalsProvider
export const createModalTitles: Record<keyof typeof createModals, string> = {
    habitCreate: 'Neues Habit',
    expenseCreate: 'Neue Ausgabe',
    deadlineCreate: 'Neue Frist',
    subscriptionCreate: 'Neues Abo',
    listCreate: 'Neue Liste',
    projectCreate: 'Neues Projekt',
    mediaCreate: 'Neues Medium',
    mealCreate: 'Neues Rezept',
    inventoryCreate: 'Neuer Gegenstand',
    applicationCreate: 'Neue Bewerbung',
    wishlistCreate: 'Neuer Wunsch',
};
