import { MatchSuggestion } from '@/domain/entities/match-suggestion';

// Porta implementada em infrastructure/. O MVP usa mocks; a implementação
// Supabase lê match_suggestions com RLS e assina INSERTs via Realtime.
export interface MatchRepository {
  listSuggestions(): Promise<MatchSuggestion[]>;
  dismiss(suggestionId: string): Promise<void>;
}
