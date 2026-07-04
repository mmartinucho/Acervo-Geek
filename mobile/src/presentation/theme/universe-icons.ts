import {
  Anchor,
  Aperture,
  Eye,
  Hexagon,
  LucideIcon,
  Package,
  Sparkles,
  Trophy,
} from 'lucide-react-native';

// Ícone lucide de cada universo (slug → glifo), como no protótipo do Figma.
const ICONS: Record<string, LucideIcon> = {
  copa: Trophy,
  pokemon: Aperture,
  yugioh: Eye,
  onepiece: Anchor,
  funko: Package,
  magic: Hexagon,
};

export function universeIcon(slug?: string): LucideIcon {
  return (slug && ICONS[slug]) || Sparkles;
}

// Descrição curta de cada universo (subtítulo do card de seleção), do protótipo.
const DESCRIPTIONS: Record<string, string> = {
  copa: 'Figurinhas, Álbuns, Cromos Extras',
  pokemon: 'Cartas, Boosters, Elite Trainer Boxes',
  yugioh: 'TCG, Speed Duel, Rush Duel',
  onepiece: 'Card Game, Action Figures',
  funko: 'Exclusivos, Chases, Vaulted',
  magic: 'Commander, Standard, Modern',
};

export function universeDesc(slug?: string): string {
  return (slug && DESCRIPTIONS[slug]) || 'Coleção';
}
