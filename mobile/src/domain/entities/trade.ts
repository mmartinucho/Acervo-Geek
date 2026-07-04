export type TradeStatus =
  | 'proposed'
  | 'accepted'
  | 'shipping'
  | 'completed'
  | 'cancelled'
  | 'disputed';

export interface TradeSummary {
  id: string;
  counterpartyUsername: string;
  status: TradeStatus;
  itemsSummary: string;
  updatedAt: Date;
}

export interface ReceivedReview {
  id: string;
  reviewerUsername: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

export type ActivityEntry =
  | { kind: 'trade'; trade: TradeSummary }
  | { kind: 'review'; review: ReceivedReview };

export const TRADE_STATUS_LABELS: Record<TradeStatus, string> = {
  proposed: 'Proposta',
  accepted: 'Aceita',
  shipping: 'Em trânsito',
  completed: 'Concluída',
  cancelled: 'Cancelada',
  disputed: 'Em disputa',
};
