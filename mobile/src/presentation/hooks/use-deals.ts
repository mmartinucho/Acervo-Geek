import { useEffect, useState } from 'react';

import { DealSummary } from '@/domain/entities/trade';
import { repositories } from '@/infrastructure/container';

export function useDeals() {
  const [deals, setDeals] = useState<DealSummary[]>([]);

  useEffect(() => {
    repositories.deals.listDeals().then(setDeals);
  }, []);

  return { deals };
}
