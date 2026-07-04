import { AlbumSheet, SlotState } from '@/domain/entities/collection-sheet';

export interface CollectionRepository {
  getActiveAlbumSheet(): Promise<AlbumSheet>;
  setSlotState(itemId: string, state: SlotState): Promise<void>;
  // Onboarding pendente quando o usuário ainda não tem inventário/wishlist.
  hasCollectionData(): Promise<boolean>;
}
