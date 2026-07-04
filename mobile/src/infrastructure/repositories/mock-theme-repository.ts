import { ThemeRepository } from '@/application/ports/theme-repository';
import { CollectibleTheme } from '@/domain/entities/theme';

// Espelha os universos semeados em supabase/seed.sql.
// Acentos canônicos em UniverseAccents (constants/theme.ts) — manter em sincronia.
const THEMES: CollectibleTheme[] = [
  { id: 'copa', slug: 'copa', name: 'Copa do Mundo', kind: 'stickers', accent: '#10B981', emoji: '⚽' },
  { id: 'pokemon', slug: 'pokemon', name: 'Pokémon TCG', kind: 'tcg', accent: '#EF4444', emoji: '⚡' },
  { id: 'yugioh', slug: 'yugioh', name: 'Yu-Gi-Oh!', kind: 'tcg', accent: '#D97706', emoji: '🃏' },
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
