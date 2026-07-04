import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { CollectionProgress } from '@/domain/entities/collection-progress';

const PITCH_GREEN = '#12813F';

// Faixa fina de progresso — presença mínima para o card do deck respirar.
export function AlbumProgress({ progress }: { progress: CollectionProgress }) {
  const theme = useTheme();
  const missing = progress.totalSlots - progress.ownedSlots;
  const pct = Math.min(100, Math.max(0, progress.completionPct));

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Ionicons name="football" size={14} color={PITCH_GREEN} />
        <ThemedText type="smallBold">{progress.collectionName}</ThemedText>
        <View style={styles.spacer} />
        <ThemedText type="small" themeColor="textSecondary">
          {pct.toFixed(0)}% · faltam {missing}
        </ThemedText>
      </View>
      <View style={[styles.track, { backgroundColor: theme.backgroundSelected }]}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: PITCH_GREEN }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  spacer: {
    flex: 1,
  },
  track: {
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: 5,
    borderRadius: 3,
  },
});
