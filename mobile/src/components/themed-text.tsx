import { StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAccent } from '@/presentation/theme/accent-context';

// Escala tipográfica única do app, espelhando o protótipo do Figma:
// títulos em sans neutra Medium com tracking bem negativo (≈ -0.05em),
// rótulos pequenos em caixa alta com tracking largo (overline).
// Peso vem embutido na FAMÍLIA (RN não sintetiza fontWeight).
export type TextVariant =
  | 'display' // hero/telas ("Acervo.", "Seus mundos.")
  | 'title' // títulos de card/seção grande
  | 'subtitle' // seção
  | 'body' // texto padrão
  | 'bodyMedium'
  | 'label' // botões/chips
  | 'overline' // rótulos uppercase de tracking largo ("UNIVERSO ATIVO")
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
  const { accent } = useAccent();
  const variant = type === 'default' ? 'body' : type;

  // linkPrimary acompanha o acento do universo ativo, não uma cor fixa.
  const color = variant === 'linkPrimary' ? accent : theme[themeColor ?? 'text'];

  return <Text style={[{ color }, styles[variant], style]} {...rest} />;
}

const styles = StyleSheet.create({
  display: {
    fontFamily: Fonts.display,
    fontSize: 36,
    lineHeight: 38,
    letterSpacing: -1.8, // tracking-tighter (-0.05em)
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: -1.2,
  },
  subtitle: {
    fontFamily: Fonts.display,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.45, // tracking-tight (-0.025em)
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
    fontFamily: Fonts.medium,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: -0.15,
  },
  overline: {
    fontFamily: Fonts.semibold,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 1.65, // tracking-[0.15em]
    textTransform: 'uppercase',
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
  },
  code: {
    fontFamily: Fonts.mono,
    fontSize: 13,
    lineHeight: 18,
  },
});
