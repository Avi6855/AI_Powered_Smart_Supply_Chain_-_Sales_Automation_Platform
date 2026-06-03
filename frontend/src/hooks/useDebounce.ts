'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * Returns a debounced version of `value` that only updates after `delay` ms
 * of inactivity. Useful for search inputs to avoid API call on every keystroke.
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default 400)
 */
export function useDebounce<T>(value: T, delay: number = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value, delay]);

  return debouncedValue;
}
