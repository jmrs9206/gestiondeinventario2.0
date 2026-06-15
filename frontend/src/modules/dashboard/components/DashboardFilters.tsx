"use client";

import React from 'react';

interface DashboardFiltersProps {
  selectedOffice: string;
  onOfficeChange: (office: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  offices: string[];
}

export default function DashboardFilters({
  selectedOffice,
  onOfficeChange,
  selectedStatus,
  onStatusChange,
  offices,
}: DashboardFiltersProps) {
  return (
    <div className="rounded-2xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h4 className="text-md font-semibold text-slate-900 dark:text-zinc-50">Filtros de Inventario</h4>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Filtra los resultados mostrados a continuación</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {/* Office Filter */}
        <div className="flex flex-col gap-1 min-w-[160px]">
          <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400 tracking-wider">Oficina</label>
          <select
            value={selectedOffice}
            onChange={(e) => onOfficeChange(e.target.value)}
            className="rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-3 py-2 text-xs text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
          >
            <option value="">Todas las oficinas</option>
            {offices.map((office) => (
              <option key={office} value={office}>
                {office}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex flex-col gap-1 min-w-[140px]">
          <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400 tracking-wider">Estado</label>
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-3 py-2 text-xs text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
          >
            <option value="">Todos los estados</option>
            <option value="OPERATIVO">Operativo</option>
            <option value="ROTO">Roto</option>
            <option value="EN_REPARACION">En reparación</option>
            <option value="BAJA">De baja</option>
          </select>
        </div>
      </div>
    </div>
  );
}
