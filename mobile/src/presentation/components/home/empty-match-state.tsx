import { useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// Feed nunca vazio: sem sugestões, oferece os dois inputs do matchmaking.
export function EmptyMatchState() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <ThemedView type="backgroundElement" style={styles.container}>
      <ThemedText type="smallBold" style={styles.title}>
        Nenhum match por enquanto
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.title}>
        Quanto mais o Acervo Geek conhece sua coleção, melhores as sugestões.
      </ThemedText>
      <Pressable
        onPress={() => router.push('/scan')}
        style={[styles.cta, { backgroundColor: theme.tint }]}>
        <ThemedText type="smallBold" style={{ color: theme.onTint }}>
          📷 Escanear minha coleção
        </ThemedText>
      </Pressable>
      <Pressable onPress={() => router.push('/profile')} style={styles.secondaryCta}>
        <ThemedText type="smallBold" themeColor="tint">
          Montar minha wishlist
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.four,
    borderRadius: Spacing.three,
    padding: Spacing.four,
    alignItems: 'center',
    gap: Spacing.two,
  },
  title: {
    textAlign: 'center',
  },
  cta: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    marginTop: Spacing.two,
  },
  secondaryCta: {
    paddingVertical: Spacing.one,
  },
});
