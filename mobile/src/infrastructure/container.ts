import { DealRepository } from '@/application/ports/deal-repository';
import { DeckRepository } from '@/application/ports/deck-repository';

import { MockDealRepository } from './repositories/mock-deal-repository';
import { MockDeckRepository } from './repositories/mock-deck-repository';
import { SupabaseDeckRepository } from './repositories/supabase-deck-repository';
import { supabase } from './supabase/client';

// Ponto único de amarração das portas. Com Supabase configurado (EXPO_PUBLIC_*),
// o deck vem do banco real (RPC deck_for_user); senão, cai no mock — a UI não
// muda. Deals ainda em mock (implementação Supabase é a próxima fase).
export const repositories: {
  deck: DeckRepository;
  deals: DealRepository;
} = {
  deck: supabase ? new SupabaseDeckRepository(supabase) : new MockDeckRepository(),
  deals: new MockDealRepository(),
};
