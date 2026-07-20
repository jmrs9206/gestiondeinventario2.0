"use client";

import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface OfficeCostBarChartProps {
  officeCosts: Record<string, number>;
}

export default function OfficeCostBarChart({ officeCosts }: OfficeCostBarChartProps) {
  if (!officeCosts) return null;

  const data = Object.entries(officeCosts).map(([name, cost]) => ({
    name,
    Coste: cost,
  }));

  const hasData = Object.values(officeCosts).some((cost) => cost > 0);

  if (data.length === 0 || !hasData) {
    return (
      <div className="flex h-64 items-center justify-center glass-card rounded-2xl p-6 shadow-sm">
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">No hay datos de costes para mostrar</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 shadow-sm flex flex-col h-full hover-lift">
      <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-4 font-display">Inversión por Sede (€)</h4>
      <div className="flex-1 min-h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="costBarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#1e3a8a" stopOpacity={0.15} />
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
              tickFormatter={(value) => `${value}€`}
            />
            <Tooltip
              cursor={{ fill: 'rgba(59, 130, 246, 0.03)', opacity: 0.5 }}
              formatter={(value: any) => [`${Number(value).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`, 'Inversión']}
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
              dataKey="Coste"
              fill="url(#costBarGradient)"
              radius={[6, 6, 0, 0]}
              maxBarSize={50}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
