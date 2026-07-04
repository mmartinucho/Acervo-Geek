import { CollectibleTheme } from '@/domain/entities/theme';

// Universos disponíveis e o universo ativo do usuário. O deck, a coleção e o
// match são escopados pelo universo ativo (resolve_theme no banco).
export interface ThemeRepository {
  listThemes(): Promise<CollectibleTheme[]>;
  getActiveTheme(): Promise<CollectibleTheme | null>;
  setActiveTheme(themeId: string): Promise<void>;
}
