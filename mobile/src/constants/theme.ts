/**
 * Tokens visuais do app — espelham o protótipo do Figma Make
 * (design/figma-make/src/app/App.tsx), que é a fonte da verdade visual.
 */

import '@/global.css';

import { Platform } from 'react-native';

// Paleta dark-first: neutros quase-pretos + "vidro" (branco translúcido).
// A cor viva vem do universo ativo (useAccent), nunca de um tint fixo.
export const Colors = {
  light: {
    text: '#171717',
    background: '#FAFAFA',
    backgroundDeep: '#F5F5F5',
    backgroundElement: '#FFFFFF',
    backgroundSelected: 'rgba(0,0,0,0.08)',
    glass: 'rgba(0,0,0,0.05)',
    glassBorder: 'rgba(0,0,0,0.10)',
    textSecondary: '#737373',
    border: 'rgba(0,0,0,0.08)',
    tint: '#171717',
    onTint: '#FFFFFF',
  },
  dark: {
    text: '#FFFFFF',
    background: '#0a0a0a',
    backgroundDeep: '#050505',
    backgroundElement: '#111111',
    backgroundSelected: 'rgba(255,255,255,0.10)',
    glass: 'rgba(255,255,255,0.05)',
    glassBorder: 'rgba(255,255,255,0.10)',
    textSecondary: '#737373',
    border: 'rgba(255,255,255,0.10)',
    tint: '#FFFFFF',
    onTint: '#0a0a0a',
  },
} as const;

// Acento canônico por universo (slug → hex). Fonte de verdade compartilhada
// com supabase/seed.sql e o MockThemeRepository — mantenha os três em sincronia.
export const UniverseAccents: Record<string, string> = {
  copa: '#10B981',
  pokemon: '#EF4444',
  yugioh: '#D97706',
  onepiece: '#3B82F6',
  funko: '#8B5CF6',
  magic: '#14B8A6',
};

// Fallback quando ainda não há universo ativo (ex.: antes do onboarding).
export const DefaultAccent = UniverseAccents.copa;

// Gradientes de marca por categoria — dão personalidade ao card sem foto real.
export const CategoryGradients = {
  card: ['#7C5CFF', '#4B2FD6'],
  figure: ['#FF8A4C', '#E0463B'],
  comic: ['#3B82F6', '#1D4ED8'],
  game: ['#22C55E', '#0E9F6E'],
  sticker: ['#16A34A', '#065F46'],
} as const;

// Figurinha especial (legend/holográfica) ganha um gradiente dourado.
export const SpecialStickerGradient = ['#F5C542', '#D97706'] as const;

export const BrandGradient = ['#7B5CFF', '#5B3DF5'] as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

// Famílias carregadas em _layout.tsx (expo-google-fonts). Sans neutra única
// (Inter); títulos usam a Medium com tracking negativo, como no protótipo.
// Peso vem da FAMÍLIA (RN não sintetiza fontWeight).
export const Fonts = {
  display: 'Inter_500Medium',
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  mono: Platform.select({ ios: 'ui-monospace', default: 'monospace' }),
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
