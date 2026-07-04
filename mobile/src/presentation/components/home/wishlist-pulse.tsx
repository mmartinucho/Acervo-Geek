import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function WishlistPulse({ newItemsCount }: { newItemsCount: number }) {
  const router = useRouter();
  const theme = useTheme();

  if (newItemsCount === 0) return null;

  return (
    <Pressable onPress={() => router.push('/profile')}>
      <View style={[styles.container, { backgroundColor: theme.backgroundElement }]}>
        <ThemedText style={styles.icon}>✨</ThemedText>
        <View style={styles.textBlock}>
          <ThemedText type="smallBold">
            {newItemsCount} {newItemsCount === 1 ? 'item' : 'itens'} da sua wishlist
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            entraram em inventários esta semana
          </ThemedText>
        </View>
        <ThemedText type="smallBold" themeColor="tint">
          Ver ›
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginHorizontal: Spacing.four,
    borderRadius: Spacing.three,
    padding: Spacing.three,
  },
  icon: {
    fontSize: 24,
  },
  textBlock: {
    flex: 1,
  },
});
