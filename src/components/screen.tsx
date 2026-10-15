import type { PropsWithChildren, ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand } from '@/constants/brand';

type Props = PropsWithChildren<{ title?: string; subtitle?: string; action?: ReactNode }>;

export function Screen({ title, subtitle, action, children }: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {(title || action) && <View style={styles.heading}><View style={styles.headingCopy}>{title ? <Text style={styles.title}>{title}</Text> : null}{subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}</View>{action}</View>}
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.cream },
  content: { flexGrow: 1, padding: 18, gap: 16, maxWidth: 980, width: '100%', alignSelf: 'center' },
  heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  headingCopy: { flex: 1, gap: 4 },
  title: { color: Brand.ink, fontSize: 30, lineHeight: 34, fontWeight: '900' },
  subtitle: { color: Brand.muted, fontSize: 15, lineHeight: 21 },
});
