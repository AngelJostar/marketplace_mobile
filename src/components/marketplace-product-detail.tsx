import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import { router, type Href, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { ProductCard } from '@/components/product-card';
import { PublicShell } from '@/components/public-shell';
import { Button, Card, ErrorMessage, Loading } from '@/components/ui';
import { Brand } from '@/constants/brand';
import { api, apiErrorMessage, mediaUrl } from '@/services/api';
import type { CollectionResponse, ItemResponse, Product } from '@/types/api';

export default function MarketplaceProductDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    void api.get<ItemResponse<Product>>(`/products/${slug}`).then((response) => {
      setProduct(response.data.data);
      setQuantity(String(response.data.data.minimum_order_quantity));
      return api.get<CollectionResponse<Product>>('/products', { params: { category: response.data.data.category?.id, per_page: 8 } });
    }).then((response) => setRelated(response.data.data.filter((item) => item.slug !== slug).slice(0, 6)))
      .catch((requestError) => setError(apiErrorMessage(requestError, 'No pudimos encontrar el producto.')));
  }, [slug]);

  if (error) return <PublicShell><ErrorMessage message={error} /></PublicShell>;
  if (!product) return <PublicShell><Loading label="Cargando producto…" /></PublicShell>;

  const image = mediaUrl(product.main_image_path);
  const contact = () => {
    const number = process.env.EXPO_PUBLIC_WHATSAPP_NUMBER ?? '525510003000';
    const message = encodeURIComponent(`Hola, me interesa ${product.name} de ${product.supplier?.company_name ?? 'Plaza Mayoreo'}. Cantidad aproximada: ${quantity || product.minimum_order_quantity}.`);
    void Linking.openURL(`https://wa.me/${number}?text=${message}`);
  };

  return (
    <PublicShell>
      <Button variant="secondary" onPress={() => router.back()}>← Atrás</Button>
      {image ? <Image source={{ uri: image }} contentFit="contain" style={styles.image} /> : <View style={[styles.image, styles.placeholder]}><Text style={styles.placeholderText}>PMC</Text></View>}
      <Text style={styles.category}>{product.category?.name ?? 'Catálogo'}</Text>
      <Text style={styles.title}>{product.name}</Text>
      <Text style={styles.description}>{product.short_description || product.long_description}</Text>
      <Text style={styles.supplier}><Text style={styles.bold}>Vendedor:</Text> {product.supplier?.company_name ?? 'Plaza Mayoreo'}</Text>
      <Button variant="yellow" onPress={() => router.push({ pathname: '/catalog', params: { supplier: product.supplier?.id } } as Href)}>Ver más productos del vendedor</Button>
      <Button onPress={contact}>Contacta al vendedor</Button>

      <View style={styles.metrics}><Metric label="Precio desde" value={`$${Number(product.price).toLocaleString('es-MX')}`} /><Metric label="Mínimo" value={`${product.minimum_order_quantity} piezas`} /><Metric label="Producción" value={`${product.production_time_days ?? 0} días`} /><Metric label="Envío" value={`${product.shipping_time_days ?? 0} días`} /></View>

      <Card><Text style={styles.sectionTitle}>Información para compra</Text><Text style={styles.description}>Catálogo público para revisar disponibilidad, opciones y datos del producto sin crear cuenta.</Text>{product.colors?.length ? <><Text style={styles.fieldLabel}>Colores disponibles</Text><Text style={styles.optionValue}>{product.colors.join(' · ')}</Text></> : null}<Text style={styles.fieldLabel}>Cantidad de referencia</Text><View style={styles.quantityRow}><TextInput value={quantity} onChangeText={setQuantity} keyboardType="number-pad" style={styles.quantity} /><Text style={styles.stock}>Stock {Number(product.stock).toLocaleString('es-MX')}</Text></View><View style={styles.actions}><Button onPress={() => router.push('/catalog' as Href)}>Ver catálogo completo</Button><Button variant="secondary" onPress={() => router.push('/home' as Href)}>Seguir explorando</Button></View></Card>

      {product.accepts_branding ? <Card><Text style={styles.sectionTitle}>Personaliza este producto con tu marca</Text><Text style={styles.description}>Opciones disponibles: {product.branding_options?.join(', ') || 'consulta las alternativas con el vendedor'}.</Text><View style={styles.metrics}><Metric label="Costo estimado" value="Cotizar" /><Metric label="Revisión" value="Antes de producir" /></View></Card> : null}

      <Card><Text style={styles.sectionTitle}>Especificaciones</Text><Text style={styles.description}>{product.long_description || product.short_description || 'Consulta detalles con el vendedor.'}</Text>{product.materials?.length ? <Text><Text style={styles.bold}>Materiales: </Text>{product.materials.join(', ')}</Text> : null}{product.colors?.length ? <Text><Text style={styles.bold}>Colores: </Text>{product.colors.join(', ')}</Text> : null}{product.dimensions ? <Text><Text style={styles.bold}>Medidas: </Text>{product.dimensions}</Text> : null}<Text><Text style={styles.bold}>Proveedor: </Text>{product.supplier?.company_name ?? 'Plaza Mayoreo'}</Text></Card>

      {related.length ? <><Text style={styles.relatedTitle}>Relacionados</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.related}>{related.map((item) => <ProductCard compact key={item.id} product={item} />)}</ScrollView></> : null}
    </PublicShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) { return <Card style={styles.metric}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></Card>; }

const styles = StyleSheet.create({
  image: { width: '100%', aspectRatio: 1, borderRadius: 20, backgroundColor: '#fff' }, placeholder: { alignItems: 'center', justifyContent: 'center' }, placeholderText: { color: Brand.purple, fontSize: 40, fontWeight: '900' }, category: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: '#fff', color: Brand.ink, fontSize: 11, fontWeight: '900' }, title: { color: Brand.ink, fontSize: 38, lineHeight: 40, fontWeight: '900' }, description: { color: Brand.muted, fontSize: 15, lineHeight: 22 }, supplier: { color: Brand.ink, fontSize: 16 }, bold: { fontWeight: '900' },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 }, metric: { width: '47%', flexGrow: 1 }, label: { color: Brand.muted, fontSize: 12 }, value: { color: Brand.ink, fontSize: 16, fontWeight: '900' }, sectionTitle: { color: Brand.ink, fontSize: 22, fontWeight: '900' }, fieldLabel: { color: Brand.ink, fontSize: 12, fontWeight: '900' }, optionValue: { color: Brand.ink }, quantityRow: { flexDirection: 'row', alignItems: 'center', gap: 16 }, quantity: { width: 110, minHeight: 48, paddingHorizontal: 14, borderWidth: 1, borderColor: Brand.line, borderRadius: 12, color: Brand.ink }, stock: { color: Brand.muted }, actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, relatedTitle: { color: Brand.ink, fontSize: 26, fontWeight: '900' }, related: { gap: 10, paddingRight: 14 },
});
