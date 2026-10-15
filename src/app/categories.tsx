import { Image } from 'expo-image';
import { router, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PublicShell } from '@/components/public-shell';
import { ErrorMessage, Loading } from '@/components/ui';
import { Brand } from '@/constants/brand';
import { api, apiErrorMessage, mediaUrl } from '@/services/api';
import type { Category, CollectionResponse } from '@/types/api';

export default function CategoriesScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    void api.get<CollectionResponse<Category>>('/categories', { params: { per_page: 100 } })
      .then((response) => setCategories(response.data.data))
      .catch((requestError) => setError(apiErrorMessage(requestError, 'No pudimos cargar las categorías.')));
  }, []);

  return (
    <PublicShell>
      <View style={styles.hero}><Text style={styles.kicker}>EXPLORA LA PLAZA</Text><Text style={styles.title}>Categorías</Text><Text style={styles.copy}>Encuentra lo que tu negocio necesita, más rápido y al mejor precio.</Text></View>
      {error ? <ErrorMessage message={error} /> : null}
      {!categories.length && !error ? <Loading /> : null}
      <View style={styles.grid}>{categories.map((category) => { const image = mediaUrl(category.image_path); return <Pressable key={category.id} onPress={() => router.push({ pathname: '/catalog', params: { category: category.slug } } as Href)} style={styles.item}>{image ? <Image source={{ uri: image }} contentFit="cover" style={styles.image} /> : <View style={[styles.image, styles.placeholder]}><Text style={styles.placeholderText}>PMC</Text></View>}<Text style={styles.name}>{category.name}</Text></Pressable>; })}</View>
    </PublicShell>
  );
}

const styles = StyleSheet.create({
  hero: { padding: 22, borderRadius: 24, backgroundColor: '#3A0567', gap: 7 }, kicker: { color: Brand.yellow, fontSize: 11, fontWeight: '900' }, title: { color: '#fff', fontSize: 42, fontWeight: '900' }, copy: { color: '#fff', fontSize: 15, lineHeight: 21 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 }, item: { width: '47%', alignItems: 'center', padding: 12, gap: 8, borderRadius: 18, backgroundColor: '#fff', borderWidth: 1, borderColor: Brand.line }, image: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#F6F1F8' }, placeholder: { alignItems: 'center', justifyContent: 'center' }, placeholderText: { color: Brand.purple, fontWeight: '900' }, name: { color: Brand.ink, textAlign: 'center', fontWeight: '900' },
});
