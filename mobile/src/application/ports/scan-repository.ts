// Upload da foto do item para o storage (S3 via presigned URL). O app nunca vê
// as chaves da AWS — a URL assinada vem de uma Edge Function.
export interface ScanRepository {
  // Sobe a foto local (fileUri) e devolve a chave do objeto no bucket.
  uploadItemPhoto(fileUri: string, ext: string): Promise<{ key: string }>;
}
