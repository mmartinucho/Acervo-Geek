import { RecognizedItem, ScanRepository } from '@/application/ports/scan-repository';

// Sem backend, finge o upload e o reconhecimento para a UI do scan funcionar.
export class MockScanRepository implements ScanRepository {
  async uploadItemPhoto(_fileUri: string, ext: string): Promise<{ key: string }> {
    await new Promise((resolve) => setTimeout(resolve, 900));
    return { key: `mock/uploads/${Date.now()}.${ext}` };
  }

  async recognizeItem(_key: string): Promise<RecognizedItem | null> {
    await new Promise((resolve) => setTimeout(resolve, 700));
    return {
      name: 'Blue-Eyes White Dragon',
      franchise: 'Yu-Gi-Oh!',
      category: 'card',
      cardNumber: 'LOB-001',
      rarity: 'Ultra Rare',
      confidence: 0.94,
    };
  }
}
