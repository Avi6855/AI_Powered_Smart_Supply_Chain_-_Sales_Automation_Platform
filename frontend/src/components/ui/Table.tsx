'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from './Skeleton';

// ── Column Definition ─────────────────────────────────────────────────────────
export interface Column<T> {
  key:       keyof T | string;
  header:    string;
  render?:   (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?:    string;
  align?:    'left' | 'center' | 'right';
  className?: string;
}

// ── Table Props ───────────────────────────────────────────────────────────────
interface TableProps<T> {
  data:           T[];
  columns:        Column<T>[];
  isLoading?:     boolean;
  emptyMessage?:  string;
  emptyIcon?:     React.ReactNode;
  keyField?:      keyof T;
  onRowClick?:    (row: T) => void;
  rowClassName?:  (row: T) => string;

  // Sorting
  sortBy?:        string;
  sortDir?:       'asc' | 'desc';
  onSort?:        (key: string, dir: 'asc' | 'desc') => void;

  // Pagination
  page?:          number;
  pageSize?:      number;
  totalElements?: number;
  onPageChange?:  (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];

  className?: string;
}

type SortDir = 'asc' | 'desc';

export function Table<T extends Record<string, unknown>>({
  data,
  columns,
  isLoading       = false,
  emptyMessage    = 'No records found.',
  emptyIcon,
  keyField        = 'id' as keyof T,
  onRowClick,
  rowClassName,
  sortBy,
  sortDir,
  onSort,
  page            = 0,
  pageSize        = 10,
  totalElements   = 0,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  className,
}: TableProps<T>) {
  // Internal sort state (for uncontrolled mode)
  const [internalSort, setInternalSort] = useState<{ key: string; dir: SortDir } | null>(null);

  const activeSort = sortBy ? { key: sortBy, dir: sortDir ?? 'asc' } : internalSort;

  const handleSort = useCallback(
    (key: string) => {
      const newDir: SortDir =
        activeSort?.key === key && activeSort.dir === 'asc' ? 'desc' : 'asc';
      if (onSort) {
        onSort(key, newDir);
      } else {
        setInternalSort({ key, dir: newDir });
      }
    },
    [activeSort, onSort]
  );

  const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));

  const getCellValue = (row: T, key: string): unknown => {
    return key.split('.').reduce<unknown>((obj, k) => {
      return (obj as Record<string, unknown>)?.[k];
    }, row);
  };

  return (
    <div className={cn('flex flex-col', className)}>
      {/* ── Table ─────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="table-dark">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  style={{ width: col.width }}
                  className={cn(
                    col.align === 'center' && 'text-center',
                    col.align === 'right'  && 'text-right',
                    col.sortable && 'cursor-pointer select-none hover:text-slate-300 transition-colors',
                    col.className
                  )}
                  onClick={() => col.sortable && handleSort(String(col.key))}
                >
                  <div
                    className={cn(
                      'flex items-center gap-1',
                      col.align === 'center' && 'justify-center',
                      col.align === 'right'  && 'justify-end',
                    )}
                  >
                    {col.header}
                    {col.sortable && (
                      <span className="flex flex-col">
                        <ChevronUp
                          size={10}
                          className={cn(
                            activeSort?.key === String(col.key) && activeSort.dir === 'asc'
                              ? 'text-primary-400'
                              : 'text-slate-600'
                          )}
                        />
                        <ChevronDown
                          size={10}
                          className={cn(
                            '-mt-1',
                            activeSort?.key === String(col.key) && activeSort.dir === 'desc'
                              ? 'text-primary-400'
                              : 'text-slate-600'
                          )}
                        />
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              Array.from({ length: pageSize > 5 ? 5 : pageSize }).map((_, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={String(col.key)}>
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="!text-center py-16">
                  <div className="flex flex-col items-center gap-3 text-slate-500">
                    {emptyIcon && <div className="text-4xl opacity-30">{emptyIcon}</div>}
                    <p className="text-sm">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              <AnimatePresence mode="wait">
                {data.map((row, index) => (
                  <motion.tr
                    key={String((row[keyField] as string | number) ?? index)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15, delay: index * 0.03 }}
                    onClick={() => onRowClick?.(row)}
                    className={cn(
                      onRowClick && 'cursor-pointer',
                      rowClassName?.(row)
                    )}
                  >
                    {columns.map((col) => (
                      <td
                        key={String(col.key)}
                        className={cn(
                          col.align === 'center' && '!text-center',
                          col.align === 'right'  && '!text-right',
                          col.className
                        )}
                      >
                        {col.render
                          ? col.render(row, index)
                          : String(getCellValue(row, String(col.key)) ?? '-')
                        }
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ─────────────────────────────────────────────────── */}
      {totalElements > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/6 mt-auto">
          {/* Page size selector */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
              className="bg-dark-800 border border-white/10 rounded-lg px-2 py-1 text-slate-300 text-xs outline-none"
            >
              {pageSizeOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <span>
              {page * pageSize + 1}–{Math.min((page + 1) * pageSize, totalElements)} of {totalElements}
            </span>
          </div>

          {/* Page navigation */}
          <div className="flex items-center gap-1">
            <PageBtn onClick={() => onPageChange?.(0)}           disabled={page === 0}><ChevronsLeft  size={14} /></PageBtn>
            <PageBtn onClick={() => onPageChange?.(page - 1)}    disabled={page === 0}><ChevronLeft   size={14} /></PageBtn>
            <span className="text-xs text-slate-400 px-2">
              {page + 1} / {totalPages}
            </span>
            <PageBtn onClick={() => onPageChange?.(page + 1)}    disabled={page >= totalPages - 1}><ChevronRight  size={14} /></PageBtn>
            <PageBtn onClick={() => onPageChange?.(totalPages - 1)} disabled={page >= totalPages - 1}><ChevronsRight size={14} /></PageBtn>
          </div>
        </div>
      )}
    </div>
  );
}

function PageBtn({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled: boolean;
  onClick:  () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs"
    >
      {children}
    </button>
  );
}
