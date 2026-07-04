export type ItemCategory = 'card' | 'figure' | 'comic' | 'game' | 'sticker';

export type ItemCondition = 'mint' | 'near_mint' | 'good' | 'played' | 'damaged';

export const CONDITION_LABELS: Record<ItemCondition, string> = {
  mint: 'Impecável',
  near_mint: 'Quase novo',
  good: 'Bom',
  played: 'Usado',
  damaged: 'Danificado',
};

export const CATEGORY_LABELS: Record<ItemCategory, string> = {
  card: 'Card',
  figure: 'Figure',
  comic: 'HQ',
  game: 'Game',
  sticker: 'Figurinha',
};
