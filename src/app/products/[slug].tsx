export { default } from '@/components/marketplace-product-detail';

/* Previous detail implementation retained temporarily for visual-history reference.
import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { Button, Card, ErrorMessage, Loading } from '@/components/ui';
import { Brand } from '@/constants/brand';
import { api, apiErrorMessage, mediaUrl } from '@/services/api';
import type { ItemResponse, Product } from '@/types/api';

export default function ProductDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    void api.get<ItemResponse<Product>>(`/products/${slug}`).then((response) => setProduct(response.data.data)).catch((requestError) => setError(apiErrorMessage(requestError, 'No pudimos encontrar el producto.')));
  }, [slug]);

  if (error) return <Screen title="Producto"><ErrorMessage message={error} /></Screen>;
  if (!product) return <Screen><Loading label="Cargando producto…" /></Screen>;
  const image = mediaUrl(product.main_image_path);
  const contact = () => {
    const number = process.env.EXPO_PUBLIC_WHATSAPP_NUMBER ?? '525510003000';
    const message = encodeURIComponent(`Hola, me interesa ${product.name} de ${product.supplier?.company_name ?? 'Plaza Mayoreo'}.`);
    void Linking.openURL(`https://wa.me/${number}?text=${message}`);
  };

  return (
    <Screen>
      {image ? <Image source={{ uri: image }} contentFit="contain" style={styles.image} /> : null}
      <Text style={styles.category}>{product.category?.name ?? 'Catálogo'}</Text>
      <Text style={styles.title}>{product.name}</Text>
      <Text style={styles.description}>{product.short_description || product.long_description}</Text>
      <Text style={styles.supplier}><Text style={styles.bold}>Vendedor:</Text> {product.supplier?.company_name ?? 'Plaza Mayoreo'}</Text>
      <Button variant="yellow" onPress={contact}>Contactar al vendedor</Button>
      <View style={styles.metrics}>
        <Card style={styles.metric}><Text style={styles.label}>Precio desde</Text><Text style={styles.value}>${Number(product.price).toLocaleString('es-MX')}</Text></Card>
        <Card style={styles.metric}><Text style={styles.label}>Pedido mínimo</Text><Text style={styles.value}>{product.minimum_order_quantity} piezas</Text></Card>
        <Card style={styles.metric}><Text style={styles.label}>Producción</Text><Text style={styles.value}>{product.production_time_days ?? 0} días</Text></Card>
        <Card style={styles.metric}><Text style={styles.label}>Envío</Text><Text style={styles.value}>{product.shipping_time_days ?? 0} días</Text></Card>
      </View>
      {product.accepts_branding ? <Card><Text style={styles.sectionTitle}>Personaliza este producto con tu marca</Text><Text style={styles.description}>{product.branding_options?.join(', ') || 'Consulta las opciones disponibles con el vendedor.'}</Text></Card> : null}
      <Card><Text style={styles.sectionTitle}>Especificaciones</Text><Text style={styles.description}>{product.long_description || product.short_description || 'Consulta detalles con el vendedor.'}</Text>{product.materials?.length ? <Text><Text style={styles.bold}>Materiales: </Text>{product.materials.join(', ')}</Text> : null}{product.colors?.length ? <Text><Text style={styles.bold}>Colores: </Text>{product.colors.join(', ')}</Text> : null}{product.dimensions ? <Text><Text style={styles.bold}>Medidas: </Text>{product.dimensions}</Text> : null}</Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  image: { width: '100%', aspectRatio: 1, borderRadius: 20, backgroundColor: '#fff' }, category: { color: Brand.magenta, fontWeight: '900', textTransform: 'uppercase' },
  title: { color: Brand.ink, fontSize: 36, lineHeight: 40, fontWeight: '900' }, description: { color: Brand.muted, fontSize: 16, lineHeight: 23 }, supplier: { color: Brand.ink, fontSize: 16 }, bold: { fontWeight: '900' },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, metric: { width: '48%', flexGrow: 1 }, label: { color: Brand.muted, fontSize: 12 }, value: { color: Brand.ink, fontSize: 17, fontWeight: '900' }, sectionTitle: { color: Brand.ink, fontSize: 20, fontWeight: '900' },
});
*/
