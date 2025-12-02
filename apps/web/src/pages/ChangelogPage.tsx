import {
    Container,
    Title,
    Text,
    Timeline,
    Badge,
    List,
    Card,
    Group,
    ThemeIcon,
    Stack,
    Loader,
    Center,
} from '@mantine/core';
import { IconGitCommit, IconRocket } from '@tabler/icons-react';
import { useVersion } from '../contexts/VersionContext';

export default function ChangelogPage() {
    const { versionInfo, currentVersion } = useVersion();

    if (!versionInfo) {
        return (
            <Container size="md" py={60}>
                <Center>
                    <Loader size="lg" />
                </Center>
            </Container>
        );
    }

    return (
        <Container size="md" py={60}>
            <Stack gap="xl">
                <div>
                    <Title order={1}>Changelog</Title>
                    <Text c="dimmed" mt="xs">
                        Alle Änderungen und Updates
                    </Text>
                </div>

                <Card withBorder>
                    <Group>
                        <ThemeIcon size="lg" color="blue" variant="light">
                            <IconRocket size={20} />
                        </ThemeIcon>
                        <div>
                            <Text fw={500}>{versionInfo.name}</Text>
                            <Text size="sm" c="dimmed">
                                Aktuelle Version: {currentVersion || versionInfo.version}
                            </Text>
                        </div>
                    </Group>
                </Card>

                <Timeline active={0} bulletSize={24} lineWidth={2}>
                    {versionInfo.changelog.map((entry, index) => (
                        <Timeline.Item
                            key={entry.version}
                            bullet={<IconGitCommit size={14} />}
                            title={
                                <Group gap="xs">
                                    <Text fw={500}>Version {entry.version}</Text>
                                    {index === 0 && (
                                        <Badge size="sm" color="green">
                                            Aktuell
                                        </Badge>
                                    )}
                                </Group>
                            }
                        >
                            <Text size="xs" c="dimmed" mt={4}>
                                {new Date(entry.date).toLocaleDateString('de-DE', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </Text>
                            <List size="sm" mt="xs">
                                {entry.changes.map((change, i) => (
                                    <List.Item key={i}>{change}</List.Item>
                                ))}
                            </List>
                        </Timeline.Item>
                    ))}
                </Timeline>
            </Stack>
        </Container>
    );
}
