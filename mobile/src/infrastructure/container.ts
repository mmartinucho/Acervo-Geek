import { AuthRepository } from '@/application/ports/auth-repository';
import { CollectionRepository } from '@/application/ports/collection-repository';
import { DealRepository } from '@/application/ports/deal-repository';
import { DeckRepository } from '@/application/ports/deck-repository';
import { ThemeRepository } from '@/application/ports/theme-repository';

import { MockAuthRepository } from './repositories/mock-auth-repository';
import { MockCollectionRepository } from './repositories/mock-collection-repository';
import { MockDealRepository } from './repositories/mock-deal-repository';
import { MockDeckRepository } from './repositories/mock-deck-repository';
import { MockThemeRepository } from './repositories/mock-theme-repository';
import { SupabaseAuthRepository } from './repositories/supabase-auth-repository';
import { SupabaseCollectionRepository } from './repositories/supabase-collection-repository';
import { SupabaseDeckRepository } from './repositories/supabase-deck-repository';
import { SupabaseThemeRepository } from './repositories/supabase-theme-repository';
import { supabase } from './supabase/client';

// Ponto único de amarração das portas. Com Supabase configurado (EXPO_PUBLIC_*),
// tudo vem do backend real; senão, mock — a UI não muda. Deals ainda em mock.
export const repositories: {
  auth: AuthRepository;
  deck: DeckRepository;
  deals: DealRepository;
  collection: CollectionRepository;
  themes: ThemeRepository;
} = {
  auth: supabase ? new SupabaseAuthRepository(supabase) : new MockAuthRepository(),
  deck: supabase ? new SupabaseDeckRepository(supabase) : new MockDeckRepository(),
  deals: new MockDealRepository(),
  collection: supabase
    ? new SupabaseCollectionRepository(supabase)
    : new MockCollectionRepository(),
  themes: supabase ? new SupabaseThemeRepository(supabase) : new MockThemeRepository(),
};
