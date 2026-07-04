import { ReactNode } from 'react';
import { Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

// Ação principal do protótipo: pílula INVERTIDA — branca no escuro, preta no
// claro (theme.tint já codifica isso). A cor de acento do universo fica para
// FAB/match/progresso; nunca entra aqui.
export function PrimaryButton({
  title,
  onPress,
  disabled = false,
  icon,
  style,
}: {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  /** Ícone opcional à direita do texto (ex.: <ArrowRight/> do lucide). */
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: disabled ? theme.glass : theme.tint },
        pressed && styles.pressed,
        style,
      ]}>
      <ThemedText type="label" style={{ color: disabled ? theme.textSecondary : theme.onTint }}>
        {title}
      </ThemedText>
      {icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18, // py-4.5 do protótipo
    paddingHorizontal: 24,
    borderRadius: 999,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
});
