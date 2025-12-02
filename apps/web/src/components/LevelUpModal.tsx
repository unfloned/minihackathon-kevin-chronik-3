import { useEffect, useState } from 'react';
import { Modal, Text, Stack, ThemeIcon, Group, Badge } from '@mantine/core';
import { IconStar, IconArrowUp } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useConfetti } from '../hooks';

interface LevelUpModalProps {
    opened: boolean;
    onClose: () => void;
    newLevel: number;
}

export function LevelUpModal({ opened, onClose, newLevel }: LevelUpModalProps) {
    const confetti = useConfetti();
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        if (opened) {
            // Delay content animation
            setTimeout(() => setShowContent(true), 300);
            // Trigger confetti
            setTimeout(() => confetti.levelUp(), 500);
        } else {
            setShowContent(false);
        }
    }, [opened, confetti]);

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            withCloseButton={false}
            centered
            size="sm"
            overlayProps={{
                backgroundOpacity: 0.7,
                blur: 3,
            }}
            styles={{
                content: {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                },
                body: {
                    padding: '2rem',
                },
            }}
        >
            <AnimatePresence>
                {showContent && (
                    <Stack align="center" gap="lg">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{
                                type: 'spring',
                                stiffness: 260,
                                damping: 20,
                            }}
                        >
                            <ThemeIcon
                                size={100}
                                radius="xl"
                                variant="white"
                                color="violet"
                            >
                                <IconStar size={60} />
                            </ThemeIcon>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Text
                                size="xl"
                                fw={700}
                                c="white"
                                ta="center"
                                tt="uppercase"
                                style={{ letterSpacing: '2px' }}
                            >
                                Level Up!
                            </Text>
                        </motion.div>

                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                                delay: 0.5,
                                type: 'spring',
                                stiffness: 300,
                            }}
                        >
                            <Group gap="xs" justify="center">
                                <Badge
                                    size="xl"
                                    variant="white"
                                    color="violet"
                                    leftSection={<IconArrowUp size={16} />}
                                    style={{ fontSize: '1.5rem', padding: '1rem 1.5rem' }}
                                >
                                    Level {newLevel}
                                </Badge>
                            </Group>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                        >
                            <Text size="sm" c="white" ta="center" style={{ opacity: 0.9 }}>
                                Weiter so! Du machst tolle Fortschritte.
                            </Text>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.6 }}
                            transition={{ delay: 1.2 }}
                        >
                            <Text size="xs" c="white" ta="center">
                                Klicke irgendwo um fortzufahren
                            </Text>
                        </motion.div>
                    </Stack>
                )}
            </AnimatePresence>
        </Modal>
    );
}

export default LevelUpModal;
