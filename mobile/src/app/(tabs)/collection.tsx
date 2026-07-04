import { BlurView } from 'expo-blur';
import { Check, ChevronDown, Filter, Search } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing, UniverseAccents } from '@/constants/theme';
import { AlbumSlot, SlotState } from '@/domain/entities/collection-sheet';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { AlbumProgressBar } from '@/presentation/components/album-progress-bar';
import { CollectionLegend } from '@/presentation/components/collection-legend';
import {
  CollectionCardChip,
  CollectionCardState,
} from '@/presentation/components/collection-card-chip';
import { useAlbumSheet } from '@/presentation/hooks/use-album-sheet';
import { useAccent } from '@/presentation/theme/accent-context';
import { universeIcon } from '@/presentation/theme/universe-icons';

const H_PAD = Spacing.four;

const CHIP_STATE: Record<SlotState, CollectionCardState> = {
  missing: 'none',
  have: 'have',
  duplicate: 'repeat',
};

const NAME_SUFFIXES = new Set(['Jr.', 'Jr', 'Neto', 'Filho', 'II', 'III']);
function shortName(name: string): string {
  if (name.startsWith('Escudo')) return 'Escudo';
  const parts = name.split(' ').filter(Boolean);
  let idx = parts.length - 1;
  if (idx > 0 && NAME_SUFFIXES.has(parts[idx]!)) idx -= 1;
  return parts[idx]!;
}

// Botão-círculo de vidro do header (buscar/filtrar).
function GlassIconButton({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={[styles.iconBtn, { backgroundColor: theme.glass }]}>
      <View>{children}</View>
    </View>
  );
}

export default function CollectionScreen() {
  const theme = useTheme();
  const dark = useColorScheme() !== 'light';
  const { accent, activeTheme, themes, setActiveTheme } = useAccent();
  const { sheet, isLoading, cycleSlot, counts } = useAlbumSheet();
  const [showSelector, setShowSelector] = useState(false);

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
  const ActiveIcon = universeIcon(activeTheme?.slug);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.headerRow}>
          <ThemedText type="display">Acervo.</ThemedText>
          <View style={styles.headerActions}>
            <GlassIconButton>
              <Search size={18} color={theme.textSecondary} />
            </GlassIconButton>
            <GlassIconButton>
              <Filter size={18} color={theme.textSecondary} />
            </GlassIconButton>
          </View>
        </View>

        {/* Seletor de universo embutido */}
        <View style={styles.selectorWrap}>
          <Pressable
            onPress={() => setShowSelector((v) => !v)}
            style={[styles.selector, { backgroundColor: theme.glass, borderColor: theme.glassBorder }]}>
            <View style={[styles.selectorIcon, { backgroundColor: dark ? '#111111' : '#FFFFFF' }]}>
              <ActiveIcon size={18} strokeWidth={2} color={accent} />
            </View>
            <View style={styles.selectorText}>
              <ThemedText type="overline" themeColor="textSecondary" style={styles.selectorKicker}>
                Universo Ativo
              </ThemedText>
              <ThemedText type="label">{activeTheme?.name ?? 'Universo'}</ThemedText>
            </View>
            <View style={showSelector ? styles.chevronOpen : undefined}>
              <ChevronDown size={18} color={theme.textSecondary} />
            </View>
          </Pressable>

          {showSelector && (
            <View style={[styles.dropdown, dark ? styles.dropdownDark : styles.dropdownLight]}>
              <BlurView
                intensity={60}
                tint={dark ? 'dark' : 'light'}
                style={StyleSheet.absoluteFill}
              />
              {themes.map((t) => {
                const ItemIcon = universeIcon(t.slug);
                const itemAccent = t.accent ?? UniverseAccents[t.slug] ?? accent;
                const isActive = activeTheme?.id === t.id;
                return (
                  <Pressable
                    key={t.id}
                    onPress={() => {
                      setActiveTheme(t.id);
                      setShowSelector(false);
                    }}
                    style={[styles.dropdownItem, isActive && { backgroundColor: theme.glass }]}>
                    <View>
                      <ItemIcon size={20} strokeWidth={1.5} color={itemAccent} />
                    </View>
                    <ThemedText type="label" style={styles.dropdownName}>
                      {t.name}
                    </ThemedText>
                    {isActive && (
                      <View>
                        <Check size={18} color={accent} />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        <AlbumProgressBar
          label={`Progresso • ${sheet?.collectionName ?? 'Álbum'}`}
          current={acquired}
          total={total}
        />
        <View style={styles.legendWrap}>
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
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: H_PAD, paddingTop: Spacing.two, gap: Spacing.four },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorWrap: {
    position: 'relative',
    zIndex: 10,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.two,
    borderRadius: 24,
    borderWidth: 1,
  },
  selectorIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorText: {
    flex: 1,
    gap: 2,
  },
  selectorKicker: {
    fontSize: 9,
    letterSpacing: 1.5,
  },
  chevronOpen: {
    transform: [{ rotate: '180deg' }],
  },
  dropdown: {
    position: 'absolute',
    top: 64,
    left: 0,
    right: 0,
    borderRadius: 24,
    borderWidth: 1,
    padding: 12,
    overflow: 'hidden',
    zIndex: 20,
  },
  dropdownDark: {
    backgroundColor: 'rgba(17,17,17,0.90)',
    borderColor: 'rgba(255,255,255,0.10)',
  },
  dropdownLight: {
    backgroundColor: 'rgba(255,255,255,0.90)',
    borderColor: 'rgba(0,0,0,0.10)',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: 16,
  },
  dropdownName: {
    flex: 1,
  },
  legendWrap: {
    marginTop: -Spacing.two,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingTop: Spacing.one, paddingBottom: BottomTabInset + 80, gap: Spacing.four },
  group: { gap: Spacing.two },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { width: '31.5%' },
});
