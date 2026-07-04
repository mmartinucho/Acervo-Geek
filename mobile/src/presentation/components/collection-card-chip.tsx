import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles } from 'lucide-react-native';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAccent } from '@/presentation/theme/accent-context';

// Slot do fichário (proporção 63/88 de carta TCG), com os 4 estados do
// protótipo: vazio, preciso (rose), tenho (gradiente do acento) e duplicada
// (gradiente âmbar + badge de contagem).
export type CollectionCardState = 'none' | 'need' | 'have' | 'repeat';

const ROSE = '#F43F5E';
const AMBER_GRADIENT = ['#FBBF24', '#D97706'] as const;

export function CollectionCardChip({
  number,
  name,
  state,
  rare = false,
  onPress,
  style,
}: {
  /** Número do slot no álbum (ex.: "003"). */
  number: string;
  name: string;
  state: CollectionCardState;
  /** Slot raro ganha um brilho âmbar quando ainda vazio. */
  rare?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const dark = useColorScheme() !== 'light';
  const { accent } = useAccent();

  const filled = state === 'have' || state === 'repeat';
  const container =
    state === 'none'
      ? dark
        ? { backgroundColor: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }
        : { backgroundColor: 'rgba(0,0,0,0.02)', borderColor: 'rgba(0,0,0,0.05)' }
      : state === 'need'
        ? dark
          ? { backgroundColor: 'rgba(244,63,94,0.10)', borderColor: 'rgba(244,63,94,0.30)' }
          : { backgroundColor: '#FFF1F2', borderColor: '#FECDD3' }
        : state === 'have'
          ? { borderColor: 'rgba(255,255,255,0.20)' }
          : { borderColor: 'rgba(255,255,255,0.30)' };

  const numberColor =
    state === 'none'
      ? dark
        ? 'rgba(255,255,255,0.30)'
        : 'rgba(0,0,0,0.30)'
      : state === 'need'
        ? '#FB7185'
        : 'rgba(255,255,255,0.80)';

  const nameColor =
    state === 'none' ? (dark ? '#737373' : '#A3A3A3') : state === 'need' ? ROSE : '#FFFFFF';

  return (
    <Pressable onPress={onPress} style={[styles.card, container, style]}>
      {state === 'have' && (
        <LinearGradient
          colors={[accent, `${accent}CC`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      {state === 'repeat' && (
        <LinearGradient
          colors={AMBER_GRADIENT}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      {filled && (
        // Brilho branco descendo do topo, como no protótipo.
        <LinearGradient
          colors={['rgba(255,255,255,0.20)', 'transparent']}
          style={StyleSheet.absoluteFill}
        />
      )}

      <ThemedText style={[styles.number, { color: numberColor }]}>#{number}</ThemedText>
      <ThemedText
        numberOfLines={1}
        style={[styles.name, { color: nameColor }, filled && styles.nameFilled]}>
        {name}
      </ThemedText>

      {rare && state === 'none' && (
        <Sparkles size={10} color="rgba(245,158,11,0.5)" style={styles.rareIcon} />
      )}
      {state === 'repeat' && (
        <View style={styles.repeatBadge}>
          <ThemedText style={styles.repeatBadgeText}>2</ThemedText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    aspectRatio: 63 / 88, // carta TCG padrão
    borderRadius: 16,
    borderWidth: 1,
    padding: 10,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  number: {
    fontFamily: Fonts.mono,
    fontSize: 9,
    lineHeight: 12,
  },
  name: {
    fontFamily: Fonts.medium,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: -0.1,
  },
  nameFilled: {
    fontFamily: Fonts.bold,
  },
  rareIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  repeatBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 20,
    height: 20,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 8,
    borderTopRightRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  repeatBadgeText: {
    fontFamily: Fonts.bold,
    fontSize: 9,
    lineHeight: 12,
    color: '#D97706',
  },
});
