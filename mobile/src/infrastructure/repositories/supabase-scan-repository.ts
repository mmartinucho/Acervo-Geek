import { SupabaseClient } from '@supabase/supabase-js';

import { RecognizedItem, ScanRepository } from '@/application/ports/scan-repository';

interface PresignResponse {
  uploadUrl: string;
  key: string;
  contentType: string;
}

export class SupabaseScanRepository implements ScanRepository {
  constructor(private readonly client: SupabaseClient) {}

  async uploadItemPhoto(fileUri: string, ext: string): Promise<{ key: string }> {
    // 1. Pede a presigned URL à Edge Function (envia o JWT da sessão).
    const { data, error } = await this.client.functions.invoke('get-upload-url', {
      body: { ext },
    });
    if (error) throw error;
    const { uploadUrl, key, contentType } = data as PresignResponse;

    // 2. Lê o arquivo local e faz PUT direto no S3 (o app não toca nas chaves).
    const blob = await (await fetch(fileUri)).blob();
    const put = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      body: blob,
    });
    if (!put.ok) throw new Error(`Falha no upload da foto (HTTP ${put.status})`);

    return { key };
  }

  async recognizeItem(key: string): Promise<RecognizedItem | null> {
    const { data, error } = await this.client.functions.invoke('scan-item', {
      body: { key },
    });
    if (error) throw error;
    const extracted = (data as { extracted?: RecognizedItem })?.extracted;
    return extracted ?? null;
  }
}
