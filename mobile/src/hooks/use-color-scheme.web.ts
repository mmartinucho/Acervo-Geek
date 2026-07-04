import { useThemeMode } from '@/presentation/theme/theme-mode-context';

// Web e nativo leem o mesmo override; a guarda de hidratação vive no provider.
export function useColorScheme(): 'light' | 'dark' {
  return useThemeMode().scheme;
}
