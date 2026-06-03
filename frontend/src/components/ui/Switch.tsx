'use client';

import React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cn } from '@/lib/utils';

interface SwitchProps {
  checked:        boolean;
  onCheckedChange:(checked: boolean) => void;
  label?:         string;
  description?:   string;
  disabled?:      boolean;
  size?:          'sm' | 'md' | 'lg';
  className?:     string;
}

const trackSizeMap: Record<string, string> = {
  sm: 'h-4 w-7',
  md: 'h-5 w-9',
  lg: 'h-6 w-11',
};

const thumbSizeMap: Record<string, string> = {
  sm: 'h-3 w-3 data-[state=checked]:translate-x-3',
  md: 'h-4 w-4 data-[state=checked]:translate-x-4',
  lg: 'h-5 w-5 data-[state=checked]:translate-x-5',
};

export function Switch({
  checked,
  onCheckedChange,
  label,
  description,
  disabled = false,
  size     = 'md',
  className,
}: SwitchProps) {
  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      {(label || description) && (
        <div className="flex-1">
          {label       && <p className="text-sm font-medium text-slate-200">{label}</p>}
          {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
        </div>
      )}

      <SwitchPrimitive.Root
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={cn(
          'relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent',
          'transition-colors duration-200 ease-in-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-950',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'data-[state=checked]:bg-primary-600 data-[state=unchecked]:bg-dark-700',
          trackSizeMap[size]
        )}
      >
        <SwitchPrimitive.Thumb
          className={cn(
            'pointer-events-none block rounded-full bg-white shadow-lg',
            'ring-0 transition-transform duration-200 ease-in-out',
            'data-[state=unchecked]:translate-x-0',
            thumbSizeMap[size]
          )}
        />
      </SwitchPrimitive.Root>
    </div>
  );
}
