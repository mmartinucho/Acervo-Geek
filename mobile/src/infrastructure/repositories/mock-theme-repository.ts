import { ThemeRepository } from '@/application/ports/theme-repository';
import { CollectibleTheme } from '@/domain/entities/theme';

// Espelha os universos semeados em supabase/seed.sql.
const THEMES: CollectibleTheme[] = [
  { id: 'copa', slug: 'copa', name: 'Copa do Mundo', kind: 'stickers', accent: '#12813F', emoji: '⚽' },
  { id: 'pokemon', slug: 'pokemon', name: 'Pokémon TCG', kind: 'tcg', accent: '#F5C542', emoji: '⚡' },
  { id: 'yugioh', slug: 'yugioh', name: 'Yu-Gi-Oh!', kind: 'tcg', accent: '#7C3AED', emoji: '🃏' },
];

export class MockThemeRepository implements ThemeRepository {
  private activeId = 'copa';

  async listThemes(): Promise<CollectibleTheme[]> {
    return THEMES;
  }

  async getActiveTheme(): Promise<CollectibleTheme | null> {
    return THEMES.find((t) => t.id === this.activeId) ?? null;
  }

  async setActiveTheme(themeId: string): Promise<void> {
    if (THEMES.some((t) => t.id === themeId)) this.activeId = themeId;
  }
}
