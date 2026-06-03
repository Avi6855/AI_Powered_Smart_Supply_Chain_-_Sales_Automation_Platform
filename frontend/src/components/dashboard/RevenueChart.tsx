'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { motion } from 'framer-motion';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

// ── Mock data ─────────────────────────────────────────────────────────────────
const generateData = (period: string) => {
  const now = new Date();
  const points = period === 'weekly' ? 7 : period === 'monthly' ? 30 : 12;
  return Array.from({ length: points }, (_, i) => {
    const base = 80000 + Math.random() * 40000;
    return {
      date:    period === 'yearly'
        ? new Date(now.getFullYear(), i, 1).toISOString()
        : new Date(now.getTime() - (points - i - 1) * 24 * 60 * 60 * 1000).toISOString(),
      revenue: Math.round(base),
      profit:  Math.round(base * 0.3 + Math.random() * 10000),
      orders:  Math.round(20 + Math.random() * 60),
    };
  });
};

type Period = 'weekly' | 'monthly' | 'yearly';

// ── Custom Tooltip ────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="tooltip-dark">
      <p className="font-semibold text-slate-100 mb-2">
        {formatDate(label ?? '')}
      </p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <span className="capitalize text-slate-400">{entry.name}</span>
          </div>
          <span className="font-semibold text-slate-100">
            {entry.name === 'orders'
              ? entry.value.toLocaleString()
              : formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── RevenueChart Component ────────────────────────────────────────────────────
export function RevenueChart() {
  const [period, setPeriod] = useState<Period>('monthly');
  const data = React.useMemo(() => generateData(period), [period]);

  const periods: Period[] = ['weekly', 'monthly', 'yearly'];

  return (
    <Card animate className="h-full">
      <CardHeader
        title="Revenue Overview"
        subtitle="Track revenue and profit trends over time"
        action={
          <div className="flex gap-1">
            {periods.map((p) => (
              <Button
                key={p}
                variant={period === p ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPeriod(p)}
                className="capitalize text-xs"
              >
                {p}
              </Button>
            ))}
          </div>
        }
      />
      <CardContent>
        <motion.div
          key={period}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="h-64"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}   />
                </linearGradient>
                <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}   />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tickFormatter={(v) => formatDate(v)}
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => `$${formatCurrency(v).replace('$', '').replace(',000', 'K').split('.')[0]}`}
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '12px', color: '#64748b', paddingTop: '12px' }}
              />

              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#8b5cf6"
                strokeWidth={2.5}
                fill="url(#revenueGrad)"
                dot={false}
                activeDot={{ r: 5, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="profit"
                stroke="#06b6d4"
                strokeWidth={2}
                fill="url(#profitGrad)"
                dot={false}
                activeDot={{ r: 4, fill: '#06b6d4', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </CardContent>
    </Card>
  );
}
