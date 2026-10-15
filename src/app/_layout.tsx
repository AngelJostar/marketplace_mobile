import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { Brand } from '@/constants/brand';
import { AuthProvider } from '@/providers/auth-provider';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerStyle: { backgroundColor: Brand.ink }, headerTintColor: '#fff', headerTitleStyle: { fontWeight: '800' }, contentStyle: { backgroundColor: Brand.cream } }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="catalog" options={{ headerShown: false }} />
        <Stack.Screen name="categories" options={{ headerShown: false }} />
        <Stack.Screen name="rentals" options={{ headerShown: false }} />
        <Stack.Screen name="products/[slug]" options={{ headerShown: false }} />
        <Stack.Screen name="admin/login" options={{ title: 'Acceso administrativo' }} />
        <Stack.Screen name="admin/index" options={{ headerShown: false }} />
        <Stack.Screen name="admin/[section]" options={{ headerShown: false }} />
        <Stack.Screen name="admin/properties/index" options={{ headerShown: false }} />
        <Stack.Screen name="admin/properties/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="admin/shipping/index" options={{ headerShown: false }} />
        <Stack.Screen name="admin/shipping/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="admin/banners/index" options={{ headerShown: false }} />
        <Stack.Screen name="admin/banners/editor" options={{ headerShown: false }} />
        <Stack.Screen name="admin/offers/index" options={{ headerShown: false }} />
        <Stack.Screen name="admin/offers/editor" options={{ headerShown: false }} />
        <Stack.Screen name="admin/marketing/index" options={{ headerShown: false }} />
        <Stack.Screen name="admin/marketing/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="admin/users/index" options={{ headerShown: false }} />
        <Stack.Screen name="admin/products/index" options={{ title: 'Productos' }} />
        <Stack.Screen name="admin/products/new" options={{ title: 'Nuevo producto' }} />
        <Stack.Screen name="admin/categories" options={{ title: 'Categorías' }} />
      </Stack>
    </AuthProvider>
  );
}
