import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, type Href, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AdminShell } from '@/components/admin-shell';
import { Button, Card, ErrorMessage, Field, Loading } from '@/components/ui';
import { Brand } from '@/constants/brand';
import { useAuth } from '@/providers/auth-provider';
import { api, apiErrorMessage, mediaUrl } from '@/services/api';
import type { ItemResponse, PromotionContent, PromotionPayload } from '@/types/api';

type FormState = { name: string; type: string; value: string; status: string; starts_at: string; ends_at: string };

export default function AdminOfferEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const creating = id === 'new';
  const numericId = Number(id);
  const { user, loading: authLoading } = useAuth();
  const [payload, setPayload] = useState<PromotionPayload | null>(null);
  const [form, setForm] = useState<FormState>(() => emptyForm());
  const [productIds, setProductIds] = useState<number[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadPromotions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get<ItemResponse<PromotionPayload>>('/admin/promotions');
      setPayload(response.data.data);
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'No fue posible cargar el editor de ofertas.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/admin/login' as Href);
  }, [authLoading, user]);

  useEffect(() => {
    if (user) void loadPromotions();
  }, [loadPromotions, user]);

  const promotion = useMemo(() => payload?.promotions.find((item) => item.id === numericId) ?? null, [numericId, payload]);

  useEffect(() => {
    if (!payload) return;
    if (creating) {
      setForm(emptyForm());
      setProductIds([]);
      return;
    }
    if (promotion) {
      setForm({ name: promotion.name, type: promotion.type, value: String(promotion.value), status: promotion.status, starts_at: promotion.starts_at, ends_at: promotion.ends_at ?? '' });
      setProductIds(promotion.product_ids);
    }
  }, [creating, payload, promotion]);

  const setField = (field: keyof FormState, value: string) => setForm((current) => ({ ...current, [field]: value }));

  const pickPng = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Se necesita permiso para seleccionar el PNG de la promoción.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
    if (result.canceled) return;
    const asset = result.assets[0];
    const isPng = asset.mimeType === 'image/png' || asset.fileName?.toLowerCase().endsWith('.png');
    if (!isPng) {
      setError('El identificador de la promoción debe ser un archivo PNG.');
      return;
    }
    setError('');
    setSelectedImage(asset);
  };

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const requestPayload = {
        ...form,
        value: Number(form.value),
        ends_at: form.ends_at.trim() || null,
        product_ids: productIds,
      };
      const response = creating
        ? await api.post<ItemResponse<PromotionContent>>('/admin/promotions', requestPayload)
        : await api.put<ItemResponse<PromotionContent>>(`/admin/promotions/${numericId}`, requestPayload);
      const saved = response.data.data;
      if (selectedImage) await uploadPng(saved.id, selectedImage);
      router.back();
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'No fue posible guardar la promoción.'));
    } finally {
      setSaving(false);
    }
  };

  const removeImage = async () => {
    if (!promotion) return;
    setSaving(true);
    setError('');
    try {
      const response = await api.delete<ItemResponse<PromotionContent>>(`/admin/promotions/${promotion.id}/image`);
      setPayload((current) => current ? { ...current, promotions: current.promotions.map((item) => item.id === promotion.id ? response.data.data : item) } : current);
      setSelectedImage(null);
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'No fue posible eliminar el PNG.'));
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user) return <AdminShell title="Oferta"><Loading /></AdminShell>;

  return <AdminShell title={creating ? 'Nueva oferta' : 'Editar oferta'} subtitle="Descuento, vigencia e identificador visual">
    {error ? <ErrorMessage message={error} /> : null}
    {loading ? <Loading label="Preparando editor…" /> : null}
    {!loading && !creating && !promotion ? <ErrorMessage message="La promoción solicitada ya no existe." /> : null}
    {!loading && payload && (creating || promotion) ? <Card>
      <Text style={styles.sectionTitle}>Datos de la promoción</Text>
      <Field label="Nombre" value={form.name} onChangeText={(value) => setField('name', value)} />
      <ChoiceField label="Tipo" value={form.type} options={payload.options.types} onChange={(value) => setField('type', value)} />
      <Field label={`Valor${promotion?.minimum_value ? ` · mínimo ${promotion.minimum_value}` : ''}`} value={form.value} onChangeText={(value) => setField('value', value)} keyboardType="decimal-pad" />
      <ChoiceField label="Estado" value={form.status} options={payload.options.statuses} onChange={(value) => setField('status', value)} />
      <Field label="Inicio" value={form.starts_at} onChangeText={(value) => setField('starts_at', value)} placeholder="2026-10-14 08:00:00" autoCapitalize="none" />
      <Field label="Cierre opcional" value={form.ends_at} onChangeText={(value) => setField('ends_at', value)} placeholder="2026-10-31 23:59:00" autoCapitalize="none" />
      <Text style={styles.help}>Usa una fecha ISO o el formato AAAA-MM-DD HH:MM:SS.</Text>

      <Text style={styles.fieldLabel}>Productos participantes ({productIds.length}/64)</Text>
      <Text style={styles.help}>Toca los productos en el orden en que deben aparecer.</Text>
      <View style={styles.products}>{payload.products.map((product) => { const position = productIds.indexOf(product.id); return <Pressable key={product.id} disabled={position < 0 && productIds.length >= 64} onPress={() => setProductIds(position >= 0 ? productIds.filter((item) => item !== product.id) : [...productIds, product.id])} style={[styles.product, position >= 0 && styles.productSelected]}><Text style={[styles.productName, position >= 0 && styles.productNameSelected]}>{product.name}</Text>{position >= 0 ? <Text style={styles.position}>{position + 1}</Text> : null}</Pressable>; })}</View>

      <View style={styles.imageField}><Text style={styles.fieldLabel}>Identificador PNG</Text>{selectedImage?.uri || promotion?.identifier_image_url || promotion?.identifier_image_path ? <Image source={selectedImage?.uri || promotion?.identifier_image_url || mediaUrl(promotion?.identifier_image_path)} style={styles.preview} contentFit="contain" /> : <View style={[styles.preview, styles.previewEmpty]}><Text style={styles.help}>Sin PNG guardado</Text></View>}<Button variant="secondary" onPress={() => void pickPng()}>Seleccionar PNG</Button>{!creating && promotion?.identifier_image_path ? <Button variant="secondary" disabled={saving} onPress={() => void removeImage()}>Eliminar PNG</Button> : null}<Text style={styles.help}>Solo PNG, máximo 5 MB.</Text></View>
      <Button disabled={saving} onPress={() => void save()}>{saving ? 'Guardando…' : 'Guardar promoción'}</Button>
    </Card> : null}
  </AdminShell>;
}

function ChoiceField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) { return <View style={styles.choiceField}><Text style={styles.fieldLabel}>{label}</Text><View style={styles.choices}>{options.map((option) => <Pressable key={option} onPress={() => onChange(option)} style={[styles.choice, value === option && styles.choiceActive]}><Text style={[styles.choiceText, value === option && styles.choiceTextActive]}>{option.replaceAll('_', ' ')}</Text></Pressable>)}</View></View>; }
function emptyForm(): FormState { return { name: '', type: 'percentage', value: '0', status: 'draft', starts_at: new Date().toISOString(), ends_at: '' }; }
async function uploadPng(id: number, asset: ImagePicker.ImagePickerAsset) { const data = new FormData(); data.append('image', { uri: asset.uri, name: asset.fileName || `promotion-${id}.png`, type: 'image/png' } as unknown as Blob); await api.patch(`/admin/promotions/${id}/image`, data, { headers: { 'Content-Type': 'multipart/form-data' } }); }

const styles = StyleSheet.create({
  sectionTitle: { color: Brand.ink, fontSize: 22, fontWeight: '900' }, fieldLabel: { color: Brand.ink, fontSize: 13, fontWeight: '800' }, help: { color: Brand.muted, fontSize: 11, lineHeight: 16 }, choiceField: { gap: 7 }, choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 }, choice: { paddingHorizontal: 11, paddingVertical: 8, borderRadius: 18, backgroundColor: '#F2E8FA' }, choiceActive: { backgroundColor: Brand.purple }, choiceText: { color: Brand.purple, fontSize: 11, fontWeight: '800', textTransform: 'capitalize' }, choiceTextActive: { color: '#fff' }, products: { gap: 7 }, product: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 12, backgroundColor: '#F8F5FA', borderWidth: 1, borderColor: Brand.line }, productSelected: { backgroundColor: Brand.purple, borderColor: Brand.purple }, productName: { flex: 1, color: Brand.ink, fontSize: 12, fontWeight: '800' }, productNameSelected: { color: '#fff' }, position: { width: 24, height: 24, paddingTop: 4, borderRadius: 12, overflow: 'hidden', backgroundColor: Brand.yellow, color: Brand.ink, textAlign: 'center', fontSize: 11, fontWeight: '900' }, imageField: { gap: 8 }, preview: { width: '100%', aspectRatio: 2, borderRadius: 14, backgroundColor: '#F2E8FA' }, previewEmpty: { alignItems: 'center', justifyContent: 'center' },
});
