"use client";

import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface StatusPieChartProps {
  statusCounts: Record<string, number>;
}

const COLORS: Record<string, string> = {
  OPERATIVO: '#10B981', // Emerald green
  ROTO: '#EF4444',      // Rose red
  EN_REPARACION: '#F59E0B', // Amber orange
  BAJA: '#64748B',      // Slate gray
};

const STATUS_LABELS: Record<string, string> = {
  OPERATIVO: 'Operativo',
  ROTO: 'Roto',
  EN_REPARACION: 'En reparación',
  BAJA: 'De baja / Retirado',
};

export default function StatusPieChart({ statusCounts }: StatusPieChartProps) {
  const data = Object.entries(statusCounts)
    .map(([key, value]) => ({
      name: STATUS_LABELS[key] || key,
      value,
      statusKey: key,
    }))
    .filter((item) => item.value > 0);

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 p-6 shadow-sm">
        <p className="text-slate-500 dark:text-zinc-400 text-sm">No hay datos de estados para mostrar</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 p-6 shadow-sm flex flex-col h-full">
      <h4 className="text-lg font-semibold text-slate-900 dark:text-zinc-50 mb-4">Distribución por Estado</h4>
      <div className="flex-1 min-h-[260px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.statusKey] || '#3B82F6'} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                color: '#0F172A',
              }}
              itemStyle={{ color: '#0F172A' }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              iconSize={8}
              formatter={(value) => <span className="text-slate-600 dark:text-zinc-300 text-xs font-semibold">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
