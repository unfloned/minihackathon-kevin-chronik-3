import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Paper, Group, Text, Switch, Collapse, ActionIcon } from '@mantine/core';
import { IconGripVertical } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { CvSectionId } from '@ycmm/core';

interface CvWidgetProps {
    id: CvSectionId;
    visible: boolean;
    onToggleVisible: (id: CvSectionId) => void;
    children: React.ReactNode;
}

export function CvWidget({ id, visible, onToggleVisible, children }: CvWidgetProps) {
    const { t } = useTranslation();
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const sectionLabel = t(`cvGenerator.sections.${id}` as any);

    return (
        <Paper
            ref={setNodeRef}
            style={style}
            withBorder
            p="md"
            mb="sm"
        >
            <Group justify="space-between" mb={visible ? 'sm' : 0}>
                <Group gap="xs">
                    <ActionIcon
                        variant="subtle"
                        color="gray"
                        style={{ cursor: 'grab' }}
                        {...attributes}
                        {...listeners}
                    >
                        <IconGripVertical size={18} />
                    </ActionIcon>
                    <Text fw={600} size="sm">{sectionLabel}</Text>
                </Group>
                <Switch
                    checked={visible}
                    onChange={() => onToggleVisible(id)}
                    label={visible ? t('cvGenerator.showSection') : t('cvGenerator.hideSection')}
                    size="sm"
                />
            </Group>
            <Collapse in={visible}>
                {children}
            </Collapse>
        </Paper>
    );
}
