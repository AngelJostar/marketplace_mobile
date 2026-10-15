import * as DocumentPicker from 'expo-document-picker';
import { Image } from 'expo-image';
import { router, type Href, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { AdminShell } from '@/components/admin-shell';
import { Button, Card, ErrorMessage, Loading } from '@/components/ui';
import { Brand } from '@/constants/brand';
import { useAuth } from '@/providers/auth-provider';
import { api, apiErrorMessage, mediaUrl } from '@/services/api';
import type { ItemResponse, MarketingCampaign, MarketingLogEvent } from '@/types/api';

const supportTypes = ['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'image/png', 'image/jpeg'];

export default function AdminMarketingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const [campaign, setCampaign] = useState<MarketingCampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const loadCampaign = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const response = await api.get<ItemResponse<MarketingCampaign>>(`/admin/marketing-campaigns/${id}`);
      setCampaign(response.data.data);
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'No fue posible cargar la campaña.'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/admin/login' as Href);
  }, [authLoading, user]);

  useEffect(() => {
    if (user) void loadCampaign();
  }, [loadCampaign, user]);

  const chooseSupport = async () => {
    if (!campaign) return;
    const result = await DocumentPicker.getDocumentAsync({ type: supportTypes, copyToCacheDirectory: true, multiple: false });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (asset.size && asset.size > 10 * 1024 * 1024) {
      setError('El soporte no puede superar 10 MB.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const form = new FormData();
      form.append('support', { uri: asset.uri, name: asset.name, type: asset.mimeType ?? 'application/octet-stream' } as unknown as Blob);
      const response = await api.patch<ItemResponse<MarketingCampaign>>(`/admin/marketing-campaigns/${campaign.id}/support`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setCampaign(response.data.data);
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'No fue posible cargar el soporte.'));
    } finally {
      setUploading(false);
    }
  };

  const openSupport = async () => {
    const url = mediaUrl(campaign?.presentation_support_url ?? campaign?.presentation_support_path);
    if (url) await Linking.openURL(url);
  };

  if (authLoading || !user) return <AdminShell title="Marketing"><Loading /></AdminShell>;

  return <AdminShell title={campaign?.folio ?? 'Campaña'} subtitle="Inversión, canales y soporte de presentación">
    {error ? <ErrorMessage message={error} /> : null}
    {loading ? <Loading label="Cargando campaña…" /> : null}
    {!loading && campaign ? <>
      <CampaignHero campaign={campaign} />
      <Card>
        <Text style={styles.sectionTitle}>Detalle de campaña</Text>
        <Info label="Objetivo" value={campaign.objective} />
        <Info label="Descripción" value={campaign.description} />
        <View style={styles.infoGrid}><Info label="Audiencia" value={campaign.target_audience} compact /><Info label="Ubicación" value={campaign.target_location} compact /><Info label="Edades" value={ageRange(campaign)} compact /><Info label="Duración" value={campaign.duration_days ? `${campaign.duration_days} días` : null} compact /></View>
      </Card>
      <Card style={styles.investmentCard}>
        <Text style={styles.sectionTitle}>Distribución de inversión</Text>
        <Text style={styles.total}>{currency(campaign.total_payment, campaign.currency)}</Text>
        <Text style={styles.totalLabel}>Pago total · {Number(campaign.investment_percent || 0).toFixed(2)}% destinado a inversión</Text>
        <View style={styles.financeGrid}><Finance label="Publicidad" value={campaign.advertising_budget_total} code={campaign.currency} /><Finance label="Servicio marketing" value={campaign.marketing_service_total} code={campaign.currency} /><Finance label="Comisión marketplace" value={campaign.marketplace_fee_total} code={campaign.currency} /><Finance label="Comisión de pago" value={campaign.payment_fee_total} code={campaign.currency} /></View>
      </Card>
      <Card>
        <Text style={styles.sectionTitle}>Canales</Text>
        {campaign.channels.length ? <View style={styles.channelList}>{campaign.channels.map((channel, index) => <View key={`${channel.channel}-${index}`} style={styles.channel}><View style={styles.channelCopy}><Text style={styles.channelName}>{channel.channel}</Text><Text style={styles.channelStatus}>{channel.status ? humanize(channel.status) : 'Sin estado operativo'}</Text></View><Text style={styles.channelBudget}>{currency(channel.allocated_budget, campaign.currency)}</Text></View>)}</View> : <Text style={styles.muted}>No hay canales asignados.</Text>}
      </Card>
      <Card style={styles.supportCard}>
        <Text style={styles.sectionTitle}>Soporte de presentación</Text>
        <Text style={styles.muted}>PDF, PowerPoint, PNG o JPG de hasta 10 MB. Cargar uno nuevo reemplaza el anterior.</Text>
        {campaign.presentation_support_name ? <Pressable onPress={() => void openSupport()} style={styles.file}><Text style={styles.fileIcon}>▣</Text><View style={styles.fileCopy}><Text numberOfLines={1} style={styles.fileName}>{campaign.presentation_support_name}</Text><Text style={styles.fileAction}>Abrir soporte actual</Text></View><Text style={styles.fileArrow}>›</Text></Pressable> : <Text style={styles.noFile}>Todavía no hay un soporte adjunto.</Text>}
        <Button disabled={uploading} onPress={() => void chooseSupport()}>{uploading ? 'Cargando…' : campaign.presentation_support_name ? 'Reemplazar soporte' : 'Seleccionar soporte'}</Button>
      </Card>
      {Object.keys(campaign.metrics).length ? <Card><Text style={styles.sectionTitle}>Resultados</Text><View style={styles.metrics}>{Object.entries(campaign.metrics).map(([key, value]) => <View key={key} style={styles.metric}><Text style={styles.metricValue}>{Number(value).toLocaleString('es-MX')}</Text><Text style={styles.metricLabel}>{humanize(key)}</Text></View>)}</View></Card> : null}
      <View style={styles.timelineHeading}><Text style={styles.sectionTitle}>Historial</Text><Text style={styles.count}>{campaign.change_log.length}</Text></View>
      {campaign.change_log.length ? <View>{[...campaign.change_log].reverse().map((event, index) => <LogCard key={`${event.created_at ?? 'event'}-${index}`} event={event} latest={index === 0} />)}</View> : <Card><Text style={styles.muted}>No hay movimientos registrados.</Text></Card>}
    </> : null}
  </AdminShell>;
}

function CampaignHero({ campaign }: { campaign: MarketingCampaign }) {
  const image = mediaUrl(campaign.product?.image_url ?? campaign.product?.image_path);
  return <Card style={styles.hero}>{image ? <Image source={image} style={styles.productImage} contentFit="contain" /> : null}<View style={styles.heroTop}><Text style={styles.heroFolio}>{campaign.folio}</Text><Text style={styles.heroStatus}>{campaign.status_label.toUpperCase()}</Text></View><Text style={styles.heroName}>{campaign.name}</Text><Text style={styles.heroRelation}>{campaign.supplier?.company_name ?? 'Vendedor no asignado'} · {campaign.product?.name ?? 'Producto no asignado'}</Text><Text style={styles.heroDates}>{dateRange(campaign.starts_on, campaign.ends_on)}</Text></Card>;
}

function Info({ label, value, compact = false }: { label: string; value?: string | null; compact?: boolean }) { return <View style={compact ? styles.infoCompact : styles.info}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value || 'No especificado'}</Text></View>; }
function Finance({ label, value, code }: { label: string; value: string | number; code: string }) { return <View style={styles.finance}><Text style={styles.financeLabel}>{label}</Text><Text style={styles.financeValue}>{currency(value, code)}</Text></View>; }
function LogCard({ event, latest }: { event: MarketingLogEvent; latest: boolean }) { return <View style={styles.log}><View style={[styles.dot, latest && styles.dotLatest]} /><View style={styles.logCopy}><View style={styles.logTop}><Text style={styles.logAction}>{humanize(event.action)}</Text>{latest ? <Text style={styles.latest}>ÚLTIMO</Text> : null}</View><Text style={styles.logDate}>{formatDateTime(event.created_at)}</Text>{event.actor_id ? <Text style={styles.logActor}>Usuario #{event.actor_id}</Text> : null}</View></View>; }
function currency(value: string | number, code = 'MXN') { return Number(value || 0).toLocaleString('es-MX', { style: 'currency', currency: code }); }
function humanize(value: string) { return value.replaceAll('_', ' ').replace(/^./, (letter) => letter.toUpperCase()); }
function ageRange(campaign: MarketingCampaign) { return campaign.minimum_age || campaign.maximum_age ? `${campaign.minimum_age ?? '—'} a ${campaign.maximum_age ?? '—'} años` : null; }
function dateRange(start?: string | null, end?: string | null) { return `${formatDate(start)} — ${formatDate(end)}`; }
function formatDate(value?: string | null) { return value ? new Date(`${value}T12:00:00`).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Sin fecha'; }
function formatDateTime(value?: string | null) { return value ? new Date(value).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' }) : 'Sin fecha'; }

const styles = StyleSheet.create({
  hero: { overflow: 'hidden', backgroundColor: Brand.ink, borderColor: Brand.ink }, productImage: { width: '100%', height: 170, borderRadius: 13, backgroundColor: '#fff' }, heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }, heroFolio: { color: Brand.yellow, fontSize: 10, fontWeight: '900', letterSpacing: 1 }, heroStatus: { maxWidth: 130, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 7, overflow: 'hidden', backgroundColor: '#D7F8EC', color: '#087C59', fontSize: 7, fontWeight: '900' }, heroName: { color: '#fff', fontSize: 25, lineHeight: 29, fontWeight: '900' }, heroRelation: { color: '#EEDFFF', fontSize: 12, lineHeight: 17 }, heroDates: { color: '#AAB4B0', fontSize: 10 },
  sectionTitle: { color: Brand.ink, fontSize: 21, fontWeight: '900' }, info: { gap: 3 }, infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, infoCompact: { width: '47%', flexGrow: 1, gap: 3, padding: 10, borderRadius: 11, backgroundColor: '#F8F5FA' }, infoLabel: { color: Brand.muted, fontSize: 9, textTransform: 'uppercase', fontWeight: '800' }, infoValue: { color: Brand.ink, fontSize: 12, lineHeight: 17, fontWeight: '700' },
  investmentCard: { borderColor: Brand.magenta, borderWidth: 2 }, total: { color: Brand.purple, fontSize: 34, fontWeight: '900' }, totalLabel: { color: Brand.muted, fontSize: 10 }, financeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, finance: { width: '47%', flexGrow: 1, padding: 11, borderRadius: 12, backgroundColor: '#F2E8FA' }, financeLabel: { color: Brand.muted, fontSize: 9 }, financeValue: { color: Brand.ink, fontSize: 13, fontWeight: '900' },
  channelList: { gap: 7 }, channel: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 11, borderRadius: 12, backgroundColor: '#F8F5FA' }, channelCopy: { flex: 1, gap: 2 }, channelName: { color: Brand.ink, fontWeight: '900' }, channelStatus: { color: Brand.muted, fontSize: 9 }, channelBudget: { color: Brand.purple, fontSize: 14, fontWeight: '900' },
  supportCard: { backgroundColor: '#FFFDF5' }, muted: { color: Brand.muted, fontSize: 12, lineHeight: 17 }, file: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 13, backgroundColor: '#fff', borderWidth: 1, borderColor: Brand.line }, fileIcon: { color: Brand.magenta, fontSize: 24 }, fileCopy: { flex: 1, gap: 2 }, fileName: { color: Brand.ink, fontWeight: '900' }, fileAction: { color: Brand.purple, fontSize: 10 }, fileArrow: { color: Brand.magenta, fontSize: 28 }, noFile: { padding: 14, borderRadius: 12, backgroundColor: '#F8F5FA', color: Brand.muted, textAlign: 'center' },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, metric: { width: '30%', flexGrow: 1, padding: 10, borderRadius: 12, backgroundColor: '#F2E8FA' }, metricValue: { color: Brand.purple, fontSize: 20, fontWeight: '900' }, metricLabel: { color: Brand.muted, fontSize: 9 },
  timelineHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, count: { minWidth: 30, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 15, overflow: 'hidden', backgroundColor: Brand.yellow, color: Brand.ink, textAlign: 'center', fontWeight: '900' }, log: { flexDirection: 'row', gap: 12, minHeight: 85 }, dot: { width: 14, height: 14, marginTop: 7, borderRadius: 7, backgroundColor: '#C9BFD0', borderWidth: 3, borderColor: Brand.cream }, dotLatest: { backgroundColor: Brand.magenta }, logCopy: { flex: 1, marginBottom: 9, padding: 13, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: Brand.line }, logTop: { flexDirection: 'row', alignItems: 'center', gap: 8 }, logAction: { color: Brand.ink, fontSize: 14, fontWeight: '900' }, latest: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, overflow: 'hidden', backgroundColor: Brand.yellow, color: Brand.ink, fontSize: 7, fontWeight: '900' }, logDate: { color: Brand.muted, fontSize: 10 }, logActor: { color: Brand.purple, fontSize: 10, fontWeight: '800' },
});
