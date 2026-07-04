import { BlurView } from 'expo-blur';
import { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';

// Superfície de "vidro" do protótipo: fundo translúcido + blur + borda sutil.
// 'subtle' = white/5 + borda white/10 (cards de lista); 'strong' = white/10 +
// borda white/20 (card do dono sobre a foto do deck).
export type GlassEmphasis = 'subtle' | 'strong';

export function glassPalette(dark: boolean, emphasis: GlassEmphasis) {
  if (dark) {
    return emphasis === 'strong'
      ? { background: 'rgba(255,255,255,0.10)', border: 'rgba(255,255,255,0.20)' }
      : { background: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.10)' };
  }
  // No claro o protótipo usa vidro escuro (bg-black/5), não branco translúcido.
  return emphasis === 'strong'
    ? { background: 'rgba(0,0,0,0.08)', border: 'rgba(0,0,0,0.12)' }
    : { background: 'rgba(0,0,0,0.05)', border: 'rgba(0,0,0,0.10)' };
}

export function GlassCard({
  children,
  emphasis = 'subtle',
  radius = 28, // rounded-[28px] do protótipo
  intensity = 40,
  style,
}: {
  children?: ReactNode;
  emphasis?: GlassEmphasis;
  radius?: number;
  intensity?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const dark = useColorScheme() !== 'light';
  const palette = glassPalette(dark, emphasis);

  return (
    <View
      style={[
        styles.card,
        { borderRadius: radius, backgroundColor: palette.background, borderColor: palette.border },
        style,
      ]}>
      <BlurView
        intensity={intensity}
        tint={dark ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  content: {
    padding: 16,
  },
});
