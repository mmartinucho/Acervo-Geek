import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { ActivityEntry } from '@/domain/entities/trade';
import { TradeStatusChip } from '@/presentation/components/trade-status-chip';

function ActivityRow({ entry }: { entry: ActivityEntry }) {
  if (entry.kind === 'trade') {
    const { trade } = entry;
    return (
      <View style={styles.row}>
        <View style={styles.rowText}>
          <ThemedText type="smallBold">@{trade.counterpartyUsername}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
            {trade.itemsSummary}
          </ThemedText>
        </View>
        <TradeStatusChip status={trade.status} />
      </View>
    );
  }

  const { review } = entry;
  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <ThemedText type="smallBold">
          @{review.reviewerUsername} te avaliou{' '}
          <ThemedText type="smallBold" themeColor="tint">
            {'★'.repeat(review.rating)}
          </ThemedText>
        </ThemedText>
        {review.comment && (
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
            “{review.comment}”
          </ThemedText>
        )}
      </View>
    </View>
  );
}

export function RecentActivityFeed({ entries }: { entries: ActivityEntry[] }) {
  if (entries.length === 0) return null;

  return (
    <View style={styles.container}>
      <ThemedText type="smallBold" style={styles.sectionTitle}>
        Atividade recente
      </ThemedText>
      <ThemedView type="backgroundElement" style={styles.list}>
        {entries.map((entry, index) => (
          <ActivityRow
            key={entry.kind === 'trade' ? entry.trade.id : entry.review.id}
            entry={entry}
          />
        ))}
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  sectionTitle: {},
  list: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  rowText: {
    flex: 1,
  },
});
