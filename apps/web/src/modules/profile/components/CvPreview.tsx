import { Stack, Text, Divider, Badge, Group, Paper } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { CvSectionConfig, CvSectionId } from '@ycmm/core';

interface CvPreviewProps {
    displayName: string;
    email: string;
    phone: string;
    address: string;
    bio: string;
    experience: any[];
    education: any[];
    skills: string[];
    languages: { language: string; level: string }[];
    projects: any[];
    certifications: any[];
    hobbies: string[];
    sections: CvSectionConfig[];
}

export function CvPreview({
    displayName,
    email,
    phone,
    address,
    bio,
    experience,
    education,
    skills,
    languages,
    projects,
    certifications,
    hobbies,
    sections,
}: CvPreviewProps) {
    const { t } = useTranslation();

    const visibleSections = [...sections]
        .filter((s) => s.visible)
        .sort((a, b) => a.order - b.order);

    const sectionRenderers: Record<CvSectionId, () => React.ReactNode | null> = {
        experience: () => {
            if (experience.length === 0) return null;
            return (
                <div key="experience">
                    <Divider label={t('cvGenerator.sections.experience')} />
                    {experience.map((exp) => (
                        <div key={exp.id}>
                            <Text fw={600} size="sm">{exp.position}</Text>
                            <Text size="xs" c="dimmed">
                                {exp.company} | {exp.startDate ? new Date(exp.startDate).toLocaleDateString('de-DE', { month: '2-digit', year: 'numeric' }) : ''} - {exp.endDate ? new Date(exp.endDate).toLocaleDateString('de-DE', { month: '2-digit', year: 'numeric' }) : t('profile.current')}
                            </Text>
                            {exp.description && <Text size="xs" mt={2}>{exp.description}</Text>}
                        </div>
                    ))}
                </div>
            );
        },
        education: () => {
            if (education.length === 0) return null;
            return (
                <div key="education">
                    <Divider label={t('cvGenerator.sections.education')} />
                    {education.map((edu) => (
                        <div key={edu.id}>
                            <Text fw={600} size="sm">{edu.degree} - {edu.field}</Text>
                            <Text size="xs" c="dimmed">
                                {edu.institution} | {edu.startDate ? new Date(edu.startDate).toLocaleDateString('de-DE', { month: '2-digit', year: 'numeric' }) : ''} - {edu.endDate ? new Date(edu.endDate).toLocaleDateString('de-DE', { month: '2-digit', year: 'numeric' }) : t('profile.current')}
                            </Text>
                        </div>
                    ))}
                </div>
            );
        },
        skills: () => {
            if (skills.length === 0) return null;
            return (
                <div key="skills">
                    <Divider label={t('cvGenerator.sections.skills')} />
                    <Group gap="xs">
                        {skills.map((skill) => (
                            <Badge key={skill} variant="light">{skill}</Badge>
                        ))}
                    </Group>
                </div>
            );
        },
        languages: () => {
            if (languages.length === 0) return null;
            return (
                <div key="languages">
                    <Divider label={t('cvGenerator.sections.languages')} />
                    {languages.map((lang, i) => (
                        <Text key={i} size="sm">
                            {lang.language}: <Badge size="sm" variant="light">{lang.level === 'native' ? t('profile.nativeLevel') : lang.level}</Badge>
                        </Text>
                    ))}
                </div>
            );
        },
        projects: () => {
            if (projects.length === 0) return null;
            return (
                <div key="projects">
                    <Divider label={t('cvGenerator.sections.projects')} />
                    {projects.map((proj) => (
                        <div key={proj.id}>
                            <Text fw={600} size="sm">{proj.title}</Text>
                            {proj.description && <Text size="xs">{proj.description}</Text>}
                            {proj.technologies && proj.technologies.length > 0 && (
                                <Group gap={4} mt={2}>
                                    {proj.technologies.map((tech: string) => (
                                        <Badge key={tech} size="xs" variant="outline">{tech}</Badge>
                                    ))}
                                </Group>
                            )}
                            {proj.url && <Text size="xs" c="blue" component="a" href={proj.url} target="_blank">{proj.url}</Text>}
                        </div>
                    ))}
                </div>
            );
        },
        certifications: () => {
            if (certifications.length === 0) return null;
            return (
                <div key="certifications">
                    <Divider label={t('cvGenerator.sections.certifications')} />
                    {certifications.map((cert) => (
                        <div key={cert.id}>
                            <Text fw={600} size="sm">{cert.name}</Text>
                            <Text size="xs" c="dimmed">
                                {cert.issuer}{cert.date ? ` | ${new Date(cert.date).toLocaleDateString('de-DE', { month: '2-digit', year: 'numeric' })}` : ''}
                            </Text>
                            {cert.url && <Text size="xs" c="blue" component="a" href={cert.url} target="_blank">{cert.url}</Text>}
                        </div>
                    ))}
                </div>
            );
        },
        hobbies: () => {
            if (hobbies.length === 0) return null;
            return (
                <div key="hobbies">
                    <Divider label={t('cvGenerator.sections.hobbies')} />
                    <Group gap="xs">
                        {hobbies.map((hobby) => (
                            <Badge key={hobby} variant="light">{hobby}</Badge>
                        ))}
                    </Group>
                </div>
            );
        },
    };

    return (
        <Paper withBorder p="lg" style={{ position: 'sticky', top: 80 }}>
            <Stack gap="md">
                <Text fw={700} size="xl" ta="center">{displayName}</Text>
                <Text size="sm" c="dimmed" ta="center">
                    {[email, phone, address].filter(Boolean).join(' | ')}
                </Text>

                {bio && (
                    <>
                        <Divider label={t('profile.bio')} />
                        <Text size="sm">{bio}</Text>
                    </>
                )}

                {visibleSections.map((section) => {
                    const renderer = sectionRenderers[section.id];
                    return renderer ? renderer() : null;
                })}
            </Stack>
        </Paper>
    );
}
