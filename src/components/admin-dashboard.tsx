import { router, type Href } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AdminShell } from '@/components/admin-shell';
import { Button, Card, Loading } from '@/components/ui';
import { adminModules } from '@/constants/admin-modules';
import { Brand } from '@/constants/brand';
import { useAuth } from '@/providers/auth-provider';

export default function AdminDashboard() {
  const { user, loading, logout } = useAuth();
  useEffect(() => { if (!loading && !user) router.replace('/admin/login' as Href); }, [loading, user]);
  if (loading || !user) return <AdminShell title="Administración"><Loading label="Cargando administración…" /></AdminShell>;

  return <AdminShell title={`Hola, ${user.name}`} subtitle="Control móvil de Plaza Mayoreo" action={<Button variant="secondary" onPress={() => void logout()}>Salir</Button>}>
    <View style={styles.quickGrid}><QuickCard icon="▣" title="Productos" copy="Catálogo, estados y altas" onPress={() => router.push('/admin/products' as Href)} /><QuickCard icon="▦" title="Categorías" copy="Estructura del catálogo" onPress={() => router.push('/admin/categories' as Href)} /></View>
    {(['Operación', 'Contenido', 'Control'] as const).map((group) => <View key={group} style={styles.group}><Text style={styles.groupTitle}>{group}</Text><View style={styles.moduleGrid}>{adminModules.filter((module) => module.group === group).map((module) => <Pressable key={module.key} onPress={() => router.push(adminModuleRoute(module.key))} style={({ pressed }) => [styles.module, pressed && styles.pressed]}><View style={styles.iconBox}><Text style={styles.icon}>{module.icon}</Text></View><View style={styles.moduleCopy}><View style={styles.moduleTitleRow}><Text style={styles.moduleTitle}>{module.title}</Text>{module.native ? <Text style={styles.ready}>LISTO</Text> : <Text style={styles.bridge}>WEB</Text>}</View><Text style={styles.moduleDescription}>{module.description}</Text></View><Text style={styles.arrow}>›</Text></Pressable>)}</View></View>)}
    <Card style={styles.note}><Text style={styles.noteTitle}>Una sola operación</Text><Text style={styles.noteCopy}>La app comparte autenticación API y base de datos con Laravel. Los módulos marcados WEB ya tienen una vista móvil de transición, pero requieren un endpoint API para editar directamente.</Text></Card>
  </AdminShell>;
}

function QuickCard({ icon, title, copy, onPress }: { icon: string; title: string; copy: string; onPress: () => void }) { return <Pressable onPress={onPress} style={styles.quick}><Text style={styles.quickIcon}>{icon}</Text><Text style={styles.quickTitle}>{title}</Text><Text style={styles.quickCopy}>{copy}</Text><Text style={styles.quickAction}>Abrir ›</Text></Pressable>; }

function adminModuleRoute(key: string): Href {
  if (key === 'properties') return '/admin/properties' as Href;
  if (key === 'shipping') return '/admin/shipping' as Href;
  if (key === 'banners') return '/admin/banners' as Href;
  if (key === 'offers') return '/admin/offers' as Href;
  if (key === 'marketing') return '/admin/marketing' as Href;
  if (key === 'users') return '/admin/users' as Href;
  return { pathname: '/admin/[section]', params: { section: key } } as Href;
}

const styles = StyleSheet.create({ quickGrid: { flexDirection: 'row', gap: 10 }, quick: { flex: 1, minHeight: 150, padding: 16, borderRadius: 20, backgroundColor: Brand.purple, gap: 5 }, quickIcon: { color: Brand.yellow, fontSize: 28 }, quickTitle: { color: '#fff', fontSize: 19, fontWeight: '900' }, quickCopy: { flex: 1, color: '#EEDFFF', fontSize: 12, lineHeight: 17 }, quickAction: { color: Brand.yellow, fontWeight: '900' }, group: { gap: 9 }, groupTitle: { color: Brand.ink, fontSize: 13, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 }, moduleGrid: { gap: 8 }, module: { minHeight: 88, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 17, backgroundColor: '#fff', borderWidth: 1, borderColor: Brand.line }, pressed: { opacity: .7 }, iconBox: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: '#F2E8FA' }, icon: { color: Brand.purple, fontSize: 24, fontWeight: '900' }, moduleCopy: { flex: 1, gap: 4 }, moduleTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 }, moduleTitle: { color: Brand.ink, fontSize: 17, fontWeight: '900' }, moduleDescription: { color: Brand.muted, fontSize: 12, lineHeight: 16 }, ready: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 7, backgroundColor: '#D7F8EC', color: '#087C59', fontSize: 8, fontWeight: '900' }, bridge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 7, backgroundColor: '#FFF0C2', color: '#865900', fontSize: 8, fontWeight: '900' }, arrow: { color: Brand.magenta, fontSize: 28 }, note: { backgroundColor: '#FFFDF5' }, noteTitle: { color: Brand.ink, fontSize: 17, fontWeight: '900' }, noteCopy: { color: Brand.muted, lineHeight: 20 } });
