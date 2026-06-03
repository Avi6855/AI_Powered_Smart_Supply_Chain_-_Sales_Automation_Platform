'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'line' | 'circle' | 'rect';
  width?:   string;
  height?:  string;
}

export function Skeleton({
  className,
  variant = 'rect',
  width,
  height,
  style,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'shimmer rounded-lg',
        variant === 'circle' && 'rounded-full',
        variant === 'line'   && 'rounded-md',
        className
      )}
      style={{ width, height, ...style }}
      {...props}
    />
  );
}

// ── Card Skeleton ─────────────────────────────────────────────────────────────
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('card-dark p-5 space-y-4', className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton variant="circle" className="w-8 h-8" />
      </div>
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

// ── Table Row Skeleton ────────────────────────────────────────────────────────
export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

// ── Chart Skeleton ────────────────────────────────────────────────────────────
export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-end gap-2 h-40 px-4', className)}>
      {[60, 80, 45, 90, 70, 55, 85, 75, 65, 95, 50, 88].map((h, i) => (
        <Skeleton
          key={i}
          className="flex-1"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}

// ── KPI Card Skeleton ─────────────────────────────────────────────────────────
export function KpiSkeleton() {
  return (
    <div className="card-dark p-5 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="w-10 h-10 rounded-xl" />
      </div>
      <Skeleton className="h-8 w-32" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

// ── List Item Skeleton ────────────────────────────────────────────────────────
export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3">
      <Skeleton variant="circle" className="w-10 h-10 shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
  );
}
