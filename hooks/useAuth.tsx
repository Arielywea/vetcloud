import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiAuthLogin, apiAuthMe, apiAuthUpdateProfile, getToken, setToken, clearToken } from '../services/auth';

interface User {
  id: string;
  rut: string;
  name: string;
  email: string | null;
  role: string;
  theme_preference: 'light' | 'dark';
  color_palette: string | null;
  clinic_name: string | null;
  veterinarian_name: string | null;
  clinic_phone: string | null;
  clinic_address: string | null;
  smtp_email: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (rut: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Record<string, any>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  login: async () => {},
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

  const login = async (rut: string, password: string) => {
    const result = await apiAuthLogin(rut, password);
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
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
