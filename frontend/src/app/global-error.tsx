"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import "@/app/globals.css";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("Critical System-Level Root Error caught:", error);
  }, [error]);

  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col justify-center items-center bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-50 p-6 relative overflow-hidden">
        {/* Background radial blurs */}
        <div className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-rose-600/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-amber-600/5 blur-3xl" />

        <div className="max-w-md w-full text-center z-10 space-y-6">
          {/* Critical Error icon container */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 text-white shadow-lg shadow-rose-500/10 mb-4 animate-pulse">
            <AlertTriangle className="h-9 w-9" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-50">
              Error Crítico del Sistema
            </h2>
            <p className="text-sm text-slate-600 dark:text-zinc-300">
              El sistema ha experimentado una falla crítica en su interfaz principal. Puede intentar recargar la aplicación completa o reiniciar los módulos.
            </p>
          </div>

          {error.message && (
            <div className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-4 text-xs font-mono text-slate-600 dark:text-zinc-300 text-left max-h-40 overflow-y-auto shadow-sm">
              <span className="text-rose-600 font-bold block mb-1">Detalle:</span>
              {error.message}
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={() => reset()}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:from-blue-500 hover:to-indigo-500 focus:outline-none shadow-lg shadow-blue-500/20 transition duration-200"
            >
              <RotateCcw className="h-4 w-4" />
              Reiniciar Aplicación
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
