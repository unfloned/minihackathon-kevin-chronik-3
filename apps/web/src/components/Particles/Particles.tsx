import { useMemo } from 'react';
import classes from './Particles.module.css';

type ParticleSize = 'small' | 'medium' | 'large';

interface ParticlesProps {
    count?: number;
    className?: string;
}

export function Particles({ count = 40, className }: ParticlesProps) {
    const particles = useMemo(() =>
        [...Array(count)].map((_, i) => {
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
        [count]
    );

    const sizeClasses: Record<ParticleSize, string> = {
        small: classes.particleSmall,
        medium: classes.particleMedium,
        large: classes.particleLarge,
    };

    return (
        <div className={`${classes.particles} ${className || ''}`}>
            {particles.map((particle) => (
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
    );
}
