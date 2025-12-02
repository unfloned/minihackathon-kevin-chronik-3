import { Menu, ActionIcon, Text, Group } from '@mantine/core';
import { IconLanguage, IconCheck } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

const languages = [
    { code: 'de', name: 'Deutsch', flag: 'DE' },
    { code: 'en', name: 'English', flag: 'EN' },
] as const;

export function LanguageSelector() {
    const { i18n } = useTranslation();

    const handleLanguageChange = (code: string) => {
        i18n.changeLanguage(code);
        localStorage.setItem('language', code);
    };

    return (
        <Menu shadow="md" width={160}>
            <Menu.Target>
                <ActionIcon variant="subtle" size="lg" aria-label="Select language">
                    <IconLanguage size={20} />
                </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
                <Menu.Label>Language</Menu.Label>
                {languages.map((lang) => (
                    <Menu.Item
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        rightSection={
                            i18n.language === lang.code ? (
                                <IconCheck size={14} color="var(--mantine-color-green-6)" />
                            ) : null
                        }
                    >
                        <Group gap="xs">
                            <Text size="sm" fw={500}>
                                {lang.flag}
                            </Text>
                            <Text size="sm">{lang.name}</Text>
                        </Group>
                    </Menu.Item>
                ))}
            </Menu.Dropdown>
        </Menu>
    );
}
