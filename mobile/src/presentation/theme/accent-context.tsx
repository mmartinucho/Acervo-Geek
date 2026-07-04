import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { DefaultAccent, UniverseAccents } from '@/constants/theme';
import { CollectibleTheme } from '@/domain/entities/theme';
import { repositories } from '@/infrastructure/container';

// A cor viva do app vem do universo ativo (Copa = verde, Pokémon = vermelho...).
// Ação primária, barra de progresso, match hint e o FAB de scan consomem
// useAccent() em vez de uma cor fixa — trocar de universo re-pinta o app.

interface AccentContextValue {
  /** Cor de acento do universo ativo (hex). */
  accent: string;
  /** Acento translúcido (~15%) para glows, fundos e sombras coloridas. */
  accentSoft: string;
  /** Universo ativo, ou null enquanto carrega / antes do onboarding. */
  activeTheme: CollectibleTheme | null;
  /** Universos disponíveis (para a futura tela de seleção). */
  themes: CollectibleTheme[];
  /** Troca o universo ativo e re-pinta o acento. */
  setActiveTheme: (themeId: string) => Promise<void>;
}

function resolveAccent(theme: CollectibleTheme | null): string {
  return theme?.accent ?? (theme && UniverseAccents[theme.slug]) ?? DefaultAccent;
}

// Sufixo alfa em hex de 8 dígitos (#RRGGBBAA); '26' ≈ 15%.
function soften(accent: string): string {
  return accent.length === 7 ? `${accent}26` : accent;
}

const AccentContext = createContext<AccentContextValue>({
  accent: DefaultAccent,
  accentSoft: soften(DefaultAccent),
  activeTheme: null,
  themes: [],
  setActiveTheme: async () => {},
});

export function AccentProvider({ children }: { children: ReactNode }) {
  const [activeTheme, setActive] = useState<CollectibleTheme | null>(null);
  const [themes, setThemes] = useState<CollectibleTheme[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Sem backend/login o repositório pode falhar ou devolver null;
      // o app segue com o acento padrão — nunca bloqueia o render.
      try {
        const [list, active] = await Promise.all([
          repositories.themes.listThemes(),
          repositories.themes.getActiveTheme(),
        ]);
        if (cancelled) return;
        setThemes(list);
        setActive(active);
      } catch {
        // mantém os defaults
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setActiveTheme = useCallback(
    async (themeId: string) => {
      await repositories.themes.setActiveTheme(themeId);
      const next =
        themes.find((t) => t.id === themeId) ?? (await repositories.themes.getActiveTheme());
      setActive(next);
    },
    [themes],
  );

  const value = useMemo<AccentContextValue>(() => {
    const accent = resolveAccent(activeTheme);
    return { accent, accentSoft: soften(accent), activeTheme, themes, setActiveTheme };
  }, [activeTheme, themes, setActiveTheme]);

  return <AccentContext.Provider value={value}>{children}</AccentContext.Provider>;
}

// Seguro fora do provider: devolve o acento padrão (útil em testes/storybook).
export function useAccent(): AccentContextValue {
  return useContext(AccentContext);
}
