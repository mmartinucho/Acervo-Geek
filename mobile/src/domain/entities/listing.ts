import { ItemCategory, ItemCondition } from './item';

export type ListingMode = 'trade' | 'sale';

export type SwipeDirection = 'want' | 'pass';

// Um anúncio no deck de descoberta: item de um inventário disponível
// para troca, venda ou ambos.
export interface DeckListing {
  id: string;
  item: {
    name: string;
    franchise: string;
    category: ItemCategory;
    condition: ItemCondition;
  };
  owner: {
    username: string;
    reputation: number;
    reviewsCount: number;
    city?: string;
  };
  modes: ListingMode[];
  priceBRL?: number;
  // Score do matchmaking (Databricks) — ordena o deck e dispara o "deu match".
  matchScore?: number;
}

export function formatPriceBRL(price: number): string {
  return `R$ ${price.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}
