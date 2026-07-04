import { BlurView } from 'expo-blur';
import { ReactNode } from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GlassEmphasis, glassPalette } from '@/presentation/components/glass-card';

// Botão-pílula de vidro do login ("Continuar com Apple/Google"):
// strong = white/10 + borda white/20; subtle = white/5 + borda white/10.
export function GlassButton({
  title,
  onPress,
  emphasis = 'subtle',
  icon,
  style,
}: {
  title: string;
  onPress?: () => void;
  emphasis?: GlassEmphasis;
  /** Ícone opcional à esquerda do texto. */
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const dark = useColorScheme() !== 'light';
  const palette = glassPalette(dark, emphasis);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: palette.background, borderColor: palette.border },
        pressed && styles.pressed,
        style,
      ]}>
      <BlurView intensity={40} tint={dark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
      {/* View ao redor do ícone: svg direto pinta atrás do blur no web */}
      {icon && <View>{icon}</View>}
      <ThemedText type="label">{title}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16, // py-4 do protótipo
    paddingHorizontal: 24,
    borderRadius: 999,
    borderWidth: 1,
    overflow: 'hidden',
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
});
