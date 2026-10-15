import type { PropsWithChildren } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, type TextInputProps, View, type ViewStyle } from 'react-native';

import { Brand } from '@/constants/brand';

export function Button({ children, onPress, variant = 'primary', disabled = false }: PropsWithChildren<{ onPress?: () => void; variant?: 'primary' | 'secondary' | 'yellow'; disabled?: boolean }>) {
  return <Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, styles[variant], (pressed || disabled) && styles.buttonPressed]}><Text style={[styles.buttonText, (variant === 'secondary' || variant === 'yellow') && styles.secondaryText]}>{children}</Text></Pressable>;
}

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput placeholderTextColor="#9B94A1" style={styles.input} {...props} /></View>;
}

export function Card({ children, style }: PropsWithChildren<{ style?: ViewStyle }>) { return <View style={[styles.card, style]}>{children}</View>; }
export function Loading({ label = 'Cargando…' }: { label?: string }) { return <View style={styles.loading}><ActivityIndicator color={Brand.purple} /><Text style={styles.loadingText}>{label}</Text></View>; }
export function ErrorMessage({ message }: { message: string }) { return <View style={styles.error}><Text style={styles.errorText}>{message}</Text></View>; }

const styles = StyleSheet.create({
  button: { minHeight: 46, borderRadius: 14, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: Brand.purple },
  primary: { backgroundColor: Brand.purple }, secondary: { backgroundColor: Brand.surface, borderWidth: 1, borderColor: Brand.line }, yellow: { backgroundColor: Brand.yellow },
  buttonPressed: { opacity: .7 }, buttonText: { color: '#fff', fontWeight: '900', fontSize: 15 }, secondaryText: { color: Brand.ink },
  field: { gap: 6 }, label: { color: Brand.ink, fontWeight: '800', fontSize: 13 }, input: { minHeight: 48, paddingHorizontal: 14, borderWidth: 1, borderColor: Brand.line, borderRadius: 12, backgroundColor: '#fff', color: Brand.ink, fontSize: 16 },
  card: { padding: 16, borderRadius: 18, backgroundColor: '#fff', borderWidth: 1, borderColor: Brand.line, gap: 12 },
  loading: { minHeight: 160, alignItems: 'center', justifyContent: 'center', gap: 10 }, loadingText: { color: Brand.muted },
  error: { padding: 12, borderRadius: 10, backgroundColor: '#FEE4E2' }, errorText: { color: Brand.danger, fontWeight: '700' },
});
