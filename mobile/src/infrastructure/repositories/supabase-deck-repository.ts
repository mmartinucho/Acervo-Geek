import { SupabaseClient } from '@supabase/supabase-js';

import { DeckRepository } from '@/application/ports/deck-repository';
import { CollectionProgress } from '@/domain/entities/collection-progress';
import { DeckListing, ListingMode, SwipeDirection } from '@/domain/entities/listing';

// "Brasil inteiro" (raio ilimitado) → a RPC usa o raio do perfil quando recebe
// null, então mandamos um valor grande para não limitar por distância.
const UNLIMITED_KM = 100_000;

interface DeckRow {
  listing_id: string;
  item_name: string;
  franchise: string;
  sticker_number: string | null;
  country: string | null;
  is_special: boolean;
  condition: DeckListing['item']['condition'];
  owner_username: string;
  owner_reputation: number;
  owner_reviews: number;
  owner_city: string | null;
  distance_km: number | null;
  for_trade: boolean;
  for_sale: boolean;
  price: number | null;
  match_reason: string | null;
}

interface ProgressRow {
  name: string;
  owned_slots: number;
  total_slots: number;
  completion_pct: number;
  spare_stickers: number;
}

function toListing(row: DeckRow): DeckListing {
  const modes: ListingMode[] = [];
  if (row.for_trade) modes.push('trade');
  if (row.for_sale) modes.push('sale');

  return {
    id: row.listing_id,
    item: {
      name: row.item_name,
      franchise: row.franchise,
      category: 'sticker',
      condition: row.condition,
      stickerNumber: row.sticker_number ?? undefined,
      country: row.country ?? undefined,
      isSpecial: row.is_special,
    },
    owner: {
      username: row.owner_username,
      reputation: Number(row.owner_reputation),
      reviewsCount: row.owner_reviews,
      city: row.owner_city ?? undefined,
      distanceKm: row.distance_km ?? undefined,
    },
    modes,
    priceBRL: row.price ?? undefined,
    // Match recíproco confirmado pela RPC → dispara a celebração no swipe.
    matchScore: 1,
    matchReason: row.match_reason ?? undefined,
  };
}

export class SupabaseDeckRepository implements DeckRepository {
  constructor(private readonly client: SupabaseClient) {}

  private async currentUserId(): Promise<string | null> {
    const { data } = await this.client.auth.getUser();
    return data.user?.id ?? null;
  }

  async listDeck(): Promise<DeckListing[]> {
    const userId = await this.currentUserId();
    if (!userId) return [];
    // Busca amplo; o radar (filtro por distância) é aplicado no hook, como no mock.
    const { data, error } = await this.client.rpc('deck_for_user', {
      p_user: userId,
      p_radius_km: UNLIMITED_KM,
    });
    if (error) throw error;
    return (data as DeckRow[]).map(toListing);
  }

  async getProgress(): Promise<CollectionProgress> {
    const userId = await this.currentUserId();
    const empty: CollectionProgress = {
      collectionName: '',
      ownedSlots: 0,
      totalSlots: 0,
      completionPct: 0,
      spareStickers: 0,
    };
    if (!userId) return empty;

    const { data, error } = await this.client
      .from('user_collection_progress')
      .select('name, owned_slots, total_slots, completion_pct, spare_stickers')
      .eq('user_id', userId)
      .order('completion_pct', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (!data) return empty;

    const row = data as ProgressRow;
    return {
      collectionName: row.name,
      ownedSlots: row.owned_slots,
      totalSlots: row.total_slots,
      completionPct: Number(row.completion_pct),
      spareStickers: row.spare_stickers,
    };
  }

  async swipe(listingId: string, direction: SwipeDirection): Promise<void> {
    const userId = await this.currentUserId();
    if (!userId) return;
    // listingId é o user_inventory.id do exemplar do outro (vindo da RPC).
    // Re-swipe substitui o anterior (unique user_id+inventory_id).
    const { error } = await this.client
      .from('swipes')
      .upsert(
        { user_id: userId, inventory_id: listingId, direction },
        { onConflict: 'user_id,inventory_id' },
      );
    if (error) throw error;
  }
}
