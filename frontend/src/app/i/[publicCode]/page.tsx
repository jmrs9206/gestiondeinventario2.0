"use client";

import React, { use, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/modules/auth/components/ProtectedRoute';
import {
  fetchMaterial,
  updateMaterial,
  decommissionMaterial,
  MaterialResponse,
  MaterialRequest
} from '@/modules/materials/services/material.service';
import { fetchOffices, OfficeResponse } from '@/modules/materials/services/office.service';
import {
  QrCode,
  MapPin,
  Activity,
  Save,
  LogOut,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ChevronLeft,
  Info,
  Wrench
} from 'lucide-react';
import { useAuth } from '@/modules/auth/hooks/useAuth';

interface PageProps {
  params: Promise<{
    publicCode: string;
  }>;
}

function MobileScanContent({ publicCode }: { publicCode: string }) {
  const { logout } = useAuth();
  const router = useRouter();

  const [material, setMaterial] = useState<MaterialResponse | null>(null);
  const [offices, setOffices] = useState<OfficeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states for quick action
  const [status, setStatus] = useState('');
  const [officeId, setOfficeId] = useState('');
  const [decommissionComment, setDecommissionComment] = useState('');
  const [updateComment, setUpdateComment] = useState('');
  const [saving, setSaving] = useState(false);

  const isMountedRef = useRef(true);

  const loadData = useCallback(async () => {
    if (!isMountedRef.current) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const [mat, offs] = await Promise.all([
        fetchMaterial(publicCode),
        fetchOffices(0, 100)
      ]);
      if (!isMountedRef.current) return;
      setMaterial(mat);
      setStatus(mat.status);
      setOfficeId(mat.officePublicId || '');
      setOffices(offs.content || []);
      setDecommissionComment('');
      setUpdateComment('');
    } catch (err: unknown) {
      if (!isMountedRef.current) return;
      setError(err instanceof Error ? err.message : 'Error al cargar el material escaneado.');
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

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!material) return;

    if (status === 'BAJA' && !decommissionComment.trim()) {
      setError('Es obligatorio indicar un comentario para dar de baja el material.');
      return;
    }
    if (status !== 'BAJA' && !updateComment.trim()) {
      setError('Es obligatorio indicar un comentario para justificar los cambios.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (status === 'BAJA') {
        await decommissionMaterial(publicCode, decommissionComment);
        setSuccess('Equipo dado de baja correctamente.');
      } else {
        if (!officeId) {
          setError('Debe seleccionar una oficina válida.');
          return;
        }
        const req: MaterialRequest = {
          materialType: material.materialType,
          brand: material.brand,
          model: material.model,
          serialNumber: material.serialNumber,
          description: material.description,
          status: status,
          officePublicId: officeId,
          purchasePrice: material.purchasePrice ?? undefined,
          purchaseDate: material.purchaseDate ?? undefined,
          comment: updateComment
        };
        await updateMaterial(publicCode, req);
        setSuccess('Estado e información actualizados con éxito.');
      }
      // Reload updated details
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el material.');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBg = (s: string) => {
    switch (s) {
      case 'OPERATIVO':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
      case 'EN_REPARACION':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20';
      case 'ROTO':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20';
      case 'BAJA':
        return 'bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 border border-zinc-500/20';
      default:
        return 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-300 border border-zinc-500/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 font-sans">
        <Loader2 className="h-10 w-10 text-zinc-700 dark:text-zinc-300 animate-spin mb-4" />
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 animate-pulse font-display uppercase tracking-wider">Obteniendo detalles del código QR...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col animate-fade-in font-sans">
      <header className="flex items-center justify-between px-6 py-4 bg-background backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800/80 sticky top-0 z-30">
        <button
          onClick={() => router.push('/materials')}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-50 hover:scale-105 active:scale-95 transition-all font-display uppercase tracking-wider shadow-sm"
        >
          <ChevronLeft className="h-4 w-4" />
          Volver
        </button>
        <div className="flex items-center gap-1.5">
          <QrCode className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
          <span className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-50">{publicCode}</span>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-50 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-sm"
          title="Cerrar sesión"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </header>

      <main className="flex-1 p-6 max-w-md w-full mx-auto space-y-6">
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-600 dark:text-rose-400">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {material ? (
          <div className="space-y-6">
            <div className="bg-white/50 dark:bg-zinc-800/50 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 relative overflow-hidden space-y-4 shadow-sm">
              <div>
                <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest font-display">
                  {material.materialType}
                </span>
                <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-50 mt-1 font-display">
                  {material.brand} <span className="text-zinc-500 dark:text-zinc-400 font-light">{material.model}</span>
                </h2>
                <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 mt-0.5">S/N: {material.serialNumber}</p>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase border ${getStatusBg(material.status)}`}>
                  {material.status}
                </span>
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 uppercase tracking-wide">
                  {material.officeName || 'Sin Oficina'}
                </span>
              </div>
            </div>

            {material.status !== 'BAJA' ? (
              <form onSubmit={handleSave} className="bg-white/50 dark:bg-zinc-800/50 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-5 shadow-sm">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3 font-display">
                  <Activity className="h-4.5 w-4.5 text-zinc-700 dark:text-zinc-300" />
                  Acciones Rápidas
                </h3>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 font-display uppercase tracking-wider">
                    <Wrench className="h-3.5 w-3.5 text-zinc-400" />
                    Cambiar Estado
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 text-zinc-900 dark:text-zinc-100 font-semibold"
                  >
                    <option value="OPERATIVO">OPERATIVO</option>
                    <option value="EN_REPARACION">EN REPARACIÓN</option>
                    <option value="ROTO">ROTO</option>
                    <option value="BAJA">DAR DE BAJA (RETIRO)</option>
                  </select>
                </div>

                {status !== 'BAJA' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 font-display uppercase tracking-wider">
                      <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                      Asignar Nueva Oficina
                    </label>
                    <select
                      value={officeId}
                      onChange={(e) => setOfficeId(e.target.value)}
                      required
                      className="w-full bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 text-zinc-900 dark:text-zinc-100 font-semibold"
                    >
                      <option value="" disabled>Seleccione una oficina...</option>
                      {offices.map((off) => (
                        <option key={off.publicId} value={off.publicId}>
                          {off.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {status !== 'BAJA' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 font-display uppercase tracking-wider">
                      Comentario de Actualización *
                    </label>
                    <textarea
                      required
                      value={updateComment}
                      onChange={(e) => setUpdateComment(e.target.value)}
                      placeholder="Motivo del cambio de oficina/estado..."
                      rows={2}
                      className="w-full bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-sm focus:outline-none focus:border-zinc-400 text-zinc-900 dark:text-zinc-50 resize-none font-medium"
                    />
                  </div>
                )}

                {status === 'BAJA' && (
                  <div className="space-y-1.5 animate-fade-in">
                    <label className="text-xs font-bold text-rose-600 dark:text-rose-400 font-display uppercase tracking-wider">
                      Comentario de Baja *
                    </label>
                    <textarea
                      required
                      value={decommissionComment}
                      onChange={(e) => setDecommissionComment(e.target.value)}
                      placeholder="Motivo obligatorio para retirar el equipo..."
                      rows={3}
                      className="w-full bg-zinc-50/50 dark:bg-zinc-900/50 border border-rose-500/20 rounded-xl p-3 text-sm focus:outline-none focus:border-rose-500 text-zinc-900 dark:text-zinc-50 resize-none font-medium"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-900 dark:bg-zinc-50 py-3.5 text-sm font-bold text-white dark:text-zinc-900 hover:scale-[1.02] transition-all disabled:opacity-40 font-display uppercase tracking-wider shadow-md"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Guardar Cambios
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="bg-white/50 dark:bg-zinc-800/50 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl text-center space-y-2 shadow-sm">
                <Info className="mx-auto h-8 w-8 text-zinc-500 dark:text-zinc-400" />
                <h4 className="text-sm font-bold text-zinc-600 dark:text-zinc-300 font-display uppercase tracking-wider">Equipo en estado BAJA</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
                  Este equipo ha sido retirado definitivamente y no permite actualizaciones rápidas de inventario.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center p-8 bg-white/50 dark:bg-zinc-800/50 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
            <AlertCircle className="mx-auto h-12 w-12 text-rose-500" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 mt-4 font-display uppercase tracking-wider">Equipo no encontrado</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
              El código de material no corresponde a ningún activo en el sistema.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function MobileScanPage({ params }: PageProps) {
  const resolvedParams = use(params);

  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'TECNICO']}>
      <MobileScanContent publicCode={resolvedParams.publicCode} />
    </ProtectedRoute>
  );
}
