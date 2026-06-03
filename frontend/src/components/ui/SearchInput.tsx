'use client';

import React, { useRef, useCallback } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value:         string;
  onChange:      (value: string) => void;
  placeholder?:  string;
  isLoading?:    boolean;
  className?:    string;
  debounce?:     boolean;
  autoFocus?:    boolean;
  onKeyDown?:    (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  isLoading   = false,
  className,
  autoFocus   = false,
  onKeyDown,
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = useCallback(() => {
    onChange('');
    inputRef.current?.focus();
  }, [onChange]);

  return (
    <div className={cn('relative', className)}>
      {/* Left icon */}
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
        {isLoading
          ? <Loader2 size={16} className="animate-spin" />
          : <Search  size={16} />
        }
      </span>

      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="input-dark pl-10 pr-9"
      />

      {/* Clear button */}
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
