import { useCallback, useEffect, useState } from 'react';

import { MatchSuggestion } from '@/domain/entities/match-suggestion';
import { repositories } from '@/infrastructure/container';

// Estado de servidor via hook simples no MVP mockado. Ao ligar o Supabase,
// migrar para TanStack Query + assinatura Realtime de match_suggestions.
export function useMatchFeed() {
  const [suggestions, setSuggestions] = useState<MatchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setSuggestions(await repositories.match.listSuggestions());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const dismiss = useCallback((suggestionId: string) => {
    // Otimista: some da UI antes de persistir.
    setSuggestions((prev) => prev.filter((s) => s.id !== suggestionId));
    repositories.match.dismiss(suggestionId);
  }, []);

  return { suggestions, isLoading, refresh, dismiss };
}
