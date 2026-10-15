import { router, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Screen } from '@/components/screen';
import { Button, Card, ErrorMessage, Field, Loading } from '@/components/ui';
import { Brand } from '@/constants/brand';
import { useAuth } from '@/providers/auth-provider';
import { apiErrorMessage } from '@/services/api';

export default function AdminLoginScreen() {
  const { user, loading, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { if (!loading && user) router.replace('/admin' as Href); }, [loading, user]);
  if (loading) return <Screen><Loading label="Comprobando sesión…" /></Screen>;

  async function submit() {
    setSubmitting(true); setError('');
    try { await login(email.trim(), password); router.replace('/admin' as Href); }
    catch (requestError) { setError(apiErrorMessage(requestError, 'No fue posible iniciar sesión.')); }
    finally { setSubmitting(false); }
  }

  return <Screen title="Acceso administrativo" subtitle="Gestiona el catálogo desde tu teléfono."><Card><Text style={styles.title}>Superadministrador</Text>{error ? <ErrorMessage message={error} /> : null}<Field label="Correo" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" /><Field label="Contraseña" value={password} onChangeText={setPassword} secureTextEntry autoComplete="current-password" /><Button disabled={submitting || !email || !password} onPress={() => void submit()}>{submitting ? 'Ingresando…' : 'Iniciar sesión'}</Button></Card></Screen>;
}

const styles = StyleSheet.create({ title: { color: Brand.ink, fontSize: 22, fontWeight: '900' } });
