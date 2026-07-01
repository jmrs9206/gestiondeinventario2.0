"use client";

import React, { useState, useEffect } from 'react';
import { fetchRolesPermissions, updateRolePermissions, RolesPermissionsMap } from '../services/role.service';
import {
  Shield,
  Save,
  Check,
  AlertCircle,
  Loader2,
  Info,
  Lock,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useBranding } from '@/modules/branding/hooks/useBranding';

interface PermissionDefinition {
  key: string;
  name: string;
  category: string;
  description: string;
}

const SYSTEM_PERMISSIONS: PermissionDefinition[] = [
  { key: 'READ_DASHBOARD', name: 'Ver Dashboard', category: 'General', description: 'Visualizar el panel de control, KPIs globales y estadísticas.' },
  { key: 'READ_AUDIT_LOG', name: 'Ver Auditoría Global', category: 'General', description: 'Acceder a los registros globales de auditoría de seguridad y operaciones.' },
  { key: 'MANAGE_ROLES', name: 'Gestionar Roles y Permisos', category: 'Seguridad', description: 'Modificar la matriz de permisos para los roles del sistema.' },
  { key: 'MANAGE_API_CLIENTS', name: 'Gestionar Clientes API', category: 'Seguridad', description: 'Administrar credenciales y scopes de integraciones externas.' },
  
  { key: 'READ_USER', name: 'Ver Usuarios', category: 'Usuarios', description: 'Listar y ver la información de perfil de los usuarios.' },
  { key: 'CREATE_USER', name: 'Crear Usuarios', category: 'Usuarios', description: 'Registrar nuevos empleados y técnicos en la plataforma.' },
  { key: 'UPDATE_USER', name: 'Editar/Actualizar Usuarios', category: 'Usuarios', description: 'Modificar perfiles, desactivar cuentas y reestablecer contraseñas.' },
  
  { key: 'CREATE_OFFICE', name: 'Crear Sedes', category: 'Sedes', description: 'Dar de alta nuevas oficinas y sedes de la empresa.' },
  { key: 'UPDATE_OFFICE', name: 'Editar Sedes', category: 'Sedes', description: 'Modificar nombres o desactivar/eliminar sedes existentes.' },
  
  { key: 'CREATE_MATERIAL', name: 'Crear Materiales', category: 'Inventario', description: 'Registrar nuevos materiales de forma individual o mediante importación masiva.' },
  { key: 'UPDATE_MATERIAL', name: 'Editar Materiales', category: 'Inventario', description: 'Actualizar la información técnica, marca, modelo o sede de un material.' },
  { key: 'UPDATE_MATERIAL_STATUS', name: 'Gestionar Estados de Baja', category: 'Inventario', description: 'Dar de baja, retirar o reactivar materiales con comentarios de justificación.' },
  { key: 'READ_MATERIAL_HISTORY', name: 'Ver Historial de Cambios', category: 'Inventario', description: 'Consultar el histórico de trazabilidad de cada material y exportar reportes.' },
  { key: 'REGENERATE_QR', name: 'Regenerar Códigos QR', category: 'Inventario', description: 'Forzar la regeneración del código QR único asociado a un material.' }
];

export default function RolesPermissionsTable() {
  const { user: currentUser } = useAuth();
  const { branding } = useBranding();
  const [rolePermissions, setRolePermissions] = useState<RolesPermissionsMap | null>(null);
  const [initialPermissions, setInitialPermissions] = useState<RolesPermissionsMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const loadPermissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchRolesPermissions();
      // Deep clone to track changes
      setRolePermissions(JSON.parse(JSON.stringify(res)));
      setInitialPermissions(JSON.parse(JSON.stringify(res)));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar los roles y permisos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPermissions();
  }, []);

  const handleTogglePermission = (role: string, permissionKey: string) => {
    if (!rolePermissions) return;

    // Safety lock: DO NOT let the current admin lock themselves out of MANAGE_ROLES!
    if (role === 'ADMIN' && permissionKey === 'MANAGE_ROLES' && currentUser?.role === 'ADMIN') {
      showToast('No puedes remover el permiso de gestión de roles a tu propio rol administrador.', 'error');
      return;
    }

    const currentPerms = rolePermissions[role] || [];
    let nextPerms: string[];

    if (currentPerms.includes(permissionKey)) {
      nextPerms = currentPerms.filter(p => p !== permissionKey);
    } else {
      nextPerms = [...currentPerms, permissionKey];
    }

    setRolePermissions({
      ...rolePermissions,
      [role]: nextPerms
    });
  };

  const handleSaveAll = async () => {
    if (!rolePermissions) return;
    setSaving(true);
    try {
      // Save ADMIN permissions first
      await updateRolePermissions('ADMIN', rolePermissions.ADMIN || []);
      // Save TECNICO permissions next
      const map2 = await updateRolePermissions('TECNICO', rolePermissions.TECNICO || []);
      
      setRolePermissions(map2);
      setInitialPermissions(JSON.parse(JSON.stringify(map2)));
      showToast('Matriz de roles y permisos actualizada exitosamente.');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error al guardar la matriz.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (initialPermissions) {
      setRolePermissions(JSON.parse(JSON.stringify(initialPermissions)));
      showToast('Cambios revertidos al estado guardado.');
    }
  };

  const isChanged = () => {
    return JSON.stringify(rolePermissions) !== JSON.stringify(initialPermissions);
  };

  const categories = Array.from(new Set(SYSTEM_PERMISSIONS.map(p => p.category)));
  const permissionCount = SYSTEM_PERMISSIONS.length;
  const adminCount = rolePermissions?.ADMIN?.length || 0;
  const tecnicoCount = rolePermissions?.TECNICO?.length || 0;
  const permissionsByCategory = categories.map((category) => ({
    category,
    permissions: SYSTEM_PERMISSIONS.filter((permission) => permission.category === category),
  }));

  const renderRoleControl = (role: 'ADMIN' | 'TECNICO', permission: PermissionDefinition) => {
    if (!rolePermissions) return null;

    const isChecked = (rolePermissions[role] || []).includes(permission.key);
    const isAdminProtected = role === 'ADMIN' && permission.key === 'MANAGE_ROLES';
    const activeColor = role === 'ADMIN' ? 'peer-checked:bg-blue-500' : 'peer-checked:bg-cyan-500';

    if (isAdminProtected) {
      return (
        <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-600 bg-slate-800 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-200">
          <Lock className="h-3 w-3 text-slate-400" />
          Requerido
        </div>
      );
    }

    return (
      <label className="relative inline-flex cursor-pointer items-center justify-center rounded-lg p-2 transition-colors hover:bg-slate-800">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={isChecked}
          aria-label={`${role === 'ADMIN' ? 'Administrador' : 'Técnico'}: ${permission.name}`}
          onChange={() => handleTogglePermission(role, permission.key)}
        />
        <div className={`h-6 w-11 rounded-full bg-slate-700 shadow-inner transition-colors ${activeColor} after:absolute after:left-[10px] after:top-[10px] after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow after:transition-transform after:content-[''] peer-checked:after:translate-x-5`} />
      </label>
    );
  };

  const renderPermissionInfo = (permission: PermissionDefinition) => (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-400 opacity-80" />
        <span className="font-black text-slate-50">{permission.name}</span>
      </div>
      <p className="max-w-2xl text-[11px] leading-relaxed text-slate-300">{permission.description}</p>
      <code className="inline-block rounded-md border border-slate-700 bg-slate-950/60 px-2 py-1 font-mono text-[9px] font-bold uppercase text-slate-300">
        {permission.key}
      </code>
    </div>
  );

  return (
    <div className="flex-1 bg-background p-4 md:p-8 space-y-6 relative animate-fade-in font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-300 ${
          toast.type === 'success' 
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
        }`}>
          {toast.type === 'success' ? <Check className="h-4 w-4 text-emerald-500" /> : <AlertCircle className="h-4 w-4 text-rose-500" />}
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-xl shadow-black/10">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600" />
        <div className="flex flex-col gap-5 p-5 md:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/30 bg-blue-500/15 text-blue-300">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white font-display">
                  Roles y Permisos
                </h1>
                <p className="text-xs text-slate-300 mt-1">
                  Configuración dinámica de acceso a módulos funcionales para {branding.appName}.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="grid grid-cols-3 gap-2 rounded-xl border border-slate-700 bg-slate-950/60 p-1.5">
              <div className="px-3 py-2 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Permisos</p>
                <p className="mt-0.5 text-sm font-black text-white">{permissionCount}</p>
              </div>
              <div className="px-3 py-2 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Admin</p>
                <p className="mt-0.5 text-sm font-black text-blue-300">{adminCount}</p>
              </div>
              <div className="px-3 py-2 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Técnico</p>
                <p className="mt-0.5 text-sm font-black text-cyan-300">{tecnicoCount}</p>
              </div>
            </div>

            <div className="flex gap-2">
              {isChanged() && (
                <button
                  onClick={handleReset}
                  disabled={loading || saving}
                  className="flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-200 transition hover:bg-slate-700 active:scale-95 disabled:opacity-40 cursor-pointer shadow-sm"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Descartar
                </button>
              )}
              <button
                onClick={handleSaveAll}
                disabled={loading || saving || !isChanged()}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-blue-500 active:scale-95 disabled:bg-slate-700 disabled:text-slate-400 disabled:opacity-100 cursor-pointer shadow-md shadow-blue-900/10 disabled:hover:scale-100"
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Guardar Matriz
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-600 dark:text-rose-400 font-sans">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Info Warning */}
      <div className="rounded-2xl border border-blue-400/20 bg-slate-900 p-4 text-xs text-slate-300 flex items-start gap-3 shadow-sm">
        <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-slate-100">Nota sobre la seguridad corporativa:</p>
          <p className="leading-relaxed">
            La modificación de la matriz afecta a la sesión activa de todos los usuarios en el próximo refresco de token. 
            El rol <strong className="text-white font-bold">ADMIN</strong> requiere tener acceso a la administración del sistema para no inhabilitar el control del panel.
          </p>
        </div>
      </div>

      {/* Matrix */}
      {loading ? (
        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-800/70 animate-pulse" />
          ))}
        </div>
      ) : !rolePermissions ? (
        <div className="rounded-2xl border border-slate-700 bg-slate-900 py-12 text-center text-xs text-slate-300">
          No se pudieron cargar los permisos.
        </div>
      ) : (
        <div className="space-y-5">
          <div className="hidden overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-xl shadow-black/10 lg:block">
            <div className="grid grid-cols-[minmax(420px,1fr)_180px_180px] border-b border-slate-700 bg-slate-950 text-[10px] font-black uppercase tracking-widest text-slate-400 font-display">
              <div className="px-6 py-4">Permiso / funcionalidad</div>
              <div className="border-l border-slate-700 px-6 py-4 text-center">Rol administrador</div>
              <div className="border-l border-slate-700 px-6 py-4 text-center">Rol técnico</div>
            </div>

            {permissionsByCategory.map(({ category, permissions }) => (
              <div key={category}>
                <div className="flex items-center justify-between border-y border-slate-700 bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-3 text-white">
                  <span className="font-black uppercase text-[10px] tracking-[0.22em] font-display">{category}</span>
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold text-white/80">{permissions.length} permisos</span>
                </div>

                {permissions.map((permission) => (
                  <div
                    key={permission.key}
                    className="grid grid-cols-[minmax(420px,1fr)_180px_180px] border-b border-slate-800 transition-colors hover:bg-slate-800/60"
                  >
                    <div className="px-6 py-4">{renderPermissionInfo(permission)}</div>
                    <div className="flex items-center justify-center border-l border-slate-800 px-6 py-4">
                      {renderRoleControl('ADMIN', permission)}
                    </div>
                    <div className="flex items-center justify-center border-l border-slate-800 px-6 py-4">
                      {renderRoleControl('TECNICO', permission)}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="space-y-4 lg:hidden">
            {permissionsByCategory.map(({ category, permissions }) => (
              <section key={category} className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-lg shadow-black/10">
                <div className="flex items-center justify-between bg-gradient-to-r from-slate-800 to-slate-700 px-4 py-3 text-white">
                  <span className="font-black uppercase text-[10px] tracking-[0.22em] font-display">{category}</span>
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold text-white/80">{permissions.length}</span>
                </div>

                <div className="divide-y divide-slate-800">
                  {permissions.map((permission) => (
                    <article key={permission.key} className="space-y-4 p-4">
                      {renderPermissionInfo(permission)}

                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-950/50 px-3 py-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-blue-300">Administrador</span>
                          {renderRoleControl('ADMIN', permission)}
                        </div>
                        <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-950/50 px-3 py-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300">Técnico</span>
                          {renderRoleControl('TECNICO', permission)}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
