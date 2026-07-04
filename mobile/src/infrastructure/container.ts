import { DealRepository } from '@/application/ports/deal-repository';
import { DeckRepository } from '@/application/ports/deck-repository';

import { MockDealRepository } from './repositories/mock-deal-repository';
import { MockDeckRepository } from './repositories/mock-deck-repository';

// Ponto único de amarração das portas. Quando o backend Supabase entrar,
// só este arquivo troca de implementação.
export const repositories: {
  deck: DeckRepository;
  deals: DealRepository;
} = {
  deck: new MockDeckRepository(),
  deals: new MockDealRepository(),
};
