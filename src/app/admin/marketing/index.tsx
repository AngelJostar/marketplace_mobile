import { router, type Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AdminShell } from '@/components/admin-shell';
import { Button, Card, ErrorMessage, Field, Loading } from '@/components/ui';
import { Brand } from '@/constants/brand';
import { useAuth } from '@/providers/auth-provider';
import { api, apiErrorMessage } from '@/services/api';
import type { CollectionResponse, MarketingCampaign } from '@/types/api';

const statuses = [
  { key: 'all', label: 'Todas' },
  { key: 'in_review', label: 'En revisión' },
  { key: 'needs_information', label: 'Requiere datos' },
  { key: 'approved', label: 'Aprobadas' },
  { key: 'scheduled', label: 'Programadas' },
  { key: 'active', label: 'Activas' },
] as const;

export default function AdminMarketingScreen() {
  const { user, loading: authLoading } = useAuth();
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [status, setStatus] = useState<(typeof statuses)[number]['key']>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get<CollectionResponse<MarketingCampaign>>('/admin/marketing-campaigns', {
        params: { per_page: 100, q: submittedQuery || undefined, status: status === 'all' ? undefined : status },
      });
      setCampaigns(response.data.data);
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'No fue posible cargar las campañas.'));
    } finally {
      setLoading(false);
    }
  }, [status, submittedQuery]);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/admin/login' as Href);
  }, [authLoading, user]);

  useEffect(() => {
    if (user) void loadCampaigns();
  }, [loadCampaigns, user]);

  if (authLoading || !user) return <AdminShell title="Marketing"><Loading /></AdminShell>;

  const investment = campaigns.reduce((sum, campaign) => sum + Number(campaign.total_payment || 0), 0);
  return <AdminShell title="Marketing" subtitle="Campañas, inversión y soporte promocional">
    <View style={styles.stats}>
      <Metric value={String(campaigns.length)} label="Campañas" />
      <Metric value={String(campaigns.filter((item) => ['in_review', 'needs_information'].includes(item.status)).length)} label="Por revisar" />
      <Metric value={compactCurrency(investment)} label="Inversión" />
    </View>

    <Card>
      <Field label="Buscar folio, campaña, vendedor o producto" value={query} onChangeText={setQuery} returnKeyType="search" onSubmitEditing={() => setSubmittedQuery(query.trim())} placeholder="Ej. MKT-2026 o Atelier" />
      <Button onPress={() => setSubmittedQuery(query.trim())}>Buscar</Button>
      <View style={styles.filters}>{statuses.map((item) => <FilterChip key={item.key} active={status === item.key} label={item.label} onPress={() => setStatus(item.key)} />)}</View>
    </Card>

    {error ? <ErrorMessage message={error} /> : null}
    {loading ? <Loading label="Cargando campañas…" /> : null}
    {!loading && !campaigns.length ? <Card><Text style={styles.empty}>No hay campañas que coincidan con los filtros.</Text></Card> : null}
    {!loading ? <View style={styles.list}>{campaigns.map((campaign) => <CampaignCard key={campaign.id} campaign={campaign} />)}</View> : null}
  </AdminShell>;
}

function CampaignCard({ campaign }: { campaign: MarketingCampaign }) {
  return <Pressable onPress={() => router.push(`/admin/marketing/${campaign.id}` as Href)} style={({ pressed }) => [styles.campaign, pressed && styles.pressed]}>
    <View style={styles.top}>
      <View style={styles.copy}><Text style={styles.folio}>{campaign.folio}</Text><Text style={styles.name}>{campaign.name}</Text></View>
      <StatusBadge campaign={campaign} />
    </View>
    <Text style={styles.relation}>{campaign.supplier?.company_name ?? 'Vendedor no asignado'} · {campaign.product?.name ?? 'Producto no asignado'}</Text>
    <View style={styles.moneyRow}><Money label="Pago total" value={currency(campaign.total_payment, campaign.currency)} /><Money label="Publicidad" value={currency(campaign.advertising_budget_total, campaign.currency)} /></View>
    <Text style={styles.dates}>{dateRange(campaign.starts_on, campaign.ends_on)}</Text>
    <Text style={styles.open}>Ver inversión y soporte ›</Text>
  </Pressable>;
}

function StatusBadge({ campaign }: { campaign: MarketingCampaign }) { return <Text style={[styles.status, ['active', 'approved'].includes(campaign.status) && styles.statusSuccess, campaign.status === 'needs_information' && styles.statusWarning]}>{campaign.status_label.toUpperCase()}</Text>; }
function Money({ label, value }: { label: string; value: string }) { return <View style={styles.money}><Text style={styles.moneyLabel}>{label}</Text><Text style={styles.moneyValue}>{value}</Text></View>; }
function Metric({ value, label }: { value: string; label: string }) { return <Card style={styles.metric}><Text numberOfLines={1} adjustsFontSizeToFit style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></Card>; }
function FilterChip({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) { return <Pressable onPress={onPress} style={[styles.filter, active && styles.filterActive]}><Text style={[styles.filterText, active && styles.filterTextActive]}>{label}</Text></Pressable>; }
function currency(value: string | number, code = 'MXN') { return Number(value || 0).toLocaleString('es-MX', { style: 'currency', currency: code }); }
function compactCurrency(value: number) { return value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', notation: 'compact', maximumFractionDigits: 1 }); }
function dateRange(start?: string | null, end?: string | null) { return `${formatDate(start)} — ${formatDate(end)}`; }
function formatDate(value?: string | null) { return value ? new Date(`${value}T12:00:00`).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Sin fecha'; }

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: 8 }, metric: { flex: 1, alignItems: 'center', paddingHorizontal: 7, paddingVertical: 12 }, metricValue: { color: Brand.purple, fontSize: 21, fontWeight: '900' }, metricLabel: { color: Brand.muted, fontSize: 10, textAlign: 'center' },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 }, filter: { paddingHorizontal: 11, paddingVertical: 8, borderRadius: 18, backgroundColor: '#F2E8FA' }, filterActive: { backgroundColor: Brand.purple }, filterText: { color: Brand.purple, fontSize: 11, fontWeight: '800' }, filterTextActive: { color: '#fff' },
  list: { gap: 10 }, campaign: { gap: 11, padding: 15, borderRadius: 19, backgroundColor: '#fff', borderWidth: 1, borderColor: Brand.line }, pressed: { opacity: .7 }, top: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 }, copy: { flex: 1, gap: 4 }, folio: { color: Brand.magenta, fontSize: 10, fontWeight: '900', letterSpacing: .7 }, name: { color: Brand.ink, fontSize: 19, fontWeight: '900' }, relation: { color: Brand.muted, fontSize: 12, lineHeight: 17 }, status: { maxWidth: 118, paddingHorizontal: 7, paddingVertical: 4, borderRadius: 7, overflow: 'hidden', backgroundColor: '#EEE8F1', color: Brand.purple, fontSize: 7, fontWeight: '900' }, statusSuccess: { backgroundColor: '#D7F8EC', color: '#087C59' }, statusWarning: { backgroundColor: '#FFF0C2', color: '#865900' }, moneyRow: { flexDirection: 'row', gap: 8 }, money: { flex: 1, padding: 10, borderRadius: 12, backgroundColor: '#F8F5FA' }, moneyLabel: { color: Brand.muted, fontSize: 9 }, moneyValue: { color: Brand.ink, fontSize: 14, fontWeight: '900' }, dates: { color: Brand.muted, fontSize: 11 }, open: { color: Brand.purple, fontWeight: '900' }, empty: { color: Brand.muted, textAlign: 'center' },
});
