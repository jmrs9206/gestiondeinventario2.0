"use client";

import React, { createContext, useState, useEffect, useCallback } from 'react';

export interface UserSession {
  publicId: string;
  email: string;
  role: string;
}

export interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
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
    return {
      publicId: decoded.sub,
      email: decoded.email,
      role: decoded.role,
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

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await fetch(`${BASE_URL}/api/v1/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
      } catch {
        // Ignore network errors during logout
      }
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setIsAuthenticated(false);
    setLoading(false);
  }, [BASE_URL]);

  const refreshSession = useCallback(async (): Promise<string | null> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      await logout();
      return null;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        throw new Error('Refresh failed');
      }

      const responseData = await res.json();
      const data = responseData.data || responseData; // Support Spring ApiResponse structure if mapped
      
      const newAccess = data.accessToken;
      const newRefresh = data.refreshToken;

      if (!newAccess || !newRefresh) {
        throw new Error('Invalid refresh response');
      }

      localStorage.setItem('accessToken', newAccess);
      localStorage.setItem('refreshToken', newRefresh);

      const decoded = parseJwt(newAccess);
      if (decoded) {
        setUser({
          publicId: decoded.publicId,
          email: decoded.email,
          role: decoded.role,
        });
        setIsAuthenticated(true);
        return newAccess;
      }
    } catch {
      await logout();
    }
    return null;
  }, [BASE_URL, logout]);

  const login = async (email: string, password: string) => {
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
        // Ignore
      }
      throw new Error(message);
    }

    const responseData = await res.json();
    const data = responseData.data || responseData;

    const access = data.accessToken;
    const refresh = data.refreshToken;

    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);

    const decoded = parseJwt(access);
    if (decoded) {
      setUser({
        publicId: decoded.publicId,
        email: decoded.email,
        role: decoded.role,
      });
      setIsAuthenticated(true);
    } else {
      throw new Error('Token payload parsing error');
    }
  };



  // Initialize session from storage
  useEffect(() => {
    const initSession = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setLoading(false);
        return;
      }

      const decoded = parseJwt(accessToken);
      if (!decoded) {
        await logout();
        return;
      }

      // Check if access token is close to expiry (less than 1 min left)
      const bufferSeconds = 60;
      const nowInSeconds = Math.floor(Date.now() / 1000);
      if (decoded.exp - nowInSeconds < bufferSeconds) {
        await refreshSession();
      } else {
        setUser({
          publicId: decoded.publicId,
          email: decoded.email,
          role: decoded.role,
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
