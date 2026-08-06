import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiAuthLogin, apiAuthRegister, apiAuthMe, apiAuthUpdateProfile, getToken, setToken, clearToken } from '../services/auth';

interface User {
  id: string;
  rut: string;
  username: string;
  name: string;
  email: string | null;
  role: string;
  organization_id: number | null;
  theme_preference: 'light' | 'dark';
  color_palette: string | null;
  clinic_name: string | null;
  veterinarian_name: string | null;
  clinic_phone: string | null;
  clinic_address: string | null;
  smtp_email: string | null;
  notification_email_reminders: boolean;
  notification_upcoming_appointments: boolean;
  notification_push: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (data: { username: string; email: string; password: string; org_name?: string; org_type?: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Record<string, any>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSession = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) { setLoading(false); return; }
      const me = await apiAuthMe();
      setUser(me);
    } catch {
      await clearToken();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { checkSession(); }, [checkSession]);

  const login = async (identifier: string, password: string) => {
    const result = await apiAuthLogin(identifier, password);
    await setToken(result.token);
    setUser(result.user);
  };

  const register = async (data: { username: string; email: string; password: string; org_name?: string; org_type?: string }) => {
    const result = await apiAuthRegister(data);
    await setToken(result.token);
    setUser(result.user);
  };

  const logout = async () => {
    await clearToken();
    setUser(null);
  };

  const updateProfile = async (data: Record<string, any>) => {
    const updated = await apiAuthUpdateProfile(data);
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
