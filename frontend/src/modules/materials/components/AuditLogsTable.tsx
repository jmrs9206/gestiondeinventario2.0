"use client";

import React, { useState, useEffect, useCallback } from 'react';
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

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAuditLogs(page, 15);
      setLogs(res.content || []);
      setTotalPages(res.totalPages || 0);
      setTotalElements(res.totalElements || 0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar la bitácora de auditoría.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadLogs();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadLogs]);

  const toggleExpand = (idx: number) => {
    if (expandedLogIdx === idx) {
      setExpandedLogIdx(null);
    } else {
      setExpandedLogIdx(idx);
    }
  };

  const getActionColorClass = (action: string) => {
    if (action.includes('CREATED')) return 'text-emerald-400 bg-emerald-500/5 border-emerald-500/20';
    if (action.includes('UPDATED') || action.includes('CHANGED') || action.includes('REGENERATED'))
      return 'text-amber-400 bg-amber-500/5 border-amber-500/20';
    if (action.includes('DELETED') || action.includes('DISABLED') || action.includes('DECOMMISSIONED') || action.includes('FAILED') || action.includes('DENIED'))
      return 'text-rose-400 bg-rose-500/5 border-rose-500/20';
    return 'text-slate-400 bg-slate-900 border-slate-800';
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
    <div className="flex-1 bg-slate-950 p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <History className="h-7 w-7 text-blue-500" />
            Bitácora de Auditoría Global
          </h1>
          <p className="text-xs text-slate-400 mt-1">Registro inmutable de acciones técnicas, inicios de sesión y operaciones críticas.</p>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-900/50 bg-rose-500/5 p-4 text-xs text-rose-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Timeline audit log list */}
      {loading ? (
        <div className="border border-slate-850 bg-slate-900/20 rounded-2xl overflow-hidden p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-slate-900/50 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="border border-dashed border-slate-800 rounded-2xl p-12 text-center">
          <History className="mx-auto h-8 w-8 text-slate-650" />
          <h3 className="mt-3 text-sm font-semibold text-white">Bitácora Vacía</h3>
          <p className="mt-1 text-xs text-slate-400">No se registran eventos de auditoría en la base de datos.</p>
        </div>
      ) : (
        <div className="border border-slate-850 bg-slate-900/20 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs text-slate-350">
              <thead className="border-b border-slate-850 bg-slate-900/40 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-4">Fecha / Hora</th>
                  <th className="px-6 py-4">Acción</th>
                  <th className="px-6 py-4">Entidad Target</th>
                  <th className="px-6 py-4">Realizado Por</th>
                  <th className="px-6 py-4">IP Origen</th>
                  <th className="px-6 py-4 text-right">Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {logs.map((log, idx) => {
                  const isExpanded = expandedLogIdx === idx;
                  return (
                    <React.Fragment key={idx}>
                      <tr className="hover:bg-slate-900/10 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-400">
                          {new Date(log.createdAt).toLocaleString('es-ES')}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-bold tracking-wide uppercase border ${getActionColorClass(log.action)}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono font-medium text-slate-400">
                          {log.entityType}{' '}
                          {log.entityId && (
                            <span className="text-[10px] text-blue-500 font-bold">[{log.entityId}]</span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-semibold">
                          <span className="text-[10px] text-slate-500 uppercase mr-1">{log.performedByType}:</span>
                          <span className="font-mono text-slate-300">{log.performedById}</span>
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-500">{log.ipAddress || 'Interno'}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => toggleExpand(idx)}
                            className="text-blue-400 hover:text-blue-300 font-bold hover:underline transition"
                          >
                            {isExpanded ? 'Ocultar' : 'Ver más'}
                          </button>
                        </td>
                      </tr>

                      {/* Collapsible details panel */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={6} className="bg-slate-900/35 border-t border-b border-slate-850/80 px-8 py-6">
                            <div className="grid gap-6 md:grid-cols-2">
                              {/* Metadata */}
                              <div className="space-y-4">
                                <h4 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wide">
                                  <Terminal className="h-4 w-4 text-slate-400" />
                                  Información Técnica del Evento
                                </h4>

                                <div className="space-y-2 text-xs">
                                  <div className="flex items-center gap-2">
                                    <Globe className="h-4 w-4 text-slate-600 shrink-0" />
                                    <span className="text-slate-500">Dirección IP:</span>
                                    <span className="font-mono text-white">{log.ipAddress || 'SISTEMA/MOCK'}</span>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <Monitor className="h-4 w-4 text-slate-600 shrink-0 mt-0.5" />
                                    <div className="overflow-hidden">
                                      <span className="text-slate-500">User Agent:</span>
                                      <p className="font-mono text-slate-400 text-[10px] break-all leading-relaxed mt-0.5 bg-slate-950 border border-slate-850 p-2 rounded-lg">
                                        {log.userAgent || 'No provisto'}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Before / After Data JSON comparison */}
                              <div className="space-y-4">
                                <h4 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wide">
                                  <Info className="h-4 w-4 text-slate-400" />
                                  Cambios Realizados (Valores JSON)
                                </h4>

                                <div className="grid gap-4 sm:grid-cols-2">
                                  <div className="space-y-1.5">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Valor Anterior</span>
                                    <pre className="text-[10px] font-mono text-slate-400 bg-slate-950 border border-slate-850 rounded-lg p-3 overflow-x-auto max-h-40 leading-relaxed">
                                      {formatJson(log.oldValue)}
                                    </pre>
                                  </div>
                                  <div className="space-y-1.5">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Valor Nuevo</span>
                                    <pre className="text-[10px] font-mono text-emerald-400/90 bg-slate-950 border border-slate-850 rounded-lg p-3 overflow-x-auto max-h-40 leading-relaxed">
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
            <div className="border-t border-slate-850 bg-slate-900/20 px-6 py-4 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Mostrando <span className="text-slate-350">{logs.length}</span> de{' '}
                <span className="text-slate-350">{totalElements}</span> resultados
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                  className="p-2 border border-slate-800 bg-slate-950 hover:bg-slate-850 disabled:opacity-40 rounded-lg text-slate-400 hover:text-white transition"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="flex items-center px-3 py-1 border border-slate-800 bg-slate-950 rounded-lg font-bold text-slate-350">
                  {page + 1} / {totalPages}
                </span>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(page + 1)}
                  className="p-2 border border-slate-800 bg-slate-950 hover:bg-slate-850 disabled:opacity-40 rounded-lg text-slate-400 hover:text-white transition"
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
