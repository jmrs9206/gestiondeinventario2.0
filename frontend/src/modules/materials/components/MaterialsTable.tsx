"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  fetchMaterials,
  createMaterial,
  updateMaterial,
  decommissionMaterial,
  reactivateMaterial,
  importMaterials,
  exportMaterials,
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
  ChevronRight,
  Check,
  QrCode,
  Download,
  Upload
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

  // Local debounced inputs
  const [serialQuery, setSerialQuery] = useState('');
  const [typeQuery, setTypeQuery] = useState('');

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

  // Debounce effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setSerialFilter(serialQuery);
      setTypeFilter(typeQuery);
      setPage(0);
    }, 350);

    return () => {
      clearTimeout(handler);
    };
  }, [serialQuery, typeQuery]);

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

  // Scanner & CSV Bulk state
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const qrScannerRef = useRef<any>(null);

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
        includeInactive: true,
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
    const normalizedType = normalizeInput(formType);
    const normalizedBrand = normalizeInput(formBrand);
    const normalizedModel = normalizeInput(formModel);
    const normalizedSerial = normalizeInput(formSerial);
    const normalizedDesc = normalizeInput(formDesc);
    if (!normalizedType || !normalizedBrand || !normalizedModel || !normalizedSerial || !formOffice) {
      setFormError('Todos los campos obligatorios deben ser completados (incluyendo la oficina).');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const requestData: MaterialRequest = {
        materialType: normalizedType,
        brand: normalizedBrand,
        model: normalizedModel,
        serialNumber: normalizedSerial,
        description: normalizedDesc || null,
        status: formStatus,
        officePublicId: formOffice
      };
      await createMaterial(requestData);
      setShowCreateModal(false);
      loadMaterials();
      showToast('Material creado exitosamente.');
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error al crear el material.');
      showToast(err instanceof Error ? err.message : 'Error al crear el material.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterial) return;
    const normalizedType = normalizeInput(formType);
    const normalizedBrand = normalizeInput(formBrand);
    const normalizedModel = normalizeInput(formModel);
    const normalizedSerial = normalizeInput(formSerial);
    const normalizedDesc = normalizeInput(formDesc);
    if (!normalizedType || !normalizedBrand || !normalizedModel || !normalizedSerial || !formOffice) {
      setFormError('Todos los campos obligatorios deben ser completados (incluyendo la oficina).');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const requestData: MaterialRequest = {
        materialType: normalizedType,
        brand: normalizedBrand,
        model: normalizedModel,
        serialNumber: normalizedSerial,
        description: normalizedDesc || null,
        status: formStatus,
        officePublicId: formOffice
      };
      await updateMaterial(selectedMaterial.publicCode, requestData);
      setShowEditModal(false);
      loadMaterials();
      showToast('Material actualizado exitosamente.');
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error al actualizar el material.');
      showToast(err instanceof Error ? err.message : 'Error al actualizar el material.', 'error');
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
      showToast('Material dado de baja.');
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error al dar de baja el material.');
      showToast(err instanceof Error ? err.message : 'Error al dar de baja el material.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReactivate = async (publicCode: string) => {
    if (!window.confirm('¿Está seguro de que desea dar de alta este material?')) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await reactivateMaterial(publicCode);
      loadMaterials();
      showToast('Material reactivado exitosamente.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al dar de alta el material.');
      showToast(err instanceof Error ? err.message : 'Error al dar de alta el material.', 'error');
      setLoading(false);
    }
  };

  // CSV Bulk Handlers
  const handleExportCsv = async () => {
    try {
      await exportMaterials();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al exportar materiales.');
    }
  };

  const validateCsv = (content: string): string[] => {
    const errors: string[] = [];
    const lines = content.split(/\r?\n/);
    if (lines.length < 2) {
      errors.push("El archivo CSV está vacío o no contiene filas de datos.");
      return errors;
    }
    
    const headers = lines[0].split(",");
    if (headers.length < 5) {
      errors.push("La cabecera del CSV debe contener al menos 5 columnas: tipo, marca, modelo, serie, oficina.");
      return errors;
    }

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const fields = line.split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/);
      if (fields.length < 5) {
        errors.push(`Línea ${i + 1}: Faltan campos. Debe tener al menos 5 valores separados por coma (Tipo, Marca, Modelo, Serie, Oficina).`);
        continue;
      }

      const materialType = fields[0]?.replace(/^"|"$/g, '').trim();
      const officeName = fields[4]?.replace(/^"|"$/g, '').trim();

      if (!materialType) {
        errors.push(`Línea ${i + 1}: El campo "Tipo de material" (columna 1) es obligatorio.`);
      }
      if (!officeName) {
        errors.push(`Línea ${i + 1}: El campo "Oficina" (columna 5) es obligatorio.`);
      }

      if (fields.length > 5) {
        const statusVal = fields[5]?.replace(/^"|"$/g, '').trim().toUpperCase();
        const validStatuses = ["OPERATIVO", "ROTO", "EN_REPARACION", "BAJA"];
        if (statusVal && !validStatuses.includes(statusVal)) {
          errors.push(`Línea ${i + 1}: El estado "${statusVal}" no es válido. Valores aceptados: OPERATIVO, ROTO, EN_REPARACION, BAJA.`);
        }
      }
    }
    return errors;
  };

  const handleImportCsv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result;
      if (typeof text !== 'string') {
        setError('Error al leer el contenido del archivo.');
        setImporting(false);
        e.target.value = '';
        return;
      }

      const validationErrors = validateCsv(text);
      if (validationErrors.length > 0) {
        setError(`Errores de validación en el archivo CSV:\n${validationErrors.slice(0, 8).join('\n')}${validationErrors.length > 8 ? `\n...y ${validationErrors.length - 8} errores más.` : ''}`);
        setImporting(false);
        e.target.value = '';
        return;
      }

      try {
        const res = await importMaterials(file);
        showToast('Importación masiva completada con éxito.');
        loadMaterials();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error al importar materiales.');
        showToast(err instanceof Error ? err.message : 'Error al importar materiales.', 'error');
      } finally {
        setImporting(false);
        e.target.value = '';
      }
    };
    reader.onerror = () => {
      setError('Error al abrir el archivo.');
      setImporting(false);
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  // QR Scanner Handlers
  const handleOpenScanner = () => {
    setScannerError(null);
    setShowScannerModal(true);
  };

  const startScanner = useCallback(async () => {
    setScannerError(null);
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode('qr-reader');
      qrScannerRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          let code = decodedText.trim();
          if (code.includes('/materials/')) {
            code = code.split('/materials/')[1].split('?')[0].split('#')[0];
          } else if (code.includes('/i/')) {
            code = code.split('/i/')[1].split('?')[0].split('#')[0];
          }
          
          if (code.startsWith('mat_')) {
            stopScanner();
            setShowScannerModal(false);
            window.location.href = `/materials/${code}`;
          } else {
            setScannerError(`Código QR no reconocido: "${decodedText}". Debe contener un código que empiece con 'mat_'.`);
          }
        },
        () => {
          // ignore frame scan errors
        }
      );
    } catch (err: any) {
      setScannerError(`Error al iniciar la cámara: ${err.message || err}`);
    }
  }, []);

  const stopScanner = useCallback(async () => {
    if (qrScannerRef.current) {
      try {
        await qrScannerRef.current.stop();
      } catch {
        // ignore
      }
      qrScannerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (showScannerModal) {
      const timer = setTimeout(() => {
        startScanner();
      }, 300);
      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    } else {
      stopScanner();
    }
  }, [showScannerModal, startScanner, stopScanner]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'OPERATIVO':
        return 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-950/50';
      case 'EN_REPARACION':
        return 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-250';
      case 'ROTO':
        return 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-950/50';
      case 'BAJA':
        return 'bg-slate-100 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700';
      default:
        return 'bg-slate-100 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700';
    }
  };

  const normalizeInput = (val: string | null | undefined): string => {
    if (!val) return '';
    return val
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase();
  };

  const suggestedTypes = Array.from(new Set([
    'ROUTER', 'SWITCH', 'ACCESS POINT', 'ORDENADOR', 'PORTATIL',
    'TELEFONO', 'IMPRESORA', 'PANTALLA', 'TECLADO', 'RATON',
    ...materials.map(m => m.materialType.toUpperCase())
  ]));

  const suggestedBrands = Array.from(new Set([
    'CISCO', 'MIKROTIK', 'UBIQUITI', 'HP', 'DELL',
    'LENOVO', 'APPLE', 'SAMSUNG', 'LG', 'LOGITECH',
    ...materials.map(m => m.brand?.toUpperCase()).filter(Boolean) as string[]
  ]));

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
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-50">Inventario de Materiales</h1>
          <p className="text-xs text-slate-600 dark:text-zinc-300 mt-1">Busca, filtra, edita o registra nuevos equipos en el sistema.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleOpenScanner}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700/40 text-xs font-bold text-slate-700 dark:text-zinc-100 px-4 py-2.5 transition shadow-sm"
          >
            <QrCode className="h-4 w-4" />
            Escanear QR
          </button>
          <button
            onClick={handleExportCsv}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700/40 text-xs font-bold text-slate-700 dark:text-zinc-100 px-4 py-2.5 transition shadow-sm"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </button>
          <label
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700/40 text-xs font-bold text-slate-700 dark:text-zinc-100 px-4 py-2.5 transition shadow-sm cursor-pointer"
          >
            {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Importar CSV
            <input
              type="file"
              accept=".csv"
              disabled={importing}
              onChange={handleImportCsv}
              className="hidden"
            />
          </label>
          <button
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-500 transition shadow-lg shadow-blue-500/20"
          >
            <Plus className="h-4 w-4" />
            Nuevo Material
          </button>
        </div>
      </div>

      {/* Filters bar */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 p-5 rounded-2xl shadow-sm">
        {/* Search by serial */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-600 dark:text-zinc-300 uppercase tracking-wider">Número de Serie</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-600 dark:text-zinc-300" />
            <input
              type="text"
              placeholder="Buscar..."
              value={serialQuery}
              onChange={(e) => setSerialQuery(e.target.value)}
              className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 dark:text-zinc-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
            />
          </div>
        </div>

        {/* Search by type */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-600 dark:text-zinc-300 uppercase tracking-wider">Tipo</label>
          <input
            type="text"
            placeholder="Ej: Router, Switch..."
            value={typeQuery}
            onChange={(e) => setTypeQuery(e.target.value)}
            className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-zinc-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* Office filter */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-600 dark:text-zinc-300 uppercase tracking-wider">Oficina</label>
          <select
            value={officeFilter}
            onChange={(e) => {
              setOfficeFilter(e.target.value);
              setPage(0);
            }}
            className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-blue-500 transition"
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
          <label className="text-[10px] font-bold text-slate-600 dark:text-zinc-300 uppercase tracking-wider">Estado</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-blue-500 transition"
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
            className="w-full py-2 border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:text-zinc-50 transition"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 dark:border-rose-950/50 bg-rose-50 dark:bg-rose-950/20 p-4 text-xs text-rose-700 dark:text-rose-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Materials Table */}
      {loading ? (
        /* Loading Skeletons */
        <div className="border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-2xl overflow-hidden p-6 space-y-4 shadow-sm">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : materials.length === 0 ? (
        /* Empty State */
        <div className="border border-dashed border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-2xl p-12 text-center shadow-sm">
          <AlertCircle className="mx-auto h-8 w-8 text-slate-700 dark:text-zinc-300" />
          <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-zinc-50">No se encontraron materiales</h3>
          <p className="mt-1 text-xs text-slate-700 dark:text-zinc-300">Prueba cambiando los filtros de búsqueda.</p>
        </div>
      ) : (
        /* Table data */
        <div className="border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs text-slate-700 dark:text-zinc-200">
              <thead className="border-b border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300">
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
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-700">
                {materials.map((item) => (
                  <tr key={item.publicCode} className="hover:bg-slate-50 dark:hover:bg-zinc-700/40 dark:bg-zinc-900 transition-colors">
                    <td className="px-6 py-4 font-mono text-slate-900 dark:text-zinc-50 font-bold">{item.publicCode}</td>
                    <td className="px-6 py-4 font-medium">{item.materialType}</td>
                    <td className="px-6 py-4">
                      {item.brand} <span className="text-slate-600 dark:text-zinc-300 font-light">|</span> {item.model}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-600 dark:text-zinc-300">{item.serialNumber}</td>
                    <td className="px-6 py-4 font-semibold text-slate-600 dark:text-zinc-300">
                      {item.officeName || <span className="text-slate-600 dark:text-zinc-300 font-light">Sin asignar</span>}
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
                          className="p-2 border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700/40 dark:bg-zinc-900 hover:text-slate-900 dark:text-zinc-50 rounded-lg transition"
                          title="Ver detalle"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
                        {item.status !== 'BAJA' ? (
                          <>
                            <button
                              onClick={() => handleOpenEdit(item)}
                              className="p-2 border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700/40 dark:bg-zinc-900 hover:text-slate-900 dark:text-zinc-50 rounded-lg transition"
                              title="Editar"
                            >
                              <Edit2 className="h-3.5 w-3.5 text-blue-600" />
                            </button>
                            <button
                              onClick={() => handleOpenDecommission(item)}
                              className="p-2 border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-rose-950/20 hover:border-rose-900/50 rounded-lg transition"
                              title="Dar de baja"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleReactivate(item.publicCode)}
                            className="p-2 border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-emerald-950/20 hover:border-emerald-900/50 rounded-lg transition text-emerald-600"
                            title="Dar de alta"
                          >
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          </button>
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
            <div className="border-t border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 px-6 py-4 flex items-center justify-between">
              <span className="text-xs text-slate-600 dark:text-zinc-300 font-medium">
                Mostrando <span className="text-slate-700 dark:text-zinc-200">{materials.length}</span> de{' '}
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

      {/* Modals Container */}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateSubmit} className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl shadow-sm w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600" />
            <div className="px-6 py-5 border-b border-slate-200 dark:border-zinc-700 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-50">Registrar Nuevo Material</h3>
              <button type="button" onClick={() => setShowCreateModal(false)} className="text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:text-zinc-100 p-1 rounded-lg hover:bg-slate-100 transition">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {formError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-950/50 text-rose-700 dark:text-rose-400 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-600 dark:text-zinc-300 font-semibold">Tipo de Material *</label>
                  <input
                    type="text"
                    required
                    value={formType}
                    onChange={(e) => setFormType(normalizeInput(e.target.value))}
                    onBlur={(e) => setFormType(normalizeInput(e.target.value))}
                    list="material-types"
                    placeholder="Ej: Router"
                    className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-50 uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-600 dark:text-zinc-300 font-semibold">Marca *</label>
                  <input
                    type="text"
                    required
                    value={formBrand}
                    onChange={(e) => setFormBrand(normalizeInput(e.target.value))}
                    onBlur={(e) => setFormBrand(normalizeInput(e.target.value))}
                    list="material-brands"
                    placeholder="Ej: MikroTik"
                    className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-50 uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-600 dark:text-zinc-300 font-semibold">Modelo *</label>
                  <input
                    type="text"
                    required
                    value={formModel}
                    onChange={(e) => setFormModel(normalizeInput(e.target.value))}
                    onBlur={(e) => setFormModel(normalizeInput(e.target.value))}
                    placeholder="Ej: RB4011"
                    className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-50 uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-600 dark:text-zinc-300 font-semibold">Número de Serie *</label>
                  <input
                    type="text"
                    required
                    value={formSerial}
                    onChange={(e) => setFormSerial(normalizeInput(e.target.value))}
                    onBlur={(e) => setFormSerial(normalizeInput(e.target.value))}
                    placeholder="Ej: SN12345678"
                    className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-50 uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-600 dark:text-zinc-300 font-semibold">Oficina Asignada</label>
                  <select
                    value={formOffice}
                    onChange={(e) => setFormOffice(e.target.value)}
                    required
                    className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-50"
                  >
                    <option value="" disabled>Seleccione una oficina...</option>
                    {offices.map((off) => (
                      <option key={off.publicId} value={off.publicId}>
                        {off.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-600 dark:text-zinc-300 font-semibold">Estado Inicial</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-50"
                  >
                    <option value="OPERATIVO">OPERATIVO</option>
                    <option value="EN_REPARACION">EN REPARACIÓN</option>
                    <option value="ROTO">ROTO</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-600 dark:text-zinc-300 font-semibold">Descripción / Notas</label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(normalizeInput(e.target.value))}
                  onBlur={(e) => setFormDesc(normalizeInput(e.target.value))}
                  placeholder="Agregar detalles adicionales del equipo..."
                  rows={3}
                  className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-50 resize-none uppercase"
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
                Guardar Registro
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleEditSubmit} className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl shadow-sm w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600" />
            <div className="px-6 py-5 border-b border-slate-200 dark:border-zinc-700 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-50">Editar Material</h3>
              <button type="button" onClick={() => setShowEditModal(false)} className="text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:text-zinc-100 p-1 rounded-lg hover:bg-slate-100 transition">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {formError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-950/50 text-rose-700 dark:text-rose-400 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-600 dark:text-zinc-300 font-semibold">Tipo de Material *</label>
                  <input
                    type="text"
                    required
                    value={formType}
                    onChange={(e) => setFormType(normalizeInput(e.target.value))}
                    onBlur={(e) => setFormType(normalizeInput(e.target.value))}
                    list="material-types"
                    className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-50 uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-600 dark:text-zinc-300 font-semibold">Marca *</label>
                  <input
                    type="text"
                    required
                    value={formBrand}
                    onChange={(e) => setFormBrand(normalizeInput(e.target.value))}
                    onBlur={(e) => setFormBrand(normalizeInput(e.target.value))}
                    list="material-brands"
                    className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-50 uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-600 dark:text-zinc-300 font-semibold">Modelo *</label>
                  <input
                    type="text"
                    required
                    value={formModel}
                    onChange={(e) => setFormModel(normalizeInput(e.target.value))}
                    onBlur={(e) => setFormModel(normalizeInput(e.target.value))}
                    className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-50 uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-600 dark:text-zinc-300 font-semibold">Número de Serie *</label>
                  <input
                    type="text"
                    required
                    value={formSerial}
                    onChange={(e) => setFormSerial(normalizeInput(e.target.value))}
                    onBlur={(e) => setFormSerial(normalizeInput(e.target.value))}
                    className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-50 uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-600 dark:text-zinc-300 font-semibold">Oficina Asignada</label>
                  <select
                    value={formOffice}
                    onChange={(e) => setFormOffice(e.target.value)}
                    required
                    className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-50"
                  >
                    <option value="" disabled>Seleccione una oficina...</option>
                    {offices.map((off) => (
                      <option key={off.publicId} value={off.publicId}>
                        {off.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-600 dark:text-zinc-300 font-semibold">Estado</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-50"
                  >
                    <option value="OPERATIVO">OPERATIVO</option>
                    <option value="EN_REPARACION">EN REPARACIÓN</option>
                    <option value="ROTO">ROTO</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-600 dark:text-zinc-300 font-semibold">Descripción / Notas</label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(normalizeInput(e.target.value))}
                  onBlur={(e) => setFormDesc(normalizeInput(e.target.value))}
                  rows={3}
                  className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-50 resize-none uppercase"
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

      {/* Decommission Modal */}
      {showDecommissionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleDecommissionSubmit} className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl shadow-sm w-full max-w-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-rose-600" />
            <div className="px-6 py-5 border-b border-slate-200 dark:border-zinc-700 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-50">Dar de Baja Material</h3>
              <button type="button" onClick={() => setShowDecommissionModal(false)} className="text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:text-zinc-100 p-1 rounded-lg hover:bg-slate-100 transition">
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

              <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                ¿Estás seguro de que deseas dar de baja este material? Esta acción es irreversible y retirará el material
                del inventario activo de Gestión De Inventario.
              </p>

              <div className="space-y-1">
                <label className="text-xs text-slate-600 dark:text-zinc-300 font-semibold">Comentario / Motivo de la baja *</label>
                <textarea
                  required
                  value={decommissionComment}
                  onChange={(e) => setDecommissionComment(e.target.value)}
                  placeholder="Ej: Desgaste irreparable, fuera de servicio oficial, robado, etc..."
                  rows={3}
                  className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-50 resize-none"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 dark:border-zinc-700 flex justify-end gap-2 bg-slate-50 dark:bg-zinc-900">
              <button
                type="button"
                onClick={() => setShowDecommissionModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:text-zinc-50 transition"
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

      {/* Scanner Modal */}
      {showScannerModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl shadow-sm w-full max-w-md shadow-2xl relative overflow-hidden flex flex-col">
            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600" />
            <div className="px-6 py-5 border-b border-slate-200 dark:border-zinc-700 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-50 flex items-center gap-2">
                <QrCode className="h-5 w-5 text-blue-600 animate-pulse" />
                Escanear Código QR
              </h3>
              <button
                type="button"
                onClick={() => setShowScannerModal(false)}
                className="text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:text-zinc-100 p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 flex-1 flex flex-col items-center">
              {scannerError && (
                <div className="w-full p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-950/50 text-rose-700 dark:text-rose-400 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{scannerError}</span>
                </div>
              )}

              <p className="text-xs text-slate-600 dark:text-zinc-300 text-center leading-relaxed max-w-xs">
                Apunta con la cámara trasera de tu dispositivo al código QR del material para ir directamente a sus detalles.
              </p>

              {/* Reader camera element */}
              <div className="w-full max-w-sm border border-slate-200 dark:border-zinc-700 rounded-2xl overflow-hidden bg-slate-950/5 relative aspect-square">
                <div id="qr-reader" className="w-full h-full overflow-hidden" />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 dark:border-zinc-700 flex justify-end bg-slate-50 dark:bg-zinc-900">
              <button
                type="button"
                onClick={() => setShowScannerModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:text-zinc-50 transition"
              >
                Cerrar Cámara
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Autocomplete Datalists */}
      <datalist id="material-types">
        {suggestedTypes.map((t) => (
          <option key={t} value={t} />
        ))}
      </datalist>
      <datalist id="material-brands">
        {suggestedBrands.map((b) => (
          <option key={b} value={b} />
        ))}
      </datalist>
    </div>
  );
}
