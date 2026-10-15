import { create, isAxiosError } from 'axios';
import { Platform } from 'react-native';

const configuredUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api/v1';
export const API_URL = (Platform.OS === 'web' ? configuredUrl.replace('10.0.2.2', '127.0.0.1') : configuredUrl).replace(/\/$/, '');
export const SERVER_URL = API_URL.replace(/\/api\/v1$/, '');

export const api = create({ baseURL: API_URL, timeout: 15000, headers: { Accept: 'application/json' } });

export function setApiToken(token: string | null) {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
}

export function mediaUrl(path?: string | null) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith('/assets/') || path.startsWith('/storage/')) return `${SERVER_URL}${path}`;
  return `${SERVER_URL}/storage/${path.replace(/^\//, '')}`;
}

export function apiErrorMessage(error: unknown, fallback = 'No fue posible completar la solicitud.') {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string; errors?: Record<string, string[]> } | undefined;
    const firstError = data?.errors ? Object.values(data.errors).flat()[0] : undefined;
    return firstError ?? data?.message ?? (error.code === 'ECONNABORTED' ? 'El servidor tardó demasiado en responder.' : fallback);
  }
  return fallback;
}
