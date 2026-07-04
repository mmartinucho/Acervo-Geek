import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { CheckCircle2 } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, UniverseAccents } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { CollectibleTheme } from '@/domain/entities/theme';
import { PrimaryButton } from '@/presentation/components/primary-button';
import { useAccent } from '@/presentation/theme/accent-context';
import { universeDesc, universeIcon } from '@/presentation/theme/universe-icons';

// Tela "Seus mundos." do protótipo: lista vertical de universos com multi-seleção.
// A UI vem daqui; a persistência (setActiveTheme) é ligada na Fase 4.
function UniverseRow({
  theme: univ,
  selected,
  onToggle,
}: {
  theme: CollectibleTheme;
  selected: boolean;
  onToggle: () => void;
}) {
  const theme = useTheme();
  const dark = useColorScheme() !== 'light';
  const univColor = univ.accent ?? UniverseAccents[univ.slug] ?? theme.text;
  const Icon = universeIcon(univ.slug);

  return (
    <Pressable
      onPress={onToggle}
      style={[
        styles.row,
        {
          backgroundColor: selected ? theme.glass : 'transparent',
          borderColor: selected ? theme.glassBorder : 'transparent',
        },
      ]}>
      {/* Glow colorido do universo quando selecionado (radial ≈ linear da esquerda) */}
      {selected && (
        <LinearGradient
          colors={[`${univColor}33`, 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 0.7, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      )}

      <View style={[styles.iconCircle, { backgroundColor: dark ? '#111111' : '#FFFFFF' }]}>
        <Icon size={24} strokeWidth={1.5} color={selected ? univColor : theme.textSecondary} />
      </View>

      <View style={styles.rowText}>
        <ThemedText
          type="subtitle"
          style={{ color: selected ? theme.text : theme.textSecondary }}>
          {univ.name}
        </ThemedText>
        <ThemedText type="overline" themeColor="textSecondary" style={styles.rowDesc}>
          {universeDesc(univ.slug)}
        </ThemedText>
      </View>

      {selected && (
        <View>
          <CheckCircle2 size={24} color={univColor} />
        </View>
      )}
    </Pressable>
  );
}

export default function SelectUniverseScreen() {
  const router = useRouter();
  const dark = useColorScheme() !== 'light';
  const { themes } = useAccent();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleNext = () => {
    if (selected.length === 0) return;
    // A persistência do universo ativo (setActiveTheme) entra na Fase 4.
    router.replace('/onboarding');
  };

  const fadeColor = dark ? '#0a0a0a' : '#FAFAFA';

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <ThemedText type="display">Seus mundos.</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
            Selecione as franquias que você acompanha. Você pode personalizar isso depois.
          </ThemedText>
        </View>

        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}>
          {themes.map((t) => (
            <UniverseRow
              key={t.id}
              theme={t}
              selected={selected.includes(t.id)}
              onToggle={() => toggle(t.id)}
            />
          ))}
        </ScrollView>
      </SafeAreaView>

      {/* Rodapé com fade + CTA fixo */}
      <View style={styles.footer} pointerEvents="box-none">
        <LinearGradient
          colors={['transparent', fadeColor]}
          style={styles.footerFade}
          pointerEvents="none"
        />
        <SafeAreaView edges={['bottom']} style={styles.footerInner}>
          <PrimaryButton
            title="Continuar"
            onPress={handleNext}
            disabled={selected.length === 0}
          />
        </SafeAreaView>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingTop: Spacing.six,
    paddingHorizontal: Spacing.five,
    paddingBottom: Spacing.four,
    gap: Spacing.two,
  },
  subtitle: {
    lineHeight: 20,
  },
  list: {
    paddingHorizontal: Spacing.four,
    paddingBottom: 160,
    gap: Spacing.two + 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.four,
    borderRadius: 28,
    borderWidth: 1,
    overflow: 'hidden',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.four,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowDesc: {
    fontSize: 10,
    letterSpacing: 0.6,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  footerFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 160,
  },
  footerInner: {
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.four,
  },
});
