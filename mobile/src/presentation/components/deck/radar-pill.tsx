import { BlurView } from 'expo-blur';
import { MapPin } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { RADIUS_STEPS } from '@/presentation/hooks/use-deck';
import { useAccent } from '@/presentation/theme/accent-context';

function label(radiusKm: number | null): string {
  return radiusKm == null ? 'Brasil' : `${radiusKm} km`;
}

// Pílula de radar do protótipo (vidro + MapPin no acento): toca para ciclar
// o raio de busca (25 → 100 → 500 → Brasil).
export function RadarPill({
  radiusKm,
  onChange,
}: {
  radiusKm: number | null;
  onChange: (next: number | null) => void;
}) {
  const dark = useColorScheme() !== 'light';
  const { accent } = useAccent();

  const cycle = () => {
    const i = RADIUS_STEPS.findIndex((r) => r === radiusKm);
    onChange(RADIUS_STEPS[(i + 1) % RADIUS_STEPS.length] ?? null);
  };

  return (
    <Pressable
      onPress={cycle}
      style={[styles.pill, dark ? styles.pillDark : styles.pillLight]}
      accessibilityLabel={`Radar: ${label(radiusKm)}. Toque para alterar.`}>
      <BlurView intensity={40} tint={dark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
      {/* View ao redor do svg: sem ela o ícone pinta atrás do backdrop-filter no web */}
      <View>
        <MapPin size={12} color={accent} />
      </View>
      <ThemedText type="smallBold" style={styles.label}>
        {label(radiusKm)}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 44,
    overflow: 'hidden',
  },
  pillDark: {
    backgroundColor: 'rgba(0,0,0,0.40)',
    borderColor: 'rgba(255,255,255,0.10)',
  },
  pillLight: {
    backgroundColor: 'rgba(255,255,255,0.60)',
    borderColor: 'rgba(0,0,0,0.05)',
  },
  label: {
    fontSize: 11,
  },
});
