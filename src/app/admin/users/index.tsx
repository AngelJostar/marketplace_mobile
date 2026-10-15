import { router, type Href } from 'expo-router';
import { type PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AdminShell } from '@/components/admin-shell';
import { Button, Card, ErrorMessage, Field, Loading } from '@/components/ui';
import { Brand } from '@/constants/brand';
import { useAuth } from '@/providers/auth-provider';
import { api, apiErrorMessage } from '@/services/api';
import type { AdminUser, AdminUsersPayload, ItemResponse, SupplierWithoutUser } from '@/types/api';

type UserGroup = 'internal' | 'suppliers' | 'customers';
const internalRoles = ['admin', 'operator', 'designer'];

export default function AdminUsersScreen() {
  const { user, loading: authLoading } = useAuth();
  const [payload, setPayload] = useState<AdminUsersPayload | null>(null);
  const [group, setGroup] = useState<UserGroup>('internal');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('operator');
  const [editingStatus, setEditingStatus] = useState('active');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get<ItemResponse<AdminUsersPayload>>('/admin/users');
      setPayload(response.data.data);
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'No fue posible cargar los usuarios.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/admin/login' as Href);
  }, [authLoading, user]);

  useEffect(() => {
    if (user) void loadUsers();
  }, [loadUsers, user]);

  const openEditor = (selected: AdminUser) => {
    setEditing(selected);
    setName(selected.name);
    setCompany(selected.company ?? '');
    setRole(selected.role);
    setEditingStatus(selected.status);
    setError('');
  };

  const saveUser = async () => {
    if (!editing) return;
    setSaving(true);
    setError('');
    try {
      const response = await api.put<ItemResponse<AdminUser>>(`/admin/users/${editing.id}`, { name: name.trim(), company: company.trim() || null, role, status: editingStatus });
      setPayload((current) => current ? { ...current, users: current.users.map((item) => item.id === editing.id ? response.data.data : item) } : current);
      setEditing(null);
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'No fue posible actualizar el usuario.'));
    } finally {
      setSaving(false);
    }
  };

  const users = payload?.users ?? [];
  const internalUsers = users.filter((item) => internalRoles.includes(item.role));
  const supplierUsers = users.filter((item) => item.role === 'supplier');
  const customerUsers = users.filter((item) => item.role === 'customer');
  const sourceUsers = group === 'internal' ? internalUsers : group === 'suppliers' ? supplierUsers : customerUsers;
  const needle = query.trim().toLocaleLowerCase('es-MX');
  const filteredUsers = sourceUsers.filter((item) => {
    const searchable = [item.name, item.email, item.company, item.supplier?.company_name, item.customer_profile?.company_name].filter(Boolean).join(' ').toLocaleLowerCase('es-MX');
    return (!needle || searchable.includes(needle)) && (status === 'all' || item.status === status);
  });
  const suppliersWithoutUser = (payload?.suppliers_without_user ?? []).filter((item) => !query.trim() || item.company_name.toLocaleLowerCase('es-MX').includes(query.trim().toLocaleLowerCase('es-MX')));

  if (authLoading || !user) return <AdminShell title="Usuarios"><Loading /></AdminShell>;

  return <AdminShell title="Usuarios" subtitle="Roles, accesos y perfiles de la plataforma">
    <View style={styles.stats}>
      <Metric value={internalUsers.length} label="Equipo interno" />
      <Metric value={supplierUsers.length + (payload?.suppliers_without_user.length ?? 0)} label="Vendedores" />
      <Metric value={customerUsers.length} label="Compradores" />
    </View>

    <View style={styles.groups}>
      <GroupTab active={group === 'internal'} label="Internos" onPress={() => { setGroup('internal'); setEditing(null); }} />
      <GroupTab active={group === 'suppliers'} label="Vendedores" onPress={() => { setGroup('suppliers'); setEditing(null); }} />
      <GroupTab active={group === 'customers'} label="Compradores" onPress={() => { setGroup('customers'); setEditing(null); }} />
    </View>

    <Card>
      <Field label="Buscar nombre, correo o empresa" value={query} onChangeText={setQuery} placeholder="Ej. Atelier o usuario@correo.com" />
      <View style={styles.filters}><FilterChip active={status === 'all'} label="Todos" onPress={() => setStatus('all')} />{payload?.options.statuses.map((item) => <FilterChip key={item.value} active={status === item.value} label={item.label} onPress={() => setStatus(item.value)} />)}</View>
    </Card>

    {error ? <ErrorMessage message={error} /> : null}
    {editing ? <UserEditor user={editing} name={name} onNameChange={setName} company={company} onCompanyChange={setCompany} role={role} onRoleChange={setRole} status={editingStatus} onStatusChange={setEditingStatus} saving={saving} onCancel={() => setEditing(null)} onSave={() => void saveUser()} /> : null}
    {loading ? <Loading label="Cargando usuarios…" /> : null}

    {!loading && group === 'internal' ? <UserSection eyebrow="Panel interno" title="Equipo administrativo" copy="Controla permisos, estado y empresa del equipo que opera la plataforma.">{filteredUsers.map((item) => <InternalUserCard key={item.id} user={item} onEdit={() => openEditor(item)} />)}</UserSection> : null}
    {!loading && group === 'suppliers' ? <UserSection eyebrow="Panel vendedores" title="Vendedores y arrendatarios" copy="Incluye explícitamente el usuario de acceso y los perfiles comerciales que aún no tienen cuenta.">{filteredUsers.map((item) => <SupplierUserCard key={item.id} user={item} />)}{status === 'all' ? suppliersWithoutUser.map((item) => <SupplierWithoutAccessCard key={item.id} supplier={item} />) : null}</UserSection> : null}
    {!loading && group === 'customers' ? <UserSection eyebrow="Panel compradores" title="Usuarios de la plataforma" copy="Público general y compradores registrados en el marketplace.">{filteredUsers.map((item) => <CustomerUserCard key={item.id} user={item} />)}</UserSection> : null}
    {!loading && !filteredUsers.length && !(group === 'suppliers' && status === 'all' && suppliersWithoutUser.length) ? <Card><Text style={styles.empty}>No hay usuarios que coincidan con los filtros.</Text></Card> : null}
  </AdminShell>;
}

function UserEditor({ user, name, onNameChange, company, onCompanyChange, role, onRoleChange, status, onStatusChange, saving, onCancel, onSave }: { user: AdminUser; name: string; onNameChange: (value: string) => void; company: string; onCompanyChange: (value: string) => void; role: string; onRoleChange: (value: string) => void; status: string; onStatusChange: (value: string) => void; saving: boolean; onCancel: () => void; onSave: () => void }) {
  return <Card style={styles.editor}><View style={styles.editorHeading}><View style={styles.editorCopy}><Text style={styles.sectionTitle}>Editar usuario interno</Text><Text style={styles.email}>{user.email}</Text></View><Pressable onPress={onCancel}><Text style={styles.close}>Cerrar</Text></Pressable></View><Field label="Nombre" value={name} onChangeText={onNameChange} /><Field label="Empresa" value={company} onChangeText={onCompanyChange} placeholder="Sin empresa" /><Text style={styles.choiceLabel}>Rol interno</Text><View style={styles.filters}>{[['admin', 'Superadministrador'], ['operator', 'Operador'], ['designer', 'Diseñador']].map(([value, label]) => <FilterChip key={value} active={role === value} label={label} onPress={() => onRoleChange(value)} />)}</View><Text style={styles.choiceLabel}>Estado</Text><View style={styles.filters}>{[['active', 'Activo'], ['disabled', 'Deshabilitado'], ['suspended', 'Suspendido']].map(([value, label]) => <FilterChip key={value} active={status === value} label={label} onPress={() => onStatusChange(value)} />)}</View><Button disabled={saving || !name.trim()} onPress={onSave}>{saving ? 'Guardando…' : 'Guardar cambios'}</Button></Card>;
}

function UserSection({ eyebrow, title, copy, children }: PropsWithChildren<{ eyebrow: string; title: string; copy: string }>) { return <View style={styles.section}><Text style={styles.eyebrow}>{eyebrow}</Text><Text style={styles.sectionTitle}>{title}</Text><Text style={styles.sectionCopy}>{copy}</Text><View style={styles.list}>{children}</View></View>; }
function InternalUserCard({ user, onEdit }: { user: AdminUser; onEdit: () => void }) { return <Card><View style={styles.cardTop}><Avatar name={user.name} /><View style={styles.cardCopy}><Text style={styles.cardTitle}>{user.name}</Text><Text style={styles.email}>{user.email}</Text></View><StatusBadge user={user} /></View><View style={styles.detailGrid}><Detail label="Rol interno" value={user.role_label} /><Detail label="Empresa" value={user.company || 'Sin empresa'} /></View><Button variant="secondary" onPress={onEdit}>Editar acceso</Button></Card>; }
function SupplierUserCard({ user }: { user: AdminUser }) { return <Card><View style={styles.cardTop}><Avatar name={user.supplier?.company_name ?? user.name} /><View style={styles.cardCopy}><Text style={styles.cardTitle}>{user.supplier?.company_name ?? user.name}</Text><Text style={styles.cardType}>VENDEDOR / ARRENDATARIO</Text></View><StatusBadge user={user} /></View><View style={styles.access}><Text style={styles.accessLabel}>USUARIO DE ACCESO</Text><Text style={styles.accessValue}>{user.email}</Text><Text style={styles.accessMeta}>{user.name} · {user.role_label}</Text></View><View style={styles.detailGrid}><Detail label="Local" value={user.supplier?.locale?.name || 'Sin local'} /><Detail label="Propiedad" value={user.supplier?.locale?.property_name || 'Sin propiedad'} /></View></Card>; }
function SupplierWithoutAccessCard({ supplier }: { supplier: SupplierWithoutUser }) { return <Card style={styles.noAccessCard}><View style={styles.cardTop}><Avatar name={supplier.company_name} /><View style={styles.cardCopy}><Text style={styles.cardTitle}>{supplier.company_name}</Text><Text style={styles.cardType}>VENDEDOR / ARRENDATARIO</Text></View><Text style={styles.noAccessBadge}>SIN ACCESO</Text></View><View style={styles.access}><Text style={styles.accessLabel}>USUARIO DE ACCESO</Text><Text style={styles.noAccessValue}>Sin usuario de plataforma</Text><Text style={styles.accessMeta}>Arrendatario sin acceso</Text></View><View style={styles.detailGrid}><Detail label="Local" value={supplier.locale?.name || 'Sin local'} /><Detail label="Estado comercial" value={supplier.status_label} /></View></Card>; }
function CustomerUserCard({ user }: { user: AdminUser }) { return <Card><View style={styles.cardTop}><Avatar name={user.name} /><View style={styles.cardCopy}><Text style={styles.cardTitle}>{user.name}</Text><Text style={styles.email}>{user.email}</Text></View><StatusBadge user={user} /></View><Detail label="Empresa" value={user.customer_profile?.company_name || user.company || 'Sin empresa'} /></Card>; }
function StatusBadge({ user }: { user: AdminUser }) { return <Text style={[styles.statusBadge, user.status === 'active' && styles.statusActive, user.status === 'suspended' && styles.statusSuspended]}>{user.status_label.toUpperCase()}</Text>; }
function Avatar({ name }: { name: string }) { const initials = name.split(' ').slice(0, 2).map((word) => word[0]).join('').toUpperCase(); return <View style={styles.avatar}><Text style={styles.avatarText}>{initials || 'U'}</Text></View>; }
function Detail({ label, value }: { label: string; value: string }) { return <View style={styles.detail}><Text style={styles.detailLabel}>{label}</Text><Text style={styles.detailValue}>{value}</Text></View>; }
function Metric({ value, label }: { value: number; label: string }) { return <Card style={styles.metric}><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></Card>; }
function GroupTab({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) { return <Pressable onPress={onPress} style={[styles.groupTab, active && styles.groupTabActive]}><Text style={[styles.groupTabText, active && styles.groupTabTextActive]}>{label}</Text></Pressable>; }
function FilterChip({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) { return <Pressable onPress={onPress} style={[styles.filter, active && styles.filterActive]}><Text style={[styles.filterText, active && styles.filterTextActive]}>{label}</Text></Pressable>; }

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: 8 }, metric: { flex: 1, alignItems: 'center', paddingHorizontal: 7, paddingVertical: 12 }, metricValue: { color: Brand.purple, fontSize: 23, fontWeight: '900' }, metricLabel: { color: Brand.muted, fontSize: 9, textAlign: 'center' },
  groups: { flexDirection: 'row', padding: 4, borderRadius: 17, backgroundColor: '#EDE5F1' }, groupTab: { flex: 1, minHeight: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 13 }, groupTabActive: { backgroundColor: Brand.purple }, groupTabText: { color: Brand.purple, fontSize: 11, fontWeight: '900' }, groupTabTextActive: { color: '#fff' },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 }, filter: { paddingHorizontal: 11, paddingVertical: 8, borderRadius: 18, backgroundColor: '#F2E8FA' }, filterActive: { backgroundColor: Brand.purple }, filterText: { color: Brand.purple, fontSize: 10, fontWeight: '800' }, filterTextActive: { color: '#fff' },
  editor: { borderWidth: 2, borderColor: Brand.magenta }, editorHeading: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 }, editorCopy: { flex: 1, gap: 2 }, close: { color: Brand.purple, fontSize: 12, fontWeight: '900' }, choiceLabel: { color: Brand.ink, fontSize: 12, fontWeight: '800' },
  section: { gap: 7 }, eyebrow: { color: Brand.magenta, fontSize: 9, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' }, sectionTitle: { color: Brand.ink, fontSize: 21, fontWeight: '900' }, sectionCopy: { color: Brand.muted, fontSize: 12, lineHeight: 17, marginBottom: 4 }, list: { gap: 9 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10 }, avatar: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: '#F2E8FA' }, avatarText: { color: Brand.purple, fontWeight: '900' }, cardCopy: { flex: 1, gap: 2 }, cardTitle: { color: Brand.ink, fontSize: 16, fontWeight: '900' }, email: { color: Brand.muted, fontSize: 11 }, cardType: { color: Brand.magenta, fontSize: 8, fontWeight: '900' }, statusBadge: { paddingHorizontal: 7, paddingVertical: 4, borderRadius: 7, overflow: 'hidden', backgroundColor: '#FEE4E2', color: Brand.danger, fontSize: 7, fontWeight: '900' }, statusActive: { backgroundColor: '#D7F8EC', color: '#087C59' }, statusSuspended: { backgroundColor: '#FFF0C2', color: '#865900' },
  detailGrid: { flexDirection: 'row', gap: 8 }, detail: { flex: 1, gap: 3, padding: 10, borderRadius: 11, backgroundColor: '#F8F5FA' }, detailLabel: { color: Brand.muted, fontSize: 8, textTransform: 'uppercase', fontWeight: '800' }, detailValue: { color: Brand.ink, fontSize: 11, lineHeight: 15, fontWeight: '800' },
  access: { gap: 2, padding: 11, borderRadius: 12, backgroundColor: '#F2E8FA', borderLeftWidth: 4, borderLeftColor: Brand.magenta }, accessLabel: { color: Brand.magenta, fontSize: 8, fontWeight: '900' }, accessValue: { color: Brand.ink, fontSize: 14, fontWeight: '900' }, accessMeta: { color: Brand.muted, fontSize: 9 }, noAccessCard: { borderColor: '#E7BD52' }, noAccessBadge: { paddingHorizontal: 7, paddingVertical: 4, borderRadius: 7, overflow: 'hidden', backgroundColor: '#FFF0C2', color: '#865900', fontSize: 7, fontWeight: '900' }, noAccessValue: { color: '#865900', fontSize: 14, fontWeight: '900' }, empty: { color: Brand.muted, textAlign: 'center' },
});
