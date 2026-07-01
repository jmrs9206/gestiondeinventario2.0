"use client";

import React from 'react';
import { useBranding } from '../hooks/useBranding';
import {
  Activity,
  Award,
  Building2,
  CheckCircle2,
  Database,
  Package,
  Palette,
  Server,
  Shield,
  Terminal
} from 'lucide-react';

export function getBrandingIcon(iconName: string, className = "h-6 w-6 text-blue-600 shrink-0") {
  switch (iconName) {
    case 'package':
      return <Package className={className} />;
    case 'building':
      return <Building2 className={className} />;
    case 'terminal':
      return <Terminal className={className} />;
    case 'award':
      return <Award className={className} />;
    case 'activity':
      return <Activity className={className} />;
    case 'shield':
    default:
      return <Shield className={className} />;
  }
}

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-[var(--brand-border)]/60 pb-4 sm:grid-cols-3 sm:gap-3">
      <span className="text-xs font-bold uppercase tracking-wider text-[var(--brand-text-muted)]">
        {label}
      </span>
      <span className="text-sm font-semibold text-foreground sm:col-span-2 break-all">
        {value || <span className="font-normal italic text-[var(--brand-text-muted)]">No definido</span>}
      </span>
    </div>
  );
}

export default function SettingsForm() {
  const { branding, loaded } = useBranding();
  const palette = branding.themeSettings?.palette;
  const brandLogoUrl = branding.logoPngUrl || branding.logoUrl;

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-black tracking-tight text-foreground">
          <Palette className="h-8 w-8 text-[var(--brand-accent)]" />
          Configuración del Sistema
        </h1>
        <p className="mt-2 text-sm text-[var(--brand-text-muted)]">
          Identidad corporativa servida por backend.
        </p>
      </div>

      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-2">
        <span className="text-sm">⚠️</span>
        <span>MODO DE LECTURA: El branding y la configuración visual del sistema (colores, logo, favicon, etc.) se definen exclusivamente desde el backend a través de variables de entorno o archivos de propiedades, no mediante el panel del cliente.</span>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <section className="space-y-6 lg:col-span-2">
          <div className="space-y-6 rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-6 shadow-sm">
            <h2 className="flex items-center gap-2 border-b border-[var(--brand-border)]/60 pb-3 text-lg font-bold text-foreground">
              <Database className="h-5 w-5 text-[var(--brand-accent)]" />
              Branding Activo Desde Backend
            </h2>

            <Field label="Aplicación" value={branding.appName} />
            <Field label="Empresa" value={branding.companyName} />
            <Field label="Logo PNG" value={branding.logoPngUrl} />
            <Field label="Logo Alternativo" value={branding.logoUrl} />
            <Field label="Favicon" value={branding.faviconUrl} />
            <Field label="Modo" value={branding.themeSettings?.mode || 'dark'} />
            <Field label="Color Primario" value={branding.primaryColor || branding.themeSettings?.color} />

            <div className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface-alt)] p-4 text-xs text-[var(--brand-text-muted)]">
              El frontend consume `/api/v1/branding` y aplica título, favicon, logo, nombre y paleta sin persistencia local ni controles de edición.
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-6 shadow-sm">
            <h2 className="flex items-center gap-2 border-b border-[var(--brand-border)]/60 pb-3 text-lg font-bold text-foreground">
              <Terminal className="h-5 w-5 text-[var(--brand-accent)]" />
              Estado
            </h2>
            <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
              <div className="space-y-1">
                <span className="font-bold uppercase tracking-wide text-[var(--brand-text-muted)]">Servicio Backend</span>
                <span className="flex items-center gap-1.5 font-semibold text-foreground">
                  <Server className="h-3.5 w-3.5 text-[var(--brand-text-muted)]" />
                  {typeof window !== 'undefined' ? (window.location.port === '3000' ? 'http://localhost:8080' : window.location.origin) : 'Cargando...'}
                </span>
              </div>
              <div className="space-y-1">
                <span className="font-bold uppercase tracking-wide text-[var(--brand-text-muted)]">Branding API</span>
                <span className="flex items-center gap-1 font-semibold text-[var(--brand-success)]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {loaded ? 'Cargado' : 'Cargando'}
                </span>
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <h2 className="px-1 text-xs font-bold uppercase tracking-wider text-[var(--brand-text-muted)]">
            Vista de Marca
          </h2>

          <div className="relative flex min-h-[300px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-6 shadow-inner">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
            <div className="z-10 w-60 space-y-4 rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface-alt)] p-4 shadow-md">
              <div className="flex items-center gap-2 border-b border-[var(--brand-border)] pb-3">
                {brandLogoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={brandLogoUrl}
                    alt="Logo preview"
                    className="h-7 w-7 shrink-0 rounded object-contain"
                  />
                ) : (
                  getBrandingIcon(branding.themeSettings?.icon || 'shield', 'h-7 w-7 shrink-0 text-[var(--brand-accent)]')
                )}
                <span className="truncate text-xs font-extrabold tracking-tight text-foreground">
                  {branding.appName}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {[
                  palette?.accent,
                  palette?.success,
                  palette?.warning,
                  palette?.danger,
                  palette?.info
                ].map((color, index) => (
                  <span
                    key={`${color}-${index}`}
                    className="h-8 rounded-lg border border-white/10"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
