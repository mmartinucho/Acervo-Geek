import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { TRADE_STATUS_LABELS, TradeStatus } from '@/domain/entities/trade';

// Status de negociação do protótipo: ponto + rótulo uppercase na mesma cor,
// sem fundo. Proposta = âmbar, Trânsito = azul, Concluída = esmeralda.
const STATUS_COLORS: Record<TradeStatus, string> = {
  proposed: '#F59E0B',
  accepted: '#14B8A6',
  shipping: '#3B82F6',
  completed: '#10B981',
  cancelled: '#737373',
  disputed: '#F43F5E',
};

export function StatusPill({
  status,
  style,
}: {
  status: TradeStatus;
  style?: StyleProp<ViewStyle>;
}) {
  const color = STATUS_COLORS[status];

  return (
    <View style={[styles.row, style]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <ThemedText type="overline" style={[styles.label, { color }]}>
        {TRADE_STATUS_LABELS[status]}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 10,
    letterSpacing: 2, // tracking-[0.2em] do protótipo
  },
});
