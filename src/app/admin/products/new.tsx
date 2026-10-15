import { router, type Href } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { Button, Card, ErrorMessage, Field, Loading } from '@/components/ui';
import { Brand } from '@/constants/brand';
import { useAuth } from '@/providers/auth-provider';
import { api, apiErrorMessage } from '@/services/api';
import type { Category, CollectionResponse } from '@/types/api';

type Supplier = { id: number; company_name: string };

export default function NewProductScreen() {
  const { user, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierId, setSupplierId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('0');
  const [minimum, setMinimum] = useState('1');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) return router.replace('/admin/login' as Href);
    if (!user) return;
    void Promise.all([
      api.get<CollectionResponse<Category>>('/admin/categories'),
      api.get<{ data: { data: Supplier[] } }>('/admin/suppliers', { params: { per_page: 100 } }),
    ]).then(([categoryResponse, supplierResponse]) => {
      setCategories(categoryResponse.data.data);
      setSuppliers(supplierResponse.data.data.data);
      setCategoryId(categoryResponse.data.data[0]?.id ?? null);
      setSupplierId(supplierResponse.data.data.data[0]?.id ?? null);
    }).catch((requestError) => setError(apiErrorMessage(requestError, 'No fue posible preparar el formulario.'))).finally(() => setLoading(false));
  }, [authLoading, user]);

  const valid = useMemo(() => Boolean(name && slug && price && supplierId), [name, price, slug, supplierId]);
  function updateName(value: string) {
    setName(value);
    setSlug(value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  }
  async function submit() {
    setSubmitting(true); setError('');
    try {
      await api.post('/admin/products', { supplier_id: supplierId, category_id: categoryId, name, slug, short_description: description || null, price: Number(price), stock: Number(stock), minimum_order_quantity: Number(minimum), status: 'published', price_tax_mode: 'included' });
      router.replace('/admin/products' as Href);
    } catch (requestError) { setError(apiErrorMessage(requestError, 'No fue posible guardar el producto.')); }
    finally { setSubmitting(false); }
  }

  if (authLoading || loading) return <Screen><Loading label="Preparando formulario…" /></Screen>;
  return <Screen title="Nuevo producto" subtitle="Los campos esenciales se publican en el mismo catálogo de Laravel.">{error ? <ErrorMessage message={error} /> : null}<Card><Field label="Nombre" value={name} onChangeText={updateName} placeholder="Ej. Termo corporativo" /><Field label="Slug" value={slug} onChangeText={setSlug} autoCapitalize="none" placeholder="termo-corporativo" /><Field label="Descripción corta" value={description} onChangeText={setDescription} multiline placeholder="Descripción visible en el catálogo" /><Field label="Precio" value={price} onChangeText={setPrice} keyboardType="decimal-pad" placeholder="0.00" /><View style={styles.twoColumns}><View style={styles.column}><Field label="Stock" value={stock} onChangeText={setStock} keyboardType="number-pad" /></View><View style={styles.column}><Field label="Pedido mínimo" value={minimum} onChangeText={setMinimum} keyboardType="number-pad" /></View></View><Text style={styles.label}>Vendedor</Text><View style={styles.options}>{suppliers.map((supplier) => <Option key={supplier.id} selected={supplier.id === supplierId} label={supplier.company_name} onPress={() => setSupplierId(supplier.id)} />)}</View><Text style={styles.label}>Categoría</Text><View style={styles.options}>{categories.map((category) => <Option key={category.id} selected={category.id === categoryId} label={category.name} onPress={() => setCategoryId(category.id)} />)}</View><Button disabled={!valid || submitting} onPress={() => void submit()}>{submitting ? 'Guardando…' : 'Guardar producto'}</Button></Card></Screen>;
}

function Option({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) { return <Pressable onPress={onPress} style={[styles.option, selected && styles.optionSelected]}><Text style={[styles.optionText, selected && styles.optionTextSelected]}>{label}</Text></Pressable>; }

const styles = StyleSheet.create({ twoColumns: { flexDirection: 'row', gap: 10 }, column: { flex: 1 }, label: { color: Brand.ink, fontWeight: '900', fontSize: 13 }, options: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 }, option: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 999, backgroundColor: '#F4EFF7', borderWidth: 1, borderColor: Brand.line }, optionSelected: { backgroundColor: Brand.purple, borderColor: Brand.purple }, optionText: { color: Brand.ink, fontSize: 12, fontWeight: '700' }, optionTextSelected: { color: '#fff' } });
