import { Image } from 'expo-image';
import { router, type Href, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AdminShell } from '@/components/admin-shell';
import { Button, Card, ErrorMessage, Loading } from '@/components/ui';
import { Brand } from '@/constants/brand';
import { useAuth } from '@/providers/auth-provider';
import { api, apiErrorMessage, mediaUrl } from '@/services/api';
import type { ItemResponse, PromotionContent, PromotionPayload } from '@/types/api';

export default function AdminOffersScreen() {
  const { user, loading: authLoading } = useAuth();
  const [payload, setPayload] = useState<PromotionPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPromotions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get<ItemResponse<PromotionPayload>>('/admin/promotions');
      setPayload(response.data.data);
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'No fue posible cargar las ofertas.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/admin/login' as Href);
  }, [authLoading, user]);

  useFocusEffect(useCallback(() => {
    if (user) void loadPromotions();
  }, [loadPromotions, user]));

  if (authLoading || !user) return <AdminShell title="Ofertas"><Loading /></AdminShell>;

  const promotions = payload?.promotions ?? [];
  return <AdminShell title="Ofertas" subtitle="Descuentos, vigencias y productos participantes" action={<Button variant="yellow" onPress={() => router.push({ pathname: '/admin/offers/editor', params: { id: 'new' } } as Href)}>Nueva</Button>}>
    <View style={styles.stats}>
      <Metric value={promotions.length} label="Promociones" />
      <Metric value={promotions.filter((item) => item.status === 'active').length} label="Activas" />
      <Metric value={promotions.filter((item) => item.status === 'scheduled').length} label="Programadas" />
    </View>
    {error ? <ErrorMessage message={error} /> : null}
    {loading ? <Loading label="Cargando ofertas…" /> : null}
    {!loading && !promotions.length ? <Card><Text style={styles.empty}>No hay promociones registradas.</Text></Card> : null}
    {!loading ? <View style={styles.list}>{promotions.map((promotion) => <PromotionCard key={promotion.id} promotion={promotion} />)}</View> : null}
  </AdminShell>;
}

function PromotionCard({ promotion }: { promotion: PromotionContent }) {
  const value = promotion.type === 'fixed' ? `$${Number(promotion.value).toLocaleString('es-MX')}` : promotion.type === 'percentage' ? `${Number(promotion.value)}%` : 'Envío gratis';
  const starts = formatDate(promotion.starts_at);
  const ends = promotion.ends_at ? formatDate(promotion.ends_at) : 'Sin cierre';
  return <Pressable onPress={() => router.push({ pathname: '/admin/offers/editor', params: { id: String(promotion.id) } } as Href)} style={({ pressed }) => [styles.promotion, pressed && styles.pressed]}>
    {promotion.identifier_image_url || promotion.identifier_image_path ? <Image source={promotion.identifier_image_url || mediaUrl(promotion.identifier_image_path)} style={styles.image} contentFit="contain" /> : <View style={[styles.image, styles.imageFallback]}><Text style={styles.fallbackValue}>{value}</Text></View>}
    <View style={styles.body}>
      <View style={styles.top}><View style={styles.copy}><Text style={styles.name}>{promotion.name}</Text><Text style={styles.type}>{typeLabel(promotion.type)} · mínimo {promotion.minimum_value}</Text></View><Status status={promotion.status} /></View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.meta}>{starts} — {ends}</Text>
      <Text style={styles.meta}>{promotion.products.length} productos participantes</Text>
      <Text style={styles.open}>Editar promoción ›</Text>
    </View>
  </Pressable>;
}

function Status({ status }: { status: string }) { return <Text style={[styles.status, status === 'active' && styles.statusActive, status === 'archived' && styles.statusArchived]}>{status.toUpperCase()}</Text>; }
function Metric({ value, label }: { value: number; label: string }) { return <Card style={styles.metric}><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></Card>; }
function typeLabel(type: string) { return type === 'percentage' ? 'Porcentaje' : type === 'fixed' ? 'Monto fijo' : 'Envío gratis'; }
function formatDate(value: string) { return new Date(value).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }); }

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: 8 }, metric: { flex: 1, alignItems: 'center', paddingHorizontal: 8, paddingVertical: 12 }, metricValue: { color: Brand.purple, fontSize: 23, fontWeight: '900' }, metricLabel: { color: Brand.muted, fontSize: 10, textAlign: 'center' }, list: { gap: 11 }, promotion: { overflow: 'hidden', borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: Brand.line }, pressed: { opacity: .72 }, image: { width: '100%', aspectRatio: 2.5, backgroundColor: '#F2E8FA' }, imageFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: Brand.purple }, fallbackValue: { color: Brand.yellow, fontSize: 31, fontWeight: '900' }, body: { padding: 15, gap: 8 }, top: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 }, copy: { flex: 1, gap: 3 }, name: { color: Brand.ink, fontSize: 19, fontWeight: '900' }, type: { color: Brand.muted, fontSize: 10 }, value: { color: Brand.magenta, fontSize: 28, fontWeight: '900' }, meta: { color: Brand.muted, fontSize: 12 }, status: { paddingHorizontal: 7, paddingVertical: 4, borderRadius: 7, overflow: 'hidden', backgroundColor: '#FFF0C2', color: '#865900', fontSize: 8, fontWeight: '900' }, statusActive: { backgroundColor: '#D7F8EC', color: '#087C59' }, statusArchived: { backgroundColor: '#FEE4E2', color: Brand.danger }, open: { color: Brand.purple, fontWeight: '900' }, empty: { color: Brand.muted, textAlign: 'center' },
});
