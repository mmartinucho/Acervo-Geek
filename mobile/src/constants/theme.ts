/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

// Paleta minimalista: neutros refinados + um único acento (violeta índigo).
// O acento aparece só em ação primária/seleção; o resto é escala de cinza.
export const Colors = {
  light: {
    text: '#0B0B0F',
    background: '#FBFBFC',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#F0F0F3',
    textSecondary: '#71717A',
    border: '#EBEBEF',
    tint: '#5B3DF5',
    onTint: '#FFFFFF',
  },
  dark: {
    text: '#F4F4F5',
    background: '#09090B',
    backgroundElement: '#161619',
    backgroundSelected: '#242428',
    textSecondary: '#9494A0',
    border: '#242428',
    tint: '#9B87FF',
    onTint: '#09090B',
  },
} as const;

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

export const PitchGreen = '#12813F';

export const BrandGradient = ['#7B5CFF', '#5B3DF5'] as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

// Famílias carregadas em _layout.tsx (expo-google-fonts).
// Space Grotesk = display/títulos (personalidade); Inter = texto/UI (neutra).
export const Fonts = {
  display: 'SpaceGrotesk_700Bold',
  displaySemi: 'SpaceGrotesk_600SemiBold',
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
