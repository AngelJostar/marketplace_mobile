import { router } from 'expo-router';
import type { PropsWithChildren, ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui';
import { Brand } from '@/constants/brand';

export function AdminShell({ title, subtitle, action, children }: PropsWithChildren<{ title: string; subtitle?: string; action?: ReactNode }>) {
  return <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}><View style={styles.bar}><Button variant="secondary" onPress={() => router.back()}>←</Button><View style={styles.barCopy}><Text style={styles.barKicker}>SUPERADMINISTRADOR</Text><Text numberOfLines={1} style={styles.barTitle}>{title}</Text></View><View style={styles.avatar}><Text style={styles.avatarText}>SA</Text></View></View><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}><View style={styles.heading}><View style={styles.headingCopy}><Text style={styles.title}>{title}</Text>{subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}</View>{action}</View>{children}</ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: Brand.cream }, bar: { minHeight: 70, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: Brand.ink }, barCopy: { flex: 1 }, barKicker: { color: Brand.yellow, fontSize: 9, fontWeight: '900' }, barTitle: { color: '#fff', fontSize: 19, fontWeight: '900' }, avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: Brand.magenta, borderWidth: 2, borderColor: '#fff' }, avatarText: { color: '#fff', fontWeight: '900' }, content: { flexGrow: 1, width: '100%', maxWidth: 760, alignSelf: 'center', padding: 16, paddingBottom: 42, gap: 16 }, heading: { flexDirection: 'row', alignItems: 'center', gap: 10 }, headingCopy: { flex: 1, gap: 4 }, title: { color: Brand.ink, fontSize: 30, lineHeight: 34, fontWeight: '900' }, subtitle: { color: Brand.muted, lineHeight: 20 } });
