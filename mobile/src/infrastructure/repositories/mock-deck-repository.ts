import { DeckRepository } from '@/application/ports/deck-repository';
import { DeckListing, SwipeDirection } from '@/domain/entities/listing';
import { CollectionProgress } from '@/domain/entities/collection-progress';

// Deck do MVP: figurinhas do álbum da Copa que faltam para o usuário e que
// outros têm repetidas. Cada card traz o gancho do match recíproco.
const DECK: DeckListing[] = [
  {
    id: 'f-1',
    item: {
      name: 'Lionel Messi',
      franchise: 'Copa 2026',
      category: 'sticker',
      condition: 'mint',
      stickerNumber: '10',
      country: 'Argentina',
      isSpecial: true,
    },
    owner: { username: 'bruno.cards', reputation: 4.9, reviewsCount: 61, city: 'São Paulo' },
    modes: ['trade'],
    matchScore: 0.96,
    matchReason: '@bruno.cards quer a sua repetida do Neymar',
  },
  {
    id: 'f-2',
    item: {
      name: 'Vini Jr.',
      franchise: 'Copa 2026',
      category: 'sticker',
      condition: 'near_mint',
      stickerNumber: '07',
      country: 'Brasil',
    },
    owner: { username: 'ana.albuns', reputation: 4.7, reviewsCount: 24, city: 'Curitiba' },
    modes: ['trade', 'sale'],
    priceBRL: 8,
    matchScore: 0.89,
    matchReason: '@ana.albuns quer a sua repetida do Mbappé',
  },
  {
    id: 'f-3',
    item: {
      name: 'Kylian Mbappé',
      franchise: 'Copa 2026',
      category: 'sticker',
      condition: 'mint',
      stickerNumber: '25',
      country: 'França',
      isSpecial: true,
    },
    owner: { username: 'colecao.zn', reputation: 4.6, reviewsCount: 18, city: 'Rio de Janeiro' },
    modes: ['sale'],
    priceBRL: 15,
    matchScore: 0.82,
  },
  {
    id: 'f-4',
    item: {
      name: 'Escudo — Brasil',
      franchise: 'Copa 2026',
      category: 'sticker',
      condition: 'mint',
      stickerNumber: 'BRA',
      country: 'Brasil',
      isSpecial: true,
    },
    owner: { username: 'troca.fc', reputation: 5.0, reviewsCount: 9, city: 'Belo Horizonte' },
    modes: ['trade'],
    matchScore: 0.78,
    matchReason: '@troca.fc quer a sua repetida do escudo da França',
  },
  {
    id: 'f-5',
    item: {
      name: 'Rodrygo',
      franchise: 'Copa 2026',
      category: 'sticker',
      condition: 'good',
      stickerNumber: '21',
      country: 'Brasil',
    },
    owner: { username: 'figura.rara', reputation: 4.5, reviewsCount: 33, city: 'Salvador' },
    modes: ['trade', 'sale'],
    priceBRL: 5,
    matchScore: 0.71,
  },
];

const PROGRESS: CollectionProgress = {
  collectionName: 'Copa 2026',
  ownedSlots: 546,
  totalSlots: 670,
  completionPct: 81.5,
  spareStickers: 47,
};

export class MockDeckRepository implements DeckRepository {
  async listDeck(): Promise<DeckListing[]> {
    return [...DECK].sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
  }

  async getProgress(): Promise<CollectionProgress> {
    return PROGRESS;
  }

  async swipe(_listingId: string, _direction: SwipeDirection): Promise<void> {
    // Na implementação real: upsert em swipes (sinal para o matchmaking).
  }
}
