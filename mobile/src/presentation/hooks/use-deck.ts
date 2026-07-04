import { useCallback, useEffect, useMemo, useState } from 'react';

import { CollectionProgress } from '@/domain/entities/collection-progress';
import { DeckListing, ListingMode, SwipeDirection } from '@/domain/entities/listing';
import { repositories } from '@/infrastructure/container';

export type DeckFilter = 'all' | ListingMode;

// Passos do radar (km); null = "todo o Brasil" (sem filtro de distância).
export const RADIUS_STEPS: (number | null)[] = [25, 100, 500, null];

const MATCH_THRESHOLD = 0.85;

export function useDeck() {
  const [all, setAll] = useState<DeckListing[]>([]);
  const [progress, setProgress] = useState<CollectionProgress | null>(null);
  const [swipedIds, setSwipedIds] = useState<ReadonlySet<string>>(new Set());
  const [filter, setFilter] = useState<DeckFilter>('all');
  const [radiusKm, setRadiusKm] = useState<number | null>(100);
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
        .filter((l) => filter === 'all' || l.modes.includes(filter))
        // Radar: fora do raio não aparece. Sem distância conhecida, mantém.
        .filter(
          (l) => radiusKm == null || l.owner.distanceKm == null || l.owner.distanceKm <= radiusKm,
        ),
    [all, swipedIds, filter, radiusKm],
  );

  // Quantos matches ficaram de fora só por causa da distância (para o CTA).
  const outOfRange = useMemo(
    () =>
      radiusKm == null
        ? 0
        : all.filter(
            (l) =>
              !swipedIds.has(l.id) &&
              (filter === 'all' || l.modes.includes(filter)) &&
              l.owner.distanceKm != null &&
              l.owner.distanceKm > radiusKm,
          ).length,
    [all, swipedIds, filter, radiusKm],
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

  return {
    cards,
    progress,
    filter,
    setFilter,
    radiusKm,
    setRadiusKm,
    outOfRange,
    swipe,
    celebration,
    dismissCelebration,
    refresh,
  };
}
