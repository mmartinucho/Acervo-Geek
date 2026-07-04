import { useCallback, useState } from 'react';

import { RecognizedItem } from '@/application/ports/scan-repository';
import { repositories } from '@/infrastructure/container';

// idle → capturando/enviando → reconhecendo → pronto (item identificado) → erro.
export type ScanState = 'idle' | 'uploading' | 'recognizing' | 'done' | 'error';

// Fluxo do scanner: captura → upload (presigned S3) → reconhecimento por IA.
export function useScan() {
  const [state, setState] = useState<ScanState>('idle');
  const [recognized, setRecognized] = useState<RecognizedItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const scan = useCallback(async (fileUri: string, ext = 'jpg') => {
    setError(null);
    setState('uploading');
    try {
      const { key } = await repositories.scan.uploadItemPhoto(fileUri, ext);
      setState('recognizing');
      const item = await repositories.scan.recognizeItem(key);
      setRecognized(item);
      setState('done');
      return item;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao escanear o item.');
      setState('error');
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState('idle');
    setRecognized(null);
    setError(null);
  }, []);

  return { state, recognized, error, scan, reset };
}
