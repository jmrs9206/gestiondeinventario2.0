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
      <div className="flex h-64 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 p-6">
        <p className="text-slate-400 text-sm">No hay datos de oficinas para mostrar</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl flex flex-col h-full">
      <h4 className="text-lg font-semibold text-white mb-4">Materiales por Oficina</h4>
      <div className="flex-1 min-h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#1D4ED8" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
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
              cursor={{ fill: '#1E293B', opacity: 0.2 }}
              contentStyle={{
                backgroundColor: '#0F172A',
                border: '1px solid #1E293B',
                borderRadius: '8px',
                color: '#F8FAFC',
              }}
              itemStyle={{ color: '#F8FAFC' }}
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
