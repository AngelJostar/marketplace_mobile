import { router, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { Button, ErrorMessage, Loading } from '@/components/ui';
import { Brand } from '@/constants/brand';
import { useAuth } from '@/providers/auth-provider';
import { api, apiErrorMessage } from '@/services/api';
import type { CollectionResponse, Product } from '@/types/api';

export default function AdminProductsScreen() {
  const { user, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true); setError('');
    try { const response = await api.get<CollectionResponse<Product>>('/admin/products', { params: { per_page: 100 } }); setProducts(response.data.data); }
    catch (requestError) { setError(apiErrorMessage(requestError, 'No fue posible cargar los productos administrativos.')); }
    finally { setLoading(false); }
  }

  useEffect(() => { if (!authLoading && !user) router.replace('/admin/login' as Href); else if (user) void load(); }, [authLoading, user]);
  if (authLoading || !user) return <Screen><Loading /></Screen>;

  return <Screen title="Productos" subtitle={`${products.length} productos en administración`} action={<Button onPress={() => router.push('/admin/products/new' as Href)}>Agregar</Button>}>{error ? <ErrorMessage message={error} /> : null}{loading ? <Loading label="Cargando productos…" /> : <View style={styles.list}>{products.map((product) => <Pressable key={product.id} style={styles.row}><View style={styles.copy}><Text style={styles.name}>{product.name}</Text><Text style={styles.meta}>{product.supplier?.company_name ?? 'Sin vendedor'} · {product.category?.name ?? 'Sin categoría'}</Text></View><View style={styles.numbers}><Text style={styles.price}>${Number(product.price).toLocaleString('es-MX')}</Text><Text style={styles.stock}>Stock {product.stock}</Text></View></Pressable>)}</View>}</Screen>;
}

const styles = StyleSheet.create({ list: { gap: 8 }, row: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 14, backgroundColor: '#fff', borderWidth: 1, borderColor: Brand.line }, copy: { flex: 1, gap: 4 }, name: { color: Brand.ink, fontWeight: '900', fontSize: 15 }, meta: { color: Brand.muted, fontSize: 12 }, numbers: { alignItems: 'flex-end', gap: 3 }, price: { color: Brand.purple, fontWeight: '900' }, stock: { color: Brand.muted, fontSize: 11 } });
