import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Dimensions, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { AlbumSlot, SLOT_STATE_LABELS, SlotState } from '@/domain/entities/collection-sheet';
import { useAuth } from '@/presentation/auth/auth-context';
import { useAlbumSheet } from '@/presentation/hooks/use-album-sheet';

const COLS = 3;
const GAP = 10;
const H_PAD = Spacing.four;
const CHIP_W = (Dimensions.get('window').width - H_PAD * 2 - GAP * (COLS - 1)) / COLS;

const STATE_COLORS: Record<SlotState, string> = {
  missing: 'transparent',
  have: '#12813F',
  duplicate: '#F5C542',
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

function SlotChip({ slot, onPress }: { slot: AlbumSlot; onPress: () => void }) {
  const theme = useTheme();
  const owned = slot.state !== 'missing';
  const bg = owned ? STATE_COLORS[slot.state] : theme.backgroundElement;
  const fg = slot.state === 'have' ? '#FFFFFF' : slot.state === 'duplicate' ? '#7A4E00' : theme.textSecondary;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          width: CHIP_W,
          backgroundColor: bg,
          borderColor: owned ? bg : theme.border,
          borderStyle: owned ? 'solid' : 'dashed',
        },
      ]}>
      {slot.isSpecial && (
        <View style={styles.specialStar}>
          <Ionicons name="star" size={11} color={slot.state === 'have' ? '#FFF' : '#F5C542'} />
        </View>
      )}

      <ThemedText style={[styles.chipNumber, { color: fg }]}>{slot.stickerNumber}</ThemedText>
      <ThemedText type="small" numberOfLines={1} style={[styles.chipName, { color: fg }]}>
        {shortName(slot.name)}
      </ThemedText>

      {slot.state === 'have' && (
        <View style={styles.stateBadge}>
          <Ionicons name="checkmark" size={12} color="#12813F" />
        </View>
      )}
      {slot.state === 'duplicate' && (
        <View style={styles.stateBadge}>
          <ThemedText style={styles.dupBadgeText}>×2</ThemedText>
        </View>
      )}
    </Pressable>
  );
}

function Legend({ state, colorDot }: { state: SlotState; colorDot: string }) {
  const theme = useTheme();
  const missing = state === 'missing';
  return (
    <View style={styles.legendItem}>
      <View
        style={[
          styles.legendDot,
          {
            backgroundColor: missing ? theme.backgroundElement : colorDot,
            borderColor: missing ? theme.border : colorDot,
            borderStyle: missing ? 'dashed' : 'solid',
          },
        ]}
      />
      <ThemedText type="small" themeColor="textSecondary">
        {SLOT_STATE_LABELS[state]}
      </ThemedText>
    </View>
  );
}

export default function OnboardingScreen() {
  const theme = useTheme();
  const router = useRouter();
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

  const finish = async () => {
    await refreshOnboarding();
    router.replace('/');
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Monte seu álbum</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Toque em cada figurinha para marcar. É isso que alimenta seus matches.
          </ThemedText>
          <View style={styles.legend}>
            <Legend state="missing" colorDot="transparent" />
            <Legend state="have" colorDot="#12813F" />
            <Legend state="duplicate" colorDot="#F5C542" />
          </View>
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
                <ThemedText type="smallBold" style={styles.groupTitle}>
                  {group.country}
                </ThemedText>
                <View style={styles.grid}>
                  {group.slots.map((slot) => (
                    <SlotChip key={slot.itemId} slot={slot} onPress={() => cycleSlot(slot.itemId)} />
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        <View style={styles.footer}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.summary}>
            {counts.have} tenho · {counts.duplicate} repetidas · {counts.missing} faltando
          </ThemedText>
          <Pressable onPress={finish} style={[styles.cta, { backgroundColor: theme.tint }]}>
            <ThemedText type="smallBold" style={{ color: theme.onTint }}>
              Concluir
            </ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: H_PAD, paddingTop: Spacing.two },
  header: { gap: Spacing.one },
  title: { fontSize: 30, lineHeight: 36, fontWeight: '800', letterSpacing: -0.6 },
  legend: { flexDirection: 'row', gap: Spacing.four, marginTop: Spacing.two },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 14, height: 14, borderRadius: 5, borderWidth: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingTop: Spacing.three, paddingBottom: Spacing.three, gap: Spacing.four },
  group: { gap: Spacing.two },
  groupTitle: { fontSize: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  chip: {
    aspectRatio: 0.82,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: 4,
  },
  specialStar: { position: 'absolute', top: 6, right: 7 },
  chipNumber: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  chipName: { fontSize: 11, fontWeight: '600', maxWidth: '100%' },
  stateBadge: {
    position: 'absolute',
    top: 6,
    left: 7,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 3,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dupBadgeText: { fontSize: 11, fontWeight: '800', color: '#7A4E00' },
  footer: { gap: Spacing.two, paddingVertical: Spacing.three },
  summary: { textAlign: 'center' },
  cta: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    paddingVertical: Spacing.three,
  },
});
