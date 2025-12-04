import { useState, useEffect } from 'react';
import {
    ActionIcon,
    Paper,
    Text,
    Group,
    Stack,
    Badge,
    Tooltip,
    Box,
    Button,
} from '@mantine/core';
import { IconMicrophone, IconPlayerStop, IconCheck, IconX } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpeechRecognition } from '../hooks';

interface VoiceRecorderProps {
    onTranscriptComplete: (transcript: string) => void;
    onCancel?: () => void;
    language?: string;
    placeholder?: string;
    autoStart?: boolean;
}

// Voice commands for punctuation and formatting
const voiceCommands: Record<string, string> = {
    // German
    'punkt': '.',
    'komma': ',',
    'fragezeichen': '?',
    'ausrufezeichen': '!',
    'doppelpunkt': ':',
    'semikolon': ';',
    'neuer absatz': '\n\n',
    'neue zeile': '\n',
    'bindestrich': '-',
    'gedankenstrich': ' – ',
    'anführungszeichen auf': '„',
    'anführungszeichen zu': '"',
    // English
    'period': '.',
    'full stop': '.',
    'comma': ',',
    'question mark': '?',
    'exclamation mark': '!',
    'exclamation point': '!',
    'colon': ':',
    'semicolon': ';',
    'new paragraph': '\n\n',
    'new line': '\n',
    'hyphen': '-',
    'dash': ' – ',
    'open quote': '"',
    'close quote': '"',
};

// Process transcript to replace voice commands with actual punctuation
function processVoiceCommands(text: string): string {
    let result = text;

    // Sort by length (longest first) to handle multi-word commands correctly
    const sortedCommands = Object.entries(voiceCommands)
        .sort((a, b) => b[0].length - a[0].length);

    for (const [command, replacement] of sortedCommands) {
        // Case-insensitive replacement, handling word boundaries
        const regex = new RegExp(`\\s*\\b${command}\\b\\s*`, 'gi');
        result = result.replace(regex, replacement);
    }

    // Clean up: capitalize after periods, question marks, etc.
    result = result.replace(/([.!?]\s*)(\w)/g, (_, punct, letter) =>
        punct + letter.toUpperCase()
    );

    // Capitalize first letter
    result = result.charAt(0).toUpperCase() + result.slice(1);

    return result;
}

// Animated sound wave bars
function SoundWave({ isActive }: { isActive: boolean }) {
    const bars = [1, 2, 3, 4, 5];

    return (
        <Group gap={3} h={24} align="center">
            {bars.map((bar) => (
                <motion.div
                    key={bar}
                    style={{
                        width: 4,
                        backgroundColor: 'var(--mantine-color-red-6)',
                        borderRadius: 2,
                    }}
                    animate={isActive ? {
                        height: [8, 20, 12, 24, 8],
                    } : { height: 8 }}
                    transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay: bar * 0.1,
                        ease: 'easeInOut',
                    }}
                />
            ))}
        </Group>
    );
}

// Pulsing microphone button
function PulsingMic({ isListening, onClick, isSupported }: {
    isListening: boolean;
    onClick: () => void;
    isSupported: boolean;
}) {
    const { t } = useTranslation();

    if (!isSupported) {
        return (
            <Tooltip label={t('voice.notSupported', { defaultValue: 'Voice input not supported in this browser' })}>
                <ActionIcon
                    size="xl"
                    radius="xl"
                    variant="light"
                    color="gray"
                    disabled
                >
                    <IconMicrophone size={24} />
                </ActionIcon>
            </Tooltip>
        );
    }

    return (
        <Tooltip label={isListening ? t('voice.stopRecording', { defaultValue: 'Stop recording' }) : t('voice.startRecording', { defaultValue: 'Start voice input' })}>
            <Box pos="relative">
                {isListening && (
                    <motion.div
                        style={{
                            position: 'absolute',
                            inset: -8,
                            borderRadius: '50%',
                            backgroundColor: 'var(--mantine-color-red-6)',
                            opacity: 0.3,
                        }}
                        animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.3, 0, 0.3],
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: 'easeOut',
                        }}
                    />
                )}
                <ActionIcon
                    size="xl"
                    radius="xl"
                    variant={isListening ? 'filled' : 'light'}
                    color={isListening ? 'red' : 'blue'}
                    onClick={onClick}
                >
                    {isListening ? <IconPlayerStop size={24} /> : <IconMicrophone size={24} />}
                </ActionIcon>
            </Box>
        </Tooltip>
    );
}

export function VoiceRecorder({
    onTranscriptComplete,
    onCancel,
    language,
    placeholder,
    autoStart = false,
}: VoiceRecorderProps) {
    const { t, i18n } = useTranslation();
    const [showPanel, setShowPanel] = useState(autoStart);

    // Use current app language if not specified
    const speechLanguage = language || (i18n.language === 'de' ? 'de-DE' : 'en-US');

    const {
        isListening,
        isSupported,
        transcript,
        interimTranscript,
        startListening,
        stopListening,
        resetTranscript,
    } = useSpeechRecognition({
        language: speechLanguage,
        continuous: true,
        interimResults: true,
    });

    // Auto-start when autoStart prop is true
    useEffect(() => {
        if (autoStart && isSupported && !isListening) {
            resetTranscript();
            startListening();
        }
    }, [autoStart, isSupported]);

    const handleToggle = () => {
        if (isListening) {
            stopListening();
        } else {
            resetTranscript();
            setShowPanel(true);
            startListening();
        }
    };

    const handleConfirm = () => {
        stopListening();
        if (transcript.trim()) {
            // Process voice commands before sending
            const processedText = processVoiceCommands(transcript.trim());
            onTranscriptComplete(processedText);
        }
        setShowPanel(false);
        resetTranscript();
    };

    const handleCancel = () => {
        stopListening();
        setShowPanel(false);
        resetTranscript();
        onCancel?.();
    };

    // Close panel when stopped and no transcript
    useEffect(() => {
        if (!isListening && !transcript && !interimTranscript && showPanel) {
            // Give a moment for final results
            const timeout = setTimeout(() => {
                if (!transcript) {
                    setShowPanel(false);
                }
            }, 500);
            return () => clearTimeout(timeout);
        }
    }, [isListening, transcript, interimTranscript, showPanel]);

    return (
        <Stack gap="xs">
            {/* Main mic button when panel is closed */}
            {!showPanel && (
                <PulsingMic
                    isListening={isListening}
                    onClick={handleToggle}
                    isSupported={isSupported}
                />
            )}

            {/* Expanded recording panel */}
            <AnimatePresence>
                {showPanel && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Paper withBorder p="md" radius="md">
                            <Stack gap="md">
                                {/* Header with status */}
                                <Group justify="space-between">
                                    <Group gap="xs">
                                        <PulsingMic
                                            isListening={isListening}
                                            onClick={handleToggle}
                                            isSupported={isSupported}
                                        />
                                        {isListening && (
                                            <Badge color="red" variant="light" leftSection={<SoundWave isActive={isListening} />}>
                                                {t('voice.listening', { defaultValue: 'Listening...' })}
                                            </Badge>
                                        )}
                                        {!isListening && transcript && (
                                            <Badge color="green" variant="light">
                                                {t('voice.ready', { defaultValue: 'Ready' })}
                                            </Badge>
                                        )}
                                    </Group>
                                    <Text size="xs" c="dimmed">
                                        {speechLanguage === 'de-DE' ? 'Deutsch' : 'English'}
                                    </Text>
                                </Group>

                                {/* Transcript display */}
                                <Paper
                                    withBorder
                                    p="sm"
                                    radius="sm"
                                    bg="var(--mantine-color-dark-7)"
                                    mih={80}
                                >
                                    {(transcript || interimTranscript) ? (
                                        <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                                            {transcript && processVoiceCommands(transcript)}
                                            {interimTranscript && (
                                                <Text span c="dimmed" inherit>
                                                    {transcript ? ' ' : ''}{interimTranscript}
                                                </Text>
                                            )}
                                        </Text>
                                    ) : (
                                        <Text size="sm" c="dimmed" fs="italic">
                                            {placeholder || t('voice.speakNow', { defaultValue: 'Speak now...' })}
                                        </Text>
                                    )}
                                </Paper>

                                {/* Action buttons */}
                                <Group justify="flex-end" gap="xs">
                                    <Button
                                        variant="subtle"
                                        color="gray"
                                        leftSection={<IconX size={16} />}
                                        onClick={handleCancel}
                                    >
                                        {t('common.cancel')}
                                    </Button>
                                    <Button
                                        variant="filled"
                                        color="green"
                                        leftSection={<IconCheck size={16} />}
                                        onClick={handleConfirm}
                                        disabled={!transcript.trim()}
                                    >
                                        {t('voice.useText', { defaultValue: 'Use text' })}
                                    </Button>
                                </Group>
                            </Stack>
                        </Paper>
                    </motion.div>
                )}
            </AnimatePresence>
        </Stack>
    );
}

// Compact inline version for text inputs
export function VoiceInputButton({
    onTranscript,
    language,
    size = 'sm',
}: {
    onTranscript: (text: string) => void;
    language?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}) {
    const { t, i18n } = useTranslation();
    const speechLanguage = language || (i18n.language === 'de' ? 'de-DE' : 'en-US');

    const {
        isListening,
        isSupported,
        transcript,
        startListening,
        stopListening,
        resetTranscript,
    } = useSpeechRecognition({
        language: speechLanguage,
        continuous: false,
        interimResults: true,
        onEnd: () => {
            // Auto-submit when speech ends
        },
    });

    // When transcript is final and we stop listening, send it
    useEffect(() => {
        if (!isListening && transcript) {
            onTranscript(transcript);
            resetTranscript();
        }
    }, [isListening, transcript, onTranscript, resetTranscript]);

    const handleClick = () => {
        if (isListening) {
            stopListening();
        } else {
            resetTranscript();
            startListening();
        }
    };

    if (!isSupported) {
        return null;
    }

    return (
        <Tooltip label={isListening ? t('voice.stopRecording') : t('voice.startRecording')}>
            <ActionIcon
                size={size}
                variant={isListening ? 'filled' : 'subtle'}
                color={isListening ? 'red' : 'gray'}
                onClick={handleClick}
            >
                {isListening ? <IconPlayerStop size={16} /> : <IconMicrophone size={16} />}
            </ActionIcon>
        </Tooltip>
    );
}

export default VoiceRecorder;
