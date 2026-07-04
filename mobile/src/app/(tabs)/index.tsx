import { useRouter } from 'expo-router';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { MatchSuggestion } from '@/domain/entities/match-suggestion';
import { HomeHeader } from '@/presentation/components/home/home-header';
import { MatchSuggestionCarousel } from '@/presentation/components/home/match-suggestion-carousel';
import { RecentActivityFeed } from '@/presentation/components/home/recent-activity-feed';
import { ScanFAB } from '@/presentation/components/home/scan-fab';
import { WishlistPulse } from '@/presentation/components/home/wishlist-pulse';
import { useMatchFeed } from '@/presentation/hooks/use-match-feed';
import { useRecentActivity } from '@/presentation/hooks/use-recent-activity';

export default function HomeScreen() {
  const router = useRouter();
  const { suggestions, isLoading, refresh, dismiss } = useMatchFeed();
  const { entries } = useRecentActivity();

  // Fase 2: navegar para a tela de proposta pré-preenchida com o payload
  // da sugestão (carregando suggestion_id para o loop de métricas).
  const handlePropose = (_suggestion: MatchSuggestion) => {
    router.push('/trades');
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} />}>
          <View style={styles.header}>
            <HomeHeader username="michael.m" newMatchesCount={suggestions.length} />
          </View>
          <MatchSuggestionCarousel
            suggestions={suggestions}
            onPropose={handlePropose}
            onDismiss={dismiss}
          />
          <WishlistPulse newItemsCount={3} />
          <RecentActivityFeed entries={entries} />
        </ScrollView>
        <ScanFAB />
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
  },
  scrollContent: {
    paddingVertical: Spacing.three,
    gap: Spacing.four,
  },
  header: {
    paddingHorizontal: Spacing.four,
  },
});
