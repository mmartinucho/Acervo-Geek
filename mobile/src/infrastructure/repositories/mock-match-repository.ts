import { MatchRepository } from '@/application/ports/match-repository';
import { MatchSuggestion } from '@/domain/entities/match-suggestion';

const DAY_MS = 24 * 60 * 60 * 1000;

const SUGGESTIONS: MatchSuggestion[] = [
  {
    id: 'sug-1',
    matchedUser: {
      id: 'u-2',
      username: 'luffy_colecoes',
      reputation: 4.8,
      reviewsCount: 23,
      city: 'São Paulo',
    },
    score: 0.94,
    youGive: [
      { itemId: 'i-1', name: 'Charizard ex SV3-125', franchise: 'Pokémon TCG', condition: 'near_mint' },
    ],
    youGet: [
      { itemId: 'i-2', name: 'Luffy Gear 5 OP05-119', franchise: 'One Piece TCG', condition: 'mint' },
    ],
    expiresAt: new Date(Date.now() + 3 * DAY_MS),
  },
  {
    id: 'sug-2',
    matchedUser: {
      id: 'u-3',
      username: 'ana.figures',
      reputation: 4.5,
      reviewsCount: 11,
      city: 'Curitiba',
    },
    score: 0.87,
    youGive: [
      { itemId: 'i-3', name: 'Goku SSJ — Grandista', franchise: 'Dragon Ball', condition: 'good' },
      { itemId: 'i-4', name: 'Vegeta Scouter BT8-041', franchise: 'Dragon Ball SCG', condition: 'near_mint' },
    ],
    youGet: [
      { itemId: 'i-5', name: 'Nendoroid Link — BotW', franchise: 'Zelda', condition: 'near_mint' },
    ],
    expiresAt: new Date(Date.now() + 5 * DAY_MS),
  },
  {
    id: 'sug-3',
    matchedUser: {
      id: 'u-4',
      username: 'cardshark_rj',
      reputation: 4.9,
      reviewsCount: 54,
      city: 'Rio de Janeiro',
    },
    score: 0.81,
    youGive: [
      { itemId: 'i-6', name: 'Mewtwo GX SM196', franchise: 'Pokémon TCG', condition: 'good' },
    ],
    youGet: [
      { itemId: 'i-7', name: 'Umbreon VMAX Alt Art', franchise: 'Pokémon TCG', condition: 'near_mint' },
    ],
    expiresAt: new Date(Date.now() + 2 * DAY_MS),
  },
];

export class MockMatchRepository implements MatchRepository {
  private dismissed = new Set<string>();

  async listSuggestions(): Promise<MatchSuggestion[]> {
    return SUGGESTIONS.filter((s) => !this.dismissed.has(s.id));
  }

  async dismiss(suggestionId: string): Promise<void> {
    this.dismissed.add(suggestionId);
  }
}
