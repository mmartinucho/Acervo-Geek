import { Ionicons } from '@expo/vector-icons';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { DEAL_MODE_LABELS, DealMode } from '@/domain/entities/trade';
import { formatPriceBRL } from '@/domain/entities/listing';
import { AvatarInitials } from '@/presentation/components/avatar-initials';
import { TradeStatusChip } from '@/presentation/components/trade-status-chip';
import { useDeals } from '@/presentation/hooks/use-deals';

const MODE_STYLE: Record<DealMode, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  trade: { icon: 'swap-horizontal', color: '#6D4AFF' },
  purchase: { icon: 'arrow-down', color: '#22C55E' },
  sale: { icon: 'arrow-up', color: '#F59E0B' },
};

export default function DealsScreen() {
  const { deals } = useDeals();
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ThemedText style={styles.title}>Negócios</ThemedText>
        <FlatList
          data={deals}
          keyExtractor={(d) => d.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const mode = MODE_STYLE[item.mode];
            return (
              <ThemedView
                type="backgroundElement"
                style={[styles.card, { borderColor: theme.border }]}>
                <View style={styles.avatarWrap}>
                  <AvatarInitials username={item.counterpartyUsername} size={40} />
                  <View style={[styles.modeBadge, { backgroundColor: mode.color, borderColor: theme.backgroundElement }]}>
                    <Ionicons name={mode.icon} size={11} color="#FFF" />
                  </View>
                </View>
                <View style={styles.cardText}>
                  <ThemedText type="smallBold">@{item.counterpartyUsername}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                    {DEAL_MODE_LABELS[item.mode]} · {item.itemsSummary}
                    {item.priceBRL != null ? ` · ${formatPriceBRL(item.priceBRL)}` : ''}
                  </ThemedText>
                </View>
                <TradeStatusChip status={item.status} />
              </ThemedView>
            );
          }}
          ListEmptyComponent={
            <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
              Nenhum negócio ainda — deslize no Descobrir para começar.
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
    paddingTop: Spacing.two,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    letterSpacing: -0.8,
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
    borderRadius: 18,
    borderWidth: 1,
    padding: Spacing.three,
  },
  avatarWrap: {
    width: 40,
    height: 40,
  },
  modeBadge: {
    position: 'absolute',
    right: -3,
    bottom: -3,
    width: 19,
    height: 19,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
  },
  empty: {
    textAlign: 'center',
    marginTop: Spacing.five,
  },
});
