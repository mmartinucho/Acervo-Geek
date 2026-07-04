// Upload da foto do item para o storage (S3 via presigned URL) e reconhecimento
// por IA (visão). O app nunca vê as chaves da AWS/Anthropic — tudo via Edge Function.
export interface RecognizedItem {
  name: string;
  franchise: string;
  category: string;
  cardNumber?: string;
  set?: string;
  rarity?: string;
  confidence: number;
}

export interface ScanRepository {
  // Sobe a foto local (fileUri) e devolve a chave do objeto no bucket.
  uploadItemPhoto(fileUri: string, ext: string): Promise<{ key: string }>;
  // Reconhece o item na foto já enviada (chave do S3). null se não identificar.
  recognizeItem(key: string): Promise<RecognizedItem | null>;
}
