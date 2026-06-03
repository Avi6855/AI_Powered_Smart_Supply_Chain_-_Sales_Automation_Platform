'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'badge',
  {
    variants: {
      variant: {
        primary:   'badge-primary',
        secondary: 'badge-secondary',
        success:   'badge-success',
        danger:    'badge-danger',
        warning:   'badge-warning',
        gray:      'badge-gray',
        accent:    'bg-accent-500/20 text-accent-400 border border-accent-500/30',
      },
      size: {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-xs px-2.5 py-0.5',
        lg: 'text-sm px-3 py-1',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size:    'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?:  boolean;
  icon?: React.ReactNode;
}

export function Badge({
  className,
  variant,
  size,
  dot   = false,
  icon,
  children,
  ...props
}: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            variant === 'success'   && 'bg-success-400',
            variant === 'danger'    && 'bg-danger-400',
            variant === 'warning'   && 'bg-warning-400',
            variant === 'primary'   && 'bg-primary-400',
            variant === 'secondary' && 'bg-secondary-400',
            variant === 'gray'      && 'bg-slate-400',
          )}
        />
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
}

// ── Status Badge convenience ──────────────────────────────────────────────────
const STATUS_VARIANT_MAP: Record<string, 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'gray'> = {
  PENDING:          'warning',
  PROCESSING:       'secondary',
  SHIPPED:          'primary',
  DELIVERED:        'success',
  CANCELLED:        'danger',
  RETURNED:         'gray',
  IN_TRANSIT:       'secondary',
  OUT_FOR_DELIVERY: 'primary',
  DELAYED:          'danger',
  IN_STOCK:         'success',
  LOW_STOCK:        'warning',
  OUT_OF_STOCK:     'danger',
  ACTIVE:           'success',
  INACTIVE:         'gray',
  SUSPENDED:        'danger',
  APPROVED:         'success',
  REJECTED:         'danger',
  DRAFT:            'gray',
  COMPLETED:        'success',
  FAILED:           'danger',
  PAID:             'success',
  UNPAID:           'danger',
};

interface StatusBadgeProps {
  status:    string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant = STATUS_VARIANT_MAP[status?.toUpperCase()] ?? 'gray';
  const label   = status?.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <Badge variant={variant} dot className={className}>
      {label}
    </Badge>
  );
}
