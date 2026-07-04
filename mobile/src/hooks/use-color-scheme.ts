import { useThemeMode } from '@/presentation/theme/theme-mode-context';

// O modo de cor efetivo vem do ThemeModeProvider (segue o sistema, mas o toggle
// Sol/Lua do Perfil pode sobrescrever). Ver presentation/theme/theme-mode-context.
export function useColorScheme(): 'light' | 'dark' {
  return useThemeMode().scheme;
}
