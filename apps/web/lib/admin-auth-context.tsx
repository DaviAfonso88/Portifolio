'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: AdminUser | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  authFetch: (url: string, init?: RequestInit) => Promise<Response>;
}

const AdminAuthContext = createContext<AuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  const refreshSession = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch('/api/v1/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        setAccessToken(null);
        setUser(null);
        return null;
      }
      const data = await res.json();
      const newToken = data.accessToken as string;
      setAccessToken(newToken);

      // Fetch user profile
      const meRes = await fetch('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${newToken}` },
      });
      if (meRes.ok) {
        const meData = await meRes.json();
        setUser(meData.user);
      }
      return newToken;
    } catch {
      setAccessToken(null);
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    async function init() {
      await refreshSession();
      if (mounted) setIsLoading(false);
    }
    init();
    return () => {
      mounted = false;
    };
  }, [refreshSession]);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        return {
          success: false,
          error: errData.message || (res.status === 429 ? 'Muitas tentativas. Tente novamente mais tarde.' : 'E-mail ou senha inválidos.'),
        };
      }

      const data = await res.json();
      setAccessToken(data.accessToken);
      setUser(data.user);
      return { success: true };
    } catch {
      return { success: false, error: 'Falha de comunicação com o servidor.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    } finally {
      setAccessToken(null);
      setUser(null);
      router.push('/admin/login');
    }
  };

  const authFetch = useCallback(
    async (url: string, init?: RequestInit): Promise<Response> => {
      let token = accessToken;
      const headers = new Headers(init?.headers || {});
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      let res = await fetch(url, { ...init, headers });

      if (res.status === 401) {
        // Token might have expired, try refresh
        const refreshedToken = await refreshSession();
        if (refreshedToken) {
          headers.set('Authorization', `Bearer ${refreshedToken}`);
          res = await fetch(url, { ...init, headers });
        } else {
          // Refresh failed
          router.push('/admin/login');
        }
      }

      return res;
    },
    [accessToken, refreshSession, router]
  );

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        login,
        logout,
        authFetch,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
