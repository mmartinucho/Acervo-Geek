import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { CollectionProgress } from '@/domain/entities/collection-progress';

const PITCH_GREEN = '#12813F';

export function AlbumProgress({ progress }: { progress: CollectionProgress }) {
  const theme = useTheme();
  const missing = progress.totalSlots - progress.ownedSlots;
  const pct = Math.min(100, Math.max(0, progress.completionPct));

  return (
    <ThemedView type="backgroundElement" style={[styles.card, { borderColor: theme.border }]}>
      <View style={styles.topRow}>
        <View style={styles.titleRow}>
          <Ionicons name="football" size={16} color={PITCH_GREEN} />
          <ThemedText type="smallBold">Álbum {progress.collectionName}</ThemedText>
        </View>
        <ThemedText type="smallBold" style={{ color: PITCH_GREEN }}>
          {pct.toFixed(0)}%
        </ThemedText>
      </View>

      <View style={[styles.track, { backgroundColor: theme.backgroundSelected }]}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: PITCH_GREEN }]} />
      </View>

      <View style={styles.statsRow}>
        <ThemedText type="small" themeColor="textSecondary">
          <ThemedText type="smallBold">{missing}</ThemedText> figurinhas para completar
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          <ThemedText type="smallBold">{progress.spareStickers}</ThemedText> repetidas p/ trocar
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: 8,
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
