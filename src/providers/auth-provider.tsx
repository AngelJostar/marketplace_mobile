import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';

import { api, setApiToken } from '@/services/api';
import type { ItemResponse, User } from '@/types/api';

const TOKEN_KEY = 'marketplace-admin-token';

async function readToken() {
  if (Platform.OS === 'web') return globalThis.localStorage?.getItem(TOKEN_KEY) ?? null;
  return SecureStore.getItemAsync(TOKEN_KEY);
}

async function writeToken(token: string | null) {
  if (Platform.OS === 'web') {
    if (token) globalThis.localStorage?.setItem(TOKEN_KEY, token);
    else globalThis.localStorage?.removeItem(TOKEN_KEY);
    return;
  }
  if (token) await SecureStore.setItemAsync(TOKEN_KEY, token);
  else await SecureStore.deleteItemAsync(TOKEN_KEY);
}

type AuthContextValue = { user: User | null; loading: boolean; login: (email: string, password: string) => Promise<void>; logout: () => Promise<void> };
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const token = await readToken();
      if (!token) return setLoading(false);
      setApiToken(token);
      try {
        const response = await api.get<ItemResponse<User>>('/me');
        setUser(response.data.data);
      } catch {
        setApiToken(null);
        await writeToken(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    login: async (email, password) => {
      const response = await api.post<ItemResponse<{ token: string; user: User }>>('/auth/login', { email, password, device_name: 'marketplace-mobile' });
      const { token, user: authenticatedUser } = response.data.data;
      setApiToken(token);
      await writeToken(token);
      setUser(authenticatedUser);
    },
    logout: async () => {
      try { await api.post('/auth/logout'); } catch { /* Close the local session even when offline. */ }
      setApiToken(null);
      await writeToken(null);
      setUser(null);
      router.replace('/');
    },
  }), [loading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider.');
  return context;
}
