"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchAuditLogs,
  AuditLogResponse
} from '../services/audit.service';
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  History,
  Terminal,
  Info,
  Globe,
  Monitor
} from 'lucide-react';

export default function AuditLogsTable() {
  const [logs, setLogs] = useState<AuditLogResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Expandable details state
  const [expandedLogIdx, setExpandedLogIdx] = useState<number | null>(null);

  const isMountedRef = useRef(true);

  const loadLogs = useCallback(async () => {
    if (!isMountedRef.current) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAuditLogs(page, 15);
      if (!isMountedRef.current) return;
      setLogs(res.content || []);
      setTotalPages(res.totalPages || 0);
      setTotalElements(res.totalElements || 0);
    } catch (err: unknown) {
      if (!isMountedRef.current) return;
      setError(err instanceof Error ? err.message : 'Error al cargar la bitácora de auditoría.');
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [page]);

  useEffect(() => {
    isMountedRef.current = true;
    loadLogs();
    return () => {
      isMountedRef.current = false;
    };
  }, [loadLogs]);

  const toggleExpand = (idx: number) => {
    if (expandedLogIdx === idx) {
      setExpandedLogIdx(null);
    } else {
      setExpandedLogIdx(idx);
    }
  };

  const getActionColorClass = (action: string) => {
    if (action.includes('SUCCESS')) return 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800';
    if (action.includes('CREATED')) return 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800';
    if (action.includes('UPDATED') || action.includes('CHANGED') || action.includes('REGENERATED'))
      return 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800';
    if (action.includes('DELETED') || action.includes('DISABLED') || action.includes('DECOMMISSIONED') || action.includes('FAILED') || action.includes('DENIED'))
      return 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800';
    return 'text-slate-700 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700';
  };

  const formatJson = (val: string | null) => {
    if (!val) return 'Ninguno';
    try {
      const obj = JSON.parse(val);
      return JSON.stringify(obj, null, 2);
    } catch {
      return val;
    }
  };

  return (
    <div className="flex-1 bg-background p-6 md:p-8 space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2 font-display">
            <History className="h-7 w-7 text-zinc-700 dark:text-zinc-300" />
            Bitácora de Auditoría Global
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Registro inmutable de acciones técnicas, inicios de sesión y operaciones críticas.</p>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 p-4 text-xs text-rose-700 dark:text-rose-300 font-sans">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Timeline audit log list */}
      {loading ? (
        <div className="glass-card rounded-2xl overflow-hidden p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-zinc-100/50 dark:bg-zinc-800/50 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="border border-dashed border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md rounded-2xl p-12 text-center shadow-sm">
          <History className="mx-auto h-8 w-8 text-zinc-400 dark:text-zinc-600" />
          <h3 className="mt-3 text-sm font-bold text-zinc-900 dark:text-zinc-50 font-display">Bitácora Vacía</h3>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">No se registran eventos de auditoría en la base de datos.</p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs text-zinc-700 dark:text-zinc-200 font-sans">
              <thead className="border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-display">
                <tr>
                  <th className="px-6 py-4">Fecha / Hora</th>
                  <th className="px-6 py-4">Acción</th>
                  <th className="px-6 py-4">Entidad Target</th>
                  <th className="px-6 py-4">Realizado Por</th>
                  <th className="px-6 py-4">IP Origen</th>
                  <th className="px-6 py-4 text-right">Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
                {logs.map((log, idx) => {
                  const isExpanded = expandedLogIdx === idx;
                  return (
                    <React.Fragment key={idx}>
                      <tr className="hover:bg-zinc-50/60 dark:hover:bg-zinc-700/30 dark:bg-zinc-900/10 transition-colors duration-150">
                        <td className="px-6 py-4 font-semibold text-zinc-500 dark:text-zinc-400">
                          {new Date(log.createdAt).toLocaleString('es-ES')}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-bold tracking-wide uppercase border ${getActionColorClass(log.action)}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono font-medium text-zinc-600 dark:text-zinc-300">
                          {log.entityType}{' '}
                          {log.entityId && (
                            <span className="text-[10px] text-zinc-900 dark:text-zinc-100 font-bold font-display">[{log.entityId.slice(0, 8)}...]</span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-semibold">
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase mr-1">{log.performedByType}:</span>
                          <span className="font-mono text-zinc-600 dark:text-zinc-300">{log.performedById}</span>
                        </td>
                        <td className="px-6 py-4 font-mono text-zinc-500 dark:text-zinc-400">{log.ipAddress || 'Interno'}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => toggleExpand(idx)}
                            className="text-zinc-800 dark:text-zinc-200 hover:text-zinc-500 dark:hover:text-zinc-400 font-bold hover:underline transition hover:scale-105 active:scale-95 font-display uppercase tracking-wider text-[10px]"
                          >
                            {isExpanded ? 'Ocultar' : 'Detalles'}
                          </button>
                        </td>
                      </tr>

                      {/* Collapsible details panel */}
                      {isExpanded && (
                        <tr className="animate-fade-in bg-zinc-50/20 dark:bg-zinc-900/20">
                          <td colSpan={6} className="border-t border-b border-zinc-200 dark:border-zinc-800/80 px-8 py-6">
                            <div className="grid gap-6 md:grid-cols-2">
                              {/* Metadata */}
                              <div className="space-y-4">
                                <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 uppercase tracking-wider font-display">
                                  <Terminal className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                                  Información Técnica del Evento
                                </h4>

                                <div className="space-y-2 text-xs">
                                  <div className="flex items-center gap-2">
                                    <Globe className="h-4 w-4 text-zinc-500 dark:text-zinc-400 shrink-0" />
                                    <span className="text-zinc-500 dark:text-zinc-400">Dirección IP:</span>
                                    <span className="font-mono text-zinc-800 dark:text-zinc-200 font-semibold">{log.ipAddress || 'SISTEMA/MOCK'}</span>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <Monitor className="h-4 w-4 text-zinc-500 dark:text-zinc-400 shrink-0 mt-0.5" />
                                    <div className="overflow-hidden w-full">
                                      <span className="text-zinc-500 dark:text-zinc-400">User Agent:</span>
                                      <p className="font-mono text-zinc-600 dark:text-zinc-400 text-[10px] break-all leading-relaxed mt-0.5 bg-zinc-50/50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl">
                                        {log.userAgent || 'No provisto'}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Before / After Data JSON comparison */}
                              <div className="space-y-4">
                                <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 uppercase tracking-wider font-display">
                                  <Info className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                                  Cambios Realizados (Valores JSON)
                                </h4>

                                <div className="grid gap-4 sm:grid-cols-2">
                                  <div className="space-y-1.5">
                                    <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-display">Valor Anterior</span>
                                    <pre className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 overflow-x-auto max-h-40 leading-relaxed scrollbar-thin">
                                      {formatJson(log.oldValue)}
                                    </pre>
                                  </div>
                                  <div className="space-y-1.5">
                                    <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-display">Valor Nuevo</span>
                                    <pre className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-zinc-50/50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 overflow-x-auto max-h-40 leading-relaxed scrollbar-thin">
                                      {formatJson(log.newValue)}
                                    </pre>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 px-6 py-4 flex items-center justify-between">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Mostrando <span className="text-zinc-700 dark:text-zinc-200 font-bold">{logs.length}</span> de{' '}
                <span className="text-zinc-700 dark:text-zinc-200 font-bold">{totalElements}</span> resultados
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                  className="p-2 border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 rounded-lg text-zinc-600 dark:text-zinc-300 transition hover:scale-105 active:scale-95"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="flex items-center px-3 py-1 border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 rounded-lg font-bold text-zinc-700 dark:text-zinc-200 font-display">
                  {page + 1} / {totalPages}
                </span>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(page + 1)}
                  className="p-2 border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 rounded-lg text-zinc-600 dark:text-zinc-300 transition hover:scale-105 active:scale-95"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
