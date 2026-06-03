'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?:       string;
  error?:       string;
  hint?:        string;
  leftIcon?:    React.ReactNode;
  rightIcon?:   React.ReactNode;
  onRightIconClick?: () => void;
  containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      onRightIconClick,
      containerClassName,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={cn('flex flex-col gap-1.5', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-slate-300 uppercase tracking-wide"
          >
            {label}
            {props.required && <span className="text-danger-400 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              'input-dark',
              leftIcon  && 'pl-10',
              rightIcon && 'pr-10',
              error     && 'border-danger-500/50 focus:border-danger-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]',
              className
            )}
            {...props}
          />

          {rightIcon && (
            <button
              type="button"
              onClick={onRightIconClick}
              className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors',
                onRightIconClick && 'hover:text-slate-300 cursor-pointer',
                !onRightIconClick && 'pointer-events-none'
              )}
            >
              {rightIcon}
            </button>
          )}
        </div>

        {error && (
          <p className="text-xs text-danger-400 flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}

        {hint && !error && (
          <p className="text-xs text-slate-500">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// ── Textarea ─────────────────────────────────────────────────────────────────
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?:  string;
  error?:  string;
  hint?:   string;
  containerClassName?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, containerClassName, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className={cn('flex flex-col gap-1.5', containerClassName)}>
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
            {label}
            {props.required && <span className="text-danger-400 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          rows={3}
          className={cn(
            'input-dark resize-none',
            error && 'border-danger-500/50',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-danger-400">⚠ {error}</p>}
        {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
