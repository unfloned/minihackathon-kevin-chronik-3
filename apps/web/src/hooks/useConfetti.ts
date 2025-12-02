import confetti from 'canvas-confetti';

interface ConfettiOptions {
    particleCount?: number;
    spread?: number;
    startVelocity?: number;
    decay?: number;
    gravity?: number;
    origin?: { x: number; y: number };
    colors?: string[];
}

export function useConfetti() {
    const fire = (options: ConfettiOptions = {}) => {
        confetti({
            particleCount: options.particleCount ?? 100,
            spread: options.spread ?? 70,
            startVelocity: options.startVelocity ?? 30,
            decay: options.decay ?? 0.95,
            gravity: options.gravity ?? 1,
            origin: options.origin ?? { y: 0.6 },
            colors: options.colors ?? ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'],
        });
    };

    const celebration = () => {
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);

            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
            });
        }, 250);
    };

    const achievementUnlock = () => {
        // Golden achievement confetti
        const colors = ['#FFD700', '#FFA500', '#FF8C00', '#FFDF00', '#F4C430'];

        confetti({
            particleCount: 80,
            spread: 100,
            origin: { y: 0.5 },
            colors,
            startVelocity: 45,
            gravity: 0.8,
        });

        setTimeout(() => {
            confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.6, x: 0.3 },
                colors,
            });
            confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.6, x: 0.7 },
                colors,
            });
        }, 200);
    };

    const levelUp = () => {
        // Epic level up celebration
        const duration = 4000;
        const animationEnd = Date.now() + duration;
        const colors = ['#7C3AED', '#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE'];

        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            confetti({
                particleCount: 3,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors,
            });
            confetti({
                particleCount: 3,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors,
            });
        }, 50);

        // Big burst in the middle
        setTimeout(() => {
            confetti({
                particleCount: 150,
                spread: 180,
                origin: { y: 0.5 },
                colors,
                startVelocity: 50,
            });
        }, 500);
    };

    const streak = (days: number) => {
        // Fire-themed confetti for streaks
        const colors = ['#FF4500', '#FF6347', '#FF7F50', '#FFA500', '#FFD700'];
        const intensity = Math.min(days * 10, 150);

        confetti({
            particleCount: intensity,
            spread: 90,
            origin: { y: 0.6 },
            colors,
            startVelocity: 35,
        });
    };

    return {
        fire,
        celebration,
        achievementUnlock,
        levelUp,
        streak,
    };
}

export default useConfetti;
