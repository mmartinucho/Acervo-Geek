import { AuthRepository } from '@/application/ports/auth-repository';
import { CollectionRepository } from '@/application/ports/collection-repository';
import { DealRepository } from '@/application/ports/deal-repository';
import { DeckRepository } from '@/application/ports/deck-repository';

import { MockAuthRepository } from './repositories/mock-auth-repository';
import { MockCollectionRepository } from './repositories/mock-collection-repository';
import { MockDealRepository } from './repositories/mock-deal-repository';
import { MockDeckRepository } from './repositories/mock-deck-repository';
import { SupabaseAuthRepository } from './repositories/supabase-auth-repository';
import { SupabaseCollectionRepository } from './repositories/supabase-collection-repository';
import { SupabaseDeckRepository } from './repositories/supabase-deck-repository';
import { supabase } from './supabase/client';

// Ponto único de amarração das portas. Com Supabase configurado (EXPO_PUBLIC_*),
// auth, deck e coleção vêm do backend real; senão, tudo cai no mock — a UI não
// muda. Deals ainda em mock (implementação Supabase é a próxima fase).
export const repositories: {
  auth: AuthRepository;
  deck: DeckRepository;
  deals: DealRepository;
  collection: CollectionRepository;
} = {
  auth: supabase ? new SupabaseAuthRepository(supabase) : new MockAuthRepository(),
  deck: supabase ? new SupabaseDeckRepository(supabase) : new MockDeckRepository(),
  deals: new MockDealRepository(),
  collection: supabase
    ? new SupabaseCollectionRepository(supabase)
    : new MockCollectionRepository(),
};
