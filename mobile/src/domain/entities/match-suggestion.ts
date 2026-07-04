export type ItemCondition = 'mint' | 'near_mint' | 'good' | 'played' | 'damaged';

export interface TradePreviewItem {
  itemId: string;
  name: string;
  franchise: string;
  condition: ItemCondition;
  thumbnailUrl?: string;
}

export interface MatchedUser {
  id: string;
  username: string;
  avatarUrl?: string;
  reputation: number;
  reviewsCount: number;
  city?: string;
}

// Espelha uma linha de match_suggestions: youGive/youGet vêm prontos do
// payload JSONB gerado pelo Databricks — a UI não faz joins.
export interface MatchSuggestion {
  id: string;
  matchedUser: MatchedUser;
  score: number;
  youGive: TradePreviewItem[];
  youGet: TradePreviewItem[];
  expiresAt: Date;
}

export const CONDITION_LABELS: Record<ItemCondition, string> = {
  mint: 'Impecável',
  near_mint: 'Quase novo',
  good: 'Bom',
  played: 'Usado',
  damaged: 'Danificado',
};
