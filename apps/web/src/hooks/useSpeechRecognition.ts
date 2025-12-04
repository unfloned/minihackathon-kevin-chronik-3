import { useState, useEffect, useCallback, useRef } from 'react';

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
    resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message: string;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: () => void;
    stop: () => void;
    abort: () => void;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
    onstart: (() => void) | null;
}

interface SpeechRecognitionConstructor {
    new (): SpeechRecognition;
}

declare global {
    interface Window {
        SpeechRecognition?: SpeechRecognitionConstructor;
        webkitSpeechRecognition?: SpeechRecognitionConstructor;
    }
}

export interface UseSpeechRecognitionOptions {
    language?: string;
    continuous?: boolean;
    interimResults?: boolean;
    onResult?: (transcript: string, isFinal: boolean) => void;
    onError?: (error: string) => void;
    onEnd?: () => void;
}

export interface UseSpeechRecognitionReturn {
    isListening: boolean;
    isSupported: boolean;
    transcript: string;
    interimTranscript: string;
    startListening: () => void;
    stopListening: () => void;
    resetTranscript: () => void;
}

export function useSpeechRecognition(
    options: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn {
    const {
        language = 'de-DE',
        continuous = true,
        interimResults = true,
        onResult,
        onError,
        onEnd,
    } = options;

    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');

    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const isSupported = typeof window !== 'undefined' &&
        !!(window.SpeechRecognition || window.webkitSpeechRecognition);

    // Initialize recognition
    useEffect(() => {
        if (!isSupported) return;

        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognitionAPI) return;

        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = continuous;
        recognition.interimResults = interimResults;
        recognition.lang = language;

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let finalTranscript = '';
            let currentInterim = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    finalTranscript += result[0].transcript;
                } else {
                    currentInterim += result[0].transcript;
                }
            }

            if (finalTranscript) {
                setTranscript(prev => prev + finalTranscript);
                setInterimTranscript('');
                onResult?.(finalTranscript, true);
            } else {
                setInterimTranscript(currentInterim);
                onResult?.(currentInterim, false);
            }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error('Speech recognition error:', event.error);
            onError?.(event.error);

            // Don't stop on 'no-speech' error, just continue listening
            if (event.error !== 'no-speech') {
                setIsListening(false);
            }
        };

        recognition.onend = () => {
            // If still supposed to be listening, restart (for continuous mode)
            if (isListening && continuous) {
                try {
                    recognition.start();
                } catch (e) {
                    setIsListening(false);
                    onEnd?.();
                }
            } else {
                setIsListening(false);
                onEnd?.();
            }
        };

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognitionRef.current = recognition;

        return () => {
            recognition.abort();
        };
    }, [isSupported, language, continuous, interimResults]);

    // Update language when it changes
    useEffect(() => {
        if (recognitionRef.current) {
            recognitionRef.current.lang = language;
        }
    }, [language]);

    const startListening = useCallback(() => {
        if (!recognitionRef.current || !isSupported) {
            onError?.('Speech recognition not supported');
            return;
        }

        try {
            setTranscript('');
            setInterimTranscript('');
            recognitionRef.current.start();
        } catch (error) {
            // Already started, ignore
            console.warn('Recognition already started');
        }
    }, [isSupported, onError]);

    const stopListening = useCallback(() => {
        if (!recognitionRef.current) return;

        try {
            setIsListening(false);
            recognitionRef.current.stop();
        } catch (error) {
            // Already stopped, ignore
        }
    }, []);

    const resetTranscript = useCallback(() => {
        setTranscript('');
        setInterimTranscript('');
    }, []);

    return {
        isListening,
        isSupported,
        transcript,
        interimTranscript,
        startListening,
        stopListening,
        resetTranscript,
    };
}

export default useSpeechRecognition;
