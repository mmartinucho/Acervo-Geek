import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// Placeholder do fluxo de scan. A implementação real usa expo-camera:
// foto → upload S3 (URL pré-assinada) → Edge Function scan-item →
// candidatos do catálogo → usuário confirma → INSERT em user_inventory.
export default function ScanScreen() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.viewfinder, { borderColor: theme.tint }]}>
        <Ionicons name="camera-outline" size={56} color={theme.textSecondary} />
        <ThemedText type="smallBold" style={styles.centered}>
          Aponte a câmera para o item
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.centered}>
          A IA identifica o card ou figura e adiciona ao seu acervo em segundos.
        </ThemedText>
      </View>
      <ThemedText type="small" themeColor="textSecondary" style={styles.centered}>
        Câmera disponível na próxima fase (expo-camera + reconhecimento via IA).
      </ThemedText>
      <Pressable
        onPress={() => router.back()}
        style={[styles.closeButton, { backgroundColor: theme.backgroundElement }]}>
        <ThemedText type="smallBold">Fechar</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
    gap: Spacing.four,
  },
  viewfinder: {
    alignSelf: 'stretch',
    aspectRatio: 3 / 4,
    maxHeight: 420,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    padding: Spacing.four,
  },
  centered: {
    textAlign: 'center',
  },
  closeButton: {
    borderRadius: 999,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two + 2,
  },
});
