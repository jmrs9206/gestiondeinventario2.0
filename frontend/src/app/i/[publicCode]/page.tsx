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
  Sliders
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

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (status === 'BAJA') {
        await decommissionMaterial(publicCode, decommissionComment);
        setSuccess('Equipo dado de baja correctamente.');
      } else {
        const req: MaterialRequest = {
          materialType: material.materialType,
          brand: material.brand,
          model: material.model,
          serialNumber: material.serialNumber,
          description: material.description,
          status: status,
          officePublicId: officeId || null
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
        return 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20';
      case 'EN_REPARACION':
        return 'bg-amber-500/10 text-amber-450 border border-amber-500/20';
      case 'ROTO':
        return 'bg-rose-500/10 text-rose-450 border border-rose-500/20';
      case 'BAJA':
        return 'bg-slate-800 text-slate-400 border border-slate-700';
      default:
        return 'bg-slate-900 text-slate-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-300">
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-3" />
        <p className="text-sm font-medium text-slate-455 animate-pulse">Obteniendo detalles del código QR...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Mobile Sticky Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-slate-900/60 backdrop-blur-md border-b border-slate-850/80 sticky top-0 z-30">
        <button
          onClick={() => router.push('/materials')}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-slate-800 bg-slate-950 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ChevronLeft className="h-4 w-4" />
          Volver
        </button>
        <div className="flex items-center gap-1.5">
          <QrCode className="h-5 w-5 text-blue-500" />
          <span className="font-mono text-sm font-bold text-white">{publicCode}</span>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 border border-slate-800 bg-slate-950 text-slate-400 hover:text-white rounded-lg transition"
          title="Cerrar sesión"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </header>

      {/* Main Form container */}
      <main className="flex-1 p-6 max-w-md w-full mx-auto space-y-6">
        {/* Error / Success Banners */}
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-rose-900/50 bg-rose-500/5 p-4 text-xs text-rose-400">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-start gap-3 rounded-xl border border-emerald-900/50 bg-emerald-500/5 p-4 text-xs text-emerald-400">
            <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {material ? (
          <div className="space-y-6">
            {/* Material Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden space-y-4">
              <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500" />

              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  {material.materialType}
                </span>
                <h2 className="text-xl font-black text-white mt-1">
                  {material.brand} <span className="text-slate-500 font-light">{material.model}</span>
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${getStatusBg(material.status)}`}>
                    {material.status}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    S/N: {material.serialNumber}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-850/80 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ubicación Actual</p>
                  <p className="font-semibold text-slate-300 mt-1">
                    {material.officeName || <span className="text-slate-600 italic">Sin asignar</span>}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Último cambio</p>
                  <p className="font-medium text-slate-400 mt-1">
                    {new Date(material.updatedAt).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions Form */}
            {material.status !== 'BAJA' ? (
              <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wide border-b border-slate-850 pb-3">
                  <Sliders className="h-4 w-4 text-blue-500" />
                  Acciones Rápidas
                </h3>

                {/* Status selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-slate-500" />
                    Cambiar Estado
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-white font-medium"
                  >
                    <option value="OPERATIVO">OPERATIVO</option>
                    <option value="EN_REPARACION">EN REPARACIÓN</option>
                    <option value="ROTO">ROTO</option>
                    <option value="BAJA">DAR DE BAJA (RETIRO)</option>
                  </select>
                </div>

                {/* Office selector */}
                {status !== 'BAJA' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-slate-500" />
                      Asignar Nueva Oficina
                    </label>
                    <select
                      value={officeId}
                      onChange={(e) => setOfficeId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-white font-medium"
                    >
                      <option value="">Sin Asignar</option>
                      {offices.map((off) => (
                        <option key={off.publicId} value={off.publicId}>
                          {off.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Decommission justification comment */}
                {status === 'BAJA' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                      Comentario de Baja *
                    </label>
                    <textarea
                      required
                      value={decommissionComment}
                      onChange={(e) => setDecommissionComment(e.target.value)}
                      placeholder="Motivo obligatorio para retirar el equipo..."
                      rows={3}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 text-white resize-none"
                    />
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-500 transition shadow-lg shadow-blue-500/20 disabled:opacity-40"
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
              <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl text-center space-y-2">
                <Info className="mx-auto h-8 w-8 text-slate-600" />
                <h4 className="text-sm font-bold text-slate-400">Equipo en estado BAJA</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Este equipo ha sido retirado definitivamente y no permite actualizaciones rápidas de inventario.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center p-8 bg-slate-900 border border-slate-800 rounded-2xl">
            <AlertCircle className="mx-auto h-12 w-12 text-rose-500" />
            <h3 className="text-base font-bold text-white mt-4">Equipo no encontrado</h3>
            <p className="text-xs text-slate-400 mt-2">
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
