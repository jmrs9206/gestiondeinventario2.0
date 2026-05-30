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
  Users
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
    if (!formFirstName.trim() || !formLastName.trim() || !formEmail.trim() || !formPassword.trim()) {
      setFormError('Todos los campos son obligatorios.');
      return;
    }
    if (formPassword.length < 8) {
      setFormError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const req: UserCreateRequest = {
        firstName: formFirstName,
        lastName: formLastName,
        email: formEmail,
        password: formPassword,
        role: formRole
      };
      await createUser(req);
      setShowCreateModal(false);
      loadUsers();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error al crear el usuario.');
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
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error al actualizar el usuario.');
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
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error al reestablecer la contraseña.');
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cambiar estado del usuario.');
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-950 p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Users className="h-7 w-7 text-blue-500" />
            Administración de Usuarios
          </h1>
          <p className="text-xs text-slate-400 mt-1">Control de accesos corporativos y roles administrativos de VDEnergy.</p>
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
        <div className="flex items-center gap-3 rounded-xl border border-rose-900/50 bg-rose-500/5 p-4 text-xs text-rose-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Users table */}
      {loading ? (
        <div className="border border-slate-850 bg-slate-900/20 rounded-2xl overflow-hidden p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-slate-900/50 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="border border-dashed border-slate-800 rounded-2xl p-12 text-center">
          <Users className="mx-auto h-8 w-8 text-slate-650" />
          <h3 className="mt-3 text-sm font-semibold text-white">No hay usuarios registrados</h3>
        </div>
      ) : (
        <div className="border border-slate-850 bg-slate-900/20 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs text-slate-300">
              <thead className="border-b border-slate-850 bg-slate-900/40 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-4">Nombre Completo</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Rol</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {users.map((item) => (
                  <tr key={item.publicId} className="hover:bg-slate-900/20 transition-colors">
                    <td className="px-6 py-4 font-bold text-white">
                      {item.firstName} {item.lastName}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-450">{item.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase border ${
                        item.role === 'ADMIN'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                      }`}>
                        {item.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase border ${
                        item.active
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-450 border-rose-500/20'
                      }`}>
                        {item.active ? 'Activo' : 'Desactivado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {item.publicId !== currentUser?.publicId ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-2 border border-slate-800 bg-slate-900/40 hover:bg-slate-850 hover:text-white rounded-lg transition"
                            title="Editar Perfil/Rol"
                          >
                            <Edit2 className="h-3.5 w-3.5 text-blue-400" />
                          </button>
                          <button
                            onClick={() => handleOpenPassword(item)}
                            className="p-2 border border-slate-800 bg-slate-900/40 hover:bg-slate-850 hover:text-white rounded-lg transition"
                            title="Cambiar Contraseña"
                          >
                            <Key className="h-3.5 w-3.5 text-amber-500" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(item)}
                            className="p-2 border border-slate-800 bg-slate-900/40 hover:bg-slate-850 rounded-lg transition"
                            title={item.active ? 'Desactivar Cuenta' : 'Activar Cuenta'}
                          >
                            {item.active ? (
                              <ToggleRight className="h-4.5 w-4.5 text-emerald-400" />
                            ) : (
                              <ToggleLeft className="h-4.5 w-4.5 text-slate-500" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-550 italic pr-2">Sesión Activa</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-slate-850 bg-slate-900/20 px-6 py-4 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Mostrando <span className="text-slate-350">{users.length}</span> de{' '}
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
          <form onSubmit={handleCreateSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600" />
            <div className="px-6 py-5 border-b border-slate-850 flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Registrar Usuario</h3>
              <button type="button" onClick={() => setShowCreateModal(false)} className="text-slate-455 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-500/5 border border-rose-900/40 text-rose-455 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-450 font-semibold">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={formFirstName}
                    onChange={(e) => setFormFirstName(e.target.value)}
                    placeholder="Ej: Laura"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-450 font-semibold">Apellido *</label>
                  <input
                    type="text"
                    required
                    value={formLastName}
                    onChange={(e) => setFormLastName(e.target.value)}
                    placeholder="Ej: Gómez"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-450 font-semibold">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="ejemplo@vdenergy.es"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-450 font-semibold">Rol Asignado *</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-white"
                  >
                    <option value="TECNICO">TECNICO</option>
                    <option value="ADMIN">ADMIN (ADMINISTRADOR)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-450 font-semibold">Contraseña *</label>
                  <input
                    type="password"
                    required
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-white"
                  />
                </div>
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
                Guardar Usuario
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleEditSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600" />
            <div className="px-6 py-5 border-b border-slate-850 flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Editar Usuario</h3>
              <button type="button" onClick={() => setShowEditModal(false)} className="text-slate-455 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-500/5 border border-rose-900/40 text-rose-455 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-450 font-semibold">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={formFirstName}
                    onChange={(e) => setFormFirstName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-450 font-semibold">Apellido *</label>
                  <input
                    type="text"
                    required
                    value={formLastName}
                    onChange={(e) => setFormLastName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-450 font-semibold">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-450 font-semibold">Rol Asignado *</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-white"
                >
                  <option value="TECNICO">TECNICO</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-850 flex justify-end gap-2 bg-slate-900/60">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-slate-800 hover:bg-slate-850 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition"
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
          <form onSubmit={handlePasswordSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
            <div className="px-6 py-5 border-b border-slate-850 flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Reestablecer Contraseña</h3>
              <button type="button" onClick={() => setShowPasswordModal(false)} className="text-slate-455 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-500/5 border border-rose-900/40 text-rose-455 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {formError}
                </div>
              )}

              <p className="text-xs text-slate-400 leading-relaxed">
                Estás forzando un cambio de credenciales para el usuario{' '}
                <span className="font-bold text-white">
                  {selectedUser?.firstName} {selectedUser?.lastName}
                </span>
                .
              </p>

              <div className="space-y-1">
                <label className="text-xs text-slate-450 font-semibold">Nueva Contraseña *</label>
                <input
                  type="password"
                  required
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-white"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-850 flex justify-end gap-2 bg-slate-900/60">
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 border border-slate-800 hover:bg-slate-800 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-xs font-bold text-slate-900 transition flex items-center gap-2"
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
