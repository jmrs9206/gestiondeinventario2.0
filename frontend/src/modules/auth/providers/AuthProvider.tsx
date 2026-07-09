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
  refreshSession: () => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface SessionResponse {
  publicId: string;
  email: string;
  role: string;
  permissions?: string[];
  mustChangePassword?: boolean;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const BASE_URL = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080');

  const applySession = useCallback((session: SessionResponse) => {
    setUser({
      publicId: session.publicId,
      email: session.email,
      role: session.role,
      permissions: session.permissions || [],
      mustChangePassword: !!session.mustChangePassword,
    });
    setIsAuthenticated(true);
    setLoading(false);
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    setIsAuthenticated(false);
    setLoading(false);

    try {
      fetch(`${BASE_URL}/api/v1/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({}),
      }).catch(() => {
        // Ignorar fallos de red en segundo plano
      });
    } catch {
      // Ignorar
    }
  }, [BASE_URL]);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        throw new Error('Refresh failed');
      }

      const responseData = await res.json();
      const data = responseData.data || responseData;
      applySession(data);
      return true;
    } catch {
      await logout();
    }
    return false;
  }, [BASE_URL, applySession, logout]);

  const login = async (email: string, password: string): Promise<boolean> => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
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

    const mustChange = !!data.mustChangePassword;
    applySession(data);
    return mustChange;
  };



  useEffect(() => {
    const initSession = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/v1/auth/session`, {
          method: 'GET',
          credentials: 'include',
        });
        if (response.ok) {
          const responseData = await response.json();
          applySession(responseData.data || responseData);
          return;
        }
      } catch {
        // Fall through to refresh
      }

      const refreshed = await refreshSession();
      if (!refreshed) {
        setLoading(false);
      }
    };

    initSession();
  }, [BASE_URL, applySession, refreshSession]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(async () => {
      await refreshSession();
    }, 120000);

    return () => clearInterval(interval);
  }, [isAuthenticated, refreshSession]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}
