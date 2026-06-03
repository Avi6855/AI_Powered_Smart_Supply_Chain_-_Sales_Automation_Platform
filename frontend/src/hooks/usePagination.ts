'use client';

import { useState, useCallback, useMemo } from 'react';

interface UsePaginationOptions {
  initialPage?:    number;
  initialPageSize?: number;
  totalElements?:  number;
}

interface UsePaginationReturn {
  page:          number;
  pageSize:      number;
  totalElements: number;
  totalPages:    number;
  isFirstPage:   boolean;
  isLastPage:    boolean;
  offset:        number;

  // Actions
  goToPage:     (page: number) => void;
  nextPage:     () => void;
  prevPage:     () => void;
  setPageSize:  (size: number) => void;
  setTotal:     (total: number) => void;
  reset:        () => void;
}

/**
 * Pagination state management hook.
 * Zero-indexed page internally; exposed page is 0-indexed for API compatibility.
 */
export function usePagination({
  initialPage     = 0,
  initialPageSize = 10,
  totalElements   = 0,
}: UsePaginationOptions = {}): UsePaginationReturn {
  const [page,    setPage]    = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [total,   setTotal]   = useState(totalElements);

  const totalPages  = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);
  const isFirstPage = page === 0;
  const isLastPage  = page >= totalPages - 1;
  const offset      = page * pageSize;

  const goToPage = useCallback(
    (newPage: number) => {
      const clamped = Math.max(0, Math.min(newPage, totalPages - 1));
      setPage(clamped);
    },
    [totalPages]
  );

  const nextPage = useCallback(() => {
    if (!isLastPage) setPage((p) => p + 1);
  }, [isLastPage]);

  const prevPage = useCallback(() => {
    if (!isFirstPage) setPage((p) => p - 1);
  }, [isFirstPage]);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setPage(0); // reset to first page when page size changes
  }, []);

  const reset = useCallback(() => {
    setPage(initialPage);
    setPageSizeState(initialPageSize);
  }, [initialPage, initialPageSize]);

  return {
    page,
    pageSize,
    totalElements: total,
    totalPages,
    isFirstPage,
    isLastPage,
    offset,

    goToPage,
    nextPage,
    prevPage,
    setPageSize,
    setTotal,
    reset,
  };
}
