import { Image } from 'expo-image';
import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Brand } from '@/constants/brand';
import { mediaUrl } from '@/services/api';
import type { Product } from '@/types/api';

export function ProductCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  const image = mediaUrl(product.main_image_path);
  return (
    <Pressable onPress={() => router.push({ pathname: '/products/[slug]', params: { slug: product.slug } } as unknown as Href)} style={({ pressed }) => [styles.card, compact && styles.compact, pressed && styles.pressed]}>
      {image ? <Image source={{ uri: image }} contentFit="contain" style={styles.image} transition={180} /> : <View style={[styles.image, styles.placeholder]}><Text style={styles.placeholderText}>PMC</Text></View>}
      <View style={styles.body}>
        <View style={styles.tags}>{product.accepts_branding ? <Text style={styles.brandTag}>Brandeable</Text> : null}{product.fast_shipping ? <Text style={styles.shippingTag}>Envío rápido</Text> : null}</View>
        <Text style={styles.category}>{product.category?.name ?? 'Catálogo'}</Text>
        <Text numberOfLines={2} style={styles.name}>{product.name}</Text>
        <Text numberOfLines={1} style={styles.supplier}>{product.supplier?.company_name ?? 'Plaza Mayoreo'}</Text>
        <View style={styles.priceRow}><Text style={styles.from}>Desde</Text><Text style={styles.price}>${Number(product.price).toLocaleString('es-MX')}</Text></View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { width: '48%', minWidth: 145, overflow: 'hidden', borderRadius: 14, backgroundColor: '#fff', borderWidth: 1, borderColor: Brand.line }, compact: { width: 178, minWidth: 178 },
  pressed: { opacity: .75, transform: [{ scale: .99 }] }, image: { width: '100%', aspectRatio: 1, backgroundColor: '#fff' },
  placeholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3ECF8' }, placeholderText: { color: Brand.purple, fontWeight: '900', fontSize: 24 },
  body: { padding: 12, gap: 5 }, tags: { minHeight: 22, flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  brandTag: { overflow: 'hidden', borderRadius: 9, paddingHorizontal: 7, paddingVertical: 3, backgroundColor: Brand.purple, color: '#fff', fontSize: 10, fontWeight: '900' },
  shippingTag: { overflow: 'hidden', borderRadius: 9, paddingHorizontal: 7, paddingVertical: 3, backgroundColor: '#63E3C9', color: '#123B34', fontSize: 10, fontWeight: '900' },
  category: { color: Brand.magenta, fontSize: 10, fontWeight: '900', textTransform: 'uppercase' }, name: { minHeight: 42, color: Brand.ink, fontSize: 16, lineHeight: 20, fontWeight: '900' },
  supplier: { color: Brand.muted, fontSize: 12 }, priceRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 6, paddingTop: 5, borderTopWidth: 1, borderTopColor: Brand.line }, from: { color: Brand.muted, fontSize: 11 }, price: { color: Brand.ink, fontSize: 17, fontWeight: '900' },
});
