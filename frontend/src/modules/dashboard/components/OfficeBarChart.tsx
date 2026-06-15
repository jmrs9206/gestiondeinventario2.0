"use client";

import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { OfficeCount } from '../services/dashboard.service';

interface OfficeBarChartProps {
  officeCounts: OfficeCount[];
}

export default function OfficeBarChart({ officeCounts }: OfficeBarChartProps) {
  const data = officeCounts.map((item) => ({
    name: item.name,
    Materiales: item.count,
  }));

  const hasData = officeCounts.some((item) => item.count > 0);

  if (officeCounts.length === 0 || !hasData) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 p-6 shadow-sm">
        <p className="text-slate-500 dark:text-zinc-400 text-sm">No hay datos de oficinas para mostrar</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 p-6 shadow-sm flex flex-col h-full">
      <h4 className="text-lg font-semibold text-slate-900 dark:text-zinc-50 mb-4">Materiales por Oficina</h4>
      <div className="flex-1 min-h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#1D4ED8" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: '#F1F5F9', opacity: 0.5 }}
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                color: '#0F172A',
              }}
              itemStyle={{ color: '#0F172A' }}
            />
            <Bar
              dataKey="Materiales"
              fill="url(#barGradient)"
              radius={[4, 4, 0, 0]}
              maxBarSize={50}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
