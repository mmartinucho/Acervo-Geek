export type ThemeKind = 'stickers' | 'tcg' | 'figures';

// Um universo colecionável (Copa do Mundo, Pokémon, Yu-Gi-Oh...).
export interface CollectibleTheme {
  id: string;
  slug: string;
  name: string;
  kind: ThemeKind;
  accent?: string; // cor de acento do universo (hex)
  emoji?: string; // ícone provisório até a arte final
}
