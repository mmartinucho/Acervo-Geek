import { CollectionProgress } from '@/domain/entities/collection-progress';
import { DeckListing, SwipeDirection } from '@/domain/entities/listing';

// Porta do deck de descoberta. A implementação Supabase lê anúncios
// ordenados pelo score do matchmaking e grava cada swipe na tabela
// swipes (sinal de treino para o modelo no Databricks).
export interface DeckRepository {
  listDeck(): Promise<DeckListing[]>;
  getProgress(): Promise<CollectionProgress>;
  swipe(listingId: string, direction: SwipeDirection): Promise<void>;
}
