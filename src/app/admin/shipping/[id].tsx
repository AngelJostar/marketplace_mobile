import { router, type Href, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AdminShell } from '@/components/admin-shell';
import { Button, Card, ErrorMessage, Field, Loading } from '@/components/ui';
import { Brand } from '@/constants/brand';
import { shipmentStatuses, shipmentStatusLabel, type ShipmentStatus } from '@/constants/shipping';
import { useAuth } from '@/providers/auth-provider';
import { api, apiErrorMessage } from '@/services/api';
import type { ItemResponse, Shipment, ShipmentEvent } from '@/types/api';

export default function AdminShipmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<ShipmentStatus>('pending');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadShipment = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const response = await api.get<ItemResponse<Shipment>>(`/admin/shipping/${id}`);
      setShipment(response.data.data);
      setSelectedStatus(response.data.data.status as ShipmentStatus);
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'No fue posible cargar el envío.'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/admin/login' as Href);
  }, [authLoading, user]);

  useEffect(() => {
    if (user) void loadShipment();
  }, [loadShipment, user]);

  const updateShipment = async () => {
    if (!shipment) return;
    setSaving(true);
    setError('');
    try {
      const response = await api.patch<ItemResponse<Shipment>>(`/admin/shipping/${shipment.id}`, { status: selectedStatus, note: note.trim() || null });
      setShipment(response.data.data);
      setNote('');
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'No fue posible actualizar la trazabilidad.'));
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user) return <AdminShell title="Envío"><Loading /></AdminShell>;

  return <AdminShell title={shipment?.order?.number ?? 'Envío'} subtitle="Guía e historial de trazabilidad">
    {error ? <ErrorMessage message={error} /> : null}
    {loading ? <Loading label="Cargando envío…" /> : null}
    {!loading && shipment ? <>
      <ShipmentSummary shipment={shipment} />
      <Card style={styles.updateCard}>
        <Text style={styles.sectionTitle}>Registrar movimiento</Text>
        <Text style={styles.help}>Selecciona el nuevo estado y agrega una nota operativa opcional.</Text>
        <View style={styles.statuses}>{shipmentStatuses.map((item) => <Pressable key={item.key} onPress={() => setSelectedStatus(item.key)} style={[styles.statusChoice, selectedStatus === item.key && styles.statusChoiceActive]}><Text style={[styles.statusChoiceText, selectedStatus === item.key && styles.statusChoiceTextActive]}>{item.label}</Text></Pressable>)}</View>
        <Field label="Nota de trazabilidad" value={note} onChangeText={setNote} multiline placeholder="Ej. Paquete recibido por la paquetería" />
        <Button disabled={saving} onPress={() => void updateShipment()}>{saving ? 'Actualizando…' : 'Guardar movimiento'}</Button>
      </Card>
      <View style={styles.timelineHeading}><Text style={styles.sectionTitle}>Trazabilidad</Text><Text style={styles.count}>{shipment.events.length}</Text></View>
      <View style={styles.timeline}>{[...shipment.events].reverse().map((event, index) => <EventCard key={`${event.at}-${index}`} event={event} latest={index === 0} />)}</View>
    </> : null}
  </AdminShell>;
}

function ShipmentSummary({ shipment }: { shipment: Shipment }) {
  return <Card style={styles.hero}>
    <View style={styles.heroTop}><Text style={styles.heroKicker}>ENVÍO #{shipment.id}</Text><Text style={styles.heroStatus}>{shipmentStatusLabel(shipment.status).toUpperCase()}</Text></View>
    <Text style={styles.heroOrder}>{shipment.order?.number ?? 'Orden sin número'}</Text>
    <Text style={styles.heroTracking}>{shipment.tracking_number || 'Guía pendiente'}</Text>
    <View style={styles.heroGrid}><SummaryItem label="Paquetería" value={shipment.carrier || 'Pendiente'} /><SummaryItem label="Cliente" value={shipment.order?.customer?.name || 'Sin nombre'} /><SummaryItem label="Vendedor" value={shipment.supplier?.company_name || 'No asignado'} /><SummaryItem label="Total" value={Number(shipment.order?.total ?? 0).toLocaleString('es-MX', { style: 'currency', currency: shipment.order?.currency ?? 'MXN' })} /></View>
  </Card>;
}

function SummaryItem({ label, value }: { label: string; value: string }) { return <View style={styles.summaryItem}><Text style={styles.summaryLabel}>{label}</Text><Text numberOfLines={2} style={styles.summaryValue}>{value}</Text></View>; }

function EventCard({ event, latest }: { event: ShipmentEvent; latest: boolean }) {
  const date = event.at ? new Date(event.at).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' }) : 'Sin fecha';
  return <View style={styles.event}><View style={[styles.dot, latest && styles.dotLatest]} /><View style={styles.eventCopy}><View style={styles.eventTop}><Text style={styles.eventStatus}>{shipmentStatusLabel(event.status)}</Text>{latest ? <Text style={styles.latest}>ÚLTIMO</Text> : null}</View><Text style={styles.eventDate}>{date}</Text><Text style={styles.eventNote}>{event.note || 'Movimiento operativo sin nota.'}</Text></View></View>;
}

const styles = StyleSheet.create({
  hero: { backgroundColor: Brand.ink, borderColor: Brand.ink }, heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }, heroKicker: { color: Brand.yellow, fontSize: 10, fontWeight: '900', letterSpacing: 1 }, heroStatus: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 7, overflow: 'hidden', backgroundColor: '#D7F8EC', color: '#087C59', fontSize: 8, fontWeight: '900' }, heroOrder: { color: '#fff', fontSize: 27, fontWeight: '900' }, heroTracking: { color: '#EEDFFF', fontSize: 14 }, heroGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 }, summaryItem: { width: '48%', flexGrow: 1, padding: 10, borderRadius: 12, backgroundColor: '#26302D' }, summaryLabel: { color: '#AAB4B0', fontSize: 9 }, summaryValue: { color: '#fff', fontSize: 12, fontWeight: '800' },
  updateCard: { borderColor: Brand.magenta, borderWidth: 2 }, sectionTitle: { color: Brand.ink, fontSize: 21, fontWeight: '900' }, help: { color: Brand.muted, fontSize: 12, lineHeight: 17 }, statuses: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 }, statusChoice: { paddingHorizontal: 11, paddingVertical: 8, borderRadius: 18, backgroundColor: '#F2E8FA' }, statusChoiceActive: { backgroundColor: Brand.purple }, statusChoiceText: { color: Brand.purple, fontSize: 11, fontWeight: '800' }, statusChoiceTextActive: { color: '#fff' },
  timelineHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, count: { minWidth: 30, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 15, overflow: 'hidden', backgroundColor: Brand.yellow, color: Brand.ink, textAlign: 'center', fontWeight: '900' }, timeline: { gap: 0 }, event: { flexDirection: 'row', gap: 12, minHeight: 92 }, dot: { width: 14, height: 14, marginTop: 7, borderRadius: 7, backgroundColor: '#C9BFD0', borderWidth: 3, borderColor: Brand.cream }, dotLatest: { backgroundColor: Brand.magenta }, eventCopy: { flex: 1, marginBottom: 9, padding: 13, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: Brand.line }, eventTop: { flexDirection: 'row', alignItems: 'center', gap: 8 }, eventStatus: { color: Brand.ink, fontSize: 15, fontWeight: '900' }, latest: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, overflow: 'hidden', backgroundColor: Brand.yellow, color: Brand.ink, fontSize: 7, fontWeight: '900' }, eventDate: { color: Brand.muted, fontSize: 10 }, eventNote: { color: Brand.ink, fontSize: 12, lineHeight: 17 },
});
