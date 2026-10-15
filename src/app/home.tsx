export { default } from '@/components/marketplace-home';

/* Legacy placeholder retained temporarily for visual-history reference.
import { router, type Href } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { Button, Card } from '@/components/ui';
import { Brand } from '@/constants/brand';

export default function MarketplaceHomeScreen() {
  return (
    <Screen>
      <View style={styles.brand}><View style={styles.mark}><View style={styles.markCut} /></View><View><Text style={styles.kicker}>PLAZA MAYOREO</Text><Text style={styles.brandName}>Circunvalación</Text></View></View>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>EL CENTRO MAYORISTA DE LA CIUDAD</Text>
        <Text style={styles.heroTitle}>Todo para surtir y hacer crecer tu negocio.</Text>
        <Text style={styles.heroCopy}>Encuentra productos al mayoreo, regalos corporativos y opciones listas para personalizar.</Text>
        <Button variant="yellow" onPress={() => router.push('/catalog' as Href)}>Explorar catálogo</Button>
      </View>
      <View style={styles.stats}>
        <Card style={styles.stat}><Text style={styles.statValue}>+100</Text><Text style={styles.statLabel}>Locales</Text></Card>
        <Card style={styles.stat}><Text style={styles.statValue}>+5000</Text><Text style={styles.statLabel}>Productos</Text></Card>
        <Card style={styles.stat}><Text style={styles.statValue}>Mayoreo</Text><Text style={styles.statLabel}>Mejores precios</Text></Card>
      </View>
      <Card>
        <Text style={styles.sectionTitle}>¿Administras la plaza?</Text>
        <Text style={styles.copy}>Accede al panel móvil para consultar y agregar productos, categorías y configuraciones.</Text>
        <Button variant="secondary" onPress={() => router.push('/admin/login' as Href)}>Acceso administrativo</Button>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 8 }, mark: { width: 48, height: 48, borderRadius: 24, backgroundColor: Brand.purple, borderWidth: 9, borderColor: Brand.magenta, overflow: 'hidden' }, markCut: { position: 'absolute', width: 28, height: 18, right: -8, bottom: -5, backgroundColor: Brand.mint, transform: [{ rotate: '-20deg' }] }, kicker: { color: Brand.ink, fontSize: 11, fontWeight: '900' }, brandName: { color: Brand.purple, fontSize: 25, fontWeight: '900' },
  hero: { overflow: 'hidden', padding: 24, borderRadius: 26, backgroundColor: Brand.purple, gap: 14 }, eyebrow: { color: Brand.yellow, fontSize: 11, fontWeight: '900' }, heroTitle: { color: '#fff', fontSize: 38, lineHeight: 42, fontWeight: '900' }, heroCopy: { color: '#F1E7FF', fontSize: 16, lineHeight: 23 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, stat: { flex: 1, minWidth: 100, alignItems: 'center' }, statValue: { color: Brand.purple, fontSize: 20, fontWeight: '900' }, statLabel: { color: Brand.muted, fontSize: 11, textAlign: 'center' }, sectionTitle: { color: Brand.ink, fontSize: 20, fontWeight: '900' }, copy: { color: Brand.muted, lineHeight: 21 },
});
*/
