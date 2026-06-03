'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { cn, formatCurrency, formatNumber, formatPercent } from '@/lib/utils';

interface KPICardProps {
  title:       string;
  value:       number | string;
  change?:     number;
  changeLabel?: string;
  icon:        React.ReactNode;
  iconBg?:     string;
  format?:     'currency' | 'number' | 'percent' | 'raw';
  currency?:   string;
  sparkData?:  Array<{ value: number }>;
  sparkColor?: string;
  delay?:      number;
  unit?:       string;
}

export function KPICard({
  title,
  value,
  change,
  changeLabel = 'vs last month',
  icon,
  iconBg      = 'from-primary-600 to-primary-400',
  format      = 'number',
  currency    = 'USD',
  sparkData,
  sparkColor  = '#8b5cf6',
  delay       = 0,
  unit,
}: KPICardProps) {
  // Format the display value
  const displayValue = (() => {
    if (typeof value === 'string') return value;
    switch (format) {
      case 'currency': return formatCurrency(value, currency);
      case 'percent':  return `${value}%`;
      case 'number':   return formatNumber(value);
      default:         return String(value);
    }
  })();

  const isPositive  = (change ?? 0) > 0;
  const isNeutral   = change === 0 || change === undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      className="card-dark p-5 card-hover relative overflow-hidden"
    >
      {/* Background glow */}
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-20"
        style={{ background: sparkColor }}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-4 relative">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
          {title}
        </p>
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br shrink-0',
            iconBg
          )}
          style={{ boxShadow: `0 4px 15px ${sparkColor}40` }}
        >
          <span className="text-white">{icon}</span>
        </div>
      </div>

      {/* Value */}
      <div className="mb-2 relative">
        <p className="text-2xl font-bold font-outfit text-slate-100 leading-tight">
          {displayValue}
          {unit && <span className="text-base font-normal text-slate-400 ml-1">{unit}</span>}
        </p>
      </div>

      {/* Change Indicator */}
      {change !== undefined && (
        <div className="flex items-center gap-1.5 mb-3">
          <span
            className={cn(
              'flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md',
              isNeutral   && 'text-slate-400 bg-slate-500/10',
              isPositive  && 'text-success-400 bg-success-500/10',
              !isPositive && !isNeutral && 'text-danger-400 bg-danger-500/10'
            )}
          >
            {isNeutral   ? <Minus size={10} />
             : isPositive ? <TrendingUp size={10} />
             : <TrendingDown size={10} />}
            {formatPercent(Math.abs(change))}
          </span>
          <span className="text-xs text-slate-500">{changeLabel}</span>
        </div>
      )}

      {/* Sparkline */}
      {sparkData && sparkData.length > 0 && (
        <div className="h-12 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData}>
              <defs>
                <linearGradient id={`spark-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={sparkColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={sparkColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={sparkColor}
                strokeWidth={2}
                fill={`url(#spark-${title})`}
                dot={false}
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}
