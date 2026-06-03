'use client';

import React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn, getInitials, stringToColor } from '@/lib/utils';

interface AvatarProps {
  src?:       string;
  name?:      string;
  size?:      'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  online?:    boolean;
}

const sizeMap: Record<string, string> = {
  xs:  'w-6 h-6 text-xs',
  sm:  'w-8 h-8 text-xs',
  md:  'w-10 h-10 text-sm',
  lg:  'w-12 h-12 text-base',
  xl:  'w-16 h-16 text-lg',
  '2xl':'w-20 h-20 text-xl',
};

const dotSizeMap: Record<string, string> = {
  xs:  'w-1.5 h-1.5',
  sm:  'w-2 h-2',
  md:  'w-2.5 h-2.5',
  lg:  'w-3 h-3',
  xl:  'w-3.5 h-3.5',
  '2xl':'w-4 h-4',
};

export function Avatar({
  src,
  name = '',
  size = 'md',
  className,
  online,
}: AvatarProps) {
  const initials    = getInitials(name);
  const bgColor     = stringToColor(name);
  const sizeClass   = sizeMap[size];
  const dotClass    = dotSizeMap[size];

  return (
    <div className="relative inline-flex">
      <AvatarPrimitive.Root
        className={cn(
          'relative inline-flex shrink-0 rounded-full overflow-hidden',
          sizeClass,
          className
        )}
      >
        <AvatarPrimitive.Image
          src={src}
          alt={name}
          className="aspect-square w-full h-full object-cover"
        />
        <AvatarPrimitive.Fallback
          className="flex items-center justify-center w-full h-full font-bold text-white"
          style={{ backgroundColor: bgColor }}
        >
          {initials || '?'}
        </AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>

      {/* Online indicator */}
      {online !== undefined && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-dark-900',
            dotClass,
            online ? 'bg-success-400' : 'bg-slate-500'
          )}
        />
      )}
    </div>
  );
}

// ── Avatar Group ──────────────────────────────────────────────────────────────
interface AvatarGroupProps {
  items:    Array<{ src?: string; name: string }>;
  max?:     number;
  size?:    AvatarProps['size'];
}

export function AvatarGroup({ items, max = 4, size = 'sm' }: AvatarGroupProps) {
  const visible   = items.slice(0, max);
  const remainder = items.length - max;

  return (
    <div className="flex -space-x-2">
      {visible.map((item, i) => (
        <div key={i} className="ring-2 ring-dark-900 rounded-full">
          <Avatar src={item.src} name={item.name} size={size} />
        </div>
      ))}
      {remainder > 0 && (
        <div
          className={cn(
            'ring-2 ring-dark-900 rounded-full flex items-center justify-center bg-dark-700 text-slate-300 font-semibold',
            sizeMap[size]
          )}
        >
          +{remainder}
        </div>
      )}
    </div>
  );
}
