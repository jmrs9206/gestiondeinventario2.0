"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Lock, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { useBranding } from '@/modules/branding/hooks/useBranding';
import { getBrandingIcon } from '@/modules/branding/components/SettingsForm';
import { apiFetch } from '@/services/api-client';

function LoginContent() {
  const { login, isAuthenticated, loading, user } = useAuth();
  const { branding } = useBranding();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');

  // Invitation parameters
  const invitationToken = searchParams.get('invitationToken');
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [invitationSuccess, setInvitationSuccess] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const brandLogoUrl = branding.logoPngUrl || branding.logoUrl;

  // Pre-fill email from parameter if inviting
  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  // If already authenticated, redirect
  useEffect(() => {
    if (!loading && isAuthenticated) {
      if (redirectTo) {
        router.push(redirectTo);
      } else if (user?.role === 'ADMIN') {
        router.push('/dashboard');
      } else {
        router.push('/materials');
      }
    }
  }, [isAuthenticated, loading, router, redirectTo, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, rellene todos los campos');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await login(email, password);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al iniciar sesión. Compruebe sus credenciales.';
      setError(msg);
      setSubmitting(false);
    }
  };

  const handleAcceptInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setError('Por favor, rellene todos los campos');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await apiFetch('/api/v1/auth/accept-invitation', {
        method: 'POST',
        body: JSON.stringify({
          email: emailParam,
          token: invitationToken,
          password: newPassword
        })
      });

      setInvitationSuccess(true);
      setSubmitting(false);

      // Auto login on success
      await login(emailParam, newPassword);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al activar la cuenta. Verifique el enlace de invitación.';
      setError(msg);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-blue-500/25 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center p-6 relative overflow-hidden animate-fade-in">
      {/* Background radial blurs in metallic gray/zinc */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-zinc-400/5 dark:bg-zinc-300/5 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-zinc-600/5 dark:bg-zinc-500/5 blur-3xl" />

      <div className="w-full max-w-md z-10">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-500 to-zinc-700 dark:from-zinc-700 dark:to-zinc-900 text-white shadow-md mb-4 border border-zinc-400/20">
            {brandLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={brandLogoUrl} alt="Logo" className="h-8 w-8 object-contain rounded" />
            ) : (
              getBrandingIcon(branding.themeSettings?.icon || 'shield', "h-7 w-7 text-zinc-100")
            )}
          </div>
          <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight font-display">
            {branding.appName}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 font-medium">Panel de Control de Activos e Inventario</p>
        </div>

        {/* Form Card (Glassmorphic) */}
        <div className="glass-card rounded-3xl p-8 relative overflow-hidden shadow-xl shadow-zinc-200/50 dark:shadow-none">
          {invitationToken ? (
            <>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2 font-display">Activar Cuenta</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
                Configurando contraseña para: <strong className="text-zinc-700 dark:text-zinc-300">{emailParam}</strong>
              </p>

              {error && (
                <div className="mb-6 flex items-start gap-3 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/50 p-4 text-sm text-rose-700 dark:text-rose-300">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {invitationSuccess ? (
                <div className="text-center py-6 space-y-4">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <h4 className="text-md font-bold text-zinc-800 dark:text-zinc-100">Cuenta Activada</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Iniciando sesión automáticamente...</p>
                </div>
              ) : (
                <form onSubmit={handleAcceptInvitation} className="space-y-5">
                  {/* Password Field */}
                  <div className="space-y-2">
                    <label htmlFor="newPassword" className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Nueva Contraseña</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        id="newPassword"
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Mínimo 8 caracteres"
                        className="w-full rounded-2xl bg-white/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 pl-10 pr-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-800 focus:border-zinc-500 transition duration-200"
                      />
                    </div>
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Confirmar Contraseña</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        id="confirmPassword"
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repite la contraseña"
                        className="w-full rounded-2xl bg-white/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 pl-10 pr-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-800 focus:border-zinc-500 transition duration-200"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl btn-satin py-3 text-sm font-semibold hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition duration-200 cursor-pointer shadow-md"
                  >
                    {submitting ? 'Activando...' : 'Activar Cuenta e Ingresar'}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => router.push('/login')}
                      className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition duration-200"
                    >
                      Cancelar y volver al Login
                    </button>
                  </div>
                </form>
              )}
            </>
          ) : (
            <>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-6 font-display">Iniciar Sesión</h3>

              {error && (
                <div className="mb-6 flex items-start gap-3 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/50 p-4 text-sm text-rose-700 dark:text-rose-300">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Correo Electrónico</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ejemplo@tuempresa.com"
                      className="w-full rounded-2xl bg-white/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 pl-10 pr-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-800 focus:border-zinc-500 transition duration-200"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label htmlFor="password" className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Contraseña</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-2xl bg-white/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 pl-10 pr-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-800 focus:border-zinc-500 transition duration-200"
                    />
                  </div>
                </div>

                {/* Submit Button (Satin style) */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl btn-satin py-3 text-sm font-semibold hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition duration-200 cursor-pointer shadow-md"
                >
                  {submitting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    'Acceder al Panel'
                  )}
                </button>
              </form>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-blue-500/25 border-t-blue-500 rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
