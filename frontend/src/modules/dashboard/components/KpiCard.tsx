import React from 'react';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  colorClassName?: string;
}

export default function KpiCard({
  title,
  value,
  icon,
  description,
  trend,
  colorClassName = 'from-blue-600 to-indigo-600',
}: KpiCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 p-6 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md hover:border-slate-300">
      {/* Decorative Gradient Background Blur */}
      <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${colorClassName} opacity-5 blur-xl`} />

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">{title}</p>
          <h3 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-zinc-50 tracking-tight">{value}</h3>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${colorClassName} text-white shadow-sm`}>
          {icon}
        </div>
      </div>

      {(description || trend) && (
        <div className="mt-4 flex items-center gap-2 text-xs">
          {trend && (
            <span className={`font-semibold ${trend.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
              {trend.value}
            </span>
          )}
          {description && <span className="text-slate-500 dark:text-zinc-400 font-medium">{description}</span>}
        </div>
      )}
    </div>
  );
}
