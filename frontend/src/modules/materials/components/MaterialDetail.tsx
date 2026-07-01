"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  fetchMaterial,
  fetchMaterialHistory,
  regenerateQrCode,
  MaterialResponse,
  MaterialHistoryResponse
} from '../services/material.service';
import {
  ArrowLeft,
  QrCode,
  Printer,
  RefreshCw,
  Clock,
  User,
  MapPin,
  Calendar,
  AlertCircle,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/modules/auth/hooks/useAuth';

interface MaterialDetailProps {
  publicCode: string;
}

export default function MaterialDetail({ publicCode }: MaterialDetailProps) {
  const { user } = useAuth();
  const router = useRouter();

  const [material, setMaterial] = useState<MaterialResponse | null>(null);
  const [history, setHistory] = useState<MaterialHistoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const BASE_URL = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080');

  const isMountedRef = useRef(true);

  const loadData = useCallback(async () => {
    if (!isMountedRef.current) return;
    setLoading(true);
    setError(null);
    try {
      const [matData, histData] = await Promise.all([
        fetchMaterial(publicCode),
        fetchMaterialHistory(publicCode, 0, 100)
      ]);
      if (!isMountedRef.current) return;
      setMaterial(matData);
      setHistory(histData.content || []);
    } catch (err: unknown) {
      if (!isMountedRef.current) return;
      setError(err instanceof Error ? err.message : 'Error al cargar el detalle del material.');
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [publicCode]);

  useEffect(() => {
    isMountedRef.current = true;
    loadData();
    return () => {
      isMountedRef.current = false;
    };
  }, [loadData]);

  const handleRegenerateQr = async () => {
    if (!window.confirm('¿Estás seguro de que deseas regenerar el código QR? El código anterior quedará invalidado.')) {
      return;
    }
    setActionLoading(true);
    setSuccessMsg(null);
    setError(null);
    try {
      await regenerateQrCode(publicCode);
      setSuccessMsg('Código QR regenerado con éxito.');
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al regenerar el código QR.');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrintLabel = async () => {
    setActionLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${BASE_URL}/api/v1/materials/${publicCode}/qr/print`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        throw new Error('No se pudo descargar la etiqueta de impresión.');
      }
      const html = await res.text();
      
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        // Wait for fonts or images inside the html to render, then print
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 300);
      } else {
        throw new Error('El navegador bloqueó la ventana emergente de impresión.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al imprimir la etiqueta.');
    } finally {
      setActionLoading(false);
    }
  };

  const [qrBlobUrl, setQrBlobUrl] = useState<string>('');
  const qrBlobUrlRef = React.useRef<string | null>(null);
  // Fetch QR image as a blob with Auth header
  const loadQrImage = useCallback(async (signal?: AbortSignal) => {
    if (!material) return;
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${BASE_URL}/api/v1/materials/${publicCode}/qr?width=300&height=300`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        signal
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        if (!isMountedRef.current) {
          URL.revokeObjectURL(url);
          return;
        }
        if (qrBlobUrlRef.current) {
          URL.revokeObjectURL(qrBlobUrlRef.current);
        }
        qrBlobUrlRef.current = url;
        setQrBlobUrl(url);
      }
    } catch {
      // Ignore QR load failures
    }
  }, [material, publicCode, BASE_URL]);

  useEffect(() => {
    const controller = new AbortController();
    loadQrImage(controller.signal);
    return () => {
      controller.abort();
      if (qrBlobUrlRef.current) {
        URL.revokeObjectURL(qrBlobUrlRef.current);
        qrBlobUrlRef.current = null;
      }
    };
  }, [loadQrImage]);
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'OPERATIVO':
        return 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-950/50';
      case 'EN_REPARACION':
        return 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-250';
      case 'ROTO':
        return 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-950/50';
      case 'BAJA':
        return 'bg-slate-100 dark:bg-zinc-800/40 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700/50';
      default:
        return 'bg-slate-100 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700';
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-background flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          <p className="text-sm text-slate-600 dark:text-zinc-300">Cargando detalles del equipo...</p>
        </div>
      </div>
    );
  }

  if (error && !material) {
    return (
      <div className="flex-1 bg-background p-8 flex items-center justify-center">
        <div className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 p-8 rounded-2xl text-center max-w-md w-full shadow-sm">
          <AlertCircle className="mx-auto h-12 w-12 text-rose-500" />
          <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-zinc-50">Error de Carga</h3>
          <p className="mt-2 text-xs text-slate-600 dark:text-zinc-300">{error}</p>
          <button
            onClick={() => router.push('/materials')}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 transition border border-slate-200 dark:border-zinc-700 shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a Materiales
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background p-6 md:p-8 space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-700 pb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/materials')}
            className="p-2.5 border border-slate-200 dark:border-zinc-700 hover:border-slate-700 rounded-xl bg-slate-50 dark:bg-zinc-900 hover:text-slate-900 dark:text-zinc-50 transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-zinc-50 flex items-center gap-2">
              Detalle de Equipo: <span className="font-mono text-blue-600">{publicCode}</span>
            </h1>
            <p className="text-xs text-slate-600 dark:text-zinc-300 mt-0.5">Trazabilidad y operaciones de inventario activo.</p>
          </div>
        </div>
      </div>

      {/* Success/Error Alerts */}
      {successMsg && (
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-950/50 p-4 text-xs">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 dark:border-rose-950/50 bg-rose-50 dark:bg-rose-950/20 p-4 text-xs text-rose-700 dark:text-rose-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {material && (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Info Card */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 p-6 rounded-2xl backdrop-blur-md space-y-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500" />
              
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-200 dark:border-zinc-700 pb-6">
                <div>
                  <span className="text-[10px] font-bold text-slate-600 dark:text-zinc-300 uppercase tracking-widest">
                    {material.materialType}
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-zinc-50 mt-1">
                    {material.brand} <span className="text-slate-600 dark:text-zinc-300 font-light">{material.model}</span>
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-zinc-300 mt-2 leading-relaxed">
                    {material.description || <span className="italic text-slate-600 dark:text-zinc-300">Sin descripción adicional provista.</span>}
                  </p>
                </div>
                <div>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${getStatusBadgeClass(material.status)}`}>
                    {material.status}
                  </span>
                </div>
              </div>

              {/* Grid attributes */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                    <QrCode className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-600 dark:text-zinc-300 uppercase tracking-wider">Número de Serie</p>
                    <p className="text-sm font-mono font-bold text-slate-900 dark:text-zinc-50 mt-0.5">{material.serialNumber}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                    <MapPin className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-600 dark:text-zinc-300 uppercase tracking-wider">Oficina Ubicación</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-zinc-50 mt-0.5">
                      {material.officeName || <span className="text-slate-600 dark:text-zinc-300 italic">Sin asignar</span>}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                    <User className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-600 dark:text-zinc-300 uppercase tracking-wider">Registrado Por</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-zinc-50 mt-0.5">
                      {material.createdByName || <span className="text-slate-600 dark:text-zinc-300">Sistema</span>}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                    <Calendar className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-600 dark:text-zinc-300 uppercase tracking-wider">Fecha Registro</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-zinc-50 mt-0.5">
                      {new Date(material.createdAt).toLocaleString('es-ES')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* History timeline */}
            <div className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 p-6 rounded-2xl backdrop-blur-md space-y-6">
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-50 flex items-center gap-2">
                <Clock className="h-4.5 w-4.5 text-slate-600 dark:text-zinc-300" />
                Historial de Movimientos
              </h3>

              {history.length === 0 ? (
                <p className="text-xs text-slate-600 dark:text-zinc-300 italic">No hay registros de historial para este equipo.</p>
              ) : (
                <div className="flow-root">
                  <ul className="-mb-8">
                    {history.map((log, idx) => (
                      <li key={log.id}>
                        <div className="relative pb-8">
                          {idx !== history.length - 1 && (
                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-100" aria-hidden="true" />
                          )}
                          <div className="relative flex space-x-3">
                            <div>
                              <span className="h-8 w-8 rounded-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center text-xs text-slate-600 dark:text-zinc-300 shadow-md">
                                {idx + 1}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                              <div>
                                <p className="text-xs font-semibold text-slate-800 dark:text-zinc-100">
                                  {log.action}{' '}
                                  {log.newStatus && log.previousStatus && (
                                    <span className="text-[10px] font-bold text-slate-600 dark:text-zinc-300">
                                      ({log.previousStatus} → {log.newStatus})
                                    </span>
                                  )}
                                </p>
                                {log.comment && (
                                  <p className="text-xs text-slate-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg p-2.5 mt-1 leading-relaxed font-light">
                                    {log.comment}
                                  </p>
                                )}
                                <div className="mt-1 flex items-center gap-2 text-[10px] font-semibold text-slate-600 dark:text-zinc-300">
                                  <span>{log.performedByUserFullName || log.performedByUserEmail}</span>
                                  <span>•</span>
                                  <span>{new Date(log.createdAt).toLocaleString('es-ES')}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* QR Side Panel */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 p-6 rounded-2xl backdrop-blur-md flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500" />
              
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-50">Etiqueta QR Activa</h3>
                <p className="text-[10px] text-slate-600 dark:text-zinc-300">Identificador físico de inventario para escaneo móvil</p>
              </div>

              {/* QR Image Frame */}
              <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl border border-slate-200 dark:border-zinc-700 shadow-xl inline-block">
                {qrBlobUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qrBlobUrl} alt={`QR Code for ${publicCode}`} className="h-44 w-44 object-contain" />
                ) : (
                  <div className="h-44 w-44 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 dark:text-zinc-400 animate-pulse">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-600 dark:text-zinc-300" />
                  </div>
                )}
              </div>

              <div className="w-full space-y-2 pt-2 border-t border-slate-200 dark:border-zinc-700">
                <button
                  onClick={handlePrintLabel}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:border-slate-700 bg-slate-100 dark:bg-zinc-900/60 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-zinc-100 transition duration-200 shadow-sm"
                >
                  <Printer className="h-4 w-4 text-blue-500" />
                  Imprimir Etiqueta (Label)
                </button>
                {user?.role === 'ADMIN' && material.status !== 'BAJA' && (
                  <button
                    onClick={handleRegenerateQr}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:border-slate-700 bg-slate-100 dark:bg-zinc-900/60 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-zinc-100 transition duration-200 shadow-sm"
                  >
                    <RefreshCw className={`h-4 w-4 text-amber-500 ${actionLoading ? 'animate-spin' : ''}`} />
                    Regenerar Código QR
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
