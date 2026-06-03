'use client';

import React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  label:    string;
  value:    string;
  disabled?: boolean;
}

interface SelectProps {
  label?:       string;
  options:      SelectOption[];
  value?:       string;
  onChange?:    (value: string) => void;
  placeholder?: string;
  error?:       string;
  disabled?:    boolean;
  className?:   string;
  containerClassName?: string;
}

export function Select({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  error,
  disabled    = false,
  className,
  containerClassName,
}: SelectProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
          {label}
        </label>
      )}

      <SelectPrimitive.Root value={value} onValueChange={onChange} disabled={disabled}>
        <SelectPrimitive.Trigger
          className={cn(
            'input-dark flex items-center justify-between text-left cursor-pointer',
            !value && 'text-slate-500',
            error  && 'border-danger-500/50',
            className
          )}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon>
            <ChevronDown size={16} className="text-slate-500 shrink-0" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            className={cn(
              'relative z-[9999] min-w-[180px] max-h-60 overflow-y-auto',
              'glass-card rounded-xl border border-white/10 shadow-glass py-1.5',
              'data-[state=open]:animate-fade-in'
            )}
            position="popper"
            sideOffset={4}
          >
            <SelectPrimitive.Viewport>
              {options.map((opt) => (
                <SelectPrimitive.Item
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                  className={cn(
                    'flex items-center justify-between px-3 py-2 text-sm text-slate-300 cursor-pointer outline-none',
                    'hover:bg-white/5 hover:text-slate-100 transition-colors',
                    'data-[highlighted]:bg-white/5 data-[highlighted]:text-slate-100',
                    'data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed'
                  )}
                >
                  <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator>
                    <Check size={14} className="text-primary-400" />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>

      {error && <p className="text-xs text-danger-400">⚠ {error}</p>}
    </div>
  );
}
