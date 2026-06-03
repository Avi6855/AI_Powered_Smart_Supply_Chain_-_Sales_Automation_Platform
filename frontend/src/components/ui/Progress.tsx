'use client';

import React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressProps {
  value:     number;   // 0-100
  max?:      number;
  label?:    string;
  showValue?: boolean;
  size?:     'xs' | 'sm' | 'md' | 'lg';
  color?:    'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'accent';
  animated?: boolean;
  className?: string;
}

const sizeMap: Record<string, string> = {
  xs: 'h-1',
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
};

const colorMap: Record<string, string> = {
  primary:   'from-primary-600 to-primary-400',
  secondary: 'from-secondary-600 to-secondary-400',
  success:   'from-success-600 to-success-400',
  danger:    'from-danger-600 to-danger-400',
  warning:   'from-warning-600 to-warning-400',
  accent:    'from-accent-600 to-accent-400',
};

const glowMap: Record<string, string> = {
  primary:   'shadow-glow-primary',
  secondary: 'shadow-glow-secondary',
  success:   'shadow-glow-success',
  danger:    'shadow-glow-danger',
  warning:   '',
  accent:    '',
};

export function Progress({
  value,
  max       = 100,
  label,
  showValue = false,
  size      = 'md',
  color     = 'primary',
  animated  = true,
  className,
}: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1.5">
          {label    && <span className="text-xs text-slate-400">{label}</span>}
          {showValue && <span className="text-xs font-semibold text-slate-300">{Math.round(pct)}%</span>}
        </div>
      )}

      <ProgressPrimitive.Root
        value={pct}
        max={100}
        className={cn(
          'relative w-full overflow-hidden rounded-full bg-dark-800 border border-white/5',
          sizeMap[size]
        )}
      >
        <ProgressPrimitive.Indicator asChild>
          {animated ? (
            <motion.div
              className={cn(
                'h-full rounded-full bg-gradient-to-r',
                colorMap[color],
                pct > 50 && glowMap[color]
              )}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          ) : (
            <div
              className={cn(
                'h-full rounded-full bg-gradient-to-r transition-all duration-500',
                colorMap[color]
              )}
              style={{ width: `${pct}%` }}
            />
          )}
        </ProgressPrimitive.Indicator>
      </ProgressPrimitive.Root>
    </div>
  );
}

// ── Ring Progress ─────────────────────────────────────────────────────────────
interface RingProgressProps {
  value:  number;
  size?:  number;
  stroke?: number;
  color?:  string;
  label?:  string;
}

export function RingProgress({
  value,
  size   = 80,
  stroke = 6,
  color  = '#8b5cf6',
  label,
}: RingProgressProps) {
  const radius      = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct         = Math.min(100, Math.max(0, value));
  const offset      = circumference - (pct / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          strokeWidth={stroke}
          stroke="rgba(255,255,255,0.05)"
          fill="none"
        />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          strokeWidth={stroke}
          stroke={color}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-sm font-bold text-slate-100">{Math.round(pct)}%</span>
        {label && <span className="text-xs text-slate-500">{label}</span>}
      </div>
    </div>
  );
}
