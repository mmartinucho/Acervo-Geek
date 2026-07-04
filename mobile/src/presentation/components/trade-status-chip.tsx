import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { TRADE_STATUS_LABELS, TradeStatus } from '@/domain/entities/trade';

const STATUS_COLORS: Record<TradeStatus, { bg: string; fg: string }> = {
  proposed: { bg: '#DBEAFE', fg: '#1D4ED8' },
  accepted: { bg: '#EDE9FE', fg: '#6D28D9' },
  shipping: { bg: '#FEF3C7', fg: '#B45309' },
  completed: { bg: '#DCFCE7', fg: '#15803D' },
  cancelled: { bg: '#F3F4F6', fg: '#4B5563' },
  disputed: { bg: '#FEE2E2', fg: '#B91C1C' },
};

export function TradeStatusChip({ status }: { status: TradeStatus }) {
  const colors = STATUS_COLORS[status];
  return (
    <View style={[styles.chip, { backgroundColor: colors.bg }]}>
      <ThemedText type="smallBold" style={[styles.label, { color: colors.fg }]}>
        {TRADE_STATUS_LABELS[status]}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  label: {
    fontSize: 12,
    lineHeight: 18,
  },
});
