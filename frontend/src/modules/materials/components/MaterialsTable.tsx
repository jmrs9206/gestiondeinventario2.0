"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  fetchMaterials,
  createMaterial,
  updateMaterial,
  decommissionMaterial,
  MaterialResponse,
  MaterialRequest
} from '../services/material.service';
import { fetchOffices, OfficeResponse } from '../services/office.service';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  X,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function MaterialsTable() {
  const [materials, setMaterials] = useState<MaterialResponse[]>([]);
  const [offices, setOffices] = useState<OfficeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filtering
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [officeFilter, setOfficeFilter] = useState('');
  const [serialFilter, setSerialFilter] = useState('');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDecommissionModal, setShowDecommissionModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialResponse | null>(null);

  // Form states
  const [formType, setFormType] = useState('');
  const [formBrand, setFormBrand] = useState('');
  const [formModel, setFormModel] = useState('');
  const [formSerial, setFormSerial] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formStatus, setFormStatus] = useState('OPERATIVO');
  const [formOffice, setFormOffice] = useState('');
  const [decommissionComment, setDecommissionComment] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isMountedRef = useRef(true);

  const loadOffices = useCallback(async () => {
    if (!isMountedRef.current) return;
    try {
      const res = await fetchOffices(0, 100);
      if (!isMountedRef.current) return;
      setOffices(res.content || []);
    } catch {
      // Non-blocking error
    }
  }, []);

  const loadMaterials = useCallback(async () => {
    if (!isMountedRef.current) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchMaterials({
        status: statusFilter || undefined,
        materialType: typeFilter || undefined,
        officePublicId: officeFilter || undefined,
        serialNumber: serialFilter || undefined,
        page,
        size: 10
      });
      if (!isMountedRef.current) return;
      setMaterials(res.content || []);
      setTotalPages(res.totalPages || 0);
      setTotalElements(res.totalElements || 0);
    } catch (err: unknown) {
      if (!isMountedRef.current) return;
      setError(err instanceof Error ? err.message : 'Error al cargar los materiales.');
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [statusFilter, typeFilter, officeFilter, serialFilter, page]);

  useEffect(() => {
    isMountedRef.current = true;
    loadOffices();
    loadMaterials();
    return () => {
      isMountedRef.current = false;
    };
  }, [loadOffices, loadMaterials]);

  const handleOpenCreate = () => {
    setFormType('');
    setFormBrand('');
    setFormModel('');
    setFormSerial('');
    setFormDesc('');
    setFormStatus('OPERATIVO');
    setFormOffice(offices[0]?.publicId || '');
    setFormError(null);
    setShowCreateModal(true);
  };

  const handleOpenEdit = (material: MaterialResponse) => {
    setSelectedMaterial(material);
    setFormType(material.materialType);
    setFormBrand(material.brand);
    setFormModel(material.model);
    setFormSerial(material.serialNumber);
    setFormDesc(material.description || '');
    setFormStatus(material.status);
    setFormOffice(material.officePublicId || '');
    setFormError(null);
    setShowEditModal(true);
  };

  const handleOpenDecommission = (material: MaterialResponse) => {
    setSelectedMaterial(material);
    setDecommissionComment('');
    setFormError(null);
    setShowDecommissionModal(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formType || !formBrand || !formModel || !formSerial) {
      setFormError('Todos los campos obligatorios deben ser completados.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const requestData: MaterialRequest = {
        materialType: formType,
        brand: formBrand,
        model: formModel,
        serialNumber: formSerial,
        description: formDesc || null,
        status: formStatus,
        officePublicId: formOffice || null
      };
      await createMaterial(requestData);
      setShowCreateModal(false);
      loadMaterials();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error al crear el material.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterial) return;
    if (!formType || !formBrand || !formModel || !formSerial) {
      setFormError('Todos los campos obligatorios deben ser completados.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const requestData: MaterialRequest = {
        materialType: formType,
        brand: formBrand,
        model: formModel,
        serialNumber: formSerial,
        description: formDesc || null,
        status: formStatus,
        officePublicId: formOffice || null
      };
      await updateMaterial(selectedMaterial.publicCode, requestData);
      setShowEditModal(false);
      loadMaterials();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error al actualizar el material.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecommissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterial) return;
    if (!decommissionComment.trim()) {
      setFormError('Debe ingresar un comentario para justificar la baja.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await decommissionMaterial(selectedMaterial.publicCode, decommissionComment);
      setShowDecommissionModal(false);
      loadMaterials();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error al dar de baja el material.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'OPERATIVO':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'EN_REPARACION':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'ROTO':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      case 'BAJA':
        return 'bg-slate-800 text-slate-400 border border-slate-700';
      default:
        return 'bg-slate-500/10 text-slate-400';
    }
  };

  return (
    <div className="flex-1 bg-slate-950 p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">Inventario de Materiales</h1>
          <p className="text-xs text-slate-400 mt-1">Busca, filtra, edita o registra nuevos equipos en el sistema.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-500 transition shadow-lg shadow-blue-500/20"
        >
          <Plus className="h-4 w-4" />
          Nuevo Material
        </button>
      </div>

      {/* Filters bar */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-5 bg-slate-900/40 border border-slate-850 p-5 rounded-2xl backdrop-blur-md">
        {/* Search by serial */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Número de Serie</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar..."
              value={serialFilter}
              onChange={(e) => {
                setSerialFilter(e.target.value);
                setPage(0);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
            />
          </div>
        </div>

        {/* Search by type */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tipo</label>
          <input
            type="text"
            placeholder="Ej: Router, Switch..."
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(0);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* Office filter */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Oficina</label>
          <select
            value={officeFilter}
            onChange={(e) => {
              setOfficeFilter(e.target.value);
              setPage(0);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 transition"
          >
            <option value="">Todas las oficinas</option>
            {offices.map((off) => (
              <option key={off.publicId} value={off.publicId}>
                {off.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status filter */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Estado</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 transition"
          >
            <option value="">Todos los estados</option>
            <option value="OPERATIVO">OPERATIVO</option>
            <option value="EN_REPARACION">EN REPARACIÓN</option>
            <option value="ROTO">ROTO</option>
            <option value="BAJA">BAJA (DECOMMISSIONED)</option>
          </select>
        </div>

        {/* Reset filters */}
        <div className="flex items-end">
          <button
            onClick={() => {
              setSerialFilter('');
              setTypeFilter('');
              setOfficeFilter('');
              setStatusFilter('');
              setPage(0);
            }}
            className="w-full py-2 border border-slate-800 bg-slate-900/60 hover:bg-slate-800 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-900/50 bg-rose-500/5 p-4 text-xs text-rose-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Materials Table */}
      {loading ? (
        /* Loading Skeletons */
        <div className="border border-slate-850 bg-slate-900/20 rounded-2xl overflow-hidden p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-slate-900/50 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : materials.length === 0 ? (
        /* Empty State */
        <div className="border border-dashed border-slate-800 rounded-2xl p-12 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-slate-650" />
          <h3 className="mt-3 text-sm font-semibold text-white">No se encontraron materiales</h3>
          <p className="mt-1 text-xs text-slate-400">Prueba cambiando los filtros de búsqueda.</p>
        </div>
      ) : (
        /* Table data */
        <div className="border border-slate-850 bg-slate-900/20 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs text-slate-300">
              <thead className="border-b border-slate-850 bg-slate-900/40 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-4">Código</th>
                  <th className="px-6 py-4">Categoría/Tipo</th>
                  <th className="px-6 py-4">Marca / Modelo</th>
                  <th className="px-6 py-4">Nº Serie</th>
                  <th className="px-6 py-4">Oficina</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {materials.map((item) => (
                  <tr key={item.publicCode} className="hover:bg-slate-900/20 transition-colors">
                    <td className="px-6 py-4 font-mono text-white font-bold">{item.publicCode}</td>
                    <td className="px-6 py-4 font-medium">{item.materialType}</td>
                    <td className="px-6 py-4">
                      {item.brand} <span className="text-slate-500 font-light">|</span> {item.model}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-400">{item.serialNumber}</td>
                    <td className="px-6 py-4 font-semibold text-slate-400">
                      {item.officeName || <span className="text-slate-600 font-light">Sin asignar</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${getStatusBadgeClass(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/materials/${item.publicCode}`}
                          className="p-2 border border-slate-800 bg-slate-900/40 hover:bg-slate-850 hover:text-white rounded-lg transition"
                          title="Ver detalle"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
                        {item.status !== 'BAJA' && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(item)}
                              className="p-2 border border-slate-800 bg-slate-900/40 hover:bg-slate-850 hover:text-white rounded-lg transition"
                              title="Editar"
                            >
                              <Edit2 className="h-3.5 w-3.5 text-blue-400" />
                            </button>
                            <button
                              onClick={() => handleOpenDecommission(item)}
                              className="p-2 border border-slate-800 bg-slate-900/40 hover:bg-rose-950/20 hover:border-rose-900/50 rounded-lg transition"
                              title="Dar de baja"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-rose-450" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="border-t border-slate-850 bg-slate-900/20 px-6 py-4 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Mostrando <span className="text-slate-350">{materials.length}</span> de{' '}
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

      {/* Modals Container */}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600" />
            <div className="px-6 py-5 border-b border-slate-850 flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Registrar Nuevo Material</h3>
              <button type="button" onClick={() => setShowCreateModal(false)} className="text-slate-450 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {formError && (
                <div className="p-3 bg-rose-500/5 border border-rose-900/40 text-rose-450 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-450 font-semibold">Tipo de Material *</label>
                  <input
                    type="text"
                    required
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    placeholder="Ej: Router"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-450 font-semibold">Marca *</label>
                  <input
                    type="text"
                    required
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    placeholder="Ej: MikroTik"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-450 font-semibold">Modelo *</label>
                  <input
                    type="text"
                    required
                    value={formModel}
                    onChange={(e) => setFormModel(e.target.value)}
                    placeholder="Ej: RB4011"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-450 font-semibold">Número de Serie *</label>
                  <input
                    type="text"
                    required
                    value={formSerial}
                    onChange={(e) => setFormSerial(e.target.value)}
                    placeholder="Ej: SN12345678"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-450 font-semibold">Oficina Asignada</label>
                  <select
                    value={formOffice}
                    onChange={(e) => setFormOffice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-white"
                  >
                    <option value="">Sin Asignar</option>
                    {offices.map((off) => (
                      <option key={off.publicId} value={off.publicId}>
                        {off.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-450 font-semibold">Estado Inicial</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-white"
                  >
                    <option value="OPERATIVO">OPERATIVO</option>
                    <option value="EN_REPARACION">EN REPARACIÓN</option>
                    <option value="ROTO">ROTO</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-450 font-semibold">Descripción / Notas</label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Agregar detalles adicionales del equipo..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-white resize-none"
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
                Guardar Registro
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleEditSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600" />
            <div className="px-6 py-5 border-b border-slate-850 flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Editar Material</h3>
              <button type="button" onClick={() => setShowEditModal(false)} className="text-slate-450 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {formError && (
                <div className="p-3 bg-rose-500/5 border border-rose-900/40 text-rose-450 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-450 font-semibold">Tipo de Material *</label>
                  <input
                    type="text"
                    required
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-450 font-semibold">Marca *</label>
                  <input
                    type="text"
                    required
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-450 font-semibold">Modelo *</label>
                  <input
                    type="text"
                    required
                    value={formModel}
                    onChange={(e) => setFormModel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-450 font-semibold">Número de Serie *</label>
                  <input
                    type="text"
                    required
                    value={formSerial}
                    onChange={(e) => setFormSerial(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-450 font-semibold">Oficina Asignada</label>
                  <select
                    value={formOffice}
                    onChange={(e) => setFormOffice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-white"
                  >
                    <option value="">Sin Asignar</option>
                    {offices.map((off) => (
                      <option key={off.publicId} value={off.publicId}>
                        {off.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-450 font-semibold">Estado</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-white"
                  >
                    <option value="OPERATIVO">OPERATIVO</option>
                    <option value="EN_REPARACION">EN REPARACIÓN</option>
                    <option value="ROTO">ROTO</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-450 font-semibold">Descripción / Notas</label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-white resize-none"
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

      {/* Decommission Modal */}
      {showDecommissionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleDecommissionSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-rose-600" />
            <div className="px-6 py-5 border-b border-slate-850 flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Dar de Baja Material</h3>
              <button type="button" onClick={() => setShowDecommissionModal(false)} className="text-slate-450 hover:text-white">
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

              <p className="text-xs text-slate-400 leading-relaxed">
                ¿Estás seguro de que deseas dar de baja este material? Esta acción es irreversible y retirará el material
                del inventario activo de VDEnergy.
              </p>

              <div className="space-y-1">
                <label className="text-xs text-slate-450 font-semibold">Comentario / Motivo de la baja *</label>
                <textarea
                  required
                  value={decommissionComment}
                  onChange={(e) => setDecommissionComment(e.target.value)}
                  placeholder="Ej: Desgaste irreparable, fuera de servicio oficial, robado, etc..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-white resize-none"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-850 flex justify-end gap-2 bg-slate-900/60">
              <button
                type="button"
                onClick={() => setShowDecommissionModal(false)}
                className="px-4 py-2 border border-slate-800 hover:bg-slate-800 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-xs font-bold text-white transition flex items-center gap-2"
              >
                {submitting && <Loader2 className="h-3 w-3 animate-spin" />}
                Confirmar Baja
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
