/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#0B0B12',
    background: '#F7F7FA',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#EEEEF3',
    textSecondary: '#71717F',
    border: '#EAEAF0',
    tint: '#6D4AFF',
    onTint: '#FFFFFF',
  },
  dark: {
    text: '#F5F5F7',
    background: '#0A0A0F',
    backgroundElement: '#17171F',
    backgroundSelected: '#22222C',
    textSecondary: '#9A9AA8',
    border: '#24242E',
    tint: '#8B6DFF',
    onTint: '#0A0A0F',
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

export const BrandGradient = ['#8B6DFF', '#6D4AFF'] as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

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
