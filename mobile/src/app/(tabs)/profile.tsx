import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { AvatarInitials } from '@/presentation/components/avatar-initials';
import { ReputationStars } from '@/presentation/components/reputation-stars';

function StatBox({ value, label }: { value: string; label: string }) {
  return (
    <ThemedView type="backgroundElement" style={styles.statBox}>
      <ThemedText type="subtitle" style={styles.statValue}>
        {value}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
    </ThemedView>
  );
}

export default function ProfileScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <AvatarInitials username="michael.m" size={72} />
          <ThemedText type="subtitle">@michael.m</ThemedText>
          <ReputationStars reputation={4.7} reviewsCount={18} />
          <ThemedText type="small" themeColor="textSecondary">
            São Paulo · colecionando desde 2026
          </ThemedText>
        </View>
        <View style={styles.stats}>
          <StatBox value="42" label="No acervo" />
          <StatBox value="17" label="Para troca" />
          <StatBox value="9" label="Na wishlist" />
        </View>
        <ThemedView type="backgroundElement" style={styles.hint}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.hintText}>
            Inventário e wishlist detalhados entram na próxima fase, conectados ao
            Supabase (user_inventory e wishlists).
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    gap: Spacing.four,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.one,
    marginTop: Spacing.three,
  },
  stats: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
  },
  statValue: {
    fontSize: 28,
    lineHeight: 36,
  },
  hint: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
  },
  hintText: {
    textAlign: 'center',
  },
});
