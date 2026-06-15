import React from 'react';
import { MaterialHistoryResponse } from '../services/dashboard.service';

interface RecentMovementsTableProps {
  movements: MaterialHistoryResponse[];
}

const ACTION_LABELS: Record<string, { text: string; bg: string; textCol: string }> = {
  MATERIAL_CREATED: { text: 'Creado', bg: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-950/50', textCol: '' },
  MATERIAL_UPDATED: { text: 'Editado', bg: 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-950/50', textCol: '' },
  STATUS_CHANGED: { text: 'Cambio Estado', bg: 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-950/50', textCol: '' },
  OFFICE_CHANGED: { text: 'Cambio Oficina', bg: 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-950/50', textCol: '' },
  STATUS_AND_OFFICE_CHANGED: { text: 'Cambio Estado/Ofic', bg: 'bg-violet-50 dark:bg-violet-950/20 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-950/50', textCol: '' },
  MATERIAL_DECOMMISSIONED: { text: 'Dado de Baja', bg: 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-950/50', textCol: '' },
  QR_GENERATED: { text: 'QR Generado', bg: 'bg-slate-50 dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700', textCol: '' },
};

export default function RecentMovementsTable({ movements }: RecentMovementsTableProps) {
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const getActionBadge = (action: string) => {
    const meta = ACTION_LABELS[action] || { text: action, bg: 'bg-slate-50 dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700', textCol: '' };
    return (
      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${meta.bg} ${meta.textCol}`}>
        {meta.text}
      </span>
    );
  };

  if (movements.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-2xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 p-6 shadow-sm">
        <p className="text-slate-700 dark:text-zinc-300 text-sm">No hay movimientos recientes registrados</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <h4 className="text-lg font-semibold text-slate-900 dark:text-zinc-50">Últimos Movimientos</h4>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Historial de las acciones más recientes sobre los materiales del inventario</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 font-medium">
              <th className="p-4">Material (Código)</th>
              <th className="p-4">Acción</th>
              <th className="p-4">Cambios</th>
              <th className="p-4">Comentario</th>
              <th className="p-4">Realizado por</th>
              <th className="p-4">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-700 text-slate-700 dark:text-zinc-200">
            {movements.map((move) => {
              const hasStatusChange = move.previousStatus !== move.newStatus && move.newStatus;
              const hasOfficeChange = move.previousOfficeName !== move.newOfficeName && move.newOfficeName;

              return (
                <tr key={move.id} className="hover:bg-slate-50 dark:hover:bg-zinc-700/40 dark:bg-zinc-900 transition-colors duration-150">
                  <td className="p-4 font-mono text-xs text-blue-600 font-semibold">{move.materialPublicCode}</td>
                  <td className="p-4">{getActionBadge(move.action)}</td>
                  <td className="p-4 text-xs">
                    {hasStatusChange && (
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500 dark:text-zinc-400">{move.previousStatus || 'Ninguno'}</span>
                        <span className="text-slate-500 dark:text-zinc-400">→</span>
                        <span className="font-bold text-slate-800 dark:text-zinc-100">{move.newStatus}</span>
                      </div>
                    )}
                    {hasOfficeChange && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-slate-500 dark:text-zinc-400 text-[10px]">{move.previousOfficeName || 'Origen'}</span>
                        <span className="text-slate-500 dark:text-zinc-400">→</span>
                        <span className="font-bold text-slate-800 dark:text-zinc-100 text-[10px]">{move.newOfficeName}</span>
                      </div>
                    )}
                    {!hasStatusChange && !hasOfficeChange && (
                      <span className="text-slate-500 dark:text-zinc-400">—</span>
                    )}
                  </td>
                  <td className="p-4 text-slate-500 dark:text-zinc-400 truncate max-w-[200px]" title={move.comment || ''}>
                    {move.comment || <span className="text-slate-500 dark:text-zinc-400 italic text-xs">Sin comentario</span>}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-slate-800 dark:text-zinc-100 font-semibold">{move.performedByUserFullName || 'Sistema'}</span>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">{move.performedByUserEmail || ''}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-zinc-300 whitespace-nowrap">{formatDate(move.createdAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
