'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';

const SALES_DATA = [
  { month: 'Jan', sales: 145000, target: 130000 },
  { month: 'Feb', sales: 162000, target: 145000 },
  { month: 'Mar', sales: 138000, target: 155000 },
  { month: 'Apr', sales: 175000, target: 160000 },
  { month: 'May', sales: 192000, target: 170000 },
  { month: 'Jun', sales: 168000, target: 175000 },
  { month: 'Jul', sales: 185000, target: 180000 },
  { month: 'Aug', sales: 205000, target: 185000 },
  { month: 'Sep', sales: 198000, target: 190000 },
  { month: 'Oct', sales: 220000, target: 200000 },
  { month: 'Nov', sales: 242000, target: 210000 },
  { month: 'Dec', sales: 265000, target: 230000 },
];

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="tooltip-dark">
      <p className="font-semibold text-slate-100 mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <span className="capitalize text-slate-400">{entry.name}</span>
          </div>
          <span className="font-semibold text-slate-100">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

export function SalesChart() {
  return (
    <Card animate delay={0.1}>
      <CardHeader
        title="Sales vs Target"
        subtitle="Monthly sales performance against targets"
      />
      <CardContent>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={SALES_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#64748b', paddingTop: '8px' }} />
              <Bar dataKey="target" name="target" fill="rgba(100,116,139,0.3)" radius={[3,3,0,0]} maxBarSize={20} />
              <Bar dataKey="sales"  name="sales"  radius={[3,3,0,0]} maxBarSize={20}>
                {SALES_DATA.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.sales >= entry.target ? '#10b981' : '#8b5cf6'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
