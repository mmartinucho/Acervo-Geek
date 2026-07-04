import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BrandGradient, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/presentation/auth/auth-context';
import { AvatarInitials } from '@/presentation/components/avatar-initials';

function StatBox({ value, label }: { value: string; label: string }) {
  const theme = useTheme();
  return (
    <ThemedView
      type="backgroundElement"
      style={[styles.statBox, { borderColor: theme.border }]}>
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
    </ThemedView>
  );
}

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user, requiresAuth, signOut } = useAuth();
  const username = user?.username ?? user?.email?.split('@')[0] ?? 'colecionador';

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={BrandGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.banner}
      />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <View style={[styles.avatarRing, { borderColor: theme.background }]}>
            <AvatarInitials username={username} size={84} />
          </View>
          <ThemedText style={styles.name}>@{username}</ThemedText>
          <View style={styles.repRow}>
            <Ionicons name="star" size={15} color="#FBBF24" />
            <ThemedText type="smallBold">4.7</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              · 18 avaliações · São Paulo
            </ThemedText>
          </View>
        </View>

        <View style={styles.stats}>
          <StatBox value="42" label="No acervo" />
          <StatBox value="17" label="Para troca" />
          <StatBox value="9" label="Na wishlist" />
        </View>

        <Pressable
          onPress={() => router.push('/onboarding')}
          style={[styles.primaryCta, { backgroundColor: theme.tint }]}>
          <Ionicons name="grid-outline" size={18} color={theme.onTint} />
          <ThemedText type="smallBold" style={{ color: theme.onTint }}>
            Montar meu álbum
          </ThemedText>
        </Pressable>

        <ThemedView
          type="backgroundElement"
          style={[styles.hint, { borderColor: theme.border }]}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.hintText}>
            Inventário e wishlist detalhados entram na próxima fase, conectados ao
            Supabase (user_inventory e wishlists).
          </ThemedText>
        </ThemedView>

        {requiresAuth && (
          <Pressable onPress={signOut} style={styles.signOut}>
            <Ionicons name="log-out-outline" size={18} color={theme.textSecondary} />
            <ThemedText type="smallBold" themeColor="textSecondary">
              Sair
            </ThemedText>
          </Pressable>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.one,
    marginTop: Spacing.six,
  },
  avatarRing: {
    borderRadius: 999,
    borderWidth: 4,
    marginBottom: Spacing.one,
  },
  name: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  repRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  stats: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: Spacing.three,
    gap: 2,
  },
  statValue: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  primaryCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    borderRadius: 999,
    paddingVertical: Spacing.three,
  },
  hint: {
    borderRadius: 20,
    borderWidth: 1,
    padding: Spacing.three,
  },
  hintText: {
    textAlign: 'center',
  },
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
});
