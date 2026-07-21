import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

let storedToken: string | null = null;

export async function getToken(): Promise<string | null> {
  if (storedToken) return storedToken;
  storedToken = await AsyncStorage.getItem('vetcloud_token');
  return storedToken;
}

export async function setToken(token: string) {
  storedToken = token;
  await AsyncStorage.setItem('vetcloud_token', token);
}

export async function clearToken() {
  storedToken = null;
  await AsyncStorage.removeItem('vetcloud_token');
}

export async function apiAuthLogin(rut: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rut, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Error al iniciar sesión');
  return json.data;
}

export async function apiAuthMe() {
  const token = await getToken();
  if (!token) throw new Error('No hay token');
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Sesión expirada');
  return json.data;
}

export function authHeaders(): Record<string, string> {
  return storedToken ? { Authorization: `Bearer ${storedToken}` } : {};
}

export async function apiAuthUpdateProfile(data: Record<string, any>) {
  const token = await getToken();
  if (!token) throw new Error('No hay token');
  const res = await fetch(`${API_URL}/auth/profile`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Error al actualizar perfil');
  return json.data;
}
