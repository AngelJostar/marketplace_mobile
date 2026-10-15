import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { ProductCard } from '@/components/product-card';
import { PublicShell } from '@/components/public-shell';
import { Button, ErrorMessage, Loading } from '@/components/ui';
import { Brand } from '@/constants/brand';
import { api, apiErrorMessage } from '@/services/api';
import type { CollectionResponse, Product } from '@/types/api';

export default function MarketplaceCatalog() {
  const params = useLocalSearchParams<{ q?: string; category?: string; sort?: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState(params.q ?? '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async (term: string) => {
    setLoading(true); setError('');
    try {
      const response = await api.get<CollectionResponse<Product>>('/products', { params: { q: term || undefined, category: params.category, sort: params.sort, per_page: 100 } });
      setProducts(response.data.data);
    } catch (requestError) { setError(apiErrorMessage(requestError, 'No pudimos cargar el catálogo. Revisa que Laravel esté encendido.')); }
    finally { setLoading(false); }
  }, [params.category, params.sort]);

  useEffect(() => { void load(params.q ?? ''); }, [load, params.q]);

  return (
    <PublicShell>
      <Image source={require('../../assets/legacy/catalog-banner-mobile.png')} contentFit="cover" style={styles.banner} />
      <View style={styles.heading}><View style={styles.headingCopy}><Text style={styles.kicker}>CATÁLOGO MAYORISTA</Text><Text style={styles.title}>Compra al mayoreo</Text><Text style={styles.subtitle}>Productos de proveedores verificados para surtir y hacer crecer tu negocio.</Text></View><View style={styles.count}><Text style={styles.countValue}>{products.length}</Text><Text style={styles.countLabel}>productos</Text></View></View>
      <View style={styles.searchRow}><TextInput value={search} onChangeText={setSearch} onSubmitEditing={() => void load(search)} placeholder="Buscar productos" placeholderTextColor="#8C8493" style={styles.search} returnKeyType="search" /><Button onPress={() => void load(search)}>Buscar</Button></View>
      {params.sort === 'sales' ? <View style={styles.offerPill}><Text style={styles.offerText}>⚡ Ofertas y promociones</Text></View> : null}
      {error ? <ErrorMessage message={error} /> : null}
      {loading ? <Loading label="Cargando productos…" /> : <View style={styles.grid}>{products.map((product) => <ProductCard key={product.id} product={product} />)}{!products.length ? <Text style={styles.empty}>No encontramos productos con esa búsqueda.</Text> : null}</View>}
    </PublicShell>
  );
}

const styles = StyleSheet.create({
  banner: { width: '100%', height: 330, borderRadius: 22, backgroundColor: Brand.ink }, heading: { flexDirection: 'row', alignItems: 'center', gap: 12 }, headingCopy: { flex: 1, gap: 4 }, kicker: { color: Brand.mint, fontSize: 11, fontWeight: '900' }, title: { color: Brand.ink, fontSize: 34, lineHeight: 38, fontWeight: '900' }, subtitle: { color: Brand.muted, lineHeight: 20 }, count: { width: 75, height: 75, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: Brand.line }, countValue: { color: Brand.purple, fontSize: 24, fontWeight: '900' }, countLabel: { color: Brand.muted, fontSize: 10, fontWeight: '800' },
  searchRow: { flexDirection: 'row', gap: 8 }, search: { flex: 1, minHeight: 48, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, borderColor: Brand.line, backgroundColor: '#fff', color: Brand.ink }, offerPill: { alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, backgroundColor: Brand.yellow }, offerText: { color: Brand.ink, fontWeight: '900' }, grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 }, empty: { width: '100%', padding: 30, textAlign: 'center', color: Brand.muted },
});
