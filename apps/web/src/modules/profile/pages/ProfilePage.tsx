import { useState, useEffect } from 'react';
import {
    Container,
    Stack,
    Group,
    TextInput,
    Textarea,
    Fieldset,
    TagsInput,
    Select,
    Paper,
    ActionIcon,
    Text,
    Skeleton,
    Grid,
} from '@mantine/core';
import {
    IconTrash,
    IconPlus,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useRequest, useMutation } from '../../../hooks';
import { PageTitle } from '../../../components/PageTitle';
import { ExperienceForm } from '../components/ExperienceForm';
import { EducationForm } from '../components/EducationForm';
import { ProjectsForm } from '../components/ProjectsForm';
import { CertificationsForm } from '../components/CertificationsForm';
import { CvWidget } from '../components/CvWidget';
import { CvPreview } from '../components/CvPreview';
import { StickyToolbar } from '../components/StickyToolbar';
import type { CvSectionId, CvSectionConfig, CvConfig } from '@ycmm/core';

interface WorkExperience {
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    description: string;
}

interface Education {
    id: string;
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate?: string;
}

interface Language {
    language: string;
    level: string;
}

interface CvProject {
    id: string;
    title: string;
    description: string;
    url?: string;
    technologies?: string[];
}

interface CvCertification {
    id: string;
    name: string;
    issuer: string;
    date?: string;
    url?: string;
}

interface ProfileData {
    displayName: string;
    email: string;
    profileBio: string;
    profilePhone: string;
    profileAddress: string;
    profileSkills: string[];
    profileExperience: WorkExperience[];
    profileEducation: Education[];
    profileLanguages: Language[];
    profileProjects: CvProject[];
    profileCertifications: CvCertification[];
    profileHobbies: string[];
    profileCvConfig: CvConfig | null;
}

const DEFAULT_SECTIONS: CvSectionConfig[] = [
    { id: 'experience', visible: true, order: 0 },
    { id: 'education', visible: true, order: 1 },
    { id: 'skills', visible: true, order: 2 },
    { id: 'languages', visible: true, order: 3 },
    { id: 'projects', visible: true, order: 4 },
    { id: 'certifications', visible: true, order: 5 },
    { id: 'hobbies', visible: true, order: 6 },
];

const languageLevels = [
    { value: 'A1', label: 'A1 - Anfänger' },
    { value: 'A2', label: 'A2 - Grundlegende Kenntnisse' },
    { value: 'B1', label: 'B1 - Fortgeschritten' },
    { value: 'B2', label: 'B2 - Selbständig' },
    { value: 'C1', label: 'C1 - Fachkundig' },
    { value: 'C2', label: 'C2 - Annähernd muttersprachlich' },
    { value: 'native', label: 'Muttersprache' },
];

export default function ProfilePage() {
    const { t } = useTranslation();
    const { data: profile, isLoading } = useRequest<ProfileData>('/profile');

    const [form, setForm] = useState<{
        profileBio: string;
        profilePhone: string;
        profileAddress: string;
        profileSkills: string[];
        profileExperience: WorkExperience[];
        profileEducation: Education[];
        profileLanguages: Language[];
        profileProjects: CvProject[];
        profileCertifications: CvCertification[];
        profileHobbies: string[];
    }>({
        profileBio: '',
        profilePhone: '',
        profileAddress: '',
        profileSkills: [],
        profileExperience: [],
        profileEducation: [],
        profileLanguages: [],
        profileProjects: [],
        profileCertifications: [],
        profileHobbies: [],
    });

    const [sections, setSections] = useState<CvSectionConfig[]>(DEFAULT_SECTIONS);

    useEffect(() => {
        if (profile) {
            setForm({
                profileBio: profile.profileBio || '',
                profilePhone: profile.profilePhone || '',
                profileAddress: profile.profileAddress || '',
                profileSkills: profile.profileSkills || [],
                profileExperience: profile.profileExperience || [],
                profileEducation: profile.profileEducation || [],
                profileLanguages: profile.profileLanguages || [],
                profileProjects: profile.profileProjects || [],
                profileCertifications: profile.profileCertifications || [],
                profileHobbies: profile.profileHobbies || [],
            });
            if (profile.profileCvConfig?.sections) {
                setSections(profile.profileCvConfig.sections);
            }
        }
    }, [profile]);

    const { mutate: updateProfile, isLoading: saving } = useMutation<ProfileData, any>(
        '/profile',
        { method: 'PATCH' }
    );

    const handleSave = async () => {
        try {
            await updateProfile({
                ...form,
                profileCvConfig: { sections },
            });
            notifications.show({
                title: t('common.success'),
                message: t('profile.profileUpdated'),
                color: 'green',
            });
        } catch {
            notifications.show({
                title: t('common.error'),
                message: t('errors.generic'),
                color: 'red',
            });
        }
    };

    const handleDownloadCv = async () => {
        try {
            const response = await fetch('/api/profile/cv/pdf', {
                credentials: 'include',
            });
            if (!response.ok) throw new Error('PDF download failed');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `CV_${profile?.displayName?.replace(/\s+/g, '_') || 'Lebenslauf'}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch {
            notifications.show({
                title: t('common.error'),
                message: t('errors.generic'),
                color: 'red',
            });
        }
    };

    const addLanguage = () => {
        setForm({
            ...form,
            profileLanguages: [...form.profileLanguages, { language: '', level: 'B1' }],
        });
    };

    const updateLanguage = (index: number, field: keyof Language, value: string) => {
        const updated = [...form.profileLanguages];
        updated[index] = { ...updated[index], [field]: value };
        setForm({ ...form, profileLanguages: updated });
    };

    const removeLanguage = (index: number) => {
        setForm({
            ...form,
            profileLanguages: form.profileLanguages.filter((_, i) => i !== index),
        });
    };

    const toggleSectionVisible = (id: CvSectionId) => {
        setSections((prev) =>
            prev.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s))
        );
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor)
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        setSections((prev) => {
            const oldIndex = prev.findIndex((s) => s.id === active.id);
            const newIndex = prev.findIndex((s) => s.id === over.id);
            const moved = arrayMove(prev, oldIndex, newIndex);
            return moved.map((s, i) => ({ ...s, order: i }));
        });
    };

    const sortedSections = [...sections].sort((a, b) => a.order - b.order);
    const sectionIds = sortedSections.map((s) => s.id);

    const sectionContent: Record<CvSectionId, React.ReactNode> = {
        experience: (
            <ExperienceForm
                experience={form.profileExperience}
                onChange={(exp) => setForm({ ...form, profileExperience: exp })}
            />
        ),
        education: (
            <EducationForm
                education={form.profileEducation}
                onChange={(edu) => setForm({ ...form, profileEducation: edu })}
            />
        ),
        skills: (
            <TagsInput
                label={t('profile.skillsLabel')}
                placeholder={t('profile.skillsPlaceholder')}
                value={form.profileSkills}
                onChange={(value) => setForm({ ...form, profileSkills: value })}
            />
        ),
        languages: (
            <Stack gap="sm">
                {form.profileLanguages.map((lang, index) => (
                    <Paper key={index} withBorder p="sm">
                        <Group>
                            <TextInput
                                label={t('profile.language')}
                                placeholder={t('profile.languagePlaceholder')}
                                value={lang.language}
                                onChange={(e) => updateLanguage(index, 'language', e.currentTarget.value)}
                                style={{ flex: 1 }}
                            />
                            <Select
                                label={t('profile.level')}
                                data={languageLevels}
                                value={lang.level}
                                onChange={(value) => updateLanguage(index, 'level', value || 'B1')}
                                style={{ flex: 1 }}
                            />
                            <ActionIcon
                                variant="subtle"
                                color="red"
                                mt="lg"
                                onClick={() => removeLanguage(index)}
                            >
                                <IconTrash size={16} />
                            </ActionIcon>
                        </Group>
                    </Paper>
                ))}
                <Group>
                    <ActionIcon variant="light" onClick={addLanguage}>
                        <IconPlus size={16} />
                    </ActionIcon>
                    <Text size="sm" c="dimmed">{t('profile.addLanguage')}</Text>
                </Group>
            </Stack>
        ),
        projects: (
            <ProjectsForm
                projects={form.profileProjects}
                onChange={(proj) => setForm({ ...form, profileProjects: proj })}
            />
        ),
        certifications: (
            <CertificationsForm
                certifications={form.profileCertifications}
                onChange={(certs) => setForm({ ...form, profileCertifications: certs })}
            />
        ),
        hobbies: (
            <TagsInput
                label={t('cvGenerator.hobbies')}
                placeholder={t('cvGenerator.hobbiesPlaceholder')}
                value={form.profileHobbies}
                onChange={(value) => setForm({ ...form, profileHobbies: value })}
            />
        ),
    };

    if (isLoading) {
        return (
            <Container size="xl" py="xl">
                <Stack gap="md">
                    <PageTitle title={t('cvGenerator.title')} subtitle={t('cvGenerator.subtitle')} />
                    <Skeleton height={200} />
                    <Skeleton height={200} />
                </Stack>
            </Container>
        );
    }

    return (
        <Container size="xl" py="xl" pb={80}>
            <Stack gap="lg">
                <PageTitle title={t('cvGenerator.title')} subtitle={t('cvGenerator.subtitle')} />

                <Grid gutter="lg">
                    {/* Left column: Widgets */}
                    <Grid.Col span={{ base: 12, md: 7 }}>
                        <Stack gap="sm">
                            {/* Personal Info - always first, not draggable */}
                            <Fieldset legend={t('cvGenerator.sections.personalInfo')}>
                                <Stack gap="sm">
                                    <Group grow>
                                        <TextInput
                                            label={t('common.name')}
                                            value={profile?.displayName || ''}
                                            disabled
                                        />
                                        <TextInput
                                            label={t('auth.email')}
                                            value={profile?.email || ''}
                                            disabled
                                        />
                                    </Group>
                                    <Group grow>
                                        <TextInput
                                            label={t('profile.phone')}
                                            placeholder="+49 ..."
                                            value={form.profilePhone}
                                            onChange={(e) => setForm({ ...form, profilePhone: e.currentTarget.value })}
                                        />
                                        <TextInput
                                            label={t('profile.address')}
                                            placeholder={t('profile.addressPlaceholder')}
                                            value={form.profileAddress}
                                            onChange={(e) => setForm({ ...form, profileAddress: e.currentTarget.value })}
                                        />
                                    </Group>
                                    <Textarea
                                        label={t('profile.bio')}
                                        placeholder={t('profile.bioPlaceholder')}
                                        minRows={3}
                                        value={form.profileBio}
                                        onChange={(e) => setForm({ ...form, profileBio: e.currentTarget.value })}
                                    />
                                </Stack>
                            </Fieldset>

                            {/* Draggable section widgets */}
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
                                    {sortedSections.map((section) => (
                                        <CvWidget
                                            key={section.id}
                                            id={section.id}
                                            visible={section.visible}
                                            onToggleVisible={toggleSectionVisible}
                                        >
                                            {sectionContent[section.id]}
                                        </CvWidget>
                                    ))}
                                </SortableContext>
                            </DndContext>
                        </Stack>
                    </Grid.Col>

                    {/* Right column: Preview */}
                    <Grid.Col span={{ base: 12, md: 5 }}>
                        <CvPreview
                            displayName={profile?.displayName || ''}
                            email={profile?.email || ''}
                            phone={form.profilePhone}
                            address={form.profileAddress}
                            bio={form.profileBio}
                            experience={form.profileExperience}
                            education={form.profileEducation}
                            skills={form.profileSkills}
                            languages={form.profileLanguages}
                            projects={form.profileProjects}
                            certifications={form.profileCertifications}
                            hobbies={form.profileHobbies}
                            sections={sections}
                        />
                    </Grid.Col>
                </Grid>
            </Stack>

            <StickyToolbar
                onSave={handleSave}
                onDownloadPdf={handleDownloadCv}
                saving={saving}
            />
        </Container>
    );
}
