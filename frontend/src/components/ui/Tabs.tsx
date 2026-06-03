'use client';

import React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface TabItem {
  value:     string;
  label:     string;
  icon?:     React.ReactNode;
  badge?:    number | string;
  disabled?: boolean;
  content:   React.ReactNode;
}

interface TabsProps {
  items:         TabItem[];
  defaultValue?: string;
  value?:        string;
  onValueChange?: (value: string) => void;
  variant?:      'default' | 'pills' | 'underline';
  className?:    string;
  listClassName?: string;
}

export function Tabs({
  items,
  defaultValue,
  value,
  onValueChange,
  variant      = 'default',
  className,
  listClassName,
}: TabsProps) {
  const [activeTab, setActiveTab] = React.useState(value ?? defaultValue ?? items[0]?.value);

  const handleChange = (v: string) => {
    setActiveTab(v);
    onValueChange?.(v);
  };

  const currentValue = value ?? activeTab;

  return (
    <TabsPrimitive.Root
      value={currentValue}
      onValueChange={handleChange}
      className={cn('w-full', className)}
    >
      <TabsPrimitive.List
        className={cn(
          'flex relative',
          variant === 'default' && 'glass rounded-xl p-1 gap-1 w-fit',
          variant === 'pills'   && 'gap-2',
          variant === 'underline' && 'border-b border-white/8 gap-1',
          listClassName
        )}
      >
        {items.map((tab) => (
          <TabsPrimitive.Trigger
            key={tab.value}
            value={tab.value}
            disabled={tab.disabled}
            className={cn(
              'relative flex items-center gap-2 text-sm font-medium transition-all duration-200 outline-none',
              variant === 'default' && [
                'px-4 py-2 rounded-lg z-10',
                'text-slate-500 hover:text-slate-300',
                'data-[state=active]:text-slate-100',
              ],
              variant === 'pills' && [
                'px-4 py-2 rounded-xl z-10',
                'text-slate-500 hover:text-slate-300 hover:bg-white/5',
                'data-[state=active]:bg-primary-600/20 data-[state=active]:text-primary-300',
              ],
              variant === 'underline' && [
                'px-4 py-2.5 z-10',
                'text-slate-500 hover:text-slate-300',
                'data-[state=active]:text-primary-400',
              ],
              tab.disabled && 'opacity-40 cursor-not-allowed'
            )}
          >
            {/* Active background for default */}
            {variant === 'default' && currentValue === tab.value && (
              <motion.div
                layoutId="tabs-active-bg"
                className="absolute inset-0 rounded-lg bg-dark-800 border border-white/8 shadow-sm"
                transition={{ duration: 0.2, ease: 'easeInOut' }}
              />
            )}

            {/* Underline indicator */}
            {variant === 'underline' && currentValue === tab.value && (
              <motion.div
                layoutId="tabs-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-full"
                transition={{ duration: 0.2, ease: 'easeInOut' }}
              />
            )}

            <span className="relative z-10 flex items-center gap-2">
              {tab.icon}
              {tab.label}
              {tab.badge !== undefined && (
                <span className="badge badge-primary text-xs">
                  {tab.badge}
                </span>
              )}
            </span>
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>

      {items.map((tab) => (
        <TabsPrimitive.Content
          key={tab.value}
          value={tab.value}
          className="mt-4 outline-none data-[state=active]:animate-fade-in"
        >
          {tab.content}
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  );
}
