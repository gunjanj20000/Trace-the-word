import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CelebrationStyle } from '../types';

interface CelebrationProps {
  style?: CelebrationStyle;
  enabled?: boolean;
  reducedMotion?: boolean;
}

export const Celebration: React.FC<CelebrationProps> = ({
  style = 'stars',
  enabled = true,
  reducedMotion = false,
}) => {
  useEffect(() => {
    if (!enabled || reducedMotion) return;

    if (style === 'confetti') {
      // Gentle, calm pastel confetti (sensory-friendly: low particle count, slow velocity)
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#fbbf24', '#4ade80', '#c084fc', '#fb7185'],
        scalar: 1.2,
        gravity: 0.6,
        ticks: 200,
      });
    }
  }, [enabled, style, reducedMotion]);

  if (!enabled || reducedMotion) return null;

  if (style === 'stars') {
    return (
      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
        <div className="absolute top-1/4 left-1/6 animate-bounce text-5xl">⭐</div>
        <div className="absolute top-1/3 right-1/6 animate-bounce text-6xl" style={{ animationDelay: '200ms' }}>✨</div>
        <div className="absolute bottom-1/3 left-1/4 animate-bounce text-5xl" style={{ animationDelay: '400ms' }}>🌟</div>
        <div className="absolute top-1/2 right-1/4 animate-bounce text-6xl" style={{ animationDelay: '600ms' }}>⭐</div>
      </div>
    );
  }

  if (style === 'balloons') {
    return (
      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
        <div className="absolute -bottom-10 left-1/5 animate-float-gentle text-6xl" style={{ animationDuration: '4s' }}>🎈</div>
        <div className="absolute -bottom-10 left-1/2 animate-float-gentle text-7xl" style={{ animationDuration: '5s', animationDelay: '300ms' }}>🎈</div>
        <div className="absolute -bottom-10 right-1/5 animate-float-gentle text-6xl" style={{ animationDuration: '4.5s', animationDelay: '600ms' }}>🎈</div>
      </div>
    );
  }

  if (style === 'sparkles') {
    return (
      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
        <div className="absolute top-1/4 left-1/3 text-5xl animate-pulse">✨</div>
        <div className="absolute top-1/3 right-1/3 text-6xl animate-pulse" style={{ animationDelay: '300ms' }}>✨</div>
        <div className="absolute bottom-1/3 left-1/2 text-5xl animate-pulse" style={{ animationDelay: '600ms' }}>✨</div>
      </div>
    );
  }

  return null;
};
