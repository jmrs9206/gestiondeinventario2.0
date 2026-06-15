"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        const nextUrl = typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : '';
        router.push(nextUrl ? `/login?redirectTo=${encodeURIComponent(nextUrl)}` : '/login');
      }
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center">
        <div className="h-12 w-12 border-4 border-blue-500/25 border-t-blue-500 rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium animate-pulse">Verificando sesión...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-600 border border-rose-200 dark:border-rose-950/50">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-zinc-50">Acceso Denegado</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-zinc-300 max-w-sm">
          No tienes permisos suficientes para visualizar este módulo.
        </p>
        <button
          onClick={() => {
            if (user?.role === 'ADMIN') {
              router.push('/dashboard');
            } else {
              router.push('/materials');
            }
          }}
          className="mt-6 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors shadow-sm"
        >
          {user?.role === 'ADMIN' ? 'Volver al Dashboard' : 'Volver a Materiales'}
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
