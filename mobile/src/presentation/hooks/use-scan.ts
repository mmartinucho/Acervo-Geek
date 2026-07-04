import { useCallback, useState } from 'react';

import { repositories } from '@/infrastructure/container';

export type ScanState = 'idle' | 'uploading' | 'done' | 'error';

// Estado do fluxo de registro: captura → upload (presigned S3) → concluído.
export function useScan() {
  const [state, setState] = useState<ScanState>('idle');
  const [key, setKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (fileUri: string, ext = 'jpg') => {
    setState('uploading');
    setError(null);
    try {
      const res = await repositories.scan.uploadItemPhoto(fileUri, ext);
      setKey(res.key);
      setState('done');
      return res;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao registrar o item.');
      setState('error');
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState('idle');
    setKey(null);
    setError(null);
  }, []);

  return { state, key, error, upload, reset };
}
