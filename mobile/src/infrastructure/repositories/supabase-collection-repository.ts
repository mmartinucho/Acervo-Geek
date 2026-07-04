import { SupabaseClient } from '@supabase/supabase-js';

import { CollectionRepository } from '@/application/ports/collection-repository';
import { AlbumSheet, SlotState } from '@/domain/entities/collection-sheet';

interface SheetRow {
  item_id: string;
  sticker_number: string;
  name: string;
  country: string | null;
  is_special: boolean;
  state: SlotState;
}

export class SupabaseCollectionRepository implements CollectionRepository {
  constructor(private readonly client: SupabaseClient) {}

  private async userId(): Promise<string | null> {
    const { data } = await this.client.auth.getUser();
    return data.user?.id ?? null;
  }

  async getActiveAlbumSheet(): Promise<AlbumSheet> {
    const userId = await this.userId();
    if (!userId) return { collectionName: '', slots: [] };

    const { data, error } = await this.client.rpc('album_sheet', { p_user: userId });
    if (error) throw error;
    const rows = (data as SheetRow[]) ?? [];
    return {
      collectionName: 'Copa 2026',
      slots: rows.map((r) => ({
        itemId: r.item_id,
        stickerNumber: r.sticker_number,
        name: r.name,
        country: r.country ?? undefined,
        isSpecial: r.is_special,
        state: r.state,
      })),
    };
  }

  async setSlotState(itemId: string, state: SlotState): Promise<void> {
    const userId = await this.userId();
    if (!userId) return;
    const { error } = await this.client.rpc('set_slot_state', {
      p_user: userId,
      p_item: itemId,
      p_state: state,
    });
    if (error) throw error;
  }

  async hasCollectionData(): Promise<boolean> {
    const userId = await this.userId();
    if (!userId) return true; // sem sessão não força onboarding
    const { data, error } = await this.client.rpc('has_collection_data', { p_user: userId });
    if (error) throw error;
    return Boolean(data);
  }
}
