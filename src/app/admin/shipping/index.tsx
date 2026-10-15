import { router, type Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AdminShell } from '@/components/admin-shell';
import { Button, Card, ErrorMessage, Field, Loading } from '@/components/ui';
import { Brand } from '@/constants/brand';
import { shipmentStatuses, shipmentStatusLabel, type ShipmentStatus } from '@/constants/shipping';
import { useAuth } from '@/providers/auth-provider';
import { api, apiErrorMessage } from '@/services/api';
import type { Shipment, ShipmentCollectionResponse, ShipmentOrder } from '@/types/api';

type StatusFilter = 'all' | ShipmentStatus;

export default function AdminShippingScreen() {
  const { user, loading: authLoading } = useAuth();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [orders, setOrders] = useState<ShipmentOrder[]>([]);
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [carrier, setCarrier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [saving, setSaving] = useState(false);

  const loadShipping = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get<ShipmentCollectionResponse>('/admin/shipping', {
        params: { per_page: 100, q: submittedQuery || undefined, status: status === 'all' ? undefined : status },
      });
      setShipments(response.data.data);
      setOrders(response.data.orders ?? []);
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'No fue posible cargar los envíos.'));
    } finally {
      setLoading(false);
    }
  }, [status, submittedQuery]);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/admin/login' as Href);
  }, [authLoading, user]);

  useEffect(() => {
    if (user) void loadShipping();
  }, [loadShipping, user]);

  const createShipment = async () => {
    if (!selectedOrderId) {
      setError('Selecciona una orden antes de crear el envío.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.post('/admin/shipping', { order_id: selectedOrderId, carrier: carrier.trim() || null, tracking_number: trackingNumber.trim() || null });
      setSelectedOrderId(null);
      setCarrier('');
      setTrackingNumber('');
      setShowCreate(false);
      await loadShipping();
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'No fue posible crear el envío.'));
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user) return <AdminShell title="Envíos"><Loading /></AdminShell>;

  return <AdminShell title="Envíos" subtitle="Órdenes, guías y trazabilidad de entregas" action={<Button variant="yellow" onPress={() => setShowCreate((value) => !value)}>{showCreate ? 'Cerrar' : 'Nuevo'}</Button>}>
    <View style={styles.stats}>
      <Metric value={shipments.length} label="Envíos" />
      <Metric value={shipments.filter((item) => item.status === 'in_transit').length} label="En tránsito" />
      <Metric value={shipments.filter((item) => item.status === 'delivered').length} label="Entregados" />
    </View>

    {showCreate ? <CreateShipmentCard orders={orders} selectedOrderId={selectedOrderId} onSelectOrder={setSelectedOrderId} carrier={carrier} onCarrierChange={setCarrier} trackingNumber={trackingNumber} onTrackingChange={setTrackingNumber} saving={saving} onSubmit={() => void createShipment()} /> : null}

    <Card>
      <Field label="Buscar guía, paquetería u orden" value={query} onChangeText={setQuery} returnKeyType="search" onSubmitEditing={() => setSubmittedQuery(query.trim())} placeholder="Ej. ORD-001 o DHL" />
      <Button onPress={() => setSubmittedQuery(query.trim())}>Buscar</Button>
      <View style={styles.filters}>
        <FilterChip active={status === 'all'} label="Todos" onPress={() => setStatus('all')} />
        {shipmentStatuses.map((item) => <FilterChip key={item.key} active={status === item.key} label={item.label} onPress={() => setStatus(item.key)} />)}
      </View>
    </Card>

    {error ? <ErrorMessage message={error} /> : null}
    {loading ? <Loading label="Cargando envíos…" /> : null}
    {!loading && !shipments.length ? <Card><Text style={styles.empty}>No hay envíos que coincidan con los filtros.</Text></Card> : null}
    {!loading ? <View style={styles.list}>{shipments.map((shipment) => <ShipmentCard key={shipment.id} shipment={shipment} />)}</View> : null}
  </AdminShell>;
}

function CreateShipmentCard({ orders, selectedOrderId, onSelectOrder, carrier, onCarrierChange, trackingNumber, onTrackingChange, saving, onSubmit }: { orders: ShipmentOrder[]; selectedOrderId: number | null; onSelectOrder: (id: number) => void; carrier: string; onCarrierChange: (value: string) => void; trackingNumber: string; onTrackingChange: (value: string) => void; saving: boolean; onSubmit: () => void }) {
  return <Card style={styles.createCard}>
    <Text style={styles.sectionTitle}>Crear envío</Text>
    <Text style={styles.help}>Selecciona una orden reciente. Una orden puede tener más de un envío.</Text>
    <View style={styles.orderList}>{orders.slice(0, 12).map((order) => <Pressable key={order.id} onPress={() => onSelectOrder(order.id)} style={[styles.order, selectedOrderId === order.id && styles.orderSelected]}><View style={styles.orderCopy}><Text style={[styles.orderNumber, selectedOrderId === order.id && styles.orderTextSelected]}>{order.number}</Text><Text style={[styles.orderMeta, selectedOrderId === order.id && styles.orderTextSelected]}>{order.customer?.name ?? 'Cliente'} · {order.shipments_count} envío(s)</Text></View><Text style={[styles.orderTotal, selectedOrderId === order.id && styles.orderTextSelected]}>{Number(order.total).toLocaleString('es-MX', { style: 'currency', currency: order.currency })}</Text></Pressable>)}</View>
    {!orders.length ? <Text style={styles.empty}>No hay órdenes disponibles.</Text> : null}
    <Field label="Paquetería" value={carrier} onChangeText={onCarrierChange} placeholder="DHL, Estafeta…" />
    <Field label="Número de guía" value={trackingNumber} onChangeText={onTrackingChange} placeholder="Puede agregarse después" />
    <Button disabled={saving || !orders.length} onPress={onSubmit}>{saving ? 'Creando…' : 'Crear envío'}</Button>
  </Card>;
}

function ShipmentCard({ shipment }: { shipment: Shipment }) {
  const latestEvent = shipment.events.at(-1);
  return <Pressable onPress={() => router.push(`/admin/shipping/${shipment.id}` as Href)} style={({ pressed }) => [styles.shipment, pressed && styles.pressed]}>
    <View style={styles.shipmentTop}><View style={styles.shipmentCopy}><Text style={styles.shipmentOrder}>{shipment.order?.number ?? `Envío #${shipment.id}`}</Text><Text style={styles.tracking}>{shipment.tracking_number || 'Guía pendiente'} · {shipment.carrier || 'Paquetería pendiente'}</Text></View><StatusBadge status={shipment.status} /></View>
    <View style={styles.divider} />
    <Text style={styles.customer}>{shipment.order?.customer?.name ?? 'Cliente sin nombre'}</Text>
    <Text numberOfLines={2} style={styles.latest}>{latestEvent?.note || `Último movimiento: ${shipmentStatusLabel(latestEvent?.status ?? shipment.status)}`}</Text>
    <Text style={styles.open}>Actualizar y ver trazabilidad ›</Text>
  </Pressable>;
}

function StatusBadge({ status }: { status: string }) { return <Text style={[styles.badge, status === 'delivered' && styles.badgeSuccess, status === 'cancelled' && styles.badgeDanger]}>{shipmentStatusLabel(status).toUpperCase()}</Text>; }
function Metric({ value, label }: { value: number; label: string }) { return <Card style={styles.metric}><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></Card>; }
function FilterChip({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) { return <Pressable onPress={onPress} style={[styles.filter, active && styles.filterActive]}><Text style={[styles.filterText, active && styles.filterTextActive]}>{label}</Text></Pressable>; }

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: 8 }, metric: { flex: 1, alignItems: 'center', paddingHorizontal: 8, paddingVertical: 12 }, metricValue: { color: Brand.purple, fontSize: 23, fontWeight: '900' }, metricLabel: { color: Brand.muted, fontSize: 10, textAlign: 'center' },
  createCard: { borderColor: Brand.magenta, borderWidth: 2 }, sectionTitle: { color: Brand.ink, fontSize: 21, fontWeight: '900' }, help: { color: Brand.muted, fontSize: 12, lineHeight: 17 }, orderList: { gap: 7 }, order: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 11, borderRadius: 12, backgroundColor: '#F8F5FA', borderWidth: 1, borderColor: Brand.line }, orderSelected: { backgroundColor: Brand.purple, borderColor: Brand.purple }, orderCopy: { flex: 1, gap: 2 }, orderNumber: { color: Brand.ink, fontWeight: '900' }, orderMeta: { color: Brand.muted, fontSize: 10 }, orderTotal: { color: Brand.purple, fontSize: 12, fontWeight: '900' }, orderTextSelected: { color: '#fff' },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 }, filter: { paddingHorizontal: 11, paddingVertical: 8, borderRadius: 18, backgroundColor: '#F2E8FA' }, filterActive: { backgroundColor: Brand.purple }, filterText: { color: Brand.purple, fontSize: 11, fontWeight: '800' }, filterTextActive: { color: '#fff' },
  list: { gap: 9 }, shipment: { gap: 10, padding: 15, borderRadius: 19, backgroundColor: '#fff', borderWidth: 1, borderColor: Brand.line }, pressed: { opacity: .7 }, shipmentTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 }, shipmentCopy: { flex: 1, gap: 4 }, shipmentOrder: { color: Brand.ink, fontSize: 18, fontWeight: '900' }, tracking: { color: Brand.muted, fontSize: 11 }, badge: { paddingHorizontal: 7, paddingVertical: 4, borderRadius: 7, overflow: 'hidden', backgroundColor: '#FFF0C2', color: '#865900', fontSize: 8, fontWeight: '900' }, badgeSuccess: { backgroundColor: '#D7F8EC', color: '#087C59' }, badgeDanger: { backgroundColor: '#FEE4E2', color: Brand.danger }, divider: { height: 1, backgroundColor: Brand.line }, customer: { color: Brand.ink, fontSize: 13, fontWeight: '800' }, latest: { color: Brand.muted, fontSize: 12, lineHeight: 17 }, open: { color: Brand.purple, fontWeight: '900' }, empty: { color: Brand.muted, textAlign: 'center' },
});
