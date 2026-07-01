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
      <div className="flex h-64 items-center justify-center glass-card rounded-2xl p-6 shadow-sm">
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">No hay datos de oficinas para mostrar</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 shadow-sm flex flex-col h-full hover-lift">
      <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-4 font-display">Materiales por Oficina</h4>
      <div className="flex-1 min-h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#71717a" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#27272a" stopOpacity={0.15} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(228, 228, 231, 0.5)" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(120, 120, 120, 0.05)', opacity: 0.5 }}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid #e4e4e7',
                borderRadius: '12px',
                color: '#18181b',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
              }}
              itemStyle={{ color: '#18181b', fontSize: '12px', fontWeight: '600' }}
            />
            <Bar
              dataKey="Materiales"
              fill="url(#barGradient)"
              radius={[6, 6, 0, 0]}
              maxBarSize={50}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
