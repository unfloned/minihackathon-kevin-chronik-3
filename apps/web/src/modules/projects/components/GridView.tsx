import { SimpleGrid } from '@mantine/core';
import { ProjectCard } from './ProjectCard';
import { Project } from '../types';

interface GridViewProps {
    projects: Project[];
    view: 'active' | 'archived';
    statusOptions: { value: string; label: string }[];
    onEdit: (project: Project) => void;
    onArchive: (id: string) => void;
    onUnarchive: (id: string) => void;
    onDelete: (id: string) => void;
}

export function GridView({
    projects,
    view,
    statusOptions,
    onEdit,
    onArchive,
    onUnarchive,
    onDelete,
}: GridViewProps) {
    return (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
            {projects.map((project) => (
                <ProjectCard
                    key={project.id}
                    project={project}
                    view={view}
                    statusOptions={statusOptions}
                    onEdit={onEdit}
                    onArchive={onArchive}
                    onUnarchive={onUnarchive}
                    onDelete={onDelete}
                />
            ))}
        </SimpleGrid>
    );
}
