import { Image } from 'expo-image';
import { router, type Href, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AdminShell } from '@/components/admin-shell';
import { Button, Card, ErrorMessage, Loading } from '@/components/ui';
import { Brand } from '@/constants/brand';
import { useAuth } from '@/providers/auth-provider';
import { api, apiErrorMessage, mediaUrl } from '@/services/api';
import type { BannerContent, CarouselContent, ItemResponse, VisualContentPayload, VisualMaterialContent } from '@/types/api';

type ContentTab = 'banners' | 'carousels' | 'materials';

export default function AdminBannersScreen() {
  const { user, loading: authLoading } = useAuth();
  const [content, setContent] = useState<VisualContentPayload | null>(null);
  const [tab, setTab] = useState<ContentTab>('banners');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadContent = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get<ItemResponse<VisualContentPayload>>('/admin/visual-content');
      setContent(response.data.data);
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'No fue posible cargar el contenido visual.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/admin/login' as Href);
  }, [authLoading, user]);

  useFocusEffect(useCallback(() => {
    if (user) void loadContent();
  }, [loadContent, user]));

  if (authLoading || !user) return <AdminShell title="Banners"><Loading /></AdminShell>;

  const openNew = () => router.push({ pathname: '/admin/banners/editor', params: { kind: tab === 'carousels' ? 'carousel' : 'material', id: 'new' } } as Href);

  return <AdminShell title="Banners" subtitle="Portada, carruseles y materiales visuales" action={tab !== 'banners' ? <Button variant="yellow" onPress={openNew}>Nuevo</Button> : undefined}>
    {content ? <View style={styles.stats}><Metric value={content.banners.length} label="Banners" /><Metric value={content.carousels.length} label="Carruseles" /><Metric value={content.visual_materials.length} label="Materiales" /></View> : null}
    <View style={styles.tabs}><Tab label="Banners" active={tab === 'banners'} onPress={() => setTab('banners')} /><Tab label="Carruseles" active={tab === 'carousels'} onPress={() => setTab('carousels')} /><Tab label="Materiales" active={tab === 'materials'} onPress={() => setTab('materials')} /></View>
    {error ? <ErrorMessage message={error} /> : null}
    {loading ? <Loading label="Cargando contenido visual…" /> : null}
    {!loading && content ? <ContentList tab={tab} content={content} /> : null}
  </AdminShell>;
}

function ContentList({ tab, content }: { tab: ContentTab; content: VisualContentPayload }) {
  if (tab === 'banners') return <View style={styles.list}>{content.banners.map((banner) => <BannerCard key={banner.id} banner={banner} />)}</View>;
  if (tab === 'carousels') return <View style={styles.list}>{content.carousels.map((carousel) => <CarouselCard key={carousel.id} carousel={carousel} />)}</View>;
  return <View style={styles.list}>{content.visual_materials.map((material) => <MaterialCard key={material.id} material={material} />)}</View>;
}

function BannerCard({ banner }: { banner: BannerContent }) {
  return <Pressable onPress={() => openEditor('banner', banner.id)} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
    {banner.image_url || banner.image_path ? <Image source={banner.image_url || mediaUrl(banner.image_path)} style={styles.bannerImage} contentFit="cover" /> : <VisualPlaceholder label="Sin imagen" />}
    <View style={styles.cardBody}><View style={styles.cardTop}><View style={styles.cardCopy}><Text style={styles.kicker}>{banner.placement.toUpperCase()}</Text><Text style={styles.cardTitle}>{banner.title}</Text></View><Status status={banner.status} /></View><Text numberOfLines={2} style={styles.cardText}>{banner.subtitle || 'Sin subtítulo'}</Text><Text style={styles.open}>Editar banner ›</Text></View>
  </Pressable>;
}

function CarouselCard({ carousel }: { carousel: CarouselContent }) {
  return <Pressable onPress={() => openEditor('carousel', carousel.id)} style={({ pressed }) => [styles.card, styles.compactCard, pressed && styles.pressed]}>
    <View style={styles.cardTop}><View style={styles.cardCopy}><Text style={styles.kicker}>{carousel.slot.toUpperCase()}</Text><Text style={styles.cardTitle}>{carousel.title}</Text></View><Status status={carousel.status} /></View>
    <Text style={styles.cardText}>{carousel.products.length} productos · {carousel.subtitle || 'Sin subtítulo'}</Text>
    <View style={styles.productStrip}>{carousel.products.slice(0, 5).map((product) => product.image_path ? <Image key={product.id} source={mediaUrl(product.image_path)} style={styles.productImage} contentFit="cover" /> : <View key={product.id} style={styles.productFallback}><Text style={styles.productFallbackText}>{product.name.slice(0, 1)}</Text></View>)}</View>
    <Text style={styles.open}>Editar carrusel ›</Text>
  </Pressable>;
}

function MaterialCard({ material }: { material: VisualMaterialContent }) {
  return <Pressable onPress={() => openEditor('material', material.id)} style={({ pressed }) => [styles.card, styles.materialCard, pressed && styles.pressed]}>
    {material.image_url || material.image_path ? <Image source={material.image_url || mediaUrl(material.image_path)} style={styles.materialImage} contentFit="cover" /> : <View style={[styles.materialImage, styles.materialFallback]}><Text style={styles.materialAmount}>{material.amount || 'Aa'}</Text></View>}
    <View style={styles.materialCopy}><View style={styles.cardTop}><View style={styles.cardCopy}><Text style={styles.kicker}>{material.type.replaceAll('_', ' ').toUpperCase()}</Text><Text style={styles.cardTitle}>{material.title || material.kicker || 'Material visual'}</Text></View><Status status={material.status} /></View><Text numberOfLines={2} style={styles.cardText}>{material.text || material.cta || 'Sin texto adicional'}</Text><Text style={styles.open}>Editar material ›</Text></View>
  </Pressable>;
}

function openEditor(kind: 'banner' | 'carousel' | 'material', id: number) { router.push({ pathname: '/admin/banners/editor', params: { kind, id: String(id) } } as Href); }
function VisualPlaceholder({ label }: { label: string }) { return <View style={[styles.bannerImage, styles.placeholder]}><Text style={styles.placeholderText}>{label}</Text></View>; }
function Status({ status }: { status: string }) { const active = status === 'active' || status === 'published'; return <Text style={[styles.status, active && styles.statusActive, status === 'archived' && styles.statusArchived]}>{status.toUpperCase()}</Text>; }
function Metric({ value, label }: { value: number; label: string }) { return <Card style={styles.metric}><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></Card>; }
function Tab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) { return <Pressable onPress={onPress} style={[styles.tab, active && styles.tabActive]}><Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text></Pressable>; }

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: 8 }, metric: { flex: 1, alignItems: 'center', paddingHorizontal: 8, paddingVertical: 12 }, metricValue: { color: Brand.purple, fontSize: 23, fontWeight: '900' }, metricLabel: { color: Brand.muted, fontSize: 10 }, tabs: { flexDirection: 'row', padding: 4, borderRadius: 16, backgroundColor: '#EDE5F1' }, tab: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center' }, tabActive: { backgroundColor: Brand.purple }, tabText: { color: Brand.purple, fontSize: 12, fontWeight: '900' }, tabTextActive: { color: '#fff' }, list: { gap: 11 },
  card: { overflow: 'hidden', borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: Brand.line }, compactCard: { padding: 15, gap: 11 }, pressed: { opacity: .72 }, bannerImage: { width: '100%', aspectRatio: 2.1, backgroundColor: '#EDE5F1' }, placeholder: { alignItems: 'center', justifyContent: 'center' }, placeholderText: { color: Brand.muted, fontWeight: '800' }, cardBody: { padding: 15, gap: 8 }, cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 }, cardCopy: { flex: 1, gap: 3 }, kicker: { color: Brand.magenta, fontSize: 9, fontWeight: '900', letterSpacing: .8 }, cardTitle: { color: Brand.ink, fontSize: 18, fontWeight: '900' }, cardText: { color: Brand.muted, fontSize: 12, lineHeight: 17 }, status: { paddingHorizontal: 7, paddingVertical: 4, borderRadius: 7, overflow: 'hidden', backgroundColor: '#FFF0C2', color: '#865900', fontSize: 8, fontWeight: '900' }, statusActive: { backgroundColor: '#D7F8EC', color: '#087C59' }, statusArchived: { backgroundColor: '#FEE4E2', color: Brand.danger }, open: { color: Brand.purple, fontWeight: '900' },
  productStrip: { flexDirection: 'row', gap: 6 }, productImage: { width: 48, height: 48, borderRadius: 10, backgroundColor: '#F4F1F5' }, productFallback: { width: 48, height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F2E8FA' }, productFallbackText: { color: Brand.purple, fontWeight: '900' }, materialCard: { flexDirection: 'row', padding: 10, gap: 11 }, materialImage: { width: 96, minHeight: 112, borderRadius: 14, backgroundColor: '#F2E8FA' }, materialFallback: { alignItems: 'center', justifyContent: 'center' }, materialAmount: { color: Brand.purple, fontSize: 27, fontWeight: '900' }, materialCopy: { flex: 1, gap: 8 },
});
