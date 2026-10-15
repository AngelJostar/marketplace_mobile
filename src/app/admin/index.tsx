export { default } from '@/components/admin-dashboard';

/* Previous dashboard retained temporarily for implementation-history reference.
import { router, type Href } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { Button, Card, Loading } from '@/components/ui';
import { Brand } from '@/constants/brand';
import { useAuth } from '@/providers/auth-provider';

const modules = [
  { title: 'Productos', description: 'Consulta y agrega productos.', route: '/admin/products' as const, enabled: true },
  { title: 'Categorías', description: 'Consulta la estructura del catálogo.', route: '/admin/categories' as const, enabled: true },
  { title: 'Vendedores', description: 'Administración de proveedores.', enabled: false },
  { title: 'Inventarios', description: 'Existencias y movimientos.', enabled: false },
  { title: 'Configuración', description: 'Banners, ofertas y marketing.', enabled: false },
];

export default function AdminHomeScreen() {
  const { user, loading, logout } = useAuth();
  useEffect(() => { if (!loading && !user) router.replace('/admin/login' as Href); }, [loading, user]);
  if (loading || !user) return <Screen><Loading label="Cargando administración…" /></Screen>;
  return <Screen title={`Hola, ${user.name}`} subtitle="Panel administrativo de Plaza Mayoreo" action={<Button variant="secondary" onPress={() => void logout()}>Salir</Button>}><View style={styles.grid}>{modules.map((module) => <Pressable key={module.title} disabled={!module.enabled} onPress={() => module.route && router.push(module.route as Href)} style={({ pressed }) => [styles.module, !module.enabled && styles.disabled, pressed && styles.pressed]}><Text style={styles.moduleTitle}>{module.title}</Text><Text style={styles.moduleCopy}>{module.description}</Text><Text style={styles.moduleAction}>{module.enabled ? 'Abrir →' : 'Próximamente'}</Text></Pressable>)}</View><Card><Text style={styles.note}>La aplicación consume la misma API y base de datos que el proyecto Laravel. Los cambios hechos aquí se reflejan en el panel web.</Text></Card></Screen>;
}

const styles = StyleSheet.create({ grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 }, module: { width: '48%', minHeight: 145, flexGrow: 1, padding: 18, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: Brand.line, gap: 8 }, disabled: { opacity: .55 }, pressed: { opacity: .7 }, moduleTitle: { color: Brand.ink, fontSize: 20, fontWeight: '900' }, moduleCopy: { flex: 1, color: Brand.muted, lineHeight: 19 }, moduleAction: { color: Brand.purple, fontWeight: '900' }, note: { color: Brand.muted, lineHeight: 21 } });
*/
