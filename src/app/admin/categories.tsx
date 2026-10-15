import { router, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { ErrorMessage, Loading } from '@/components/ui';
import { Brand } from '@/constants/brand';
import { useAuth } from '@/providers/auth-provider';
import { api, apiErrorMessage } from '@/services/api';
import type { Category, CollectionResponse } from '@/types/api';

export default function AdminCategoriesScreen() {
  const { user, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!authLoading && !user) return router.replace('/admin/login' as Href);
    if (!user) return;
    void api.get<CollectionResponse<Category>>('/admin/categories').then((response) => setCategories(response.data.data)).catch((requestError) => setError(apiErrorMessage(requestError, 'No fue posible cargar las categorías.'))).finally(() => setLoading(false));
  }, [authLoading, user]);
  if (authLoading || !user) return <Screen><Loading /></Screen>;
  return <Screen title="Categorías" subtitle={`${categories.length} categorías del catálogo`}>{error ? <ErrorMessage message={error} /> : null}{loading ? <Loading /> : <View style={styles.list}>{categories.map((category) => <View key={category.id} style={styles.row}><View style={styles.dot} /><View style={styles.copy}><Text style={styles.name}>{category.name}</Text><Text style={styles.slug}>{category.slug}</Text>{category.description ? <Text numberOfLines={2} style={styles.description}>{category.description}</Text> : null}</View></View>)}</View>}</Screen>;
}

const styles = StyleSheet.create({ list: { gap: 8 }, row: { flexDirection: 'row', gap: 12, padding: 14, borderRadius: 14, backgroundColor: '#fff', borderWidth: 1, borderColor: Brand.line }, dot: { width: 12, height: 12, marginTop: 4, borderRadius: 6, backgroundColor: Brand.magenta }, copy: { flex: 1, gap: 3 }, name: { color: Brand.ink, fontSize: 16, fontWeight: '900' }, slug: { color: Brand.purple, fontSize: 11 }, description: { color: Brand.muted, fontSize: 12, lineHeight: 17 } });
