import { useCallback, useEffect, useMemo, useState } from 'react';

import { CollectionProgress } from '@/domain/entities/collection-progress';
import { DeckListing, ListingMode, SwipeDirection } from '@/domain/entities/listing';
import { repositories } from '@/infrastructure/container';

export type DeckFilter = 'all' | ListingMode;

const MATCH_THRESHOLD = 0.85;

export function useDeck() {
  const [all, setAll] = useState<DeckListing[]>([]);
  const [progress, setProgress] = useState<CollectionProgress | null>(null);
  const [swipedIds, setSwipedIds] = useState<ReadonlySet<string>>(new Set());
  const [filter, setFilter] = useState<DeckFilter>('all');
  const [celebration, setCelebration] = useState<DeckListing | null>(null);

  const refresh = useCallback(async () => {
    const [deck, prog] = await Promise.all([
      repositories.deck.listDeck(),
      repositories.deck.getProgress(),
    ]);
    setAll(deck);
    setProgress(prog);
    setSwipedIds(new Set());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const cards = useMemo(
    () =>
      all
        .filter((l) => !swipedIds.has(l.id))
        .filter((l) => filter === 'all' || l.modes.includes(filter)),
    [all, swipedIds, filter],
  );

  const swipe = useCallback(
    (direction: SwipeDirection) => {
      const top = cards[0];
      if (!top) return;
      setSwipedIds((prev) => new Set(prev).add(top.id));
      repositories.deck.swipe(top.id, direction);
      if (
        direction === 'want' &&
        top.modes.includes('trade') &&
        (top.matchScore ?? 0) >= MATCH_THRESHOLD
      ) {
        setCelebration(top);
      }
    },
    [cards],
  );

  const dismissCelebration = useCallback(() => setCelebration(null), []);

  return { cards, progress, filter, setFilter, swipe, celebration, dismissCelebration, refresh };
}
