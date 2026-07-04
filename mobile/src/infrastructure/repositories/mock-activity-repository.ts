import { ActivityRepository } from '@/application/ports/activity-repository';
import { ActivityEntry, TradeSummary } from '@/domain/entities/trade';

const HOUR_MS = 60 * 60 * 1000;

const TRADES: TradeSummary[] = [
  {
    id: 't-1',
    counterpartyUsername: 'cardshark_rj',
    status: 'shipping',
    itemsSummary: 'Mewtwo GX ⇄ Umbreon VMAX',
    updatedAt: new Date(Date.now() - 5 * HOUR_MS),
  },
  {
    id: 't-2',
    counterpartyUsername: 'ana.figures',
    status: 'completed',
    itemsSummary: 'Goku SSJ ⇄ Nendoroid Link',
    updatedAt: new Date(Date.now() - 48 * HOUR_MS),
  },
  {
    id: 't-3',
    counterpartyUsername: 'luffy_colecoes',
    status: 'proposed',
    itemsSummary: 'Charizard ex ⇄ Luffy Gear 5',
    updatedAt: new Date(Date.now() - 1 * HOUR_MS),
  },
];

const ACTIVITY: ActivityEntry[] = [
  { kind: 'trade', trade: TRADES[2] },
  { kind: 'trade', trade: TRADES[0] },
  {
    kind: 'review',
    review: {
      id: 'r-1',
      reviewerUsername: 'ana.figures',
      rating: 5,
      comment: 'Troca tranquila, item impecável!',
      createdAt: new Date(Date.now() - 40 * HOUR_MS),
    },
  },
];

export class MockActivityRepository implements ActivityRepository {
  async listRecentActivity(): Promise<ActivityEntry[]> {
    return ACTIVITY;
  }

  async listTrades(): Promise<TradeSummary[]> {
    return TRADES;
  }
}
