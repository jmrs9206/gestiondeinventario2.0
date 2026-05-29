"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Package, AlertTriangle, Clock, Activity, RotateCw, Shield } from 'lucide-react';
import {
  fetchDashboardKpis,
  fetchRecentMovements,
  DashboardKpis,
  MaterialHistoryResponse,
} from '../../modules/dashboard/services/dashboard.service';
import KpiCard from '../../modules/dashboard/components/KpiCard';
import StatusPieChart from '../../modules/dashboard/components/StatusPieChart';
import OfficeBarChart from '../../modules/dashboard/components/OfficeBarChart';
import RecentMovementsTable from '../../modules/dashboard/components/RecentMovementsTable';
import DashboardFilters from '../../modules/dashboard/components/DashboardFilters';
import ProtectedRoute from '@/modules/auth/components/ProtectedRoute';

function DashboardPageContent() {
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [movements, setMovements] = useState<MaterialHistoryResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [selectedOffice, setSelectedOffice] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // In local development, the user might need to log in first.
      // We will read the token, and if missing, we can redirect or show an error.
      const token = localStorage.getItem('accessToken');
      if (!token) {
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

      setKpis(kpisData);
      setMovements(movementsData.content || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar los datos del dashboard.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timer);
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
      <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between border-b border-slate-900 pb-6">
            <div>
              <div className="h-8 w-64 bg-slate-900 rounded-lg animate-pulse" />
              <div className="h-4 w-48 bg-slate-900 rounded-md mt-2 animate-pulse" />
            </div>
            <div className="h-10 w-24 bg-slate-900 rounded-lg animate-pulse" />
          </div>

          {/* KPI Skeletons */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-slate-900 border border-slate-850 rounded-2xl animate-pulse" />
            ))}
          </div>

          {/* Filters Skeleton */}
          <div className="h-20 bg-slate-900 border border-slate-850 rounded-2xl animate-pulse" />

          {/* Charts Skeletons */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-80 bg-slate-900 border border-slate-850 rounded-2xl animate-pulse" />
            <div className="h-80 bg-slate-900 border border-slate-850 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-8">
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-8 text-center max-w-md w-full shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-rose-500" />
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-white">Error de Carga</h3>
          <p className="mt-2 text-sm text-slate-400 leading-relaxed">{error}</p>
          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={loadData}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20"
            >
              <RotateCw className="h-4 w-4" />
              Reintentar
            </button>
            <button
              onClick={() => {
                localStorage.setItem('accessToken', 'mock_admin_token'); // Setup token for local developer mode
                loadData();
              }}
              className="mt-2 text-xs text-blue-400 hover:text-blue-300 font-medium hover:underline"
            >
              Configurar token de prueba
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Empty State (No Materials at all)
  const isEmpty = !kpis || kpis.totalMaterials === 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-900 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Shield className="h-8 w-8 text-blue-500" />
              VDEnergy
              <span className="text-slate-500 font-light text-2xl">|</span>
              <span className="font-semibold text-slate-300">Dashboard</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">Panel de control de administración y métricas globales de inventario</p>
          </div>
          <div>
            <button
              onClick={loadData}
              className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-850 hover:text-white transition duration-200"
            >
              <RotateCw className="h-3.5 w-3.5" />
              Actualizar
            </button>
          </div>
        </div>

        {isEmpty ? (
          /* Empty State Dashboard */
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-12 text-center max-w-2xl mx-auto shadow-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
              <Package className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-white">Inventario Vacío</h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
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
              <div className="grid gap-6 md:grid-cols-2">
                <StatusPieChart statusCounts={kpis.statusCounts} />
                <OfficeBarChart officeCounts={kpis.officeCounts} />
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
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <DashboardPageContent />
    </ProtectedRoute>
  );
}
