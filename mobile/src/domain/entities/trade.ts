export type TradeStatus =
  | 'proposed'
  | 'accepted'
  | 'shipping'
  | 'completed'
  | 'cancelled'
  | 'disputed';

export type DealMode = 'trade' | 'purchase' | 'sale';

export interface DealSummary {
  id: string;
  counterpartyUsername: string;
  mode: DealMode;
  status: TradeStatus;
  itemsSummary: string;
  priceBRL?: number;
  updatedAt: Date;
}

export const TRADE_STATUS_LABELS: Record<TradeStatus, string> = {
  proposed: 'Proposta',
  accepted: 'Aceita',
  shipping: 'Em trânsito',
  completed: 'Concluída',
  cancelled: 'Cancelada',
  disputed: 'Em disputa',
};

export const DEAL_MODE_LABELS: Record<DealMode, string> = {
  trade: 'Troca',
  purchase: 'Compra',
  sale: 'Venda',
};
