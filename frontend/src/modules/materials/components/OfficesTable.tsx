"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchOffices,
  createOffice,
  updateOffice,
  deleteOffice,
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
  Building2
} from 'lucide-react';
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

  const isMountedRef = useRef(true);

  const loadOffices = useCallback(async () => {
    if (!isMountedRef.current) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchOffices(page, 10);
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
    if (!formName.trim()) {
      setFormError('El nombre de la oficina es obligatorio.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await createOffice({ name: formName });
      setShowCreateModal(false);
      loadOffices();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error al crear la oficina.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOffice) return;
    if (!formName.trim()) {
      setFormError('El nombre de la oficina es obligatorio.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await updateOffice(selectedOffice.publicId, { name: formName });
      setShowEditModal(false);
      loadOffices();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error al actualizar la oficina.');
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al desactivar la oficina.');
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-950 p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Building2 className="h-7 w-7 text-blue-500" />
            Oficinas / Sedes
          </h1>
          <p className="text-xs text-slate-400 mt-1">Registra sedes físicas donde se distribuyen los materiales.</p>
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
        <div className="flex items-center gap-3 rounded-xl border border-rose-900/50 bg-rose-500/5 p-4 text-xs text-rose-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Offices list */}
      {loading ? (
        /* Loading grid */
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-slate-900/50 rounded-2xl border border-slate-850 animate-pulse" />
          ))}
        </div>
      ) : offices.length === 0 ? (
        <div className="border border-dashed border-slate-800 rounded-2xl p-12 text-center">
          <Building2 className="mx-auto h-8 w-8 text-slate-650" />
          <h3 className="mt-3 text-sm font-semibold text-white">No hay oficinas registradas</h3>
          <p className="mt-1 text-xs text-slate-400">Crea una oficina para comenzar a asignarle materiales.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {offices.map((office) => (
              <div
                key={office.publicId}
                className="bg-slate-900/45 border border-slate-850 p-6 rounded-2xl backdrop-blur-md flex flex-col justify-between h-44 shadow-xl hover:border-slate-750 transition-all duration-200 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800" />
                
                <div>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-bold tracking-wide uppercase border ${
                    office.active
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}>
                    {office.active ? 'Activa' : 'Inactiva'}
                  </span>
                  <h3 className="text-lg font-black text-white mt-3 truncate">{office.name}</h3>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">ID: {office.publicId.slice(0, 8)}...</p>
                </div>

                <div className="border-t border-slate-850/80 pt-4 flex justify-between items-center text-xs">
                  <span className="text-[10px] text-slate-500">
                    Sede registrada
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenEdit(office)}
                      className="p-2 border border-slate-800 bg-slate-950/60 hover:bg-slate-800 hover:text-white rounded-lg transition"
                      title="Editar"
                    >
                      <Edit2 className="h-3.5 w-3.5 text-blue-400" />
                    </button>
                    {office.active && (
                      <button
                        onClick={() => handleDeleteOffice(office)}
                        className="p-2 border border-slate-800 bg-slate-950/60 hover:bg-rose-950/20 hover:border-rose-900/50 rounded-lg transition"
                        title="Desactivar"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-rose-450" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border border-slate-850 bg-slate-900/20 px-6 py-4 flex items-center justify-between rounded-2xl">
              <span className="text-xs text-slate-500 font-medium">
                Mostrando <span className="text-slate-350">{offices.length}</span> de{' '}
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

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600" />
            <div className="px-6 py-5 border-b border-slate-850 flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Registrar Oficina</h3>
              <button type="button" onClick={() => setShowCreateModal(false)} className="text-slate-455 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-500/5 border border-rose-900/40 text-rose-450 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {formError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs text-slate-450 font-semibold">Nombre de la Oficina *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ej: Sede Central Sevilla"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-white"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-850 flex justify-end gap-2 bg-slate-900/60">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-slate-800 hover:bg-slate-800 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition"
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
          <form onSubmit={handleEditSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600" />
            <div className="px-6 py-5 border-b border-slate-850 flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Editar Oficina</h3>
              <button type="button" onClick={() => setShowEditModal(false)} className="text-slate-455 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-500/5 border border-rose-900/40 text-rose-450 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {formError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs text-slate-450 font-semibold">Nombre de la Oficina *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-white"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-850 flex justify-end gap-2 bg-slate-900/60">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-slate-800 hover:bg-slate-800 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition"
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
