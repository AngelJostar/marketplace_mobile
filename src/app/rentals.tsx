import * as Linking from 'expo-linking';
import { StyleSheet, Text, View } from 'react-native';

import { PublicShell } from '@/components/public-shell';
import { Button, Card } from '@/components/ui';
import { Brand } from '@/constants/brand';

export default function RentalsScreen() {
  return (
    <PublicShell>
      <View style={styles.hero}><Text style={styles.kicker}>RENTA TU LOCAL</Text><Text style={styles.title}>Emprende o haz crecer tu negocio en Plaza Mayoreo Circunvalación.</Text><Text style={styles.copy}>Tenemos espacios comerciales para vender al mayoreo y menudeo en una zona de alta actividad, cerca de Metro Merced.</Text><Button variant="yellow" onPress={() => void Linking.openURL('https://wa.me/525510003000?text=Hola%2C%20quiero%20informacion%20para%20rentar%20un%20local.')}>Atención inmediata</Button></View>
      <Card><Text style={styles.cardTitle}>Ubicación estratégica</Text><Text style={styles.cardCopy}>Adolfo Gurrión esquina con Circunvalación, La Merced, Ciudad de México.</Text><Button variant="secondary" onPress={() => void Linking.openURL('https://maps.google.com/?q=Plaza+Mayoreo+Circunvalacion')}>Ver ubicación</Button></Card>
      <View style={styles.metrics}><Card style={styles.metric}><Text style={styles.value}>+100</Text><Text style={styles.label}>locales</Text></Card><Card style={styles.metric}><Text style={styles.value}>Mayoreo</Text><Text style={styles.label}>y menudeo</Text></Card></View>
    </PublicShell>
  );
}

const styles = StyleSheet.create({
  hero: { padding: 22, borderRadius: 25, backgroundColor: Brand.purple, gap: 14 }, kicker: { color: Brand.yellow, fontWeight: '900' }, title: { color: '#fff', fontSize: 33, lineHeight: 36, fontWeight: '900' }, copy: { color: '#F5EFFF', fontSize: 16, lineHeight: 23 }, cardTitle: { color: Brand.ink, fontSize: 22, fontWeight: '900' }, cardCopy: { color: Brand.muted, lineHeight: 21 }, metrics: { flexDirection: 'row', gap: 10 }, metric: { flex: 1, alignItems: 'center' }, value: { color: Brand.purple, fontSize: 22, fontWeight: '900' }, label: { color: Brand.muted },
});
