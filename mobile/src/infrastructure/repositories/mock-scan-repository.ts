import { ScanRepository } from '@/application/ports/scan-repository';

// Sem backend, finge o upload (delay + chave fake) para a UI do scan funcionar.
export class MockScanRepository implements ScanRepository {
  async uploadItemPhoto(_fileUri: string, ext: string): Promise<{ key: string }> {
    await new Promise((resolve) => setTimeout(resolve, 900));
    return { key: `mock/uploads/${Date.now()}.${ext}` };
  }
}
