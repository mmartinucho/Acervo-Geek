import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAccent } from '@/presentation/theme/accent-context';

// Barra de progresso do fichário (protótipo): rótulo + contagem mono na cor de
// acento, faixa fina branca/10 com preenchimento no acento do universo ativo.
export function AlbumProgressBar({
  label,
  current,
  total,
}: {
  label: string;
  current: number;
  total: number;
}) {
  const { accent } = useAccent();
  const dark = useColorScheme() !== 'light';
  const pct = total > 0 ? Math.min(100, Math.max(0, (current / total) * 100)) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <ThemedText type="overline" themeColor="textSecondary">
          {label}
        </ThemedText>
        <View style={styles.spacer} />
        <ThemedText style={[styles.count, { color: accent }]}>
          {current}
          <ThemedText style={[styles.count, { color: dark ? '#3F3F46' : '#D4D4D8' }]}>
            /{total}
          </ThemedText>
        </ThemedText>
      </View>
      <View
        style={[
          styles.track,
          { backgroundColor: dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)' },
        ]}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: accent }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spacer: {
    flex: 1,
  },
  count: {
    fontFamily: Fonts.mono,
    fontSize: 12,
    lineHeight: 16,
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: 6,
    borderRadius: 3,
  },
});
