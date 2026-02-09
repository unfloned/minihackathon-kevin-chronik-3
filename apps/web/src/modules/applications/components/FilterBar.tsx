import { useState } from 'react';
import {
    TextInput,
    MultiSelect,
    Group,
    ActionIcon,
    Button,
    Collapse,
    SimpleGrid,
    NumberInput,
    Paper,
    Popover,
    Stack,
    Text,
    TagsInput,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import {
    IconSearch,
    IconFilter,
    IconFilterOff,
    IconBookmark,
    IconTrash,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { ApplicationStatus, ApplicationPriority, RemoteType } from '../types';
import { statusColors } from '../types';

export interface ApplicationFilters {
    search: string;
    statuses: ApplicationStatus[];
    priorities: ApplicationPriority[];
    remoteTypes: RemoteType[];
    sources: string[];
    tags: string[];
    salaryMin: number | undefined;
    salaryMax: number | undefined;
    dateFrom: string | null;
    dateTo: string | null;
}

export const defaultFilters: ApplicationFilters = {
    search: '',
    statuses: [],
    priorities: [],
    remoteTypes: [],
    sources: [],
    tags: [],
    salaryMin: undefined,
    salaryMax: undefined,
    dateFrom: null,
    dateTo: null,
};

interface FilterPreset {
    name: string;
    filters: ApplicationFilters;
}

const PRESETS_KEY = 'ycmm-application-filter-presets';

function loadPresets(): FilterPreset[] {
    try {
        const raw = localStorage.getItem(PRESETS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function savePresetsToStorage(presets: FilterPreset[]) {
    localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
}

interface FilterBarProps {
    filters: ApplicationFilters;
    onFiltersChange: (filters: ApplicationFilters) => void;
    statusLabels: Record<ApplicationStatus, string>;
    allSources: string[];
    allTags: string[];
}

export function FilterBar({
    filters,
    onFiltersChange,
    statusLabels,
    allSources,
    allTags,
}: FilterBarProps) {
    const { t } = useTranslation();
    const [expanded, setExpanded] = useState(false);
    const [presets, setPresets] = useState<FilterPreset[]>(loadPresets);
    const [presetName, setPresetName] = useState('');
    const [presetPopoverOpen, setPresetPopoverOpen] = useState(false);

    const statusData = (Object.keys(statusLabels) as ApplicationStatus[]).map((s) => ({
        value: s,
        label: statusLabels[s],
    }));

    const priorityData: { value: ApplicationPriority; label: string }[] = [
        { value: 'low', label: t('applications.priority.low') },
        { value: 'medium', label: t('applications.priority.medium') },
        { value: 'high', label: t('applications.priority.high') },
    ];

    const remoteData: { value: RemoteType; label: string }[] = [
        { value: 'onsite', label: t('applications.interviewType.onsite') },
        { value: 'hybrid', label: 'Hybrid' },
        { value: 'remote', label: 'Remote' },
    ];

    const sourceData = allSources.map((s) => ({ value: s, label: s }));

    const hasActiveFilters =
        filters.search !== '' ||
        filters.statuses.length > 0 ||
        filters.priorities.length > 0 ||
        filters.remoteTypes.length > 0 ||
        filters.sources.length > 0 ||
        filters.tags.length > 0 ||
        filters.salaryMin !== undefined ||
        filters.salaryMax !== undefined ||
        filters.dateFrom !== null ||
        filters.dateTo !== null;

    const handleSavePreset = () => {
        if (!presetName.trim()) return;
        const updated = [...presets, { name: presetName.trim(), filters: { ...filters } }];
        setPresets(updated);
        savePresetsToStorage(updated);
        setPresetName('');
    };

    const handleLoadPreset = (preset: FilterPreset) => {
        onFiltersChange({ ...preset.filters });
        setPresetPopoverOpen(false);
    };

    const handleDeletePreset = (index: number) => {
        const updated = presets.filter((_, i) => i !== index);
        setPresets(updated);
        savePresetsToStorage(updated);
    };

    return (
        <Paper shadow="sm" withBorder p="md" radius="md">
            <Stack gap="sm">
                {/* Row 1: Always visible */}
                <Group gap="sm">
                    <TextInput
                        placeholder={t('applications.filter.search')}
                        leftSection={<IconSearch size={16} />}
                        value={filters.search}
                        onChange={(e) => onFiltersChange({ ...filters, search: e.currentTarget.value })}
                        style={{ flex: 1 }}
                    />
                    <MultiSelect
                        placeholder={t('applications.filter.statuses')}
                        data={statusData}
                        value={filters.statuses}
                        onChange={(val) => onFiltersChange({ ...filters, statuses: val as ApplicationStatus[] })}
                        w={220}
                        clearable
                        renderOption={({ option }) => (
                            <Group gap="xs">
                                <div
                                    style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        backgroundColor: `var(--mantine-color-${statusColors[option.value as ApplicationStatus]}-filled)`,
                                    }}
                                />
                                <span>{option.label}</span>
                            </Group>
                        )}
                    />
                    <ActionIcon
                        variant={expanded ? 'filled' : 'light'}
                        onClick={() => setExpanded((v) => !v)}
                        title={expanded ? t('applications.filter.collapse') : t('applications.filter.expand')}
                    >
                        <IconFilter size={16} />
                    </ActionIcon>
                    {hasActiveFilters && (
                        <ActionIcon
                            variant="light"
                            color="red"
                            onClick={() => onFiltersChange({ ...defaultFilters })}
                            title={t('applications.filter.reset')}
                        >
                            <IconFilterOff size={16} />
                        </ActionIcon>
                    )}
                    <Popover
                        opened={presetPopoverOpen}
                        onChange={setPresetPopoverOpen}
                        width={260}
                        position="bottom-end"
                    >
                        <Popover.Target>
                            <ActionIcon
                                variant="light"
                                onClick={() => setPresetPopoverOpen((v) => !v)}
                                title={t('applications.filter.presets')}
                            >
                                <IconBookmark size={16} />
                            </ActionIcon>
                        </Popover.Target>
                        <Popover.Dropdown>
                            <Stack gap="xs">
                                <Text fw={500} size="sm">{t('applications.filter.presets')}</Text>
                                {presets.length === 0 && (
                                    <Text size="xs" c="dimmed">{t('applications.filter.noPresets')}</Text>
                                )}
                                {presets.map((preset, i) => (
                                    <Group key={i} justify="space-between">
                                        <Button
                                            variant="subtle"
                                            size="xs"
                                            onClick={() => handleLoadPreset(preset)}
                                            style={{ flex: 1 }}
                                            justify="flex-start"
                                        >
                                            {preset.name}
                                        </Button>
                                        <ActionIcon
                                            size="xs"
                                            variant="subtle"
                                            color="red"
                                            onClick={() => handleDeletePreset(i)}
                                        >
                                            <IconTrash size={12} />
                                        </ActionIcon>
                                    </Group>
                                ))}
                                <Group gap="xs">
                                    <TextInput
                                        size="xs"
                                        placeholder={t('applications.filter.presetName')}
                                        value={presetName}
                                        onChange={(e) => setPresetName(e.currentTarget.value)}
                                        style={{ flex: 1 }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSavePreset();
                                        }}
                                    />
                                    <Button size="xs" onClick={handleSavePreset} disabled={!presetName.trim()}>
                                        {t('applications.filter.savePreset')}
                                    </Button>
                                </Group>
                            </Stack>
                        </Popover.Dropdown>
                    </Popover>
                </Group>

                {/* Row 2: Collapsible advanced filters */}
                <Collapse in={expanded}>
                    <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="sm">
                        <MultiSelect
                            label={t('applications.filter.priorities')}
                            data={priorityData}
                            value={filters.priorities}
                            onChange={(val) => onFiltersChange({ ...filters, priorities: val as ApplicationPriority[] })}
                            clearable
                            size="sm"
                        />
                        <MultiSelect
                            label={t('applications.filter.remoteTypes')}
                            data={remoteData}
                            value={filters.remoteTypes}
                            onChange={(val) => onFiltersChange({ ...filters, remoteTypes: val as RemoteType[] })}
                            clearable
                            size="sm"
                        />
                        <MultiSelect
                            label={t('applications.filter.sources')}
                            data={sourceData}
                            value={filters.sources}
                            onChange={(val) => onFiltersChange({ ...filters, sources: val })}
                            clearable
                            size="sm"
                        />
                        <TagsInput
                            label={t('applications.filter.tags')}
                            data={allTags}
                            value={filters.tags}
                            onChange={(val) => onFiltersChange({ ...filters, tags: val })}
                            size="sm"
                        />
                        <NumberInput
                            label={t('applications.filter.salaryMin')}
                            value={filters.salaryMin ?? ''}
                            onChange={(val) => onFiltersChange({ ...filters, salaryMin: val === '' ? undefined : Number(val) })}
                            min={0}
                            step={5000}
                            thousandSeparator="."
                            decimalSeparator=","
                            size="sm"
                        />
                        <NumberInput
                            label={t('applications.filter.salaryMax')}
                            value={filters.salaryMax ?? ''}
                            onChange={(val) => onFiltersChange({ ...filters, salaryMax: val === '' ? undefined : Number(val) })}
                            min={0}
                            step={5000}
                            thousandSeparator="."
                            decimalSeparator=","
                            size="sm"
                        />
                        <DateInput
                            label={t('applications.filter.dateFrom')}
                            value={filters.dateFrom}
                            onChange={(val) => onFiltersChange({ ...filters, dateFrom: val || null })}
                            clearable
                            size="sm"
                        />
                        <DateInput
                            label={t('applications.filter.dateTo')}
                            value={filters.dateTo}
                            onChange={(val) => onFiltersChange({ ...filters, dateTo: val || null })}
                            clearable
                            size="sm"
                        />
                    </SimpleGrid>
                </Collapse>
            </Stack>
        </Paper>
    );
}

export function applyFilters(applications: import('../types').Application[], filters: ApplicationFilters): import('../types').Application[] {
    return applications.filter((app) => {
        // Search
        if (filters.search) {
            const q = filters.search.toLowerCase();
            const matches =
                app.companyName.toLowerCase().includes(q) ||
                app.jobTitle.toLowerCase().includes(q) ||
                app.location.toLowerCase().includes(q) ||
                app.tags.some((tag) => tag.toLowerCase().includes(q));
            if (!matches) return false;
        }

        // Statuses
        if (filters.statuses.length > 0 && !filters.statuses.includes(app.status)) return false;

        // Priorities
        if (filters.priorities.length > 0 && !filters.priorities.includes(app.priority)) return false;

        // Remote types
        if (filters.remoteTypes.length > 0 && !filters.remoteTypes.includes(app.remote)) return false;

        // Sources
        if (filters.sources.length > 0 && !filters.sources.includes(app.source)) return false;

        // Tags
        if (filters.tags.length > 0 && !filters.tags.some((t) => app.tags.includes(t))) return false;

        // Salary min
        if (filters.salaryMin !== undefined) {
            const appMax = app.salary?.max ?? app.salary?.min ?? 0;
            if (appMax < filters.salaryMin) return false;
        }

        // Salary max
        if (filters.salaryMax !== undefined) {
            const appMin = app.salary?.min ?? app.salary?.max ?? Infinity;
            if (appMin > filters.salaryMax) return false;
        }

        // Date from
        if (filters.dateFrom && app.appliedAt) {
            if (new Date(app.appliedAt) < new Date(filters.dateFrom)) return false;
        }
        if (filters.dateFrom && !app.appliedAt) return false;

        // Date to
        if (filters.dateTo && app.appliedAt) {
            if (new Date(app.appliedAt) > new Date(filters.dateTo)) return false;
        }
        if (filters.dateTo && !app.appliedAt) return false;

        return true;
    });
}
