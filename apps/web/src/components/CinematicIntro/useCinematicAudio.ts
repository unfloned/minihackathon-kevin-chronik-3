import { useRef, useCallback, useState } from 'react';

// Verfügbare Tracks
const TRACKS = {
    cyberpunk: '/audio/intro-music.mp3',      // Brain Implant - Vasil Yatsevich
    cinematic: '/audio/intro-music-2.mp3',    // Cinematic Trailer - Mikhail Smusev
};

// Welcher Track soll verwendet werden?
const ACTIVE_TRACK: keyof typeof TRACKS = 'cyberpunk';

// Default max volume (0-1)
const DEFAULT_MAX_VOLUME = 0.8;

export function useCinematicAudio() {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const [volume, setVolumeState] = useState(DEFAULT_MAX_VOLUME);
    const maxVolumeRef = useRef(DEFAULT_MAX_VOLUME);

    // Initialize AudioContext lazily
    const getAudioContext = useCallback(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        }
        return audioContextRef.current;
    }, []);

    // Set volume
    const setVolume = useCallback((newVolume: number) => {
        const clampedVolume = Math.max(0, Math.min(1, newVolume));
        maxVolumeRef.current = clampedVolume;
        setVolumeState(clampedVolume);
        if (audioRef.current) {
            audioRef.current.volume = clampedVolume;
        }
    }, []);

    // Play the intro music
    const playIntroMusic = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }

        const audio = new Audio(TRACKS[ACTIVE_TRACK]);
        audio.playbackRate = 1.0; // Original-Geschwindigkeit
        audioRef.current = audio;

        // Start with volume 0 for fade in
        audio.volume = 0;
        audio.play().catch(() => {
            // Autoplay blocked
        });

        // Smooth fade in over 1 second to max volume
        let vol = 0;
        const targetVolume = maxVolumeRef.current;
        const fadeIn = setInterval(() => {
            vol += targetVolume / 20; // 20 steps
            if (vol >= targetVolume) {
                audio.volume = targetVolume;
                clearInterval(fadeIn);
            } else {
                audio.volume = vol;
            }
        }, 50);

        return audio;
    }, []);

    // Fade out and stop
    const fadeOutAndStop = useCallback((duration: number = 2000) => {
        const audio = audioRef.current;
        if (!audio) return;

        const startVolume = audio.volume;
        const steps = 40;
        const stepTime = duration / steps;
        const volumeStep = startVolume / steps;
        let currentStep = 0;

        const fadeOut = setInterval(() => {
            currentStep++;
            const newVolume = startVolume - (volumeStep * currentStep);
            if (newVolume <= 0 || currentStep >= steps) {
                audio.volume = 0;
                audio.pause();
                clearInterval(fadeOut);
            } else {
                audio.volume = newVolume;
            }
        }, stepTime);
    }, []);

    // Cleanup
    const cleanup = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
    }, []);

    // Legacy functions - now all trigger the main music or are no-ops
    const playDarkAmbient = useCallback(() => {
        playIntroMusic();
    }, [playIntroMusic]);

    // Bass hit sound for features - LOUD and punchy
    const playBassHit = useCallback(() => {
        try {
            const ctx = getAudioContext();
            const now = ctx.currentTime;

            // Create main bass oscillator
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(60, now); // Start at 60Hz (deeper)
            osc.frequency.exponentialRampToValueAtTime(30, now + 0.15); // Drop to 30Hz

            // Loud and punchy
            const vol = maxVolumeRef.current * 1.0; // 100% of main volume
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(vol, now + 0.005); // Very fast attack
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25); // Longer decay

            osc.connect(gainNode);
            gainNode.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.3);

            // Add a sub-bass layer for more punch
            const subOsc = ctx.createOscillator();
            const subGain = ctx.createGain();

            subOsc.type = 'sine';
            subOsc.frequency.setValueAtTime(40, now);
            subOsc.frequency.exponentialRampToValueAtTime(20, now + 0.2);

            const subVol = maxVolumeRef.current * 0.8;
            subGain.gain.setValueAtTime(0, now);
            subGain.gain.linearRampToValueAtTime(subVol, now + 0.01);
            subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

            subOsc.connect(subGain);
            subGain.connect(ctx.destination);

            subOsc.start(now);
            subOsc.stop(now + 0.35);
        } catch {
            // AudioContext not available
        }
    }, [getAudioContext]);

    // These are now no-ops since we use one continuous track
    const playBwaam = useCallback(() => {}, []);
    const playTensionRiser = useCallback(() => {}, []);
    const playDeepHit = useCallback(() => {}, []);
    const playWhoosh = useCallback(() => {}, []);
    const playRevealShimmer = useCallback(() => {}, []);
    const playTextTick = useCallback(() => {}, []);
    const playFinalDrop = useCallback(() => {}, []);

    return {
        playDarkAmbient,
        playBwaam,
        playTensionRiser,
        playDeepHit,
        playWhoosh,
        playRevealShimmer,
        playTextTick,
        playFinalDrop,
        playBassHit,
        playIntroMusic,
        fadeOutAndStop,
        cleanup,
        volume,
        setVolume,
    };
}
