import { DealRepository } from '@/application/ports/deal-repository';
import { DealSummary } from '@/domain/entities/trade';

const HOUR_MS = 60 * 60 * 1000;

const DEALS: DealSummary[] = [
  {
    id: 'd-1',
    counterpartyUsername: 'luffy_colecoes',
    mode: 'trade',
    status: 'proposed',
    itemsSummary: 'Charizard ex ⇄ Luffy Gear 5',
    updatedAt: new Date(Date.now() - 1 * HOUR_MS),
  },
  {
    id: 'd-2',
    counterpartyUsername: 'ana.figures',
    mode: 'purchase',
    status: 'shipping',
    itemsSummary: 'Nendoroid Link — BotW',
    priceBRL: 420,
    updatedAt: new Date(Date.now() - 5 * HOUR_MS),
  },
  {
    id: 'd-3',
    counterpartyUsername: 'hq.vault',
    mode: 'sale',
    status: 'completed',
    itemsSummary: 'Mewtwo GX SM196',
    priceBRL: 260,
    updatedAt: new Date(Date.now() - 30 * HOUR_MS),
  },
  {
    id: 'd-4',
    counterpartyUsername: 'cardshark_rj',
    mode: 'trade',
    status: 'completed',
    itemsSummary: 'Goku SSJ ⇄ Umbreon VMAX',
    updatedAt: new Date(Date.now() - 72 * HOUR_MS),
  },
];

export class MockDealRepository implements DealRepository {
  async listDeals(): Promise<DealSummary[]> {
    return DEALS;
  }
}
