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
import type { BannerContent, CarouselContent, ItemResponse, VisualContentPayload, VisualMaterialContent } from '@/types/api';

type EditorKind = 'banner' | 'carousel' | 'material';
type FormState = Record<string, string>;

const emptyCarousel: FormState = { slot: 'custom', title: '', subtitle: '', label: '', status: 'draft' };
const emptyMaterial: FormState = { type: 'promo_card', tone: '', kicker: '', title: '', amount: '', text: '', cta: '', href: '', image_path: '', status: 'draft' };

export default function VisualContentEditorScreen() {
  const params = useLocalSearchParams<{ kind: EditorKind; id: string }>();
  const kind = params.kind;
  const creating = params.id === 'new';
  const numericId = Number(params.id);
  const { user, loading: authLoading } = useAuth();
  const [content, setContent] = useState<VisualContentPayload | null>(null);
  const [form, setForm] = useState<FormState>(kind === 'carousel' ? emptyCarousel : emptyMaterial);
  const [productIds, setProductIds] = useState<number[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadContent = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get<ItemResponse<VisualContentPayload>>('/admin/visual-content');
      setContent(response.data.data);
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'No fue posible cargar el editor visual.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/admin/login' as Href);
  }, [authLoading, user]);

  useEffect(() => {
    if (user) void loadContent();
  }, [loadContent, user]);

  const record = useMemo(() => {
    if (!content || creating) return null;
    if (kind === 'banner') return content.banners.find((item) => item.id === numericId) ?? null;
    if (kind === 'carousel') return content.carousels.find((item) => item.id === numericId) ?? null;
    return content.visual_materials.find((item) => item.id === numericId) ?? null;
  }, [content, creating, kind, numericId]);

  useEffect(() => {
    if (!content) return;
    if (creating) {
      setForm(kind === 'carousel' ? { ...emptyCarousel } : { ...emptyMaterial });
      setProductIds([]);
      return;
    }
    if (kind === 'banner' && record) setForm(bannerForm(record as BannerContent));
    if (kind === 'carousel' && record) {
      setForm(carouselForm(record as CarouselContent));
      setProductIds((record as CarouselContent).product_ids);
    }
    if (kind === 'material' && record) setForm(materialForm(record as VisualMaterialContent));
  }, [content, creating, kind, record]);

  const setField = (field: string, value: string) => setForm((current) => ({ ...current, [field]: value }));

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Se necesita permiso para seleccionar una imagen.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: .9 });
    if (!result.canceled) setSelectedImage(result.assets[0]);
  };

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      let savedId = numericId;
      if (kind === 'banner') {
        await api.put(`/admin/banners/${numericId}`, nullablePayload(form, ['subtitle', 'offer_label', 'image_path', 'linked_url']));
      } else if (kind === 'carousel') {
        const payload = { ...nullablePayload(form, ['subtitle', 'label']), product_ids: productIds };
        const response = creating
          ? await api.post<ItemResponse<CarouselContent>>('/admin/carousels', payload)
          : await api.put<ItemResponse<CarouselContent>>(`/admin/carousels/${numericId}`, payload);
        savedId = response.data.data.id;
      } else {
        const payload = nullablePayload(form, ['tone', 'kicker', 'title', 'amount', 'text', 'cta', 'href', 'image_path']);
        const response = creating
          ? await api.post<ItemResponse<VisualMaterialContent>>('/admin/visual-materials', payload)
          : await api.put<ItemResponse<VisualMaterialContent>>(`/admin/visual-materials/${numericId}`, payload);
        savedId = response.data.data.id;
      }

      if (selectedImage && kind !== 'carousel') await uploadImage(kind, savedId, selectedImage);
      router.back();
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'No fue posible guardar el contenido visual.'));
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user) return <AdminShell title="Contenido visual"><Loading /></AdminShell>;
  const title = creating ? `Nuevo ${kind === 'carousel' ? 'carrusel' : 'material'}` : `Editar ${kindLabel(kind)}`;

  return <AdminShell title={title} subtitle="Los cambios se reflejan en la experiencia pública">
    {error ? <ErrorMessage message={error} /> : null}
    {loading ? <Loading label="Preparando editor…" /> : null}
    {!loading && !creating && !record ? <ErrorMessage message="El contenido solicitado ya no existe." /> : null}
    {!loading && content && (creating || record) ? <Card>
      {kind === 'banner' ? <BannerFields form={form} setField={setField} /> : null}
      {kind === 'carousel' ? <CarouselFields form={form} setField={setField} productIds={productIds} setProductIds={setProductIds} content={content} /> : null}
      {kind === 'material' ? <MaterialFields form={form} setField={setField} /> : null}
      {kind !== 'carousel' ? <ImageField current={selectedImage?.uri || currentImage(record)} onPick={() => void pickImage()} /> : null}
      <Button disabled={saving} onPress={() => void save()}>{saving ? 'Guardando…' : 'Guardar cambios'}</Button>
    </Card> : null}
  </AdminShell>;
}

function BannerFields({ form, setField }: FieldProps) {
  return <><Text style={styles.sectionTitle}>Contenido del banner</Text><Field label="Título" value={form.title} onChangeText={(value) => setField('title', value)} /><Field label="Subtítulo" value={form.subtitle} onChangeText={(value) => setField('subtitle', value)} multiline /><Field label="Etiqueta de oferta" value={form.offer_label} onChangeText={(value) => setField('offer_label', value)} /><Field label="Ruta o URL de imagen" value={form.image_path} onChangeText={(value) => setField('image_path', value)} /><Field label="Enlace" value={form.linked_url} onChangeText={(value) => setField('linked_url', value)} /><ChoiceField label="Estado" value={form.status} options={['published', 'draft', 'scheduled', 'archived']} onChange={(value) => setField('status', value)} /></>;
}

function CarouselFields({ form, setField, productIds, setProductIds, content }: FieldProps & { productIds: number[]; setProductIds: (ids: number[]) => void; content: VisualContentPayload }) {
  const toggle = (id: number) => setProductIds(productIds.includes(id) ? productIds.filter((item) => item !== id) : [...productIds, id]);
  return <><Text style={styles.sectionTitle}>Configuración del carrusel</Text><ChoiceField label="Ubicación" value={form.slot} options={content.options.carousel_slots} onChange={(value) => setField('slot', value)} /><Field label="Título" value={form.title} onChangeText={(value) => setField('title', value)} /><Field label="Subtítulo" value={form.subtitle} onChangeText={(value) => setField('subtitle', value)} multiline /><Field label="Etiqueta" value={form.label} onChangeText={(value) => setField('label', value)} /><ChoiceField label="Estado" value={form.status} options={content.options.visual_statuses} onChange={(value) => setField('status', value)} /><Text style={styles.fieldLabel}>Productos ({productIds.length}/24)</Text><Text style={styles.help}>Toca los productos en el orden en que deben aparecer.</Text><View style={styles.products}>{content.products.map((product) => { const position = productIds.indexOf(product.id); return <Pressable key={product.id} disabled={position < 0 && productIds.length >= 24} onPress={() => toggle(product.id)} style={[styles.product, position >= 0 && styles.productSelected]}><Text style={[styles.productName, position >= 0 && styles.productNameSelected]}>{product.name}</Text>{position >= 0 ? <Text style={styles.position}>{position + 1}</Text> : null}</Pressable>; })}</View></>;
}

function MaterialFields({ form, setField }: FieldProps) {
  return <><Text style={styles.sectionTitle}>Material visual</Text><ChoiceField label="Tipo" value={form.type} options={['promo_card', 'hero_offer', 'section_banner', 'animated_background', 'section_heading', 'ticker_text']} onChange={(value) => setField('type', value)} /><Field label="Tono visual" value={form.tone} onChangeText={(value) => setField('tone', value)} /><Field label="Encabezado corto" value={form.kicker} onChangeText={(value) => setField('kicker', value)} /><Field label="Título" value={form.title} onChangeText={(value) => setField('title', value)} /><Field label="Monto o beneficio" value={form.amount} onChangeText={(value) => setField('amount', value)} /><Field label="Texto" value={form.text} onChangeText={(value) => setField('text', value)} multiline /><Field label="Llamado a la acción" value={form.cta} onChangeText={(value) => setField('cta', value)} /><Field label="Enlace" value={form.href} onChangeText={(value) => setField('href', value)} /><Field label="Ruta o URL de imagen" value={form.image_path} onChangeText={(value) => setField('image_path', value)} /><ChoiceField label="Estado" value={form.status} options={['active', 'draft', 'archived']} onChange={(value) => setField('status', value)} /></>;
}

function ImageField({ current, onPick }: { current: string | null; onPick: () => void }) { return <View style={styles.imageField}><Text style={styles.fieldLabel}>Imagen</Text>{current ? <Image source={current} style={styles.preview} contentFit="cover" /> : <View style={[styles.preview, styles.previewEmpty]}><Text style={styles.help}>Sin imagen</Text></View>}<Button variant="secondary" onPress={onPick}>Seleccionar imagen</Button><Text style={styles.help}>PNG, JPG, WEBP o GIF. Máximo 5 MB.</Text></View>; }
function ChoiceField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) { return <View style={styles.choiceField}><Text style={styles.fieldLabel}>{label}</Text><View style={styles.choices}>{options.map((option) => <Pressable key={option} onPress={() => onChange(option)} style={[styles.choice, value === option && styles.choiceActive]}><Text style={[styles.choiceText, value === option && styles.choiceTextActive]}>{option.replaceAll('_', ' ')}</Text></Pressable>)}</View></View>; }

type FieldProps = { form: FormState; setField: (field: string, value: string) => void };
function bannerForm(item: BannerContent): FormState { return { title: item.title, subtitle: item.subtitle ?? '', offer_label: item.offer_label ?? '', image_path: item.image_path ?? '', linked_url: item.linked_url ?? '', status: item.status }; }
function carouselForm(item: CarouselContent): FormState { return { slot: item.slot, title: item.title, subtitle: item.subtitle ?? '', label: item.label ?? '', status: item.status }; }
function materialForm(item: VisualMaterialContent): FormState { return { type: item.type, tone: item.tone ?? '', kicker: item.kicker ?? '', title: item.title ?? '', amount: item.amount ?? '', text: item.text ?? '', cta: item.cta ?? '', href: item.href ?? '', image_path: item.image_path ?? '', status: item.status }; }
function nullablePayload(form: FormState, nullable: string[]) { return Object.fromEntries(Object.entries(form).map(([key, value]) => [key, nullable.includes(key) && !value.trim() ? null : value])); }
function currentImage(record: BannerContent | CarouselContent | VisualMaterialContent | null) { if (!record || !('image_url' in record)) return null; return record.image_url || mediaUrl(record.image_path); }
function kindLabel(kind: EditorKind) { return kind === 'banner' ? 'banner' : kind === 'carousel' ? 'carrusel' : 'material'; }
async function uploadImage(kind: EditorKind, id: number, asset: ImagePicker.ImagePickerAsset) { const data = new FormData(); data.append('image', { uri: asset.uri, name: asset.fileName || `visual-${id}.jpg`, type: asset.mimeType || 'image/jpeg' } as unknown as Blob); const path = kind === 'banner' ? `/admin/banners/${id}/image` : `/admin/visual-materials/${id}/image`; await api.patch(path, data, { headers: { 'Content-Type': 'multipart/form-data' } }); }

const styles = StyleSheet.create({
  sectionTitle: { color: Brand.ink, fontSize: 22, fontWeight: '900' }, fieldLabel: { color: Brand.ink, fontSize: 13, fontWeight: '800' }, help: { color: Brand.muted, fontSize: 11, lineHeight: 16 }, choiceField: { gap: 7 }, choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 }, choice: { paddingHorizontal: 11, paddingVertical: 8, borderRadius: 18, backgroundColor: '#F2E8FA' }, choiceActive: { backgroundColor: Brand.purple }, choiceText: { color: Brand.purple, fontSize: 11, fontWeight: '800', textTransform: 'capitalize' }, choiceTextActive: { color: '#fff' },
  products: { gap: 7 }, product: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 12, backgroundColor: '#F8F5FA', borderWidth: 1, borderColor: Brand.line }, productSelected: { backgroundColor: Brand.purple, borderColor: Brand.purple }, productName: { flex: 1, color: Brand.ink, fontSize: 12, fontWeight: '800' }, productNameSelected: { color: '#fff' }, position: { width: 24, height: 24, paddingTop: 4, borderRadius: 12, overflow: 'hidden', backgroundColor: Brand.yellow, color: Brand.ink, textAlign: 'center', fontSize: 11, fontWeight: '900' },
  imageField: { gap: 8 }, preview: { width: '100%', aspectRatio: 2, borderRadius: 14, backgroundColor: '#F2E8FA' }, previewEmpty: { alignItems: 'center', justifyContent: 'center' },
});
