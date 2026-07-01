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
  colorClassName = 'from-zinc-500 to-zinc-700 dark:from-zinc-600 dark:to-zinc-800',
}: KpiCardProps) {
  return (
    <div className="relative overflow-hidden glass-card rounded-2xl p-6 hover-lift">
      {/* Decorative Gradient Background Blur */}
      <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${colorClassName} opacity-10 blur-xl`} />

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-display">{title}</p>
          <h3 className="mt-2 text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight font-display">{value}</h3>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${colorClassName} text-white shadow-sm border border-white/10`}>
          {icon}
        </div>
      </div>

      {(description || trend) && (
        <div className="mt-4 flex items-center gap-2 text-xs">
          {trend && (
            <span className={`font-semibold ${trend.isPositive ? 'text-zinc-650' : 'text-zinc-500'}`}>
              {trend.value}
            </span>
          )}
          {description && <span className="text-zinc-500 dark:text-zinc-450 font-medium">{description}</span>}
        </div>
      )}
    </div>
  );
}
