"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Next.js Page Error boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] w-full flex flex-col justify-center items-center p-6 relative overflow-hidden bg-slate-50 dark:bg-zinc-900">
      {/* Background radial blurs */}
      <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-rose-600/5 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-amber-600/5 blur-3xl" />

      <div className="max-w-md w-full text-center z-10 space-y-6">
        {/* Error icon container */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 text-white shadow-lg shadow-rose-500/10 mb-4 animate-pulse">
          <AlertTriangle className="h-9 w-9" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-50">
            Ha ocurrido un problema
          </h2>
          <p className="text-sm text-slate-600 dark:text-zinc-300">
            El sistema encontró un error al intentar renderizar esta sección. No te preocupes, tus datos no se han perdido.
          </p>
        </div>

        {error.message && (
          <div className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-4 text-xs font-mono text-slate-600 dark:text-zinc-300 text-left max-h-40 overflow-y-auto shadow-sm">
            <span className="text-rose-600 font-bold block mb-1">Detalle del error:</span>
            {error.message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:from-blue-500 hover:to-indigo-500 focus:outline-none shadow-lg shadow-blue-500/20 transition duration-200"
          >
            <RotateCcw className="h-4 w-4" />
            Intentar de nuevo
          </button>
          
          <a
            href="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700/40 dark:bg-zinc-900 px-5 py-3 text-sm font-semibold text-slate-700 dark:text-zinc-200 transition duration-200 shadow-sm"
          >
            <Home className="h-4 w-4" />
            Ir al Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
