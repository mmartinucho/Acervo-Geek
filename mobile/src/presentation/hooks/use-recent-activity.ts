import { useEffect, useState } from 'react';

import { ActivityEntry, TradeSummary } from '@/domain/entities/trade';
import { repositories } from '@/infrastructure/container';

export function useRecentActivity() {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);

  useEffect(() => {
    repositories.activity.listRecentActivity().then(setEntries);
  }, []);

  return { entries };
}

export function useTrades() {
  const [trades, setTrades] = useState<TradeSummary[]>([]);

  useEffect(() => {
    repositories.activity.listTrades().then(setTrades);
  }, []);

  return { trades };
}
