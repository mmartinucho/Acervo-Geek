import { SupabaseClient } from '@supabase/supabase-js';

import { ThemeRepository } from '@/application/ports/theme-repository';
import { CollectibleTheme, ThemeKind } from '@/domain/entities/theme';

interface ThemeRow {
  id: string;
  slug: string;
  name: string;
  kind: string;
  accent: string | null;
  emoji: string | null;
}

function toTheme(row: ThemeRow): CollectibleTheme {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    kind: row.kind as ThemeKind,
    accent: row.accent ?? undefined,
    emoji: row.emoji ?? undefined,
  };
}

export class SupabaseThemeRepository implements ThemeRepository {
  constructor(private readonly client: SupabaseClient) {}

  private async userId(): Promise<string | null> {
    const { data } = await this.client.auth.getUser();
    return data.user?.id ?? null;
  }

  async listThemes(): Promise<CollectibleTheme[]> {
    const { data, error } = await this.client.rpc('list_themes');
    if (error) throw error;
    return (data as ThemeRow[]).map(toTheme);
  }

  async getActiveTheme(): Promise<CollectibleTheme | null> {
    const userId = await this.userId();
    if (!userId) return null;
    const { data, error } = await this.client
      .from('profiles')
      .select('active_theme_id, themes:active_theme_id (id, slug, name, kind, accent, emoji)')
      .eq('id', userId)
      .maybeSingle();
    if (error) throw error;
    const theme = (data as { themes: ThemeRow | null } | null)?.themes;
    return theme ? toTheme(theme) : null;
  }

  async setActiveTheme(themeId: string): Promise<void> {
    const userId = await this.userId();
    if (!userId) return;
    const { error } = await this.client.rpc('set_active_theme', {
      p_user: userId,
      p_theme: themeId,
    });
    if (error) throw error;
  }
}
