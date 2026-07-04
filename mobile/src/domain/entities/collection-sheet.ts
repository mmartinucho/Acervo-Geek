export type SlotState = 'missing' | 'have' | 'duplicate';

export interface AlbumSlot {
  itemId: string;
  stickerNumber: string;
  name: string;
  country?: string;
  isSpecial: boolean;
  state: SlotState;
}

export interface AlbumSheet {
  collectionName: string;
  slots: AlbumSlot[];
}

// Ciclo ao tocar: preciso → tenho → repetida → preciso.
export const NEXT_STATE: Record<SlotState, SlotState> = {
  missing: 'have',
  have: 'duplicate',
  duplicate: 'missing',
};

export const SLOT_STATE_LABELS: Record<SlotState, string> = {
  missing: 'Preciso',
  have: 'Tenho',
  duplicate: 'Repetida',
};
