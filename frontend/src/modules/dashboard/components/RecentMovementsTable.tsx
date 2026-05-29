import React from 'react';
import { MaterialHistoryResponse } from '../services/dashboard.service';

interface RecentMovementsTableProps {
  movements: MaterialHistoryResponse[];
}

const ACTION_LABELS: Record<string, { text: string; bg: string; textCol: string }> = {
  MATERIAL_CREATED: { text: 'Creado', bg: 'bg-emerald-500/10', textCol: 'text-emerald-400' },
  MATERIAL_UPDATED: { text: 'Editado', bg: 'bg-blue-500/10', textCol: 'text-blue-400' },
  STATUS_CHANGED: { text: 'Cambio Estado', bg: 'bg-amber-500/10', textCol: 'text-amber-400' },
  OFFICE_CHANGED: { text: 'Cambio Oficina', bg: 'bg-indigo-500/10', textCol: 'text-indigo-400' },
  STATUS_AND_OFFICE_CHANGED: { text: 'Cambio Estado/Ofic', bg: 'bg-violet-500/10', textCol: 'text-violet-400' },
  MATERIAL_DECOMMISSIONED: { text: 'Dado de Baja', bg: 'bg-rose-500/10', textCol: 'text-rose-400' },
  QR_GENERATED: { text: 'QR Generado', bg: 'bg-slate-500/10', textCol: 'text-slate-400' },
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
    const meta = ACTION_LABELS[action] || { text: action, bg: 'bg-slate-500/10', textCol: 'text-slate-400' };
    return (
      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ${meta.bg} ${meta.textCol}`}>
        {meta.text}
      </span>
    );
  };

  if (movements.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 p-6">
        <p className="text-slate-400 text-sm">No hay movimientos recientes registrados</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
      <div className="p-6 border-b border-slate-850">
        <h4 className="text-lg font-semibold text-white">Últimos Movimientos</h4>
        <p className="text-xs text-slate-400 mt-1">Historial de las acciones más recientes sobre los materiales del inventario</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 font-medium">
              <th className="p-4">Material (Código)</th>
              <th className="p-4">Acción</th>
              <th className="p-4">Cambios</th>
              <th className="p-4">Comentario</th>
              <th className="p-4">Realizado por</th>
              <th className="p-4">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-300">
            {movements.map((move) => {
              const hasStatusChange = move.previousStatus !== move.newStatus && move.newStatus;
              const hasOfficeChange = move.previousOfficeName !== move.newOfficeName && move.newOfficeName;

              return (
                <tr key={move.id} className="hover:bg-slate-850/50 transition-colors duration-150">
                  <td className="p-4 font-mono text-xs text-blue-400 font-semibold">{move.materialPublicCode}</td>
                  <td className="p-4">{getActionBadge(move.action)}</td>
                  <td className="p-4 text-xs">
                    {hasStatusChange && (
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500">{move.previousStatus || 'Ninguno'}</span>
                        <span className="text-slate-400">→</span>
                        <span className="font-semibold text-white">{move.newStatus}</span>
                      </div>
                    )}
                    {hasOfficeChange && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-slate-500 text-[10px]">{move.previousOfficeName || 'Origen'}</span>
                        <span className="text-slate-400">→</span>
                        <span className="font-semibold text-white text-[10px]">{move.newOfficeName}</span>
                      </div>
                    )}
                    {!hasStatusChange && !hasOfficeChange && (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                  <td className="p-4 text-slate-400 truncate max-w-[200px]" title={move.comment || ''}>
                    {move.comment || <span className="text-slate-600 italic">Sin comentario</span>}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-white font-medium">{move.performedByUserFullName || 'Sistema'}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{move.performedByUserEmail || ''}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-400 whitespace-nowrap">{formatDate(move.createdAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
