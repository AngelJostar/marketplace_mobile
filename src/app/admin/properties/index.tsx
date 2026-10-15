import { router, type Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AdminShell } from '@/components/admin-shell';
import { Button, Card, ErrorMessage, Field, Loading } from '@/components/ui';
import { Brand } from '@/constants/brand';
import { useAuth } from '@/providers/auth-provider';
import { api, apiErrorMessage } from '@/services/api';
import type { CollectionResponse, Property } from '@/types/api';

type OccupancyFilter = 'all' | 'available' | 'full' | 'empty';

const filters: { key: OccupancyFilter; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'available', label: 'Disponibles' },
  { key: 'full', label: 'Llenas' },
  { key: 'empty', label: 'Vacías' },
];

export default function AdminPropertiesScreen() {
  const { user, loading: authLoading } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [filter, setFilter] = useState<OccupancyFilter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProperties = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get<CollectionResponse<Property>>('/admin/properties', {
        params: {
          per_page: 100,
          q: submittedQuery || undefined,
          occupancy: filter === 'all' ? undefined : filter,
        },
      });
      setProperties(response.data.data);
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'No fue posible cargar las propiedades.'));
    } finally {
      setLoading(false);
    }
  }, [filter, submittedQuery]);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/admin/login' as Href);
  }, [authLoading, user]);

  useEffect(() => {
    if (user) void loadProperties();
  }, [loadProperties, user]);

  if (authLoading || !user) return <AdminShell title="Propiedades"><Loading /></AdminShell>;

  const units = properties.reduce((total, property) => total + property.units, 0);
  const occupied = properties.reduce((total, property) => total + property.occupied, 0);
  const available = properties.reduce((total, property) => total + property.available_units, 0);

  return (
    <AdminShell title="Propiedades" subtitle="Ocupación, locales y responsables de la plaza">
      <View style={styles.stats}>
        <Metric value={properties.length} label="Propiedades" />
        <Metric value={units} label="Unidades" />
        <Metric value={occupied} label="Ocupadas" />
        <Metric value={available} label="Disponibles" />
      </View>

      <Card>
        <Field label="Buscar propiedad o responsable" value={query} onChangeText={setQuery} returnKeyType="search" onSubmitEditing={() => setSubmittedQuery(query.trim())} placeholder="Ej. Plaza Mayorista" />
        <Button onPress={() => setSubmittedQuery(query.trim())}>Buscar</Button>
        <View style={styles.filters}>
          {filters.map((item) => <Pressable key={item.key} onPress={() => setFilter(item.key)} style={[styles.filter, filter === item.key && styles.filterActive]}><Text style={[styles.filterText, filter === item.key && styles.filterTextActive]}>{item.label}</Text></Pressable>)}
        </View>
      </Card>

      {error ? <ErrorMessage message={error} /> : null}
      {loading ? <Loading label="Cargando propiedades…" /> : null}
      {!loading && !properties.length ? <Card><Text style={styles.empty}>No hay propiedades que coincidan con los filtros.</Text></Card> : null}
      {!loading ? <View style={styles.list}>{properties.map((property) => <PropertyCard key={property.id} property={property} />)}</View> : null}
    </AdminShell>
  );
}

function Metric({ value, label }: { value: number; label: string }) {
  return <Card style={styles.metric}><Text style={styles.metricValue}>{value.toLocaleString('es-MX')}</Text><Text style={styles.metricLabel}>{label}</Text></Card>;
}

function PropertyCard({ property }: { property: Property }) {
  const money = Number(property.receivable).toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
  return (
    <Pressable onPress={() => router.push(`/admin/properties/${property.id}` as Href)} style={({ pressed }) => [styles.property, pressed && styles.pressed]}>
      <View style={styles.propertyTop}><View style={styles.propertyCopy}><Text style={styles.propertyName}>{property.name}</Text><Text style={styles.propertyMeta}>{property.property_manager || 'Sin responsable operativo'}</Text></View><Text style={[styles.status, property.status !== 'active' && styles.statusInactive]}>{property.status === 'active' ? 'ACTIVA' : property.status.toUpperCase()}</Text></View>
      <View style={styles.progressTrack}><View style={[styles.progress, { width: `${Math.min(property.occupancy_percentage, 100)}%` }]} /></View>
      <View style={styles.propertyMetrics}><SmallMetric value={`${property.occupied}/${property.units}`} label="Ocupación" /><SmallMetric value={`${property.occupancy_percentage}%`} label="Porcentaje" /><SmallMetric value={money} label="Por cobrar" /></View>
      <Text style={styles.open}>Ver locales y responsables ›</Text>
    </Pressable>
  );
}

function SmallMetric({ value, label }: { value: string; label: string }) {
  return <View style={styles.smallMetric}><Text numberOfLines={1} style={styles.smallValue}>{value}</Text><Text style={styles.smallLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metric: { width: '48%', flexGrow: 1, alignItems: 'center', padding: 12 },
  metricValue: { color: Brand.purple, fontSize: 24, fontWeight: '900' },
  metricLabel: { color: Brand.muted, fontSize: 11 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  filter: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F2E8FA' },
  filterActive: { backgroundColor: Brand.purple },
  filterText: { color: Brand.purple, fontSize: 12, fontWeight: '800' },
  filterTextActive: { color: '#fff' },
  list: { gap: 10 },
  property: { gap: 13, padding: 16, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: Brand.line },
  pressed: { opacity: 0.72 },
  propertyTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  propertyCopy: { flex: 1, gap: 4 },
  propertyName: { color: Brand.ink, fontSize: 19, fontWeight: '900' },
  propertyMeta: { color: Brand.muted, fontSize: 12 },
  status: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, overflow: 'hidden', backgroundColor: '#D7F8EC', color: '#087C59', fontSize: 9, fontWeight: '900' },
  statusInactive: { backgroundColor: '#FEE4E2', color: Brand.danger },
  progressTrack: { height: 8, borderRadius: 8, overflow: 'hidden', backgroundColor: '#EEE7F2' },
  progress: { height: '100%', borderRadius: 8, backgroundColor: Brand.magenta },
  propertyMetrics: { flexDirection: 'row', gap: 6 },
  smallMetric: { flex: 1, minWidth: 0, padding: 9, borderRadius: 12, backgroundColor: '#F8F5FA' },
  smallValue: { color: Brand.ink, fontSize: 13, fontWeight: '900' },
  smallLabel: { color: Brand.muted, fontSize: 9 },
  open: { color: Brand.purple, fontWeight: '900' },
  empty: { color: Brand.muted, textAlign: 'center' },
});
