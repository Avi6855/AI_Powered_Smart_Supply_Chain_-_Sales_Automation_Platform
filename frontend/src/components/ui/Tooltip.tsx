'use client';

import React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';

interface TooltipProps {
  content:   React.ReactNode;
  children:  React.ReactNode;
  side?:     'top' | 'right' | 'bottom' | 'left';
  align?:    'start' | 'center' | 'end';
  delay?:    number;
  className?: string;
  disabled?:  boolean;
}

export function Tooltip({
  content,
  children,
  side      = 'top',
  align     = 'center',
  delay     = 400,
  className,
  disabled  = false,
}: TooltipProps) {
  if (disabled) return <>{children}</>;

  return (
    <TooltipPrimitive.Provider delayDuration={delay}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          {children}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            align={align}
            sideOffset={6}
            className={cn(
              'tooltip-dark z-[9999] max-w-xs',
              'data-[state=delayed-open]:animate-fade-in',
              'data-[state=closed]:opacity-0',
              className
            )}
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-dark-800" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
