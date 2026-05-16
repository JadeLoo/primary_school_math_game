import { useEffect, useState } from 'react';
import styles from './ComboEffect.module.css';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
}

interface ComboEffectProps {
  combo: number;
  onComplete: () => void;
}

const COLORS = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#FF8E53', '#C06FF0'];

function generateParticles(combo: number): Particle[] {
  const count = combo * 4;
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 300,
    y: (Math.random() - 0.5) * 200 - 60,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: 8 + Math.random() * 16,
    delay: Math.random() * 0.3,
    duration: 0.6 + Math.random() * 0.8,
  }));
}

export default function ComboEffect({ combo, onComplete }: ComboEffectProps) {
  const [particles] = useState(() => generateParticles(combo));
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete();
    }, 1800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className={styles.overlay}>
      {particles.map((p) => (
        <span
          key={p.id}
          className={styles.particle}
          style={{
            left: `calc(50% + ${p.x}px)`,
            top: `calc(50% + ${p.y}px)`,
            width: p.size,
            height: p.size,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
      <div className={styles.comboText}>
        <span className={styles.comboLabel}>🔥 {combo} 连击！</span>
      </div>
    </div>
  );
}
