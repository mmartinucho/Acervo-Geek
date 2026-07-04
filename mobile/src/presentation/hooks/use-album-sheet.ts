import { useCallback, useEffect, useMemo, useState } from 'react';

import { AlbumSheet, NEXT_STATE, SlotState } from '@/domain/entities/collection-sheet';
import { repositories } from '@/infrastructure/container';

export function useAlbumSheet() {
  const [sheet, setSheet] = useState<AlbumSheet | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    repositories.collection.getActiveAlbumSheet().then((s) => {
      if (active) {
        setSheet(s);
        setIsLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const cycleSlot = useCallback((itemId: string) => {
    setSheet((prev) => {
      if (!prev) return prev;
      let next: SlotState = 'have';
      const slots = prev.slots.map((slot) => {
        if (slot.itemId !== itemId) return slot;
        next = NEXT_STATE[slot.state];
        return { ...slot, state: next };
      });
      // Otimista: UI muda na hora, persiste em seguida.
      repositories.collection.setSlotState(itemId, next);
      return { ...prev, slots };
    });
  }, []);

  const counts = useMemo(() => {
    const c = { missing: 0, have: 0, duplicate: 0 };
    sheet?.slots.forEach((s) => (c[s.state] += 1));
    return c;
  }, [sheet]);

  return { sheet, isLoading, cycleSlot, counts };
}
