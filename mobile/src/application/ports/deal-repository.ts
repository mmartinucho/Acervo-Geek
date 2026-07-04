import { DealSummary } from '@/domain/entities/trade';

export interface DealRepository {
  listDeals(): Promise<DealSummary[]>;
}
