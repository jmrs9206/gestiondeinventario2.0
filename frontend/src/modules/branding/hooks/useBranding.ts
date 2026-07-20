"use client";

import { useState, useEffect } from 'react';
import { apiFetch } from '@/services/api-client';

export interface BrandingSettings {
  appName: string;
  companyName?: string;
  logoUrl?: string;
  logoPngUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  themeSettings?: {
    icon?: string;
    color?: string;
    mode?: 'light' | 'dark';
    palette?: {
      background?: string;
      surface?: string;
      surfaceAlt?: string;
      border?: string;
      text?: string;
      textMuted?: string;
      accent?: string;
      success?: string;
      warning?: string;
      danger?: string;
      info?: string;
    };
  };
}

const DEFAULT_BRANDING: BrandingSettings = {
  appName: 'GESTION DE INVENTARIO',
  companyName: '',
  logoUrl: '',
  logoPngUrl: '',
  faviconUrl: '',
  primaryColor: 'blue',
  themeSettings: {
    icon: 'shield',
    color: 'blue',
    mode: 'dark',
    palette: {
      background: '#1f232a',
      surface: '#282d35',
      surfaceAlt: '#303640',
      border: '#3b4555',
      text: '#f8fafc',
      textMuted: '#9fb0c7',
      accent: '#3b82f6',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      info: '#06b6d4'
    }
  }
};

function applyBrandingToDocument(branding: BrandingSettings) {
  if (typeof document === 'undefined') {
    return;
  }

  document.title = branding.appName;

  const faviconUrl = branding.faviconUrl || branding.logoPngUrl || branding.logoUrl;
  if (faviconUrl) {
    let favicon = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      document.head.appendChild(favicon);
    }
    favicon.href = faviconUrl;
  }

  const palette = branding.themeSettings?.palette;
  if (palette) {
    const rootStyle = document.documentElement.style;
    if (palette.background) rootStyle.setProperty('--background', palette.background);
    if (palette.text) rootStyle.setProperty('--foreground', palette.text);
    if (palette.surface) rootStyle.setProperty('--brand-surface', palette.surface);
    if (palette.surfaceAlt) rootStyle.setProperty('--brand-surface-alt', palette.surfaceAlt);
    if (palette.border) rootStyle.setProperty('--brand-border', palette.border);
    if (palette.textMuted) rootStyle.setProperty('--brand-text-muted', palette.textMuted);
    if (palette.accent) rootStyle.setProperty('--brand-accent', palette.accent);
    if (palette.success) rootStyle.setProperty('--brand-success', palette.success);
    if (palette.warning) rootStyle.setProperty('--brand-warning', palette.warning);
    if (palette.danger) rootStyle.setProperty('--brand-danger', palette.danger);
    if (palette.info) rootStyle.setProperty('--brand-info', palette.info);
  }

  if (branding.themeSettings?.mode === 'dark') {
    document.documentElement.classList.add('dark');
  } else if (branding.themeSettings?.mode === 'light') {
    document.documentElement.classList.remove('dark');
  }
}

export function useBranding() {
  const [branding, setBranding] = useState<BrandingSettings>(DEFAULT_BRANDING);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    async function loadBranding() {
      try {
        const isTestEnv = typeof process !== 'undefined' && process.env.NODE_ENV === 'test';
        const urlPath = isTestEnv ? 'http://127.0.0.1:8080/api/v1/branding' : '/api/v1/branding';
        const data = await apiFetch<BrandingSettings>(urlPath);
        if (isMounted && data) {
          setBranding({
            appName: data.appName || DEFAULT_BRANDING.appName,
            companyName: data.companyName || DEFAULT_BRANDING.companyName,
            logoUrl: data.logoUrl || '',
            logoPngUrl: data.logoPngUrl || '',
            faviconUrl: data.faviconUrl || '',
            primaryColor: data.primaryColor || data.themeSettings?.color || DEFAULT_BRANDING.primaryColor,
            themeSettings: {
              icon: data.themeSettings?.icon || DEFAULT_BRANDING.themeSettings?.icon,
              color: data.themeSettings?.color || DEFAULT_BRANDING.themeSettings?.color,
              mode: data.themeSettings?.mode || DEFAULT_BRANDING.themeSettings?.mode,
              palette: {
                ...DEFAULT_BRANDING.themeSettings?.palette,
                ...data.themeSettings?.palette
              }
            }
          });
        }
      } catch (e) {
        if (typeof process === 'undefined' || process.env.NODE_ENV !== 'test') {
          console.error('Failed to load branding from backend', e);
        }
      } finally {
        if (isMounted) {
          setLoaded(true);
        }
      }
    }

    loadBranding();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (loaded) {
      applyBrandingToDocument(branding);
    }
  }, [branding, loaded]);

  return { branding, loaded };
}
