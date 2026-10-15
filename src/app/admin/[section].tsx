import * as Linking from 'expo-linking';
import { router, type Href, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AdminShell } from '@/components/admin-shell';
import { Button, Card, ErrorMessage, Loading } from '@/components/ui';
import { findAdminModule, type AdminModuleKey } from '@/constants/admin-modules';
import { Brand } from '@/constants/brand';
import { useAuth } from '@/providers/auth-provider';
import { api, apiErrorMessage, SERVER_URL } from '@/services/api';
import type { Product } from '@/types/api';

type DataRow = Record<string, unknown>;

const webPaths: Record<AdminModuleKey, string> = {
  suppliers: 'suppliers', properties: 'properties', banners: 'banners', offers: 'offers', marketing: 'marketing', users: 'users', reports: 'reports', shipping: 'shipping', inventory: 'inventory', branding: 'branding', preview: 'preview',
};

export default function AdminModuleScreen() {
  const { section } = useLocalSearchParams<{ section: AdminModuleKey }>();
  const module = findAdminModule(section);
  const { user, loading: authLoading } = useAuth();
  const [rows, setRows] = useState<DataRow[]>([]);
  const [stats, setStats] = useState<{ label: string; value: string }[]>([]);
  const [loading, setLoading] = useState(module?.native && module.key !== 'preview');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) { router.replace('/admin/login' as Href); return; }
    if (!user || !module) return;
    void loadModule(module.key, setRows, setStats).catch((requestError) => setError(apiErrorMessage(requestError, `No fue posible cargar ${module.title.toLowerCase()}.`))).finally(() => setLoading(false));
  }, [authLoading, module, user]);

  const summaries = useMemo(() => section === 'inventory' ? inventoryStats(rows as unknown as Product[]) : stats, [rows, section, stats]);
  if (!module) return <AdminShell title="Módulo no encontrado"><ErrorMessage message="La sección solicitada no existe." /></AdminShell>;
  if (authLoading || !user) return <AdminShell title={module.title}><Loading /></AdminShell>;

  const openWeb = () => void Linking.openURL(`${SERVER_URL}/admin/${webPaths[module.key]}`);

  return <AdminShell title={module.title} subtitle={module.description} action={module.key === 'preview' ? <Button onPress={() => router.push('/home' as Href)}>Ver app</Button> : undefined}>
    <View style={styles.status}><Text style={styles.statusIcon}>{module.icon}</Text><View style={styles.statusCopy}><Text style={styles.statusTitle}>{module.native ? 'Módulo móvil conectado' : 'Vista móvil preparada'}</Text><Text style={styles.statusText}>{module.native ? 'Los datos se consultan desde la API de Laravel.' : 'Laravel todavía ofrece esta administración únicamente desde el panel web.'}</Text></View></View>
    {summaries.length ? <View style={styles.stats}>{summaries.map((item) => <Card key={item.label} style={styles.stat}><Text style={styles.statValue}>{item.value}</Text><Text style={styles.statLabel}>{item.label}</Text></Card>)}</View> : null}
    {error ? <ErrorMessage message={error} /> : null}
    {loading ? <Loading label={`Cargando ${module.title.toLowerCase()}…`} /> : null}
    {!loading && module.native ? <NativeContent section={module.key} rows={rows} /> : null}
    {!module.native ? <Card><Text style={styles.cardTitle}>Administración disponible en Laravel</Text><Text style={styles.cardCopy}>La experiencia móvil ya tiene su acceso y contexto. Para altas, edición y acciones de este módulo todavía se necesita exponer sus rutas web mediante una API segura.</Text><Button variant="yellow" onPress={openWeb}>Abrir panel web</Button></Card> : null}
  </AdminShell>;
}

async function loadModule(key: AdminModuleKey, setRows: (rows: DataRow[]) => void, setStats: (stats: { label: string; value: string }[]) => void) {
  if (key === 'preview') return;
  if (key === 'suppliers') { const response = await api.get('/admin/suppliers', { params: { per_page: 100 } }); const rows = extractRows(response.data); setRows(rows); setStats([{ label: 'Vendedores', value: String(rows.length) }, { label: 'Destacados', value: String(rows.filter((row) => Boolean(row.featured)).length) }]); return; }
  if (key === 'inventory') { const response = await api.get('/admin/products', { params: { per_page: 100 } }); setRows(extractRows(response.data)); return; }
  if (key === 'branding') { const response = await api.get('/branding-requests'); const rows = extractRows(response.data); setRows(rows); setStats([{ label: 'Solicitudes', value: String(rows.length) }, { label: 'Pendientes', value: String(rows.filter((row) => String(row.status).includes('pending') || String(row.status).includes('review')).length) }]); return; }
  if (key === 'reports') {
    const [productsResponse, suppliersResponse, paymentsResponse] = await Promise.all([api.get('/admin/products', { params: { per_page: 100 } }), api.get('/admin/suppliers', { params: { per_page: 100 } }), api.get('/admin/payments')]);
    const products = extractRows(productsResponse.data); const suppliers = extractRows(suppliersResponse.data); const payments = extractRows(paymentsResponse.data); setRows(products.slice(0, 10)); setStats([{ label: 'Productos', value: String(products.length) }, { label: 'Vendedores', value: String(suppliers.length) }, { label: 'Pagos', value: String(payments.length) }]);
  }
}

function extractRows(payload: unknown): DataRow[] {
  let current = payload as { data?: unknown } | unknown[];
  for (let depth = 0; depth < 3; depth += 1) { if (Array.isArray(current)) return current as DataRow[]; if (current && typeof current === 'object' && 'data' in current) current = (current as { data: never }).data; else break; }
  return [];
}

function inventoryStats(products: Product[]) { const total = products.reduce((sum, product) => sum + Number(product.stock || 0), 0); return [{ label: 'Productos', value: String(products.length) }, { label: 'Unidades', value: total.toLocaleString('es-MX') }, { label: 'Stock bajo', value: String(products.filter((product) => product.stock <= 20).length) }]; }

function NativeContent({ section, rows }: { section: AdminModuleKey; rows: DataRow[] }) {
  if (section === 'preview') return <Card><Text style={styles.cardTitle}>Experiencia pública</Text><Text style={styles.cardCopy}>Comprueba portada, catálogo, categorías, locales y detalle de producto exactamente como los verá el cliente.</Text></Card>;
  if (!rows.length) return <Card><Text style={styles.cardCopy}>No hay registros disponibles en este momento.</Text></Card>;
  return <View style={styles.list}>{rows.slice(0, 30).map((row, index) => <Card key={String(row.id ?? index)} style={styles.row}><View style={styles.rowCopy}><Text style={styles.rowTitle}>{rowTitle(section, row)}</Text><Text style={styles.rowMeta}>{rowMeta(section, row)}</Text></View>{section === 'inventory' ? <Text style={styles.rowValue}>{String(row.stock ?? 0)}</Text> : null}</Card>)}</View>;
}

function rowTitle(section: AdminModuleKey, row: DataRow) { if (section === 'suppliers') return String(row.company_name ?? 'Vendedor'); if (section === 'branding') return String((row.product as DataRow | undefined)?.name ?? `Solicitud #${row.id ?? ''}`); return String(row.name ?? `Registro #${row.id ?? ''}`); }
function rowMeta(section: AdminModuleKey, row: DataRow) { if (section === 'suppliers') return String(row.contact_email ?? row.contact_name ?? 'Sin contacto registrado'); if (section === 'branding') return `${String(row.status ?? 'pendiente')} · ${String(row.quantity ?? 0)} piezas`; if (section === 'inventory') return `${String(row.status ?? 'sin estado')} · ${String((row.supplier as DataRow | undefined)?.company_name ?? 'Sin vendedor')}`; return String(row.status ?? 'Activo'); }

const styles = StyleSheet.create({ status: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 18, backgroundColor: Brand.ink }, statusIcon: { color: Brand.yellow, fontSize: 30 }, statusCopy: { flex: 1, gap: 3 }, statusTitle: { color: '#fff', fontWeight: '900' }, statusText: { color: '#D9CFDF', fontSize: 12, lineHeight: 17 }, stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, stat: { minWidth: 100, flex: 1, alignItems: 'center' }, statValue: { color: Brand.purple, fontSize: 25, fontWeight: '900' }, statLabel: { color: Brand.muted, fontSize: 11, textAlign: 'center' }, cardTitle: { color: Brand.ink, fontSize: 20, fontWeight: '900' }, cardCopy: { color: Brand.muted, lineHeight: 20 }, list: { gap: 8 }, row: { flexDirection: 'row', alignItems: 'center' }, rowCopy: { flex: 1, gap: 4 }, rowTitle: { color: Brand.ink, fontSize: 15, fontWeight: '900' }, rowMeta: { color: Brand.muted, fontSize: 12 }, rowValue: { color: Brand.purple, fontSize: 20, fontWeight: '900' } });
