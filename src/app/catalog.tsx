export { default } from '@/components/marketplace-catalog';

/* Previous catalog implementation retained temporarily for visual-history reference.
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { ProductCard } from '@/components/product-card';
import { Screen } from '@/components/screen';
import { Button, ErrorMessage, Loading } from '@/components/ui';
import { Brand } from '@/constants/brand';
import { api, apiErrorMessage } from '@/services/api';
import type { CollectionResponse, Product } from '@/types/api';

export default function CatalogScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async (term: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get<CollectionResponse<Product>>('/products', { params: { q: term || undefined, per_page: 100 } });
      setProducts(response.data.data);
    } catch (requestError) { setError(apiErrorMessage(requestError, 'No pudimos cargar el catálogo. Revisa que Laravel esté encendido.')); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(''); }, [load]);

  return (
    <Screen title="Compra al mayoreo" subtitle="Productos de proveedores verificados para surtir y hacer crecer tu negocio.">
      <View style={styles.searchRow}>
        <TextInput value={search} onChangeText={setSearch} onSubmitEditing={() => void load(search)} placeholder="Buscar productos" placeholderTextColor="#8C8493" style={styles.search} returnKeyType="search" />
        <Button onPress={() => void load(search)}>Buscar</Button>
      </View>
      {error ? <ErrorMessage message={error} /> : null}
      {loading ? <Loading label="Cargando productos…" /> : (
        <View style={styles.grid}>
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
          {!products.length ? <Text style={styles.empty}>No encontramos productos con esa búsqueda.</Text> : null}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchRow: { flexDirection: 'row', gap: 8 }, search: { flex: 1, minHeight: 48, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, borderColor: Brand.line, backgroundColor: '#fff', color: Brand.ink },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 }, empty: { width: '100%', padding: 30, textAlign: 'center', color: Brand.muted },
});
*/
