"use client";

import React, { createContext, useState, useEffect, useCallback } from 'react';

export interface UserSession {
  publicId: string;
  email: string;
  role: string;
  permissions: string[];
  mustChangePassword?: boolean;
}

export interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<string | null>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const decoded = JSON.parse(jsonPayload);
    
    // Fallback for old tokens/sessions without permissions claim
    let permissions = decoded.permissions;
    if (!permissions || permissions.length === 0) {
      if (decoded.role === 'ADMIN') {
        permissions = [
          'CREATE_USER', 'READ_USER', 'UPDATE_USER', 
          'CREATE_OFFICE', 'UPDATE_OFFICE', 
          'CREATE_MATERIAL', 'UPDATE_MATERIAL', 'UPDATE_MATERIAL_STATUS', 'READ_MATERIAL_HISTORY',
          'READ_DASHBOARD', 'READ_AUDIT_LOG', 'MANAGE_API_CLIENTS', 'REGENERATE_QR', 'MANAGE_ROLES'
        ];
      } else if (decoded.role === 'TECNICO') {
        permissions = [
          'CREATE_OFFICE', 'UPDATE_OFFICE', 
          'CREATE_MATERIAL', 'UPDATE_MATERIAL', 'UPDATE_MATERIAL_STATUS', 'READ_MATERIAL_HISTORY'
        ];
      } else {
        permissions = [];
      }
    }

    return {
      publicId: decoded.public_id,
      email: decoded.sub,
      role: decoded.role,
      permissions: permissions,
      mustChangePassword: !!decoded.must_change_password,
      exp: decoded.exp,
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const BASE_URL = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080');

  const logout = useCallback(async () => {
    localStorage.removeItem('accessToken');
    setUser(null);
    setIsAuthenticated(false);
    setLoading(false);

    try {
      fetch(`${BASE_URL}/api/v1/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}), // El backend leerá la cookie
      }).catch(() => {
        // Ignorar fallos de red en segundo plano
      });
    } catch {
      // Ignorar
    }
  }, [BASE_URL]);

  const refreshSession = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}), // El backend leerá la cookie
      });

      if (!res.ok) {
        throw new Error('Refresh failed');
      }

      const responseData = await res.json();
      const data = responseData.data || responseData;
      
      const newAccess = data.accessToken;

      if (!newAccess) {
        throw new Error('Invalid refresh response');
      }

      localStorage.setItem('accessToken', newAccess);

      const decoded = parseJwt(newAccess);
      if (decoded) {
        setUser({
          publicId: decoded.publicId,
          email: decoded.email,
          role: decoded.role,
          permissions: decoded.permissions,
          mustChangePassword: decoded.mustChangePassword,
        });
        setIsAuthenticated(true);
        setLoading(false);
        return newAccess;
      }
    } catch {
      await logout();
    }
    return null;
  }, [BASE_URL, logout]);

  const login = async (email: string, password: string): Promise<boolean> => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      let message = 'Credenciales incorrectas';
      try {
        const err = await res.json();
        if (err?.error?.message) message = err.error.message;
        else if (err?.message) message = err.message;
      } catch {
        // Ignorar
      }
      throw new Error(message);
    }

    const responseData = await res.json();
    const data = responseData.data || responseData;

    const access = data.accessToken;
    const mustChange = !!data.mustChangePassword;

    // Almacenar únicamente el access token (el refresh token se maneja vía cookie HttpOnly)
    localStorage.setItem('accessToken', access);

    const decoded = parseJwt(access);
    if (decoded) {
      setUser({
        publicId: decoded.publicId,
        email: decoded.email,
        role: decoded.role,
        permissions: decoded.permissions,
        mustChangePassword: decoded.mustChangePassword,
      });
      setIsAuthenticated(true);
      return mustChange;
    } else {
      throw new Error('Token payload parsing error');
    }
  };



  // Inicializar sesión desde almacenamiento
  useEffect(() => {
    const initSession = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        // Intento de refresco silencioso en carga inicial por si existe la cookie
        const token = await refreshSession();
        if (!token) {
          setLoading(false);
        }
        return;
      }

      const decoded = parseJwt(accessToken);
      if (!decoded) {
        await logout();
        return;
      }

      // Comprobar si el token expira pronto (menos de 1 minuto)
      const bufferSeconds = 60;
      const nowInSeconds = Math.floor(Date.now() / 1000);
      if (decoded.exp - nowInSeconds < bufferSeconds) {
        await refreshSession();
      } else {
        setUser({
          publicId: decoded.publicId,
          email: decoded.email,
          role: decoded.role,
          permissions: decoded.permissions,
          mustChangePassword: decoded.mustChangePassword,
        });
        setIsAuthenticated(true);
        setLoading(false);
      }
    };

    initSession();
  }, [logout, refreshSession]);

  // Periodic refresh check every 2 minutes
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        const decoded = parseJwt(accessToken);
        if (decoded) {
          const bufferSeconds = 120;
          const nowInSeconds = Math.floor(Date.now() / 1000);
          if (decoded.exp - nowInSeconds < bufferSeconds) {
            await refreshSession();
          }
        }
      }
    }, 120000);

    return () => clearInterval(interval);
  }, [isAuthenticated, refreshSession]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}