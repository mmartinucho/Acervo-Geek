import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  CONDITION_LABELS,
  MatchSuggestion,
  TradePreviewItem,
} from '@/domain/entities/match-suggestion';
import { AvatarInitials } from '@/presentation/components/avatar-initials';
import { ReputationStars } from '@/presentation/components/reputation-stars';

function ItemChip({ item }: { item: TradePreviewItem }) {
  const theme = useTheme();
  return (
    <View style={[styles.itemChip, { backgroundColor: theme.backgroundSelected }]}>
      <ThemedText type="smallBold" numberOfLines={1}>
        {item.name}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
        {item.franchise} · {CONDITION_LABELS[item.condition]}
      </ThemedText>
    </View>
  );
}

export function MatchCard({
  suggestion,
  onPropose,
  onDismiss,
}: {
  suggestion: MatchSuggestion;
  onPropose: (suggestion: MatchSuggestion) => void;
  onDismiss: (suggestionId: string) => void;
}) {
  const theme = useTheme();
  const { matchedUser } = suggestion;

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={styles.userRow}>
        <View style={styles.userBadge}>
          <AvatarInitials username={matchedUser.username} size={36} />
          <View>
            <ThemedText type="smallBold">@{matchedUser.username}</ThemedText>
            {matchedUser.city && (
              <ThemedText type="small" themeColor="textSecondary">
                {matchedUser.city}
              </ThemedText>
            )}
          </View>
        </View>
        <ReputationStars
          reputation={matchedUser.reputation}
          reviewsCount={matchedUser.reviewsCount}
        />
      </View>

      <View style={styles.tradeRow}>
        <View style={styles.tradeSide}>
          <ThemedText type="small" themeColor="textSecondary">
            Você dá
          </ThemedText>
          {suggestion.youGive.map((item) => (
            <ItemChip key={item.itemId} item={item} />
          ))}
        </View>
        <ThemedText type="subtitle" themeColor="tint" style={styles.arrow}>
          ⇄
        </ThemedText>
        <View style={styles.tradeSide}>
          <ThemedText type="small" themeColor="textSecondary">
            Você recebe
          </ThemedText>
          {suggestion.youGet.map((item) => (
            <ItemChip key={item.itemId} item={item} />
          ))}
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable onPress={() => onDismiss(suggestion.id)} style={styles.dismissButton}>
          <ThemedText type="small" themeColor="textSecondary">
            Dispensar
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={() => onPropose(suggestion)}
          style={[styles.proposeButton, { backgroundColor: theme.tint }]}>
          <ThemedText type="smallBold" style={{ color: theme.onTint }}>
            Propor troca
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 300,
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  tradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  tradeSide: {
    flex: 1,
    gap: Spacing.one,
  },
  arrow: {
    fontSize: 20,
    lineHeight: 24,
  },
  itemChip: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.three,
  },
  dismissButton: {
    paddingVertical: Spacing.two,
  },
  proposeButton: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
});
