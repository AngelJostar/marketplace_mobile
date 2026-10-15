import * as Linking from 'expo-linking';
import { router, type Href, usePathname } from 'expo-router';
import { type PropsWithChildren, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand } from '@/constants/brand';

type Props = PropsWithChildren<{ contentStyle?: ViewStyle; showHeader?: boolean }>;

const whatsappUrl = 'https://wa.me/525510003000?text=Hola%2C%20quiero%20informacion%20de%20Plaza%20Mayoreo%20Circunvalacion.';

export function PublicShell({ children, contentStyle, showHeader = true }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const pathname = usePathname();

  const navigate = (href: Href) => {
    setMenuOpen(false);
    router.push(href);
  };

  const submitSearch = () => {
    router.push({ pathname: '/catalog', params: search.trim() ? { q: search.trim() } : {} } as Href);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {showHeader ? (
        <View style={styles.header}>
          <View style={styles.topRow}>
            <Pressable accessibilityLabel="Abrir menú" onPress={() => setMenuOpen(true)} style={styles.iconButton}><Text style={styles.menuGlyph}>☰</Text></Pressable>
            <Pressable onPress={() => navigate('/home' as Href)} style={styles.brand}>
              <View style={styles.mark}><View style={styles.markCut} /></View>
              <View><Text style={styles.kicker}>PLAZA MAYOREO</Text><Text style={styles.brandName}>Circunvalación</Text></View>
            </Pressable>
            <Pressable accessibilityLabel="Acceso administrativo" onPress={() => navigate('/admin/login' as Href)} style={styles.accountButton}><Text style={styles.accountGlyph}>♙</Text></Pressable>
          </View>
          <Pressable onPress={() => void Linking.openURL('https://maps.google.com/?q=Plaza+Mayoreo+Circunvalacion')} style={styles.address}>
            <Text style={styles.addressText}>Adolfo Gurrión esquina con Circunvalación, La Merced, Ciudad de México</Text>
          </Pressable>
          <Pressable onPress={() => void Linking.openURL(whatsappUrl)} style={styles.whatsapp}><Text style={styles.whatsappText}>◉  RENTA TU LOCAL. ATENCIÓN INMEDIATA.</Text></Pressable>
          <View style={styles.searchRow}>
            <Text style={styles.searchGlyph}>⌕</Text>
            <TextInput value={search} onChangeText={setSearch} onSubmitEditing={submitSearch} placeholder="Buscar productos" placeholderTextColor="#8B8390" returnKeyType="search" style={styles.search} />
            <Pressable onPress={submitSearch} style={styles.aiButton}><Text style={styles.aiText}>✦ IA</Text></Pressable>
          </View>
        </View>
      ) : null}

      <ScrollView contentContainerStyle={[styles.content, contentStyle]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>{children}</ScrollView>

      <View style={styles.bottomNav}>
        <BottomItem icon="⌂" label="Inicio" active={pathname === '/home'} onPress={() => navigate('/home' as Href)} />
        <BottomItem icon="▣" label="Productos" active={pathname === '/catalog' || pathname.startsWith('/products/')} onPress={() => navigate('/catalog' as Href)} />
        <BottomItem icon="▦" label="Categorías" active={pathname === '/categories'} onPress={() => navigate('/categories' as Href)} />
        <BottomItem icon="⌖" label="Locales" active={pathname === '/rentals'} onPress={() => navigate('/rentals' as Href)} />
      </View>

      <Modal animationType="fade" transparent visible={menuOpen} onRequestClose={() => setMenuOpen(false)}>
        <View style={styles.overlay}>
          <View style={styles.drawer}>
            <View style={styles.drawerHead}><View><Text style={styles.kicker}>PLAZA MAYOREO</Text><Text style={styles.drawerTitle}>Circunvalación</Text></View><Pressable onPress={() => setMenuOpen(false)}><Text style={styles.close}>×</Text></Pressable></View>
            <DrawerItem label="Inicio" onPress={() => navigate('/home' as Href)} />
            <DrawerItem label="Categorías" onPress={() => navigate('/categories' as Href)} />
            <DrawerItem label="Productos" onPress={() => navigate('/catalog' as Href)} />
            <DrawerItem label="Promociones" onPress={() => navigate({ pathname: '/catalog', params: { sort: 'sales' } } as Href)} />
            <DrawerItem label="Renta tu local" onPress={() => navigate('/rentals' as Href)} />
            <DrawerItem label="Favoritos" muted onPress={() => navigate('/catalog' as Href)} />
            <DrawerItem label="Pedidos" muted onPress={() => navigate('/admin/login' as Href)} />
            <DrawerItem label="Carrito" muted onPress={() => navigate('/catalog' as Href)} />
            <DrawerItem label="Cuenta / administración" onPress={() => navigate('/admin/login' as Href)} />
            <Pressable onPress={() => void Linking.openURL(whatsappUrl)} style={styles.drawerCta}><Text style={styles.drawerCtaText}>ATENCIÓN INMEDIATA</Text></Pressable>
          </View>
          <Pressable style={styles.dismissArea} onPress={() => setMenuOpen(false)} />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function BottomItem({ icon, label, active, onPress }: { icon: string; label: string; active: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={styles.bottomItem}><Text style={[styles.bottomIcon, active && styles.active]}>{icon}</Text><Text style={[styles.bottomLabel, active && styles.active]}>{label}</Text></Pressable>;
}

function DrawerItem({ label, onPress, muted = false }: { label: string; onPress: () => void; muted?: boolean }) {
  return <Pressable onPress={onPress} style={styles.drawerItem}><Text style={[styles.drawerItemText, muted && styles.drawerMuted]}>{label}</Text><Text style={styles.chevron}>›</Text></Pressable>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.cream },
  header: { backgroundColor: Brand.yellow, paddingHorizontal: 14, paddingTop: 8, paddingBottom: 12, gap: 8, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 10 }, iconButton: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }, menuGlyph: { color: Brand.ink, fontSize: 25, fontWeight: '900' },
  brand: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }, mark: { width: 39, height: 39, borderRadius: 20, backgroundColor: Brand.purple, borderWidth: 8, borderColor: Brand.magenta, overflow: 'hidden' }, markCut: { position: 'absolute', width: 24, height: 15, right: -8, bottom: -4, backgroundColor: Brand.mint, transform: [{ rotate: '-20deg' }] }, kicker: { color: Brand.ink, fontSize: 9, fontWeight: '900' }, brandName: { color: Brand.purple, fontSize: 20, fontWeight: '900' },
  accountButton: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: Brand.magenta, borderWidth: 2, borderColor: '#fff' }, accountGlyph: { color: '#fff', fontSize: 25, fontWeight: '900' },
  address: { padding: 11, borderRadius: 14, backgroundColor: '#FFF2A4', borderWidth: 1, borderColor: '#F3D870' }, addressText: { color: Brand.ink, fontSize: 15, lineHeight: 19, fontWeight: '900' },
  whatsapp: { minHeight: 42, borderRadius: 22, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, backgroundColor: '#48E700', borderWidth: 2, borderColor: '#fff' }, whatsappText: { color: '#103A00', fontSize: 13, textAlign: 'center', fontWeight: '900' },
  searchRow: { minHeight: 44, flexDirection: 'row', alignItems: 'center', borderRadius: 23, backgroundColor: '#fff', borderWidth: 2, borderColor: Brand.magenta, paddingHorizontal: 12 }, searchGlyph: { color: Brand.purple, fontSize: 24 }, search: { flex: 1, color: Brand.ink, fontSize: 16, paddingHorizontal: 8 }, aiButton: { paddingVertical: 8, paddingHorizontal: 9, borderRadius: 16, backgroundColor: '#E9F9FF' }, aiText: { color: '#11A0C4', fontWeight: '900' },
  content: { padding: 14, paddingBottom: 100, gap: 18, maxWidth: 760, width: '100%', alignSelf: 'center' },
  bottomNav: { minHeight: 72, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingBottom: 8, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: Brand.line }, bottomItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 }, bottomIcon: { color: Brand.purple, fontSize: 25, fontWeight: '900' }, bottomLabel: { color: Brand.ink, fontSize: 11, fontWeight: '800' }, active: { color: Brand.magenta },
  overlay: { flex: 1, flexDirection: 'row', backgroundColor: 'rgba(17,0,35,.55)' }, drawer: { width: '82%', maxWidth: 360, height: '100%', paddingTop: 50, paddingHorizontal: 22, backgroundColor: '#fff' }, dismissArea: { flex: 1 }, drawerHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }, drawerTitle: { color: Brand.purple, fontSize: 26, fontWeight: '900' }, close: { color: Brand.ink, fontSize: 40 }, drawerItem: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: Brand.line }, drawerItemText: { color: Brand.ink, fontSize: 17, fontWeight: '800' }, drawerMuted: { color: Brand.muted }, chevron: { color: Brand.magenta, fontSize: 26 }, drawerCta: { marginTop: 24, minHeight: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: '#47E800' }, drawerCtaText: { color: '#123800', fontWeight: '900' },
});
