"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchUsers,
  createUser,
  updateUser,
  changeUserStatus,
  changeUserPassword,
  UserResponse,
  UserCreateRequest,
  UserUpdateRequest
} from '../services/user.service';
import {
  Plus,
  Edit2,
  Key,
  ToggleLeft,
  ToggleRight,
  X,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Users,
  Check
} from 'lucide-react';
import { useAuth } from '@/modules/auth/hooks/useAuth';

export default function UsersTable() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);

  // Form states
  const [formFirstName, setFormFirstName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState('TECNICO');
  const [formPassword, setFormPassword] = useState('');
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

  const loadUsers = useCallback(async () => {
    if (!isMountedRef.current) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchUsers(page, 10);
      if (!isMountedRef.current) return;
      setUsers(res.content || []);
      setTotalPages(res.totalPages || 0);
      setTotalElements(res.totalElements || 0);
    } catch (err: unknown) {
      if (!isMountedRef.current) return;
      setError(err instanceof Error ? err.message : 'Error al cargar los usuarios.');
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [page]);

  useEffect(() => {
    isMountedRef.current = true;
    loadUsers();
    return () => {
      isMountedRef.current = false;
    };
  }, [loadUsers]);

  const handleOpenCreate = () => {
    setFormFirstName('');
    setFormLastName('');
    setFormEmail('');
    setFormRole('TECNICO');
    setFormPassword('');
    setFormError(null);
    setShowCreateModal(true);
  };

  const handleOpenEdit = (user: UserResponse) => {
    setSelectedUser(user);
    setFormFirstName(user.firstName);
    setFormLastName(user.lastName);
    setFormEmail(user.email);
    setFormRole(user.role);
    setFormError(null);
    setShowEditModal(true);
  };

  const handleOpenPassword = (user: UserResponse) => {
    setSelectedUser(user);
    setFormPassword('');
    setFormError(null);
    setShowPasswordModal(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFirstName.trim() || !formLastName.trim() || !formEmail.trim()) {
      setFormError('Todos los campos son obligatorios.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const req: UserCreateRequest = {
        firstName: formFirstName,
        lastName: formLastName,
        email: formEmail,
        role: formRole
      };
      await createUser(req);
      setShowCreateModal(false);
      loadUsers();
      showToast('Usuario creado exitosamente. Las credenciales de acceso se enviarán por correo.');
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error al crear el usuario.');
      showToast(err instanceof Error ? err.message : 'Error al crear el usuario.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (!formFirstName.trim() || !formLastName.trim() || !formEmail.trim()) {
      setFormError('Nombre, apellido y correo son obligatorios.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const req: UserUpdateRequest = {
        firstName: formFirstName,
        lastName: formLastName,
        email: formEmail,
        role: formRole
      };
      await updateUser(selectedUser.publicId, req);
      setShowEditModal(false);
      loadUsers();
      showToast('Usuario actualizado exitosamente.');
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error al actualizar el usuario.');
      showToast(err instanceof Error ? err.message : 'Error al actualizar el usuario.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (!formPassword.trim()) {
      setFormError('La contraseña no puede estar vacía.');
      return;
    }
    if (formPassword.length < 8) {
      setFormError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await changeUserPassword(selectedUser.publicId, formPassword);
      setShowPasswordModal(false);
      showToast('Contraseña restablecida exitosamente.');
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error al reestablecer la contraseña.');
      showToast(err instanceof Error ? err.message : 'Error al reestablecer la contraseña.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: UserResponse) => {
    const actionText = user.active ? 'desactivar' : 'activar';
    if (!window.confirm(`¿Estás seguro de que deseas ${actionText} al usuario "${user.firstName} ${user.lastName}"?`)) {
      return;
    }
    setLoading(true);
    try {
      await changeUserStatus(user.publicId, !user.active);
      loadUsers();
      showToast(user.active ? 'Usuario desactivado exitosamente.' : 'Usuario activado exitosamente.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cambiar estado del usuario.');
      showToast(err instanceof Error ? err.message : 'Error al cambiar estado del usuario.', 'error');
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
            <Users className="h-7 w-7 text-blue-600" />
            Administración de Usuarios
          </h1>
          <p className="text-xs text-slate-600 dark:text-zinc-300 mt-1">Control de accesos corporativos y roles administrativos de Gestión De Inventario.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-500 transition shadow-lg shadow-blue-500/20"
        >
          <Plus className="h-4 w-4" />
          Registrar Usuario
        </button>
      </div>

      {/* Error alert */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 dark:border-rose-950/50 bg-rose-50 dark:bg-rose-950/20 p-4 text-xs text-rose-700 dark:text-rose-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Users table */}
      {loading ? (
        <div className="border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-2xl overflow-hidden p-6 space-y-4 shadow-sm">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="border border-dashed border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-2xl p-12 text-center shadow-sm">
          <Users className="mx-auto h-8 w-8 text-slate-700 dark:text-zinc-300" />
          <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-zinc-50">No hay usuarios registrados</h3>
        </div>
      ) : (
        <div className="border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs text-slate-700 dark:text-zinc-200">
              <thead className="border-b border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300">
                <tr>
                  <th className="px-6 py-4">Nombre Completo</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Rol</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-700">
                {users.map((item) => (
                  <tr key={item.publicId} className="hover:bg-slate-50 dark:hover:bg-zinc-700/40 dark:bg-zinc-900 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-zinc-50">{`${item.firstName} ${item.lastName}`}</td>
                    <td className="px-6 py-4 font-mono text-slate-600 dark:text-zinc-300">{item.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase border ${
                        item.role === 'ADMIN'
                          ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                          : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                      }`}>
                        {item.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase border ${
                        item.active
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                      }`}>
                        {item.active ? 'Activo' : 'Desactivado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {item.email === 'admin@tuempresa.com' ? (
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-semibold italic pr-2">Protegido (Sistema)</span>
                      ) : item.publicId !== currentUser?.publicId ? (
                        <div className="flex justify-end gap-2">
                          <button
                            disabled={loading || submitting}
                            onClick={() => handleOpenEdit(item)}
                            className="p-2 border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700/40 dark:bg-zinc-900 hover:text-slate-900 dark:text-zinc-50 rounded-lg transition disabled:opacity-40"
                            title="Editar Perfil/Rol"
                          >
                            <Edit2 className="h-3.5 w-3.5 text-blue-600" />
                          </button>
                          <button
                            disabled={loading || submitting}
                            onClick={() => handleOpenPassword(item)}
                            className="p-2 border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700/40 dark:bg-zinc-900 hover:text-slate-900 dark:text-zinc-50 rounded-lg transition disabled:opacity-40"
                            title="Cambiar Contraseña"
                          >
                            <Key className="h-3.5 w-3.5 text-amber-500" />
                          </button>
                          <button
                            disabled={loading || submitting}
                            onClick={() => handleToggleStatus(item)}
                            className="p-2 border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700/40 dark:bg-zinc-900 rounded-lg transition disabled:opacity-40"
                            title={item.active ? 'Desactivar Cuenta' : 'Activar Cuenta'}
                          >
                            {item.active ? (
                              <ToggleRight className="h-4.5 w-4.5 text-emerald-400" />
                            ) : (
                              <ToggleLeft className="h-4.5 w-4.5 text-slate-600 dark:text-zinc-300" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-600 dark:text-zinc-300 italic pr-2">Sesión Activa</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 px-6 py-4 flex items-center justify-between">
              <span className="text-xs text-slate-600 dark:text-zinc-300 font-medium">
                Mostrando <span className="text-slate-700 dark:text-zinc-200">{users.length}</span> de{' '}
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
          <form onSubmit={handleCreateSubmit} className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl shadow-sm w-full max-w-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600" />
            <div className="px-6 py-5 border-b border-slate-200 dark:border-zinc-700 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-50">Registrar Usuario</h3>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-600 dark:text-zinc-300 font-semibold">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={formFirstName}
                    onChange={(e) => setFormFirstName(e.target.value)}
                    placeholder="Ej: Laura"
                    className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-600 dark:text-zinc-300 font-semibold">Apellido *</label>
                  <input
                    type="text"
                    required
                    value={formLastName}
                    onChange={(e) => setFormLastName(e.target.value)}
                    placeholder="Ej: Gómez"
                    className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-600 dark:text-zinc-300 font-semibold">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="ejemplo@tuempresa.com"
                  className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-600 dark:text-zinc-300 font-semibold">Rol Asignado *</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-50"
                >
                  <option value="TECNICO">TECNICO</option>
                  <option value="ADMIN">ADMIN (ADMINISTRADOR)</option>
                </select>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-2 italic">
                * Las credenciales de acceso se generarán aleatoriamente y se enviarán automáticamente por correo al nuevo usuario.
              </p>
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
                Registrar y Enviar Credenciales
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleEditSubmit} className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl shadow-sm w-full max-w-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600" />
            <div className="px-6 py-5 border-b border-slate-200 dark:border-zinc-700 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-50">Editar Usuario</h3>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-600 dark:text-zinc-300 font-semibold">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={formFirstName}
                    onChange={(e) => setFormFirstName(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-600 dark:text-zinc-300 font-semibold">Apellido *</label>
                  <input
                    type="text"
                    required
                    value={formLastName}
                    onChange={(e) => setFormLastName(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-600 dark:text-zinc-300 font-semibold">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-600 dark:text-zinc-300 font-semibold">Rol Asignado *</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-50"
                >
                  <option value="TECNICO">TECNICO</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 dark:border-zinc-700 flex justify-end gap-2 bg-slate-50 dark:bg-zinc-900">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700/40 dark:bg-zinc-900 rounded-lg text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:text-zinc-50 transition"
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

      {/* Password Reset Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handlePasswordSubmit} className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl shadow-sm w-full max-w-sm shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
            <div className="px-6 py-5 border-b border-slate-200 dark:border-zinc-700 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-50">Reestablecer Contraseña</h3>
              <button type="button" onClick={() => setShowPasswordModal(false)} className="text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:text-zinc-100 p-1 rounded-lg hover:bg-slate-100 transition">
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
                Estás forzando un cambio de credenciales para el usuario{' '}
                <span className="font-bold text-slate-900 dark:text-zinc-50">
                  {selectedUser?.firstName} {selectedUser?.lastName}
                </span>
                .
              </p>

              <div className="space-y-1">
                <label className="text-xs text-slate-600 dark:text-zinc-300 font-semibold">Nueva Contraseña *</label>
                <input
                  type="password"
                  required
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-50"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 dark:border-zinc-700 flex justify-end gap-2 bg-slate-50 dark:bg-zinc-900">
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:text-zinc-50 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-xs font-bold text-white transition flex items-center gap-2"
              >
                {submitting && <Loader2 className="h-3 w-3 animate-spin" />}
                Reestablecer Contraseña
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
