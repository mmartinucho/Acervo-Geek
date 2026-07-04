import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

// Chip de filtro/categoria do protótipo: pílula pequena, uppercase, tracking
// largo. Selecionado = invertido (como o PrimaryButton); senão, vidro sutil.
export function Chip({
  label,
  selected = false,
  onPress,
  style,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: selected ? theme.tint : theme.glass },
        pressed && styles.pressed,
        style,
      ]}>
      <ThemedText
        type="overline"
        style={{ color: selected ? theme.onTint : theme.textSecondary }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 20, // px-5 py-2.5 do protótipo
    paddingVertical: 10,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
});
