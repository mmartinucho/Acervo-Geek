// Espelha a view user_collection_progress (migration 0003).
export interface CollectionProgress {
  collectionName: string;
  ownedSlots: number;
  totalSlots: number;
  completionPct: number;
  spareStickers: number; // repetidas disponíveis para troca
}
