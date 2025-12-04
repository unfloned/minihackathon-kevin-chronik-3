import {
    Modal,
    Stack,
    Group,
    Button,
    TextInput,
    Textarea,
    Select,
    NumberInput,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { Application, CreateApplicationForm, RemoteType } from '../types';
import { sourceOptions } from '../types';

interface ApplicationFormModalProps {
    opened: boolean;
    onClose: () => void;
    editingApp: Application | null;
    form: CreateApplicationForm;
    onFormChange: (form: CreateApplicationForm) => void;
    onSubmit: () => void;
    isLoading: boolean;
}

export function ApplicationFormModal({
    opened,
    onClose,
    editingApp,
    form,
    onFormChange,
    onSubmit,
    isLoading,
}: ApplicationFormModalProps) {
    const { t } = useTranslation();

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={editingApp ? t('applications.editApplication') : t('applications.newApplication')}
            size="lg"
        >
            <Stack gap="md">
                <TextInput
                    label={t('applications.company')}
                    placeholder={t('applications.company')}
                    required
                    value={form.companyName}
                    onChange={(e) => onFormChange({ ...form, companyName: e.currentTarget.value })}
                />
                <TextInput
                    label={t('applications.position')}
                    placeholder={t('applications.position')}
                    required
                    value={form.jobTitle}
                    onChange={(e) => onFormChange({ ...form, jobTitle: e.currentTarget.value })}
                />
                <TextInput
                    label={t('common.website', { defaultValue: 'Firmen-Website' })}
                    placeholder="https://..."
                    value={form.companyWebsite}
                    onChange={(e) => onFormChange({ ...form, companyWebsite: e.currentTarget.value })}
                />
                <TextInput
                    label={t('common.url', { defaultValue: 'Stellenanzeige URL' })}
                    placeholder="https://..."
                    value={form.jobUrl}
                    onChange={(e) => onFormChange({ ...form, jobUrl: e.currentTarget.value })}
                />
                <Textarea
                    label={t('common.description')}
                    placeholder={t('common.description')}
                    minRows={3}
                    value={form.jobDescription}
                    onChange={(e) => onFormChange({ ...form, jobDescription: e.currentTarget.value })}
                />
                <TextInput
                    label={t('applications.location')}
                    placeholder={t('applications.location')}
                    required
                    value={form.location}
                    onChange={(e) => onFormChange({ ...form, location: e.currentTarget.value })}
                />
                <Select
                    label="Remote"
                    placeholder={t('common.select', { defaultValue: 'Wählen...' })}
                    data={[
                        { value: 'onsite', label: t('applications.interviewType.onsite') },
                        { value: 'hybrid', label: 'Hybrid' },
                        { value: 'remote', label: 'Remote' },
                    ]}
                    value={form.remote}
                    onChange={(value) => onFormChange({ ...form, remote: value as RemoteType })}
                />
                <Group grow>
                    <NumberInput
                        label={t('applications.salary') + ' Min'}
                        placeholder="50000"
                        min={0}
                        value={form.salaryMin}
                        onChange={(value) => onFormChange({ ...form, salaryMin: value as number })}
                    />
                    <NumberInput
                        label={t('applications.salary') + ' Max'}
                        placeholder="70000"
                        min={0}
                        value={form.salaryMax}
                        onChange={(value) => onFormChange({ ...form, salaryMax: value as number })}
                    />
                </Group>
                <TextInput
                    label={t('applications.contactPerson')}
                    placeholder={t('common.name')}
                    value={form.contactName}
                    onChange={(e) => onFormChange({ ...form, contactName: e.currentTarget.value })}
                />
                <TextInput
                    label={t('auth.email')}
                    placeholder="email@example.com"
                    type="email"
                    value={form.contactEmail}
                    onChange={(e) => onFormChange({ ...form, contactEmail: e.currentTarget.value })}
                />
                <Select
                    label={t('applications.source')}
                    placeholder={t('applications.source')}
                    data={sourceOptions}
                    value={form.source}
                    onChange={(value) => onFormChange({ ...form, source: value || '' })}
                />
                <Textarea
                    label={t('common.notes')}
                    placeholder={t('common.notes')}
                    minRows={3}
                    value={form.notes}
                    onChange={(e) => onFormChange({ ...form, notes: e.currentTarget.value })}
                />
                <Group justify="flex-end">
                    <Button variant="subtle" onClick={onClose}>
                        {t('common.cancel')}
                    </Button>
                    <Button onClick={onSubmit} loading={isLoading}>
                        {editingApp ? t('common.save') : t('common.create')}
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}
