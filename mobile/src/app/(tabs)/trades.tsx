import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { AvatarInitials } from '@/presentation/components/avatar-initials';
import { TradeStatusChip } from '@/presentation/components/trade-status-chip';
import { useTrades } from '@/presentation/hooks/use-recent-activity';

export default function TradesScreen() {
  const { trades } = useTrades();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ThemedText type="subtitle" style={styles.title}>
          Minhas trocas
        </ThemedText>
        <FlatList
          data={trades}
          keyExtractor={(t) => t.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <ThemedView type="backgroundElement" style={styles.card}>
              <AvatarInitials username={item.counterpartyUsername} size={36} />
              <View style={styles.cardText}>
                <ThemedText type="smallBold">@{item.counterpartyUsername}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                  {item.itemsSummary}
                </ThemedText>
              </View>
              <TradeStatusChip status={item.status} />
            </ThemedView>
          )}
          ListEmptyComponent={
            <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
              Nenhuma troca ainda — proponha uma a partir dos seus matches!
            </ThemedText>
          }
        />
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
    paddingTop: Spacing.three,
  },
  title: {
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.three,
  },
  listContent: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Spacing.three,
    padding: Spacing.three,
  },
  cardText: {
    flex: 1,
  },
  empty: {
    textAlign: 'center',
    marginTop: Spacing.five,
  },
});
