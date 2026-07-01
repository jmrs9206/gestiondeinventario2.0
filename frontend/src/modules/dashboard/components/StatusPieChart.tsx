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
      <div className="flex h-64 items-center justify-center glass-card rounded-2xl p-6 shadow-sm">
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">No hay datos de estados para mostrar</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 shadow-sm flex flex-col h-full hover-lift">
      <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-4 font-display">Distribución por Estado</h4>
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
                <Cell key={`cell-${index}`} fill={COLORS[entry.statusKey] || '#71717a'} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid #e4e4e7',
                borderRadius: '12px',
                color: '#18181b',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
              }}
              itemStyle={{ color: '#18181b', fontSize: '12px', fontWeight: '600' }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              iconSize={8}
              formatter={(value) => <span className="text-zinc-600 dark:text-zinc-300 text-xs font-semibold">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
