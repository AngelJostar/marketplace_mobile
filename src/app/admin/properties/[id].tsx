import { router, type Href, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AdminShell } from '@/components/admin-shell';
import { Card, ErrorMessage, Loading } from '@/components/ui';
import { Brand } from '@/constants/brand';
import { useAuth } from '@/providers/auth-provider';
import { api, apiErrorMessage } from '@/services/api';
import type { ItemResponse, Locale, Property } from '@/types/api';

export default function AdminPropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProperty = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const response = await api.get<ItemResponse<Property>>(`/admin/properties/${id}`);
      setProperty(response.data.data);
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'No fue posible cargar la propiedad.'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/admin/login' as Href);
  }, [authLoading, user]);

  useEffect(() => {
    if (user) void loadProperty();
  }, [loadProperty, user]);

  if (authLoading || !user) return <AdminShell title="Propiedad"><Loading /></AdminShell>;

  return <AdminShell title={property?.name ?? 'Propiedad'} subtitle="Detalle operativo y locales vinculados">
    {error ? <ErrorMessage message={error} /> : null}
    {loading ? <Loading label="Cargando propiedad…" /> : null}
    {!loading && property ? <PropertyDetail property={property} /> : null}
  </AdminShell>;
}

function PropertyDetail({ property }: { property: Property }) {
  const money = Number(property.receivable).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
  return <>
    <Card style={styles.hero}>
      <View style={styles.heroTop}><Text style={styles.heroType}>{property.type === 'commercial_plaza' ? 'PLAZA COMERCIAL' : property.type.toUpperCase()}</Text><Text style={styles.heroStatus}>{property.status === 'active' ? 'ACTIVA' : property.status.toUpperCase()}</Text></View>
      <Text style={styles.heroName}>{property.name}</Text>
      <View style={styles.progressTrack}><View style={[styles.progress, { width: `${Math.min(property.occupancy_percentage, 100)}%` }]} /></View>
      <Text style={styles.progressLabel}>{property.occupied} de {property.units} unidades ocupadas · {property.occupancy_percentage}%</Text>
    </Card>

    <View style={styles.metrics}><Metric value={String(property.available_units)} label="Disponibles" /><Metric value={String(property.occupied_locales_count ?? 0)} label="Locales activos" /><Metric value={money} label="Por cobrar" /></View>

    <Card>
      <Text style={styles.sectionTitle}>Responsables</Text>
      <DataRow label="Operación" value={property.property_manager || 'Sin asignar'} />
      <DataRow label="Cobranza" value={property.accounting_manager || 'Sin asignar'} />
    </Card>

    <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>Locales</Text><Text style={styles.count}>{property.locales?.length ?? 0}</Text></View>
    {!property.locales?.length ? <Card><Text style={styles.empty}>No hay locales vinculados a esta propiedad.</Text></Card> : null}
    <View style={styles.locales}>{property.locales?.map((locale) => <LocaleCard key={locale.id} locale={locale} />)}</View>
  </>;
}

function Metric({ value, label }: { value: string; label: string }) {
  return <Card style={styles.metric}><Text numberOfLines={1} style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></Card>;
}

function DataRow({ label, value }: { label: string; value: string }) {
  return <View style={styles.dataRow}><Text style={styles.dataLabel}>{label}</Text><Text style={styles.dataValue}>{value}</Text></View>;
}

function LocaleCard({ locale }: { locale: Locale }) {
  const supplier = locale.supplier;
  return <View style={styles.locale}>
    <View style={styles.localeTop}><View style={styles.localeCopy}><Text style={styles.localeName}>{locale.name || `Local ${locale.number}`}</Text><Text style={styles.localeNumber}>Local {locale.number}{locale.zone ? ` · ${locale.zone}` : ''}</Text></View><Text style={[styles.occupancy, !locale.is_occupied && styles.available]}>{locale.is_occupied ? 'OCUPADO' : 'NO OCUPADO'}</Text></View>
    <View style={styles.divider} />
    <DataRow label="Vendedor" value={supplier?.company_name || 'Sin vendedor vinculado'} />
    <DataRow label="Contacto" value={supplier?.contact_name || locale.manager || 'Sin contacto'} />
    {supplier?.contact_email ? <Text style={styles.contact}>{supplier.contact_email}</Text> : null}
    {supplier?.contact_phone ? <Text style={styles.contact}>{supplier.contact_phone}</Text> : null}
    {(locale.contract_start || locale.contract_end) ? <Text style={styles.contract}>Contrato: {locale.contract_start || '—'} a {locale.contract_end || '—'}</Text> : null}
  </View>;
}

const styles = StyleSheet.create({
  hero: { backgroundColor: Brand.purple, borderColor: Brand.purple },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  heroType: { color: Brand.yellow, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  heroStatus: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, overflow: 'hidden', backgroundColor: '#D7F8EC', color: '#087C59', fontSize: 9, fontWeight: '900' },
  heroName: { color: '#fff', fontSize: 27, lineHeight: 31, fontWeight: '900' },
  progressTrack: { height: 9, borderRadius: 9, overflow: 'hidden', backgroundColor: '#5A168F' },
  progress: { height: '100%', backgroundColor: Brand.yellow },
  progressLabel: { color: '#EEDFFF', fontSize: 12 },
  metrics: { flexDirection: 'row', gap: 7 },
  metric: { flex: 1, minWidth: 0, alignItems: 'center', paddingHorizontal: 7, paddingVertical: 12 },
  metricValue: { color: Brand.purple, fontSize: 17, fontWeight: '900' },
  metricLabel: { color: Brand.muted, fontSize: 9, textAlign: 'center' },
  sectionTitle: { color: Brand.ink, fontSize: 20, fontWeight: '900' },
  dataRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  dataLabel: { color: Brand.muted, fontSize: 12 },
  dataValue: { flex: 1, color: Brand.ink, fontSize: 13, fontWeight: '800', textAlign: 'right' },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  count: { minWidth: 30, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 15, overflow: 'hidden', backgroundColor: Brand.yellow, color: Brand.ink, textAlign: 'center', fontWeight: '900' },
  locales: { gap: 9 },
  locale: { gap: 9, padding: 15, borderRadius: 18, backgroundColor: '#fff', borderWidth: 1, borderColor: Brand.line },
  localeTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  localeCopy: { flex: 1, gap: 3 },
  localeName: { color: Brand.ink, fontSize: 17, fontWeight: '900' },
  localeNumber: { color: Brand.muted, fontSize: 12 },
  occupancy: { paddingHorizontal: 7, paddingVertical: 4, borderRadius: 7, overflow: 'hidden', backgroundColor: '#D7F8EC', color: '#087C59', fontSize: 8, fontWeight: '900' },
  available: { backgroundColor: '#FFF0C2', color: '#865900' },
  divider: { height: 1, backgroundColor: Brand.line },
  contact: { color: Brand.purple, fontSize: 12, fontWeight: '700' },
  contract: { color: Brand.muted, fontSize: 11 },
  empty: { color: Brand.muted, textAlign: 'center' },
});
