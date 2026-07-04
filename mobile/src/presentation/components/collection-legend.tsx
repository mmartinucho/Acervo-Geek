import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { useAccent } from '@/presentation/theme/accent-context';

// Âmbar de "duplicada", compartilhado com o gradiente do CollectionCardChip.
const AMBER = '#F5C542';

function LegendItem({
  label,
  color,
  outline = false,
}: {
  label: string;
  color: string;
  outline?: boolean;
}) {
  return (
    <View style={styles.item}>
      <View
        style={[
          styles.dot,
          outline
            ? { borderColor: color, borderWidth: 1 }
            : { backgroundColor: color },
        ]}
      />
      <ThemedText type="overline" style={[styles.label, { color }]}>
        {label}
      </ThemedText>
    </View>
  );
}

// Legenda dos 3 estados de carta (mapeados do modelo missing/have/duplicate).
export function CollectionLegend() {
  const theme = useTheme();
  const { accent } = useAccent();

  return (
    <View style={styles.legend}>
      <LegendItem label="Faltante" color={theme.textSecondary} outline />
      <LegendItem label="Adquirida" color={accent} />
      <LegendItem label="Duplicada" color={AMBER} />
    </View>
  );
}

const styles = StyleSheet.create({
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 12,
    columnGap: 20,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  label: {
    fontSize: 9,
    letterSpacing: 1.5,
  },
});
