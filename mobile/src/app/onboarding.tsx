import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { AlbumSlot, SlotState } from '@/domain/entities/collection-sheet';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/presentation/auth/auth-context';
import { AlbumProgressBar } from '@/presentation/components/album-progress-bar';
import { CollectionLegend } from '@/presentation/components/collection-legend';
import {
  CollectionCardChip,
  CollectionCardState,
} from '@/presentation/components/collection-card-chip';
import { PrimaryButton } from '@/presentation/components/primary-button';
import { useAlbumSheet } from '@/presentation/hooks/use-album-sheet';

const H_PAD = Spacing.four;

// Mapeia o estado de dados (3 estados) para o visual do chip (Fase 2).
// O 4º estado do chip (NEED/wishlist) fica reservado até existir wishlist real.
const CHIP_STATE: Record<SlotState, CollectionCardState> = {
  missing: 'none',
  have: 'have',
  duplicate: 'repeat',
};

// Nome curto para caber no chip (sobrenome / "Escudo"), ignorando sufixos.
const NAME_SUFFIXES = new Set(['Jr.', 'Jr', 'Neto', 'Filho', 'II', 'III']);
function shortName(name: string): string {
  if (name.startsWith('Escudo')) return 'Escudo';
  const parts = name.split(' ').filter(Boolean);
  let idx = parts.length - 1;
  if (idx > 0 && NAME_SUFFIXES.has(parts[idx]!)) idx -= 1;
  return parts[idx]!;
}

export default function OnboardingScreen() {
  const router = useRouter();
  const dark = useColorScheme() !== 'light';
  const { refreshOnboarding } = useAuth();
  const { sheet, isLoading, cycleSlot, counts } = useAlbumSheet();

  // Agrupa por seleção (país) → cada bloco vira uma "página" do álbum.
  const groups: { country: string; slots: AlbumSlot[] }[] = [];
  sheet?.slots.forEach((slot) => {
    const country = slot.country ?? 'Outros';
    let g = groups.find((x) => x.country === country);
    if (!g) {
      g = { country, slots: [] };
      groups.push(g);
    }
    g.slots.push(slot);
  });

  const total = sheet?.slots.length ?? 0;
  const acquired = counts.have + counts.duplicate;

  const finish = async () => {
    await refreshOnboarding();
    router.replace('/');
  };

  const fadeColor = dark ? '#0a0a0a' : '#FAFAFA';

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <ThemedText type="display">Fichário.</ThemedText>
          <AlbumProgressBar
            label={sheet?.collectionName ?? 'Álbum'}
            current={acquired}
            total={total}
          />
          <CollectionLegend />
        </View>

        {isLoading || !sheet ? (
          <View style={styles.center}>
            <ThemedText type="small" themeColor="textSecondary">
              Carregando álbum…
            </ThemedText>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            {groups.map((group) => (
              <View key={group.country} style={styles.group}>
                <ThemedText type="overline" themeColor="textSecondary">
                  {group.country}
                </ThemedText>
                <View style={styles.grid}>
                  {group.slots.map((slot) => (
                    <CollectionCardChip
                      key={slot.itemId}
                      number={slot.stickerNumber}
                      name={shortName(slot.name)}
                      state={CHIP_STATE[slot.state]}
                      rare={slot.isSpecial}
                      onPress={() => cycleSlot(slot.itemId)}
                      style={styles.chip}
                    />
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>

      {/* Rodapé com fade + CTA "Ir para o Radar" */}
      <View style={styles.footer} pointerEvents="box-none">
        <LinearGradient
          colors={['transparent', fadeColor]}
          style={styles.footerFade}
          pointerEvents="none"
        />
        <SafeAreaView edges={['bottom']} style={styles.footerInner}>
          <PrimaryButton
            title="Ir para o Radar"
            onPress={finish}
            icon={<ArrowRight size={18} color={dark ? '#0a0a0a' : '#FFFFFF'} />}
          />
        </SafeAreaView>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: H_PAD, paddingTop: Spacing.two },
  header: { gap: Spacing.four },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingTop: Spacing.four, paddingBottom: 140, gap: Spacing.four },
  group: { gap: Spacing.two },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { width: '31.5%' },
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
    paddingHorizontal: H_PAD,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.four,
  },
});
