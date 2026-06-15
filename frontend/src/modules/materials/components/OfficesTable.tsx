"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchOffices,
  createOffice,
  updateOffice,
  deleteOffice,
  reactivateOffice,
  OfficeResponse
} from '../services/office.service';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Building2,
  Check
} from 'lucide-react';
const normalizeInput = (val: string | null | undefined): string => {
  if (!val) return '';
  return val
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
};

export default function OfficesTable() {
  const [offices, setOffices] = useState<OfficeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOffice, setSelectedOffice] = useState<OfficeResponse | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const isMountedRef = useRef(true);

  const loadOffices = useCallback(async () => {
    if (!isMountedRef.current) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchOffices(page, 10, true);
      if (!isMountedRef.current) return;
      setOffices(res.content || []);
      setTotalPages(res.totalPages || 0);
      setTotalElements(res.totalElements || 0);
    } catch (err: unknown) {
      if (!isMountedRef.current) return;
      setError(err instanceof Error ? err.message : 'Error al cargar las oficinas.');
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [page]);

  useEffect(() => {
    isMountedRef.current = true;
    loadOffices();
    return () => {
      isMountedRef.current = false;
    };
  }, [loadOffices]);

  const handleOpenCreate = () => {
    setFormName('');
    setFormError(null);
    setShowCreateModal(true);
  };

  const handleOpenEdit = (office: OfficeResponse) => {
    setSelectedOffice(office);
    setFormName(office.name);
    setFormError(null);
    setShowEditModal(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedName = normalizeInput(formName);
    if (!normalizedName.trim()) {
      setFormError('El nombre de la oficina es obligatorio.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await createOffice({ name: normalizedName });
      setShowCreateModal(false);
      loadOffices();
      showToast('Oficina creada exitosamente.');
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error al crear la oficina.');
      showToast(err instanceof Error ? err.message : 'Error al crear la oficina.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOffice) return;
    const normalizedName = normalizeInput(formName);
    if (!normalizedName.trim()) {
      setFormError('El nombre de la oficina es obligatorio.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await updateOffice(selectedOffice.publicId, { name: normalizedName });
      setShowEditModal(false);
      loadOffices();
      showToast('Oficina actualizada exitosamente.');
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error al actualizar la oficina.');
      showToast(err instanceof Error ? err.message : 'Error al actualizar la oficina.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteOffice = async (office: OfficeResponse) => {
    if (!window.confirm(`¿Estás seguro de que deseas desactivar la oficina "${office.name}"?`)) {
      return;
    }
    setLoading(true);
    try {
      await deleteOffice(office.publicId);
      loadOffices();
      showToast('Oficina desactivada exitosamente.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al desactivar la oficina.');
      showToast(err instanceof Error ? err.message : 'Error al desactivar la oficina.', 'error');
      setLoading(false);
    }
  };

  const handleReactivateOffice = async (office: OfficeResponse) => {
    if (!window.confirm(`¿Está seguro de que desea activar la oficina "${office.name}"?`)) {
      return;
    }
    setLoading(true);
    try {
      await reactivateOffice(office.publicId);
      loadOffices();
      showToast('Oficina activada exitosamente.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al activar la oficina.');
      showToast(err instanceof Error ? err.message : 'Error al activar la oficina.', 'error');
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-background p-6 md:p-8 space-y-6 relative">
      {/* Toast Notification Banner */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border transition-all duration-300 ${
          toast.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-950/50' 
            : 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-950/50'
        }`}>
          {toast.type === 'success' ? <Check className="h-4 w-4 text-emerald-600" /> : <AlertCircle className="h-4 w-4 text-rose-600" />}
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-700 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-50 flex items-center gap-2">
            <Building2 className="h-7 w-7 text-blue-600" />
            Oficinas / Sedes
          </h1>
          <p className="text-xs text-slate-600 dark:text-zinc-300 mt-1">Registra sedes físicas donde se distribuyen los materiales.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-500 transition shadow-lg shadow-blue-500/20"
        >
          <Plus className="h-4 w-4" />
          Nueva Oficina
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 dark:border-rose-950/50 bg-rose-50 dark:bg-rose-950/20 p-4 text-xs text-rose-700 dark:text-rose-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Offices list */}
      {loading ? (
        /* Loading grid */
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-white dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700 shadow-sm animate-pulse" />
          ))}
        </div>
      ) : offices.length === 0 ? (
        <div className="border border-dashed border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-2xl p-12 text-center shadow-sm">
          <Building2 className="mx-auto h-8 w-8 text-slate-700 dark:text-zinc-300" />
          <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-zinc-50">No hay oficinas registradas</h3>
          <p className="mt-1 text-xs text-slate-700 dark:text-zinc-300">Crea una oficina para comenzar a asignarle materiales.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {offices.map((office) => (
              <div
                key={office.publicId}
                className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 p-6 rounded-2xl flex flex-col justify-between h-44 shadow-sm hover:border-blue-500 hover:shadow-md transition-all duration-200 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600" />
                
                <div>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-bold tracking-wide uppercase border ${
                    office.active
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-slate-100 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-700'
                  }`}>
                    {office.active ? 'Activa' : 'Inactiva'}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-zinc-50 mt-3 truncate">{office.name}</h3>
                  <p className="text-[10px] text-slate-600 dark:text-zinc-300 font-mono mt-1">ID: {office.publicId.slice(0, 8)}...</p>
                </div>

                <div className="border-t border-slate-200 dark:border-zinc-700/80 pt-4 flex justify-between items-center text-xs">
                  <span className="text-[10px] text-slate-600 dark:text-zinc-300">
                    Sede registrada
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={loading || submitting}
                      onClick={() => handleOpenEdit(office)}
                      className="p-2 border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700/40 dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:text-zinc-50 rounded-lg transition shadow-sm disabled:opacity-40"
                      title="Editar"
                    >
                      <Edit2 className="h-3.5 w-3.5 text-blue-600" />
                    </button>
                    {office.active ? (
                      <button
                        disabled={loading || submitting}
                        onClick={() => handleDeleteOffice(office)}
                        className="p-2 border border-slate-200 dark:border-zinc-700 bg-white/60 hover:bg-rose-950/20 hover:border-rose-900/50 rounded-lg transition disabled:opacity-40"
                        title="Desactivar"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                      </button>
                    ) : (
                      <button
                        disabled={loading || submitting}
                        onClick={() => handleReactivateOffice(office)}
                        className="p-2 border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-emerald-950/20 hover:border-emerald-900/50 rounded-lg transition text-emerald-600 disabled:opacity-40"
                        title="Activar"
                      >
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-6 py-4 flex items-center justify-between rounded-2xl">
              <span className="text-xs text-slate-600 dark:text-zinc-300 font-medium">
                Mostrando <span className="text-slate-700 dark:text-zinc-200">{offices.length}</span> de{' '}
                <span className="text-slate-700 dark:text-zinc-200">{totalElements}</span> resultados
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                  className="p-2 border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700/40 dark:bg-zinc-900 disabled:opacity-40 rounded-lg text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:text-zinc-50 transition"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="flex items-center px-3 py-1 border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg font-bold text-slate-700 dark:text-zinc-200">
                  {page + 1} / {totalPages}
                </span>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(page + 1)}
                  className="p-2 border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700/40 dark:bg-zinc-900 disabled:opacity-40 rounded-lg text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:text-zinc-50 transition"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateSubmit} className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl shadow-sm w-full max-w-sm shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600" />
            <div className="px-6 py-5 border-b border-slate-200 dark:border-zinc-700 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-50">Registrar Oficina</h3>
              <button type="button" onClick={() => setShowCreateModal(false)} className="text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:text-zinc-100 p-1 rounded-lg hover:bg-slate-100 transition">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-950/50 text-rose-700 dark:text-rose-400 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {formError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs text-slate-600 dark:text-zinc-300 font-semibold">Nombre de la Oficina *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(normalizeInput(e.target.value))}
                  onBlur={(e) => setFormName(normalizeInput(e.target.value))}
                  placeholder="Ej: Sede Central Sevilla"
                  className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-50 uppercase"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 dark:border-zinc-700 flex justify-end gap-2 bg-slate-50 dark:bg-zinc-900">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:text-zinc-50 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-xs font-bold text-white transition flex items-center gap-2"
              >
                {submitting && <Loader2 className="h-3 w-3 animate-spin" />}
                Guardar Oficina
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleEditSubmit} className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl shadow-sm w-full max-w-sm shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600" />
            <div className="px-6 py-5 border-b border-slate-200 dark:border-zinc-700 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-50">Editar Oficina</h3>
              <button type="button" onClick={() => setShowEditModal(false)} className="text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:text-zinc-100 p-1 rounded-lg hover:bg-slate-100 transition">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-950/50 text-rose-700 dark:text-rose-400 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {formError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs text-slate-600 dark:text-zinc-300 font-semibold">Nombre de la Oficina *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(normalizeInput(e.target.value))}
                  onBlur={(e) => setFormName(normalizeInput(e.target.value))}
                  className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-50 uppercase"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 dark:border-zinc-700 flex justify-end gap-2 bg-slate-50 dark:bg-zinc-900">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:text-zinc-50 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-xs font-bold text-white transition flex items-center gap-2"
              >
                {submitting && <Loader2 className="h-3 w-3 animate-spin" />}
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
