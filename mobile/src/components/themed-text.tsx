import { StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// Escala tipográfica única do app. display/title = Space Grotesk (personalidade);
// o resto = Inter (neutra). Peso vem embutido na família (RN não sintetiza).
export type TextVariant =
  | 'display' // hero/telas
  | 'title' // títulos de card/seção grande
  | 'subtitle' // seção
  | 'body' // texto padrão
  | 'bodyMedium'
  | 'label' // botões/chips
  | 'small'
  | 'smallBold'
  | 'caption'
  | 'link'
  | 'linkPrimary'
  | 'code';

export type ThemedTextProps = TextProps & {
  // 'type' mantido por compatibilidade; 'default' = body.
  type?: TextVariant | 'default';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'body', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();
  const variant = type === 'default' ? 'body' : type;

  return (
    <Text
      style={[{ color: theme[themeColor ?? 'text'] }, styles[variant], style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  display: {
    fontFamily: Fonts.display,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.6,
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontFamily: Fonts.displaySemi,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  body: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    lineHeight: 24,
  },
  label: {
    fontFamily: Fonts.semibold,
    fontSize: 15,
    lineHeight: 20,
  },
  small: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    lineHeight: 20,
  },
  smallBold: {
    fontFamily: Fonts.semibold,
    fontSize: 14,
    lineHeight: 20,
  },
  caption: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    lineHeight: 16,
  },
  link: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    lineHeight: 20,
  },
  linkPrimary: {
    fontFamily: Fonts.semibold,
    fontSize: 14,
    lineHeight: 20,
    color: '#5B3DF5',
  },
  code: {
    fontFamily: Fonts.mono,
    fontSize: 13,
    lineHeight: 18,
  },
});
