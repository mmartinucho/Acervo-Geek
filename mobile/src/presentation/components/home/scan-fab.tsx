import { useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function ScanFAB() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <Pressable
      onPress={() => router.push('/scan')}
      style={[styles.fab, { backgroundColor: theme.tint }]}
      accessibilityLabel="Escanear item com a câmera">
      <ThemedText style={styles.icon}>📷</ThemedText>
      <ThemedText type="smallBold" style={{ color: theme.onTint }}>
        Escanear
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: Spacing.four,
    bottom: Spacing.four,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  icon: {
    fontSize: 18,
  },
});
