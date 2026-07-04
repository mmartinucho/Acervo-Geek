import { FlatList, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { MatchSuggestion } from '@/domain/entities/match-suggestion';
import { EmptyMatchState } from '@/presentation/components/home/empty-match-state';
import { MatchCard } from '@/presentation/components/home/match-card';

export function MatchSuggestionCarousel({
  suggestions,
  onPropose,
  onDismiss,
}: {
  suggestions: MatchSuggestion[];
  onPropose: (suggestion: MatchSuggestion) => void;
  onDismiss: (suggestionId: string) => void;
}) {
  return (
    <View style={styles.container}>
      <ThemedText type="smallBold" style={styles.sectionTitle}>
        Matches para você
      </ThemedText>
      {suggestions.length === 0 ? (
        <EmptyMatchState />
      ) : (
        <FlatList
          horizontal
          data={suggestions}
          keyExtractor={(s) => s.id}
          renderItem={({ item }) => (
            <MatchCard suggestion={item} onPropose={onPropose} onDismiss={onDismiss} />
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          snapToInterval={300 + Spacing.two}
          decelerationRate="fast"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  sectionTitle: {
    paddingHorizontal: Spacing.four,
  },
  listContent: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
});
