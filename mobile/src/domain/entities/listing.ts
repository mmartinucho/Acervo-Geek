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
    // Foto do item (full-bleed no deck); sem ela o card usa um fundo escuro
    // com brilho da cor da categoria.
    imageUrl?: string;
    // Específico de figurinha: número do slot, país e se é especial/legend.
    stickerNumber?: string;
    country?: string;
    isSpecial?: boolean;
  };
  owner: {
    username: string;
    reputation: number;
    reviewsCount: number;
    city?: string;
    distanceKm?: number; // distância até o usuário (radar de proximidade)
  };
  modes: ListingMode[];
  priceBRL?: number;
  // Score do matchmaking (Databricks) — ordena o deck e dispara o "deu match".
  matchScore?: number;
  // Gancho do match recíproco de repetidas: "@bruno quer a sua repetida do Messi".
  matchReason?: string;
}

export function formatPriceBRL(price: number): string {
  return `R$ ${price.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}

export function formatDistance(km: number): string {
  if (km < 1) return 'menos de 1 km';
  if (km < 10) return `${km.toFixed(1).replace('.', ',')} km`;
  return `${Math.round(km)} km`;
}
