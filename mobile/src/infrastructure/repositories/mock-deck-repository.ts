import { DeckRepository } from '@/application/ports/deck-repository';
import { DeckListing, SwipeDirection } from '@/domain/entities/listing';

const DECK: DeckListing[] = [
  {
    id: 'l-1',
    item: { name: 'Umbreon VMAX Alt Art', franchise: 'Pokémon TCG', category: 'card', condition: 'near_mint' },
    owner: { username: 'cardshark_rj', reputation: 4.9, reviewsCount: 54, city: 'Rio de Janeiro' },
    modes: ['sale'],
    priceBRL: 1250,
    matchScore: 0.72,
  },
  {
    id: 'l-2',
    item: { name: 'Luffy Gear 5 OP05-119', franchise: 'One Piece TCG', category: 'card', condition: 'mint' },
    owner: { username: 'luffy_colecoes', reputation: 4.8, reviewsCount: 23, city: 'São Paulo' },
    modes: ['trade', 'sale'],
    priceBRL: 890,
    matchScore: 0.94,
  },
  {
    id: 'l-3',
    item: { name: 'Nendoroid Link — Breath of the Wild', franchise: 'Zelda', category: 'figure', condition: 'near_mint' },
    owner: { username: 'ana.figures', reputation: 4.5, reviewsCount: 11, city: 'Curitiba' },
    modes: ['sale'],
    priceBRL: 420,
    matchScore: 0.61,
  },
  {
    id: 'l-4',
    item: { name: 'Charizard ex SV3-125', franchise: 'Pokémon TCG', category: 'card', condition: 'near_mint' },
    owner: { username: 'mestre_dex', reputation: 4.6, reviewsCount: 31, city: 'Belo Horizonte' },
    modes: ['trade'],
    matchScore: 0.88,
  },
  {
    id: 'l-5',
    item: { name: 'Grandista Goku SSJ', franchise: 'Dragon Ball', category: 'figure', condition: 'good' },
    owner: { username: 'saiyan.store', reputation: 4.7, reviewsCount: 42, city: 'Porto Alegre' },
    modes: ['trade', 'sale'],
    priceBRL: 310,
    matchScore: 0.58,
  },
  {
    id: 'l-6',
    item: { name: 'Amazing Spider-Man #300 (fac-símile)', franchise: 'Marvel', category: 'comic', condition: 'good' },
    owner: { username: 'hq.vault', reputation: 5.0, reviewsCount: 8, city: 'São Paulo' },
    modes: ['sale'],
    priceBRL: 180,
    matchScore: 0.44,
  },
];

export class MockDeckRepository implements DeckRepository {
  async listDeck(): Promise<DeckListing[]> {
    return [...DECK].sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
  }

  async swipe(_listingId: string, _direction: SwipeDirection): Promise<void> {
    // Na implementação real: upsert em swipes (sinal para o matchmaking).
  }
}
