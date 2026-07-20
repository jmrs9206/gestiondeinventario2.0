"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Package, AlertTriangle, Clock, Activity, RotateCw, Shield, Monitor, Headphones, Sparkles } from 'lucide-react';
import {
  fetchDashboardKpis,
  fetchRecentMovements,
  DashboardKpis,
  MaterialHistoryResponse,
} from '../../modules/dashboard/services/dashboard.service';
import dynamic from 'next/dynamic';
import KpiCard from '../../modules/dashboard/components/KpiCard';
const StatusPieChart = dynamic(() => import('../../modules/dashboard/components/StatusPieChart'), { ssr: false });
const OfficeBarChart = dynamic(() => import('../../modules/dashboard/components/OfficeBarChart'), { ssr: false });
const OfficeCostBarChart = dynamic(() => import('../../modules/dashboard/components/OfficeCostBarChart'), { ssr: false });
import RecentMovementsTable from '../../modules/dashboard/components/RecentMovementsTable';
import DashboardFilters from '../../modules/dashboard/components/DashboardFilters';
import ProtectedRoute from '@/modules/auth/components/ProtectedRoute';
import Navigation from '@/modules/materials/components/Navigation';
import { useBranding } from '@/modules/branding/hooks/useBranding';

function DashboardPageContent() {
  const { branding } = useBranding();
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [movements, setMovements] = useState<MaterialHistoryResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [selectedOffice, setSelectedOffice] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const isMountedRef = useRef(true);

  const loadData = useCallback(async () => {
    if (!isMountedRef.current) return;
    setLoading(true);
    setError(null);
    try {
      // In local development, the user might need to log in first.
      // We will read the token, and if missing, we can redirect or show an error.
      const token = localStorage.getItem('accessToken');
      if (!token) {
        if (!isMountedRef.current) return;
        // Set a placeholder token for local testing if not running the full app flow yet,
        // or prompt the user. For robustness, if we get an Unauthorized error,
        // it redirects to login. Let's raise the error directly.
        setError('Acceso denegado. Por favor, inicia sesión como administrador.');
        setLoading(false);
        return;
      }

      const [kpisData, movementsData] = await Promise.all([
        fetchDashboardKpis(),
        fetchRecentMovements(10),
      ]);

      if (!isMountedRef.current) return;
      setKpis(kpisData);
      setMovements(movementsData.content || []);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Ignored, component was unmounted
        return;
      }
      if (!isMountedRef.current) return;
      const msg = err instanceof Error ? err.message : 'Error al cargar los datos del dashboard.';
      setError(msg);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    loadData();
    return () => {
      isMountedRef.current = false;
    };
  }, [loadData]);

  // Filter computations
  const filteredMovements = movements.filter((move) => {
    if (selectedOffice && move.newOfficeName !== selectedOffice && move.previousOfficeName !== selectedOffice) {
      return false;
    }
    if (selectedStatus && move.newStatus !== selectedStatus && move.previousStatus !== selectedStatus) {
      return false;
    }
    return true;
  });

  const getOfficeNames = () => {
    if (!kpis) return [];
    return kpis.officeCounts.map((o) => o.name);
  };

  const getOperationalPercentage = () => {
    if (!kpis || kpis.totalMaterials === 0) return 0;
    const opCount = kpis.statusCounts['OPERATIVO'] || 0;
    return Math.round((opCount / kpis.totalMaterials) * 100);
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-700 pb-6">
            <div>
              <div className="h-8 w-64 bg-slate-200 dark:bg-zinc-700/60 rounded-lg animate-pulse" />
              <div className="h-4 w-48 bg-slate-200 dark:bg-zinc-700/60 rounded-md mt-2 animate-pulse" />
            </div>
            <div className="h-10 w-24 bg-slate-200 dark:bg-zinc-700/60 rounded-lg animate-pulse" />
          </div>

          {/* KPI Skeletons */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl animate-pulse" />
            ))}
          </div>

          {/* Filters Skeleton */}
          <div className="h-20 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl animate-pulse" />

          {/* Charts Skeletons */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-80 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl animate-pulse" />
            <div className="h-80 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-8">
        <div className="rounded-2xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 p-8 text-center max-w-md w-full shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-rose-500" />
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-500">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-zinc-50">Error de Carga</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">{error}</p>
          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={loadData}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20"
            >
              <RotateCw className="h-4 w-4" />
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Empty State (No Materials at all)
  const isEmpty = !kpis || kpis.totalMaterials === 0;

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-zinc-700 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-zinc-50 tracking-tight flex items-center gap-2">
              <Shield className="h-8 w-8 text-blue-600" />
              {branding.appName}
              <span className="text-slate-700 dark:text-zinc-200 font-light text-2xl">|</span>
              <span className="font-semibold text-slate-700 dark:text-zinc-200">Dashboard</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Panel de control de administración y métricas globales de inventario</p>
          </div>
          <div>
            <button
              onClick={loadData}
              className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700/40 dark:bg-zinc-900 hover:text-slate-900 dark:text-zinc-50 transition duration-200"
            >
              <RotateCw className="h-3.5 w-3.5" />
              Actualizar
            </button>
          </div>
        </div>

        {/* Active Alerts */}
        {kpis && kpis.systemAlerts && kpis.systemAlerts.length > 0 && (
          <div className="flex flex-col items-start gap-3">
            {kpis.systemAlerts.map((alert, index) => (
              <div
                key={index}
                className="inline-flex w-fit max-w-full items-start gap-3 rounded-2xl border border-rose-200/80 bg-white/85 px-4 py-3 text-sm text-rose-800 shadow-lg shadow-rose-950/5 backdrop-blur-md dark:border-rose-900/50 dark:bg-rose-950/25 dark:text-rose-200 dark:shadow-black/20"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <span className="font-medium leading-relaxed">{alert}</span>
              </div>
            ))}
          </div>
        )}

        {isEmpty ? (
          /* Empty State Dashboard */
          <div className="rounded-2xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 p-12 text-center max-w-2xl mx-auto shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/20 text-blue-600">
              <Package className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-zinc-50">Inventario Vacío</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400 leading-relaxed max-w-md mx-auto">
              No hay materiales registrados en el inventario actualmente. Una vez agregados por el equipo técnico, las estadísticas aparecerán aquí de forma automática.
            </p>
          </div>
        ) : (
          /* Real Dashboard Content */
          <>
            {/* KPI Cards */}
            {kpis && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <KpiCard
                  title="Total Materiales"
                  value={kpis.totalMaterials}
                  icon={<Package className="h-6 w-6" />}
                  description="materiales activos en stock"
                  colorClassName="from-blue-600 to-cyan-600"
                />
                <KpiCard
                  title="Operatividad"
                  value={`${getOperationalPercentage()}%`}
                  icon={<Activity className="h-6 w-6" />}
                  description="porcentaje de stock operativo"
                  colorClassName="from-emerald-600 to-teal-600"
                />
                <KpiCard
                  title="Incidencias"
                  value={kpis.incidencesCount}
                  icon={<AlertTriangle className="h-6 w-6" />}
                  description="materiales rotos o en reparación"
                  colorClassName="from-rose-600 to-orange-600"
                />
                <KpiCard
                  title="T. Medio Reparación"
                  value={`${kpis.meanRepairTimeInHours.toFixed(1)}h`}
                  icon={<Clock className="h-6 w-6" />}
                  description="horas de reparación media"
                  colorClassName="from-violet-600 to-indigo-600"
                />
              </div>
            )}

            {/* Cost KPIs Row */}
            {kpis && kpis.totalAcquisitionCost !== undefined && (
              <div className="grid gap-6 sm:grid-cols-3">
                <KpiCard
                  title="Inversión en Adquisición"
                  value={`${kpis.totalAcquisitionCost.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`}
                  icon={<div className="font-extrabold text-lg text-blue-500">€</div>}
                  description="valor total de compra del inventario"
                  colorClassName="from-zinc-800 to-zinc-900 border-zinc-700/50"
                />
                <KpiCard
                  title="Valor Amortizado"
                  value={`${kpis.totalCurrentValue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`}
                  icon={<div className="font-extrabold text-lg text-emerald-500">📉</div>}
                  description="valor depreciado lineal (5 años)"
                  colorClassName="from-zinc-800 to-zinc-900 border-zinc-700/50"
                />
                <KpiCard
                  title="Depreciación Total"
                  value={`${kpis.totalDepreciation.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`}
                  icon={<div className="font-extrabold text-lg text-amber-500">⏳</div>}
                  description="pérdida de valor acumulada"
                  colorClassName="from-zinc-800 to-zinc-900 border-zinc-700/50"
                />
              </div>
            )}

            {/* Puestos de Trabajo Section */}
            {kpis && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600 animate-pulse" />
                    Capacidad Operativa de Puestos de Trabajo
                  </h2>
                  <span className="text-xs text-slate-500 dark:text-zinc-400">
                    Cálculo basado en stock operativo disponible por oficina
                  </span>
                </div>
                
                <div className="grid gap-6 sm:grid-cols-3">
                  <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 p-6 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md hover:border-slate-300">
                    <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 opacity-5 blur-xl" />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Puestos Especiales</p>
                        <h3 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-zinc-50 tracking-tight">
                          {kpis.specialWorkstations}
                        </h3>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-sm">
                        <Sparkles className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="mt-4 text-xs text-slate-500 dark:text-zinc-400 font-medium">
                      Requiere 2 Monitores + Teclado + Ratón + 2 Audífonos
                    </div>
                  </div>

                  <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 p-6 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md hover:border-slate-300">
                    <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 opacity-5 blur-xl" />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Puestos Completos</p>
                        <h3 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-zinc-50 tracking-tight">
                          {kpis.completeWorkstations}
                        </h3>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-sm">
                        <Monitor className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="mt-4 text-xs text-slate-500 dark:text-zinc-400 font-medium">
                      Requiere 1 Monitor + Teclado + Ratón + 2 Audífonos
                    </div>
                  </div>

                  <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 p-6 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md hover:border-slate-300">
                    <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-600 to-teal-600 opacity-5 blur-xl" />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Puestos Parciales</p>
                        <h3 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-zinc-50 tracking-tight">
                          {kpis.partialWorkstations}
                        </h3>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-sm">
                        <Headphones className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="mt-4 text-xs text-slate-500 dark:text-zinc-400 font-medium">
                      Requiere 1 Monitor + Teclado + Ratón + 1 Audífono
                    </div>
                  </div>
                </div>

                {/* Componentes Libres */}
                <div className="rounded-2xl bg-slate-50 dark:bg-zinc-900/30 border border-slate-200 dark:border-zinc-800/80 p-4 text-xs flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-slate-700 dark:text-zinc-300 text-sm">Componentes Libres (en Reserva):</span>
                    <span className="text-slate-500 dark:text-zinc-400">Equipos operativos disponibles para reemplazo de incidencias o ensamblaje de nuevos puestos.</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-white dark:bg-zinc-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 font-medium flex items-center gap-1.5 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-violet-600 animate-pulse" />
                      <strong>{kpis.leftoverMonitors}</strong> Monitores
                    </span>
                    <span className="bg-white dark:bg-zinc-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 font-medium flex items-center gap-1.5 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                      <strong>{kpis.leftoverKeyboards}</strong> Teclados
                    </span>
                    <span className="bg-white dark:bg-zinc-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 font-medium flex items-center gap-1.5 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-cyan-600 animate-pulse" />
                      <strong>{kpis.leftoverMice}</strong> Ratones
                    </span>
                    <span className="bg-white dark:bg-zinc-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 font-medium flex items-center gap-1.5 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                      <strong>{kpis.leftoverHeadphones}</strong> Audífonos
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Resumen por Tipo de Material */}
            {kpis && kpis.materialTypeCounts && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-2">
                    <Package className="h-5 w-5 text-zinc-500" />
                    Resumen de Inventario por Tipo de Material
                  </h2>
                  <span className="text-xs text-slate-500 dark:text-zinc-400">
                    Cantidad total de equipos activos agrupados por categoría
                  </span>
                </div>
                
                <div className="grid gap-4 grid-cols-2 sm:grid-cols-4 lg:grid-cols-6">
                  {Object.entries(kpis.materialTypeCounts).map(([type, count]) => (
                    <div 
                      key={type} 
                      className="relative overflow-hidden rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700/80 p-4 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md hover:border-slate-300 dark:hover:border-zinc-600"
                    >
                      <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider truncate">{type}</p>
                      <h4 className="mt-1 text-2xl font-extrabold text-slate-800 dark:text-zinc-100 tracking-tight">
                        {count}
                      </h4>
                      <div className="absolute right-3 bottom-3 opacity-10">
                        <Package className="h-8 w-8 text-slate-900 dark:text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Filters */}
            <DashboardFilters
              selectedOffice={selectedOffice}
              onOfficeChange={setSelectedOffice}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              offices={getOfficeNames()}
            />

            {/* Charts Section */}
            {kpis && (
              <div className="grid gap-6 md:grid-cols-3">
                <StatusPieChart statusCounts={kpis.statusCounts} />
                <OfficeBarChart officeCounts={kpis.officeCounts} />
                <OfficeCostBarChart officeCosts={kpis.officeCosts} />
              </div>
            )}

            {/* Recent Movements Table */}
            <RecentMovementsTable movements={filteredMovements} />
          </>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute requiredPermission="READ_DASHBOARD">
      <Navigation>
        <DashboardPageContent />
      </Navigation>
    </ProtectedRoute>
  );
}
