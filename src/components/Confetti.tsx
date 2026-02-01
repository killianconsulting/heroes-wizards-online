'use client';

import { useMemo } from 'react';

const COLORS = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9', '#fd79a8'];
const SHAPES = ['square', 'rectangle'] as const;

interface Particle {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
  shape: (typeof SHAPES)[number];
  rotation: number;
  drift: number;
}

function createParticles(count: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 1.5,
      duration: 2.5 + Math.random() * 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 6 + Math.random() * 8,
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      rotation: Math.random() * 360,
      drift: (Math.random() - 0.5) * 120,
    });
  }
  return particles;
}

export default function Confetti() {
  const particles = useMemo(() => createParticles(80), []);

  return (
    <div className="confetti" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className={`confetti__particle confetti__particle--${p.shape}`}
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            backgroundColor: p.color,
            width: p.shape === 'square' ? p.size : p.size * 1.5,
            height: p.shape === 'square' ? p.size : p.size * 0.6,
            ['--confetti-rotation' as string]: `${p.rotation}deg`,
            ['--confetti-drift' as string]: `${p.drift}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
