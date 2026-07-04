import { ActivityEntry, TradeSummary } from '@/domain/entities/trade';

export interface ActivityRepository {
  listRecentActivity(): Promise<ActivityEntry[]>;
  listTrades(): Promise<TradeSummary[]>;
}
