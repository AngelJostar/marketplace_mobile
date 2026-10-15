import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import { router, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ProductCard } from '@/components/product-card';
import { PublicShell } from '@/components/public-shell';
import { ErrorMessage, Loading } from '@/components/ui';
import { Brand } from '@/constants/brand';
import { api, apiErrorMessage, mediaUrl } from '@/services/api';
import type { Category, CollectionResponse, Product } from '@/types/api';

const bonuses = [
  ['CUPÓN DE BIENVENIDA', 'Compra por volumen', '$1,000', 'En crédito para tu primera orden aprobada.', '#FF9420'],
  ['BONO PARA EMPRESAS', 'Branding incluido', 'Hasta 25%', 'Descuento en personalización para pedidos grandes.', '#8D24D9'],
  ['PROMOCIÓN DIARIA', 'Paquetes listos', '2×1', 'Combina empaque, regalo y producto promocional.', '#F23286'],
  ['SÚPER OFERTAS', 'Precios chicos', 'Desde $9', 'Insumos, etiquetas y piezas promocionales.', '#1EBCD0'],
] as const;

const fallbackCategories = [
  { id: -1, name: 'Hogar y cocina', slug: 'hogar-y-cocina', image: require('../../assets/legacy/category-home.png') },
  { id: -2, name: 'Belleza y cuidado', slug: 'belleza-y-cuidado-personal', image: require('../../assets/legacy/category-beauty.png') },
  { id: -3, name: 'Tecnología', slug: 'tecnologia-y-accesorios', image: require('../../assets/legacy/category-tech.png') },
];

export default function MarketplaceHome() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    void Promise.all([
      api.get<CollectionResponse<Product>>('/products', { params: { per_page: 12 } }),
      api.get<CollectionResponse<Category>>('/categories', { params: { per_page: 12 } }),
    ]).then(([productResponse, categoryResponse]) => {
      setProducts(productResponse.data.data);
      setCategories(categoryResponse.data.data);
    }).catch((requestError) => setError(apiErrorMessage(requestError, 'No pudimos conectar con Laravel; el diseño sigue disponible.')));
  }, []);

  const openWhatsapp = () => void Linking.openURL('https://wa.me/525510003000?text=Hola%2C%20quiero%20rentar%20un%20local.');

  return (
    <PublicShell>
      <View style={styles.hero}>
        <View style={styles.heroGlow} />
        <Text style={styles.eyebrow}>— EL CENTRO MAYORISTA DE LA MERCED</Text>
        <Text style={styles.heroTitle}>PLAZA MAYORISTA PARA SURTIR Y HACER CRECER TU NEGOCIO</Text>
        <View style={styles.stats}><Stat value="+100" label="LOCALES" /><Stat value="+5000" label="PRODUCTOS" /><Stat value="MEJORES" label="PRECIOS" /><Stat value="COMPRA" label="AL MAYOREO" /></View>
        <View style={styles.heroActions}><Pressable onPress={() => void Linking.openURL('https://maps.google.com/?q=Plaza+Mayoreo+Circunvalacion')} style={styles.yellowButton}><Text style={styles.yellowButtonText}>VISÍTANOS HOY</Text></Pressable><Pressable onPress={() => router.push('/rentals' as Href)} style={styles.yellowButton}><Text style={styles.yellowButtonText}>RENTA TU LOCAL</Text></Pressable></View>
      </View>

      <View style={styles.rentCard}>
        <Text style={styles.sectionKicker}>RENTA TU LOCAL</Text><Text style={styles.rentTitle}>Emprende o haz crecer tu negocio en Plaza Mayoreo Circunvalación.</Text><Text style={styles.rentCopy}>Espacios comerciales en una zona de alta actividad y flujo constante de compradores.</Text>
        <View style={styles.row}><Pressable onPress={openWhatsapp} style={styles.greenButton}><Text style={styles.greenText}>ATENCIÓN INMEDIATA</Text></Pressable><Pressable onPress={() => router.push('/rentals' as Href)} style={styles.outlineButton}><Text style={styles.outlineText}>VER UBICACIÓN</Text></Pressable></View>
      </View>

      <SectionTitle kicker="OPORTUNIDADES" title="Ofertas relámpago" subtitle="Descuentos agresivos para cerrar compras por volumen." />
      {error ? <ErrorMessage message={error} /> : null}
      {!products.length && !error ? <Loading label="Cargando ofertas…" /> : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>{products.slice(0, 7).map((product) => <View key={product.id} style={styles.offerWrap}><Text style={styles.discount}>-{70 - (product.id % 7) * 5}%</Text><ProductCard compact product={product} /></View>)}</ScrollView>

      <SectionTitle title="Promociones y bonos" subtitle="Cupones, descuentos por volumen y beneficios para empresas." />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>{bonuses.map(([kicker, title, value, copy, color]) => <View key={title} style={[styles.bonus, { backgroundColor: color }]}><Text style={styles.bonusKicker}>{kicker}</Text><Text style={styles.bonusTitle}>{title}</Text><Text style={styles.bonusValue}>{value}</Text><Text style={styles.bonusCopy}>{copy}</Text></View>)}</ScrollView>

      <SectionTitle title="Branding, regalos y populares" subtitle="Productos con buena rotación y listos para personalizar." />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>{products.slice(4, 12).map((product) => <ProductCard compact key={product.id} product={product} />)}</ScrollView>

      <View style={styles.categoriesSection}>
        <Text style={styles.categoryKicker}>— EXPLORA LA PLAZA POR TIPO DE PRODUCTO</Text><Text style={styles.categoriesTitle}>CATEGORÍAS</Text><Text style={styles.categoriesCopy}>Encuentra lo que tu negocio necesita, más rápido y al mejor precio.</Text>
        <Pressable onPress={() => router.push('/categories' as Href)} style={styles.viewAll}><Text style={styles.viewAllText}>Ver todas ›</Text></Pressable>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>{(categories.length ? categories : fallbackCategories).slice(0, 10).map((category, index) => { const localImage = 'image' in category ? category.image : fallbackCategories[index % fallbackCategories.length].image; const remoteImage = 'image_path' in category ? mediaUrl(category.image_path) : null; return <Pressable key={category.id} onPress={() => router.push({ pathname: '/catalog', params: { category: category.slug } } as Href)} style={styles.categoryItem}><Image source={remoteImage ? { uri: remoteImage } : localImage} contentFit="cover" style={styles.categoryImage} /><Text numberOfLines={2} style={styles.categoryName}>{category.name}</Text></Pressable>; })}</ScrollView>
      </View>

      <Pressable onPress={() => router.push('/catalog' as Href)} style={styles.catalogBannerWrap}><Image source={require('../../assets/legacy/catalog-banner-mobile.png')} contentFit="cover" style={styles.catalogBanner} /></Pressable>
      <SectionTitle kicker="CATÁLOGO MAYORISTA" title="Compra al mayoreo" subtitle="Productos de proveedores verificados para surtir tu negocio." />
      <View style={styles.grid}>{products.slice(0, 8).map((product) => <ProductCard key={product.id} product={product} />)}</View>
    </PublicShell>
  );
}

function Stat({ value, label }: { value: string; label: string }) { return <View style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>; }
function SectionTitle({ kicker, title, subtitle }: { kicker?: string; title: string; subtitle: string }) { return <View style={styles.sectionHead}>{kicker ? <Text style={styles.sectionKicker}>{kicker}</Text> : null}<Text style={styles.sectionTitle}>{title}</Text><Text style={styles.sectionCopy}>{subtitle}</Text></View>; }

const styles = StyleSheet.create({
  hero: { overflow: 'hidden', padding: 20, borderRadius: 24, backgroundColor: '#370061', gap: 14 }, heroGlow: { position: 'absolute', width: 240, height: 420, right: -80, top: -50, backgroundColor: '#7200E4', transform: [{ rotate: '18deg' }] }, eyebrow: { color: Brand.yellow, fontSize: 10, fontWeight: '900' }, heroTitle: { color: '#fff', fontSize: 31, lineHeight: 33, fontWeight: '900' },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 }, stat: { width: '48%', flexGrow: 1, minHeight: 72, alignItems: 'center', justifyContent: 'center', borderRadius: 12, borderWidth: 2, borderColor: 'rgba(255,255,255,.45)', backgroundColor: 'rgba(64,0,115,.65)' }, statValue: { color: '#fff', fontSize: 19, fontWeight: '900' }, statLabel: { color: '#fff', fontSize: 13, fontWeight: '900' }, heroActions: { flexDirection: 'row', gap: 8 }, yellowButton: { flex: 1, minHeight: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8, backgroundColor: Brand.yellow }, yellowButtonText: { color: Brand.ink, fontSize: 13, textAlign: 'center', fontWeight: '900' },
  rentCard: { padding: 20, borderRadius: 22, backgroundColor: '#fff', borderWidth: 1, borderColor: Brand.line, gap: 10 }, sectionKicker: { color: Brand.magenta, fontSize: 11, fontWeight: '900' }, rentTitle: { color: Brand.ink, fontSize: 27, lineHeight: 30, fontWeight: '900' }, rentCopy: { color: Brand.muted, fontSize: 15, lineHeight: 21 }, row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, greenButton: { flexGrow: 1, minHeight: 44, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: '#52EB00' }, greenText: { color: '#153B00', fontWeight: '900' }, outlineButton: { flexGrow: 1, minHeight: 44, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center', borderRadius: 22, borderWidth: 1, borderColor: Brand.purple }, outlineText: { color: Brand.purple, fontWeight: '900' },
  sectionHead: { gap: 4 }, sectionTitle: { color: Brand.ink, fontSize: 28, lineHeight: 32, fontWeight: '900' }, sectionCopy: { color: Brand.muted, fontSize: 14, lineHeight: 20 }, horizontalList: { gap: 10, paddingRight: 14 }, offerWrap: { position: 'relative' }, discount: { zIndex: 2, position: 'absolute', top: 8, left: 8, paddingHorizontal: 7, paddingVertical: 4, borderRadius: 7, backgroundColor: '#FF4A13', color: '#fff', fontWeight: '900' },
  bonus: { width: 235, minHeight: 230, padding: 18, borderRadius: 16, gap: 7 }, bonusKicker: { color: '#fff', fontSize: 12, fontWeight: '900' }, bonusTitle: { color: '#fff', fontSize: 20, fontWeight: '900' }, bonusValue: { color: '#fff', fontSize: 36, fontWeight: '900' }, bonusCopy: { color: '#fff', fontSize: 15, lineHeight: 20 },
  categoriesSection: { overflow: 'hidden', padding: 20, borderRadius: 24, backgroundColor: '#3B0668', gap: 10 }, categoryKicker: { color: Brand.yellow, fontSize: 10, fontWeight: '900' }, categoriesTitle: { color: '#fff', fontSize: 40, fontWeight: '900' }, categoriesCopy: { color: '#fff', lineHeight: 20 }, viewAll: { alignSelf: 'flex-start', minHeight: 48, paddingHorizontal: 22, alignItems: 'center', justifyContent: 'center', borderRadius: 24, borderWidth: 2, borderColor: Brand.yellow, backgroundColor: '#6F11B8' }, viewAllText: { color: '#fff', fontSize: 17, fontWeight: '900' }, categoryList: { paddingTop: 8, gap: 12 }, categoryItem: { width: 105, alignItems: 'center', gap: 7 }, categoryImage: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#fff', borderWidth: 3, borderColor: Brand.magenta }, categoryName: { color: '#fff', textAlign: 'center', fontSize: 12, fontWeight: '900' },
  catalogBannerWrap: { overflow: 'hidden', height: 390, borderRadius: 22, backgroundColor: Brand.ink }, catalogBanner: { width: '100%', height: '100%' }, grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
});
