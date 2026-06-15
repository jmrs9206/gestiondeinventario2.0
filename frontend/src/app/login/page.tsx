"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Lock, Mail, AlertCircle, Shield } from 'lucide-react';

function LoginContent() {
  const { login, isAuthenticated, loading, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-blue-500/25 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Background radial blurs */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-blue-600/5 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-indigo-600/5 blur-3xl" />

      <div className="w-full max-w-md z-10">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/10 mb-4">
            <Shield className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-zinc-50 tracking-tight">Gestión De Inventario</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Acceso al panel de administración y control</p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl p-8 shadow-md relative overflow-hidden">
          <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100 mb-6">Iniciar sesión</h3>

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-950/50 p-4 text-sm text-rose-700 dark:text-rose-400">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Correo Electrónico</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 dark:text-zinc-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@tuempresa.com"
                  className="w-full rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 pl-10 pr-4 py-2.5 text-sm text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Contraseña</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 dark:text-zinc-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 pl-10 pr-4 py-2.5 text-sm text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-semibold text-white hover:from-blue-500 hover:to-indigo-500 focus:outline-none shadow-lg shadow-blue-500/20 disabled:opacity-50 transition duration-200"
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
