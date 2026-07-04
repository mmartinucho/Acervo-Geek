import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { RADIUS_STEPS } from '@/presentation/hooks/use-deck';

function label(radiusKm: number | null): string {
  return radiusKm == null ? 'Brasil' : `${radiusKm} km`;
}

// Pílula de radar: toca para ciclar o raio de busca (25 → 100 → 500 → Brasil).
export function RadarPill({
  radiusKm,
  onChange,
}: {
  radiusKm: number | null;
  onChange: (next: number | null) => void;
}) {
  const theme = useTheme();

  const cycle = () => {
    const i = RADIUS_STEPS.findIndex((r) => r === radiusKm);
    onChange(RADIUS_STEPS[(i + 1) % RADIUS_STEPS.length]);
  };

  return (
    <Pressable
      onPress={cycle}
      style={[styles.pill, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
      accessibilityLabel={`Radar: ${label(radiusKm)}. Toque para alterar.`}>
      <Ionicons name="locate" size={15} color={theme.tint} />
      <ThemedText type="smallBold">{label(radiusKm)}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 42,
  },
});
