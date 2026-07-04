import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Fonts, Spacing } from '@/constants/theme';
import { formatPriceBRL } from '@/domain/entities/listing';
import { DEAL_MODE_LABELS, DealSummary, TradeStatus } from '@/domain/entities/trade';
import { useTheme } from '@/hooks/use-theme';
import { AvatarInitials } from '@/presentation/components/avatar-initials';
import { StatusPill } from '@/presentation/components/status-pill';
import { useDeals } from '@/presentation/hooks/use-deals';

// Negociação "ativa" = ainda em andamento; o resto vai para o Histórico.
const ACTIVE_STATUS: TradeStatus[] = ['proposed', 'accepted', 'shipping'];

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
function formatDealDate(d: Date): string {
  const now = new Date();
  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((startOfDay(now) - startOfDay(d)) / 86_400_000);
  if (days <= 0) return 'Hoje';
  if (days === 1) return 'Ontem';
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]}`;
}

function DealCard({ deal }: { deal: DealSummary }) {
  const theme = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.glass, borderColor: theme.glassBorder }]}>
      <View style={styles.cardTop}>
        <View style={styles.typeRow}>
          <View style={[styles.typeBadge, { backgroundColor: theme.backgroundSelected }]}>
            <ThemedText type="overline" style={styles.typeBadgeText}>
              {DEAL_MODE_LABELS[deal.mode]}
            </ThemedText>
          </View>
          <ThemedText type="overline" themeColor="textSecondary" style={styles.date}>
            {formatDealDate(deal.updatedAt)}
          </ThemedText>
        </View>
        <StatusPill status={deal.status} />
      </View>

      <View style={styles.cardBody}>
        <AvatarInitials username={deal.counterpartyUsername} size={48} />
        <View style={styles.dealText}>
          <ThemedText type="bodyMedium" numberOfLines={1} style={styles.item}>
            {deal.itemsSummary}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
            com @{deal.counterpartyUsername}
          </ThemedText>
        </View>
        {deal.priceBRL != null && (
          <ThemedText style={styles.price}>{formatPriceBRL(deal.priceBRL)}</ThemedText>
        )}
      </View>
    </View>
  );
}

export default function DealsScreen() {
  const theme = useTheme();
  const { deals } = useDeals();
  const [tab, setTab] = useState<'active' | 'history'>('active');

  const visible = useMemo(
    () =>
      deals.filter((d) =>
        tab === 'active' ? ACTIVE_STATUS.includes(d.status) : !ACTIVE_STATUS.includes(d.status),
      ),
    [deals, tab],
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ThemedText type="display" style={styles.title}>
          Negociações.
        </ThemedText>

        <View style={styles.tabs}>
          {(['active', 'history'] as const).map((key) => {
            const selected = tab === key;
            return (
              <Pressable key={key} onPress={() => setTab(key)} style={styles.tab}>
                <ThemedText
                  type="bodyMedium"
                  style={{ color: selected ? theme.text : theme.textSecondary }}>
                  {key === 'active' ? 'Ativos' : 'Histórico'}
                </ThemedText>
                {selected && <View style={[styles.tabUnderline, { backgroundColor: theme.text }]} />}
              </Pressable>
            );
          })}
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}>
          {visible.length === 0 ? (
            <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
              {tab === 'active'
                ? 'Nenhuma negociação ativa — deslize no Descobrir para começar.'
                : 'Seu histórico aparece aqui quando um negócio é concluído.'}
            </ThemedText>
          ) : (
            visible.map((deal) => <DealCard key={deal.id} deal={deal} />)
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: Spacing.four, paddingTop: Spacing.two },
  title: { marginBottom: Spacing.four },
  tabs: {
    flexDirection: 'row',
    gap: Spacing.five,
    marginBottom: Spacing.four,
  },
  tab: {
    paddingBottom: Spacing.one,
    gap: Spacing.one,
  },
  tabUnderline: {
    height: 1.5,
    borderRadius: 1,
  },
  list: {
    gap: Spacing.three,
    paddingBottom: BottomTabInset + 80,
  },
  empty: {
    textAlign: 'center',
    marginTop: Spacing.five,
  },
  card: {
    borderRadius: 32,
    borderWidth: 1,
    padding: Spacing.four,
    gap: Spacing.four,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  typeBadgeText: {
    fontSize: 9,
    letterSpacing: 2,
  },
  date: {
    fontSize: 9,
    letterSpacing: 1.5,
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  dealText: {
    flex: 1,
    gap: 2,
  },
  item: {
    letterSpacing: -0.2,
  },
  price: {
    fontFamily: Fonts.medium, // font-medium text-lg — peso via família
    fontSize: 18,
    letterSpacing: -0.3,
  },
});
