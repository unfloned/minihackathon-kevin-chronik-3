import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Box, Text, Title, Slider } from '@mantine/core';
import {
    IconVolume,
    IconVolume2,
    IconBriefcase,
    IconCalendar,
    IconNote,
    IconList,
    IconCoin,
    IconBox,
    IconTarget,
    IconGift,
    IconDeviceTv,
    IconCreditCard,
    IconCheck,
    IconToolsKitchen2,
    IconRocket,
    IconBolt,
    IconCode,
    IconBrandReact,
    IconShield,
    IconLock,
    IconLayoutGrid,
    IconEye,
    IconArrowRight,
    IconSparkles,
} from '@tabler/icons-react';
import { useCinematicAudio } from './useCinematicAudio';
import classes from './CinematicIntro.module.css';

type TimeoutId = ReturnType<typeof setTimeout>;

interface CinematicIntroProps {
    onComplete: () => void;
}

type ParticleSize = 'small' | 'medium' | 'large';

const FEATURES = [
    'Bewerbungen', 'Gewohnheiten', 'Ausgaben', 'Termine',
    'Abos', 'Medien', 'Inventar', 'Notizen',
    'Listen', 'Projekte', 'Mahlzeiten', 'Wunschlisten'
];

// Chaos icons für UNORDNUNG scene
const CHAOS_ICONS = [
    { Icon: IconBriefcase, x: -180, y: -120, delay: 0 },
    { Icon: IconCalendar, x: 200, y: -100, delay: 0.2 },
    { Icon: IconNote, x: -220, y: 80, delay: 0.4 },
    { Icon: IconList, x: 180, y: 100, delay: 0.1 },
    { Icon: IconCoin, x: -140, y: -180, delay: 0.3 },
    { Icon: IconBox, x: 240, y: -20, delay: 0.5 },
    { Icon: IconTarget, x: -200, y: 0, delay: 0.15 },
    { Icon: IconGift, x: 160, y: 150, delay: 0.35 },
    { Icon: IconDeviceTv, x: -100, y: 160, delay: 0.25 },
    { Icon: IconCreditCard, x: 100, y: -160, delay: 0.45 },
    { Icon: IconCheck, x: -260, y: -60, delay: 0.55 },
    { Icon: IconToolsKitchen2, x: 280, y: 60, delay: 0.6 },
];

export function CinematicIntro({ onComplete }: CinematicIntroProps) {
    const [phase, setPhase] = useState(0);
    const [isSkipping, setIsSkipping] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const [currentFeatureIndex, setCurrentFeatureIndex] = useState(-1);
    const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
    const audioStartedRef = useRef(false);
    const timelineStartedRef = useRef(false);
    const featureIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const audio = useCinematicAudio();
    const audioRef = useRef(audio);
    audioRef.current = audio;

    // Mouse tracking for chaos effect
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            const offsetX = (e.clientX - centerX) / centerX; // -1 to 1
            const offsetY = (e.clientY - centerY) / centerY; // -1 to 1
            setMouseOffset({ x: offsetX * 30, y: offsetY * 30 }); // Max 30px offset
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Calculate particle count based on phase - more particles as it gets faster
    const getParticleCount = useCallback((currentPhase: number) => {
        if (currentPhase < 10) return 60;        // Normal phases
        if (currentPhase < 15) return 100;       // Starting fast
        if (currentPhase < 20) return 150;       // Getting intense
        return 200;                               // Maximum intensity
    }, []);

    // Generate all possible particles (max count), will show based on phase
    const allParticles = useMemo(() =>
        [...Array(200)].map((_, i) => {
            const sizes: ParticleSize[] = ['small', 'medium', 'large'];
            const size = sizes[Math.floor(Math.random() * 3)];
            return {
                id: i,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${4 + Math.random() * 4}s`,
                size,
            };
        }),
        []
    );

    // Get visible particles based on current phase
    const visibleParticleCount = getParticleCount(phase);

    const handleSkip = useCallback((e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
        }
        setIsSkipping(true);
        audioRef.current.cleanup();
        setTimeout(onComplete, 300);
    }, [onComplete]);

    const handleInteraction = useCallback(() => {
        if (!hasInteracted) {
            setHasInteracted(true);
        }
    }, [hasInteracted]);

    // Start audio after interaction (but not if skipping)
    useEffect(() => {
        if (!hasInteracted || audioStartedRef.current || isSkipping) return;
        audioStartedRef.current = true;

        // Start with dark ambient drone
        audioRef.current.playDarkAmbient();
    }, [hasInteracted, isSkipping]);

    // Phase-based effects (no flash, just visual transitions via CSS)
    useEffect(() => {
        // All visual effects are handled by CSS transitions
        // Audio is one continuous track
    }, [phase, hasInteracted, isSkipping]);

    // Feature cycling effect - starts at phase 8 (full screen features)
    useEffect(() => {
        if (phase !== 8 || isSkipping) return;

        // Start cycling through features
        setCurrentFeatureIndex(0);
        audioRef.current.playBassHit(); // Play bass hit for first feature

        const interval = setInterval(() => {
            setCurrentFeatureIndex(prev => {
                if (prev >= FEATURES.length - 1) {
                    clearInterval(interval);
                    return prev;
                }
                audioRef.current.playBassHit(); // Play bass hit for each feature
                return prev + 1;
            });
        }, 300); // 300ms per feature = ~3.6s for all 12

        featureIntervalRef.current = interval;

        return () => {
            if (featureIntervalRef.current) {
                clearInterval(featureIntervalRef.current);
            }
        };
    }, [phase, isSkipping]);

    // Animation timeline - 5 Scenes (~28 Sekunden)
    useEffect(() => {
        if (!hasInteracted || timelineStartedRef.current || isSkipping) return;
        timelineStartedRef.current = true;

        // Timeline für intro-music.mp3 (49s) - Musik startet richtig bei 900ms
        // Ab 22s: Schnelle Screens (~1s pro Screen) bis Fade out bei 44s
        const timeline = [
            { phase: 1, delay: 900 },       // Particles fade in
            { phase: 2, delay: 900 },       // MINIHACKATHON 3.0 (gleichzeitig mit Particles)
            { phase: 3, delay: 3500 },      // von Kevin Chromik
            { phase: 4, delay: 6000 },      // Dezember 2025
            { phase: 5, delay: 10500 },     // UNORDNUNG
            { phase: 6, delay: 13000 },     // Subtitle "Entwickle etwas..."
            { phase: 7, delay: 15500 },     // "Eine App für alles"
            { phase: 8, delay: 17500 },     // Features cycling starts
            { phase: 9, delay: 21500 },     // Features continue (~4s total)
            // === Ab hier SCHNELL (nach 22s) - ~1s pro Screen ===
            { phase: 10, delay: 22000 },    // "Organisiere dein Leben"
            { phase: 11, delay: 23200 },    // "Tracke deine Fortschritte"
            { phase: 12, delay: 24400 },    // "Behalte den Überblick"
            { phase: 13, delay: 25600 },    // "Plane voraus"
            { phase: 14, delay: 26800 },    // "Bleib fokussiert"
            { phase: 15, delay: 28000 },    // "Erreiche mehr"
            { phase: 16, delay: 29200 },    // "Alles an einem Ort"
            { phase: 17, delay: 30400 },    // "Einfach. Schnell. Effizient."
            { phase: 18, delay: 31600 },    // Tech: React + TypeScript
            { phase: 19, delay: 33000 },    // "Deine Daten. Deine Kontrolle."
            { phase: 20, delay: 34500 },    // "12 Module. 1 Vision."
            { phase: 21, delay: 36000 },    // "Chaos → Ordnung"
            { phase: 22, delay: 37500 },    // Dein Chaos
            { phase: 23, delay: 39000 },    // Meine Mission
            { phase: 24, delay: 41000 },    // Developer credit
            { phase: 25, delay: 44000 },    // Fade out (Musik läuft bis 49s)
        ];

        const timeouts: TimeoutId[] = [];

        timeline.forEach(({ phase: p, delay }) => {
            const timeout = setTimeout(() => {
                setPhase(p);
                if (p === 25) {
                    // Start audio fade out at 44s, complete at 49s
                    audioRef.current.fadeOutAndStop?.(5000);
                    setTimeout(() => {
                        audioRef.current.cleanup();
                        onComplete();
                    }, 5000);
                }
            }, delay);
            timeouts.push(timeout);
        });

        return () => {
            timeouts.forEach(clearTimeout);
        };
    }, [hasInteracted, isSkipping, onComplete]);

    // Keyboard skip
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
                if (hasInteracted) {
                    handleSkip();
                } else {
                    handleInteraction();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleSkip, handleInteraction, hasInteracted]);

    const sizeClasses: Record<ParticleSize, string> = {
        small: classes.particleSmall,
        medium: classes.particleMedium,
        large: classes.particleLarge,
    };

    return (
        <Box
            className={`${classes.container} ${isSkipping ? classes.fadeOut : ''} ${phase >= 25 ? classes.fadeOut : ''}`}
            onClick={handleInteraction}
        >
            {/* Film grain */}
            <div className={classes.filmGrain} />
            {/* Vignette */}
            <div className={classes.vignette} />

            {/* Particles - count increases with phase, hidden at end */}
            <div className={`${classes.particles} ${phase >= 1 && phase < 24 ? classes.visible : ''}`}>
                {allParticles.slice(0, visibleParticleCount).map((particle) => (
                    <div
                        key={particle.id}
                        className={`${classes.particle} ${sizeClasses[particle.size]}`}
                        style={{
                            left: particle.left,
                            top: particle.top,
                            animationDelay: particle.animationDelay,
                            animationDuration: particle.animationDuration,
                        }}
                    />
                ))}
            </div>

            {/* ==================== SCENE 1: MINIHACKATHON 3.0 ==================== */}
            <div className={`${classes.scene} ${phase >= 2 && phase < 5 ? classes.visible : ''}`}>
                <div className={classes.sceneContent}>
                    <div className={classes.mainTitle}>
                        {'MINIHACKATHON'.split('').map((char, i) => (
                            <span
                                key={i}
                                className={classes.letter}
                                style={{ animationDelay: `${i * 0.03}s` }}
                            >
                                {char}
                            </span>
                        ))}
                        <span className={classes.versionNumber}>3.0</span>
                    </div>
                    <Text
                        className={`${classes.subtitle} ${phase >= 3 ? classes.visible : ''}`}
                        size="xl"
                        fw={300}
                    >
                        von Kevin Chromik
                    </Text>
                    <Text
                        className={`${classes.subtitle} ${classes.dateText} ${phase >= 4 ? classes.visible : ''}`}
                        size="lg"
                        fw={400}
                    >
                        Dezember 2025
                    </Text>
                </div>
            </div>

            {/* ==================== SCENE 2: UNORDNUNG ==================== */}
            <div className={`${classes.scene} ${phase >= 5 && phase < 7 ? classes.visible : ''}`}>
                {/* Chaos Icons floating around */}
                <div className={classes.chaosIconsContainer}>
                    {CHAOS_ICONS.map(({ Icon, x, y, delay }, index) => (
                        <div
                            key={index}
                            className={classes.chaosIcon}
                            style={{
                                '--delay': `${delay}s`,
                                left: `calc(50% + ${x + mouseOffset.x * (1 + index * 0.1)}px)`,
                                top: `calc(50% + ${y + mouseOffset.y * (1 + index * 0.1)}px)`,
                            } as React.CSSProperties}
                        >
                            <Icon size={28 + (index % 3) * 8} />
                        </div>
                    ))}
                </div>
                <div className={classes.sceneContent}>
                    <Title
                        className={classes.chaosTitle}
                        order={1}
                    >
                        UNORDNUNG
                    </Title>
                    <Text
                        className={`${classes.challengeText} ${phase >= 6 ? classes.visible : ''}`}
                        size="lg"
                        fw={400}
                        c="dimmed"
                        ta="center"
                    >
                        Entwickle etwas, um Chaos in Ordnung zu verwandeln
                    </Text>
                </div>
            </div>

            {/* ==================== SCENE 3: EINE APP FÜR ALLES ==================== */}
            <div className={`${classes.scene} ${phase >= 7 && phase < 8 ? classes.visible : ''}`}>
                <div className={classes.sceneContent}>
                    <Title className={classes.statementTitle} order={1}>
                        <Text
                            component="span"
                            variant="gradient"
                            gradient={{ from: 'violet', to: 'grape', deg: 90 }}
                            inherit
                        >
                            Eine App für alles
                        </Text>
                    </Title>
                </div>
            </div>

            {/* ==================== SCENE 4: FEATURES CYCLING ==================== */}
            <div className={`${classes.scene} ${phase >= 8 && phase < 10 ? classes.visible : ''}`}>
                {/* Feature cycling - full screen, one at a time */}
                <div className={classes.featureContainer}>
                    {currentFeatureIndex >= 0 && phase >= 8 && phase < 10 && (
                        <Text
                            key={currentFeatureIndex}
                            className={classes.featureItem}
                            variant="gradient"
                            gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
                        >
                            {FEATURES[currentFeatureIndex]}
                        </Text>
                    )}
                </div>
            </div>

            {/* ==================== SCENE 5: ORGANISIERE DEIN LEBEN ==================== */}
            <div className={`${classes.scene} ${phase >= 10 && phase < 11 ? classes.visible : ''}`}>
                {/* Decorators */}
                <div className={`${classes.statementDecorator} ${classes.topLeft}`} style={{ animationDelay: '0.1s' }}>
                    <IconCalendar size={36} />
                </div>
                <div className={`${classes.statementDecorator} ${classes.bottomRight}`} style={{ animationDelay: '0.2s' }}>
                    <IconCheck size={32} />
                </div>
                <div className={`${classes.decoratorShape} ${classes.shapeCircle} ${classes.shape1}`} />
                <div className={`${classes.decoratorShape} ${classes.shapeSquare} ${classes.shape2}`} />
                <div className={classes.sceneContent}>
                    <Title className={classes.statementTitle} order={1}>
                        <span className={classes.statementWord}>Organisiere</span>
                        <span className={classes.statementWord}>dein</span>
                        <Text
                            component="span"
                            variant="gradient"
                            gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
                            inherit
                            className={classes.statementWord}
                        >
                            Leben
                        </Text>
                    </Title>
                </div>
            </div>

            {/* ==================== SCENE 6: TRACKE DEINE FORTSCHRITTE ==================== */}
            <div className={`${classes.scene} ${phase >= 11 && phase < 12 ? classes.visible : ''}`}>
                <div className={`${classes.statementDecorator} ${classes.topRight}`} style={{ animationDelay: '0.1s' }}>
                    <IconTarget size={34} />
                </div>
                <div className={`${classes.decoratorShape} ${classes.shapeTriangle} ${classes.shape3}`} />
                <div className={classes.sceneContent}>
                    <Title className={classes.statementTitle} order={1}>
                        <span className={classes.statementWord}>Tracke</span>
                        <span className={classes.statementWord}>deine</span>
                        <Text
                            component="span"
                            variant="gradient"
                            gradient={{ from: 'green', to: 'teal', deg: 90 }}
                            inherit
                            className={classes.statementWord}
                        >
                            Fortschritte
                        </Text>
                    </Title>
                </div>
            </div>

            {/* ==================== SCENE 7: BEHALTE DEN ÜBERBLICK ==================== */}
            <div className={`${classes.scene} ${phase >= 12 && phase < 13 ? classes.visible : ''}`}>
                <div className={`${classes.statementDecorator} ${classes.topLeft}`} style={{ animationDelay: '0.1s' }}>
                    <IconList size={32} />
                </div>
                <div className={`${classes.decoratorShape} ${classes.shapeCircle} ${classes.shape4}`} />
                <div className={classes.sceneContent}>
                    <Title className={classes.statementTitle} order={1}>
                        <span className={classes.statementWord}>Behalte</span>
                        <span className={classes.statementWord}>den</span>
                        <Text
                            component="span"
                            variant="gradient"
                            gradient={{ from: 'orange', to: 'red', deg: 90 }}
                            inherit
                            className={classes.statementWord}
                        >
                            Überblick
                        </Text>
                    </Title>
                </div>
            </div>

            {/* ==================== SCENE 8: PLANE VORAUS ==================== */}
            <div className={`${classes.scene} ${phase >= 13 && phase < 14 ? classes.visible : ''}`}>
                <div className={`${classes.statementDecorator} ${classes.topRight}`} style={{ animationDelay: '0.1s' }}>
                    <IconCalendar size={34} />
                </div>
                <div className={`${classes.decoratorShape} ${classes.shapeSquare} ${classes.shape1}`} />
                <div className={classes.sceneContent}>
                    <Title className={classes.statementTitle} order={1}>
                        <span className={classes.statementWord}>Plane</span>
                        <Text
                            component="span"
                            variant="gradient"
                            gradient={{ from: 'violet', to: 'grape', deg: 90 }}
                            inherit
                            className={classes.statementWord}
                        >
                            voraus
                        </Text>
                    </Title>
                </div>
            </div>

            {/* ==================== SCENE 9: BLEIB FOKUSSIERT ==================== */}
            <div className={`${classes.scene} ${phase >= 14 && phase < 15 ? classes.visible : ''}`}>
                <div className={`${classes.statementDecorator} ${classes.bottomLeft}`} style={{ animationDelay: '0.1s' }}>
                    <IconTarget size={32} />
                </div>
                <div className={`${classes.decoratorShape} ${classes.shapeTriangle} ${classes.shape2}`} />
                <div className={classes.sceneContent}>
                    <Title className={classes.statementTitle} order={1}>
                        <span className={classes.statementWord}>Bleib</span>
                        <Text
                            component="span"
                            variant="gradient"
                            gradient={{ from: 'pink', to: 'grape', deg: 90 }}
                            inherit
                            className={classes.statementWord}
                        >
                            fokussiert
                        </Text>
                    </Title>
                </div>
            </div>

            {/* ==================== SCENE 10: ERREICHE MEHR ==================== */}
            <div className={`${classes.scene} ${phase >= 15 && phase < 16 ? classes.visible : ''}`}>
                <div className={`${classes.statementDecorator} ${classes.topRight}`} style={{ animationDelay: '0.1s' }}>
                    <IconCheck size={36} />
                </div>
                <div className={`${classes.decoratorShape} ${classes.shapeCircle} ${classes.shape3}`} />
                <div className={classes.sceneContent}>
                    <Title className={classes.statementTitle} order={1}>
                        <span className={classes.statementWord}>Erreiche</span>
                        <Text
                            component="span"
                            variant="gradient"
                            gradient={{ from: 'yellow', to: 'orange', deg: 90 }}
                            inherit
                            className={classes.statementWord}
                        >
                            mehr
                        </Text>
                    </Title>
                </div>
            </div>

            {/* ==================== SCENE 11: ALLES AN EINEM ORT ==================== */}
            <div className={`${classes.scene} ${phase >= 16 && phase < 17 ? classes.visible : ''}`}>
                <div className={`${classes.statementDecorator} ${classes.topLeft}`} style={{ animationDelay: '0.1s' }}>
                    <IconBox size={32} />
                </div>
                <div className={`${classes.statementDecorator} ${classes.bottomRight}`} style={{ animationDelay: '0.15s' }}>
                    <IconNote size={30} />
                </div>
                <div className={`${classes.decoratorShape} ${classes.shapeSquare} ${classes.shape4}`} />
                <div className={classes.sceneContent}>
                    <Title className={classes.statementTitle} order={1}>
                        <span className={classes.statementWord}>Alles</span>
                        <span className={classes.statementWord}>an</span>
                        <Text
                            component="span"
                            variant="gradient"
                            gradient={{ from: 'lime', to: 'green', deg: 90 }}
                            inherit
                            className={classes.statementWord}
                        >
                            einem Ort
                        </Text>
                    </Title>
                </div>
            </div>

            {/* ==================== SCENE 12: EINFACH. SCHNELL. EFFIZIENT. ==================== */}
            <div className={`${classes.scene} ${phase >= 17 && phase < 18 ? classes.visible : ''}`}>
                <div className={`${classes.statementDecorator} ${classes.topLeft}`} style={{ animationDelay: '0.1s' }}>
                    <IconSparkles size={32} />
                </div>
                <div className={`${classes.statementDecorator} ${classes.topRight}`} style={{ animationDelay: '0.15s' }}>
                    <IconBolt size={34} />
                </div>
                <div className={`${classes.statementDecorator} ${classes.bottomRight}`} style={{ animationDelay: '0.2s' }}>
                    <IconRocket size={36} />
                </div>
                <div className={`${classes.decoratorShape} ${classes.shapeCircle} ${classes.shape1}`} />
                <div className={`${classes.decoratorShape} ${classes.shapeTriangle} ${classes.shape3}`} />
                <div className={classes.sceneContent}>
                    <Title className={classes.statementTitle} order={1}>
                        <Text
                            component="span"
                            variant="gradient"
                            gradient={{ from: 'blue', to: 'violet', deg: 90 }}
                            inherit
                            className={classes.statementWord}
                        >
                            Einfach.
                        </Text>
                        <Text
                            component="span"
                            variant="gradient"
                            gradient={{ from: 'violet', to: 'grape', deg: 90 }}
                            inherit
                            className={classes.statementWord}
                        >
                            Schnell.
                        </Text>
                        <Text
                            component="span"
                            variant="gradient"
                            gradient={{ from: 'grape', to: 'pink', deg: 90 }}
                            inherit
                            className={classes.statementWord}
                        >
                            Effizient.
                        </Text>
                    </Title>
                </div>
            </div>

            {/* ==================== SCENE 13: TECH STACK ==================== */}
            <div className={`${classes.scene} ${phase >= 18 && phase < 19 ? classes.visible : ''}`}>
                <div className={`${classes.statementDecorator} ${classes.topLeft}`} style={{ animationDelay: '0.1s' }}>
                    <IconBrandReact size={40} />
                </div>
                <div className={`${classes.statementDecorator} ${classes.bottomRight}`} style={{ animationDelay: '0.15s' }}>
                    <IconCode size={36} />
                </div>
                <div className={`${classes.decoratorShape} ${classes.shapeSquare} ${classes.shape2}`} />
                <div className={`${classes.decoratorShape} ${classes.shapeCircle} ${classes.shape4}`} />
                <div className={classes.sceneContent}>
                    <Text size="sm" c="dimmed" className={classes.techLabel}>
                        Built with
                    </Text>
                    <Title className={classes.techTitle} order={2}>
                        <Text
                            component="span"
                            variant="gradient"
                            gradient={{ from: 'cyan', to: 'blue', deg: 90 }}
                            inherit
                        >
                            React
                        </Text>
                        {' • '}
                        <Text
                            component="span"
                            variant="gradient"
                            gradient={{ from: 'blue', to: 'indigo', deg: 90 }}
                            inherit
                        >
                            Deepkit
                        </Text>
                        {' • '}
                        <Text
                            component="span"
                            variant="gradient"
                            gradient={{ from: 'indigo', to: 'violet', deg: 90 }}
                            inherit
                        >
                            Mantine
                        </Text>
                    </Title>
                    <Text size="xs" c="dimmed" mt="xs" className={classes.techSubtext}>
                        TypeScript • Vite • pnpm
                    </Text>
                </div>
            </div>

            {/* ==================== SCENE 14: DEINE DATEN. DEINE KONTROLLE. ==================== */}
            <div className={`${classes.scene} ${phase >= 19 && phase < 20 ? classes.visible : ''}`}>
                <div className={`${classes.statementDecorator} ${classes.topRight}`} style={{ animationDelay: '0.1s' }}>
                    <IconShield size={38} />
                </div>
                <div className={`${classes.statementDecorator} ${classes.bottomLeft}`} style={{ animationDelay: '0.15s' }}>
                    <IconLock size={32} />
                </div>
                <div className={`${classes.decoratorShape} ${classes.shapeTriangle} ${classes.shape1}`} />
                <div className={`${classes.decoratorShape} ${classes.shapeSquare} ${classes.shape3}`} />
                <div className={classes.sceneContent}>
                    <Title className={classes.statementTitle} order={1}>
                        <Text
                            component="span"
                            variant="gradient"
                            gradient={{ from: 'red', to: 'orange', deg: 90 }}
                            inherit
                            className={classes.statementWord}
                        >
                            Deine
                        </Text>
                        <Text
                            component="span"
                            variant="gradient"
                            gradient={{ from: 'orange', to: 'yellow', deg: 90 }}
                            inherit
                            className={classes.statementWord}
                        >
                            Daten.
                        </Text>
                        <Text
                            component="span"
                            variant="gradient"
                            gradient={{ from: 'yellow', to: 'orange', deg: 90 }}
                            inherit
                            className={classes.statementWord}
                        >
                            Deine
                        </Text>
                        <Text
                            component="span"
                            variant="gradient"
                            gradient={{ from: 'orange', to: 'red', deg: 90 }}
                            inherit
                            className={classes.statementWord}
                        >
                            Kontrolle.
                        </Text>
                    </Title>
                </div>
            </div>

            {/* ==================== SCENE 15: 12 MODULE. 1 VISION. ==================== */}
            <div className={`${classes.scene} ${phase >= 20 && phase < 21 ? classes.visible : ''}`}>
                <div className={`${classes.statementDecorator} ${classes.topLeft}`} style={{ animationDelay: '0.1s' }}>
                    <IconLayoutGrid size={36} />
                </div>
                <div className={`${classes.statementDecorator} ${classes.bottomRight}`} style={{ animationDelay: '0.15s' }}>
                    <IconEye size={34} />
                </div>
                <div className={`${classes.decoratorShape} ${classes.shapeCircle} ${classes.shape2}`} />
                <div className={`${classes.decoratorShape} ${classes.shapeTriangle} ${classes.shape4}`} />
                <div className={classes.sceneContent}>
                    <Title className={classes.statementTitle} order={1}>
                        <Text
                            component="span"
                            variant="gradient"
                            gradient={{ from: 'indigo', to: 'violet', deg: 90 }}
                            inherit
                            className={classes.statementWord}
                        >
                            12
                        </Text>
                        <Text
                            component="span"
                            variant="gradient"
                            gradient={{ from: 'violet', to: 'grape', deg: 90 }}
                            inherit
                            className={classes.statementWord}
                        >
                            Module.
                        </Text>
                        <Text
                            component="span"
                            variant="gradient"
                            gradient={{ from: 'grape', to: 'pink', deg: 90 }}
                            inherit
                            className={classes.statementWord}
                        >
                            1
                        </Text>
                        <Text
                            component="span"
                            variant="gradient"
                            gradient={{ from: 'pink', to: 'violet', deg: 90 }}
                            inherit
                            className={classes.statementWord}
                        >
                            Vision.
                        </Text>
                    </Title>
                </div>
            </div>

            {/* ==================== SCENE 16: CHAOS → ORDNUNG ==================== */}
            <div className={`${classes.scene} ${phase >= 21 && phase < 22 ? classes.visible : ''}`}>
                <div className={`${classes.statementDecorator} ${classes.topLeft} ${classes.chaosDecorator}`} style={{ animationDelay: '0.1s' }}>
                    <IconBriefcase size={30} />
                </div>
                <div className={`${classes.statementDecorator} ${classes.bottomLeft} ${classes.chaosDecorator}`} style={{ animationDelay: '0.15s' }}>
                    <IconCoin size={28} />
                </div>
                <div className={`${classes.statementDecorator} ${classes.topRight} ${classes.orderDecorator}`} style={{ animationDelay: '0.2s' }}>
                    <IconCheck size={34} />
                </div>
                <div className={`${classes.statementDecorator} ${classes.bottomRight} ${classes.orderDecorator}`} style={{ animationDelay: '0.25s' }}>
                    <IconTarget size={32} />
                </div>
                <div className={`${classes.statementDecorator} ${classes.centerLeft}`} style={{ animationDelay: '0.1s' }}>
                    <IconArrowRight size={40} />
                </div>
                <div className={`${classes.decoratorShape} ${classes.shapeSquare} ${classes.shape1}`} />
                <div className={`${classes.decoratorShape} ${classes.shapeCircle} ${classes.shape3}`} />
                <div className={classes.sceneContent}>
                    <Title className={classes.statementTitle} order={1}>
                        <span className={`${classes.statementWord} ${classes.chaosText}`}>
                            Chaos
                        </span>
                        <span className={classes.statementWord}>→</span>
                        <Text
                            component="span"
                            variant="gradient"
                            gradient={{ from: 'teal', to: 'cyan', deg: 90 }}
                            inherit
                            className={classes.statementWord}
                        >
                            Ordnung
                        </Text>
                    </Title>
                </div>
            </div>

            {/* ==================== SCENE 17: DEIN CHAOS, MEINE MISSION ==================== */}
            <div className={`${classes.scene} ${classes.ycmmScene} ${phase >= 22 && phase < 24 ? classes.visible : ''}`}>
                <div className={classes.ycmmContainer}>
                    <Title
                        className={`${classes.ycmmText} ${phase >= 22 ? classes.visible : ''}`}
                        order={1}
                    >
                        <span className={classes.yourText}>Dein</span>{' '}
                        <span className={classes.chaosTextLarge}>
                            Chaos
                        </span>
                    </Title>
                    <Title
                        className={`${classes.ycmmText} ${classes.missionLine} ${phase >= 23 ? classes.visible : ''}`}
                        order={1}
                    >
                        <span className={classes.myText}>Meine</span>{' '}
                        <Text
                            component="span"
                            variant="gradient"
                            gradient={{ from: 'cyan', to: 'teal', deg: 90 }}
                            inherit
                        >
                            Mission
                        </Text>
                    </Title>
                </div>
            </div>

            {/* ==================== SCENE 18: DEVELOPER CREDIT ==================== */}
            <div className={`${classes.scene} ${phase >= 24 && phase < 25 ? classes.visible : ''}`}>
                <div className={classes.developerCredit}>
                    <Text size="sm" c="dimmed" className={classes.creditLabel}>
                        Entwickler
                    </Text>
                    <Title
                        className={classes.developerName}
                        order={2}
                    >
                        Florian Chiorean
                    </Title>
                    <Text size="xs" c="dimmed" mt="lg" className={classes.musicCredit}>
                        Music by Vasil Yatsevich from Pixabay
                    </Text>
                </div>
            </div>

            {/* Start hint */}
            {!hasInteracted && (
                <div className={classes.startHint}>
                    <div className={classes.playIcon} />
                    <Text className={classes.startHintText} size="xs" c="dimmed">
                        Klicken zum Starten
                    </Text>
                </div>
            )}

            {/* Skip button */}
            <button className={classes.skipButton} onClick={handleSkip}>
                Skip
            </button>

            {/* Volume slider */}
            {hasInteracted && (
                <div className={classes.volumeControl} onClick={(e) => e.stopPropagation()}>
                    <IconVolume2 size={16} color="rgba(255,255,255,0.5)" />
                    <Slider
                        className={classes.volumeSlider}
                        value={audio.volume * 100}
                        onChange={(val) => audio.setVolume(val / 100)}
                        min={0}
                        max={100}
                        size="xs"
                        color="gray"
                        label={null}
                    />
                    <IconVolume size={16} color="rgba(255,255,255,0.5)" />
                </div>
            )}

            {/* Cinematic bars - close at end */}
            <div className={`${classes.cinematicBarTop} ${phase >= 25 ? classes.closing : ''}`} />
            <div className={`${classes.cinematicBarBottom} ${phase >= 25 ? classes.closing : ''}`} />
        </Box>
    );
}
