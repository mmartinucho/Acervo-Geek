import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { Check, ChevronDown } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, UniverseAccents } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { BrandLogo } from '@/presentation/components/brand-logo';
import { RadarPill } from '@/presentation/components/deck/radar-pill';
import { SwipeDeck } from '@/presentation/components/deck/swipe-deck';
import { PrimaryButton } from '@/presentation/components/primary-button';
import { useDeck } from '@/presentation/hooks/use-deck';
import { useAccent } from '@/presentation/theme/accent-context';
import { universeIcon } from '@/presentation/theme/universe-icons';

export default function DiscoverScreen() {
  const router = useRouter();
  const theme = useTheme();
  const dark = useColorScheme() !== 'light';
  const { accent, activeTheme, themes, setActiveTheme } = useAccent();
  const [showSelector, setShowSelector] = useState(false);
  const {
    cards,
    radiusKm,
    setRadiusKm,
    outOfRange,
    swipe,
    celebration,
    dismissCelebration,
    refresh,
  } = useDeck();

  const UniverseIcon = universeIcon(activeTheme?.slug);

  return (
    <ThemedView style={styles.container}>
      {/* Deck edge-to-edge, atrás do header e da nav flutuante */}
      <View style={styles.deckArea}>
        {cards.length === 0 ? (
          <View style={styles.emptyState}>
            <BrandLogo size={80} color={theme.text} opacity={0.4} />
            <ThemedText type="display" style={styles.emptyTitle}>
              Radar Limpo.
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.emptyHint}>
              {outOfRange > 0
                ? `${outOfRange} ${outOfRange === 1 ? 'item está' : 'itens estão'} fora do seu radar de ${radiusKm} km.`
                : 'Não há mais itens na sua região atual para este universo.'}
            </ThemedText>
            {outOfRange > 0 ? (
              <PrimaryButton
                title="Expandir Busca"
                onPress={() => setRadiusKm(null)}
                style={styles.emptyCta}
              />
            ) : (
              <PrimaryButton title="Recomeçar" onPress={refresh} style={styles.emptyCta} />
            )}
          </View>
        ) : (
          <SwipeDeck cards={cards} onSwipe={swipe} showActions />
        )}
      </View>

      {/* Header flutuante */}
      <SafeAreaView edges={['top']} style={styles.header} pointerEvents="box-none">
        <View style={styles.headerRow} pointerEvents="box-none">
          <Pressable
            onPress={() => setShowSelector((v) => !v)}
            style={[styles.universePill, dark ? styles.pillDark : styles.pillLight]}>
            <BlurView
              intensity={40}
              tint={dark ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />
            {/* Views ao redor dos svgs: sem elas o ícone pinta atrás do blur no web */}
            <View>
              <UniverseIcon size={16} strokeWidth={2.5} color={accent} />
            </View>
            <ThemedText type="label" style={styles.universeName}>
              {activeTheme?.name ?? 'Universo'}
            </ThemedText>
            <View style={showSelector ? styles.chevronOpen : undefined}>
              <ChevronDown size={14} color={theme.textSecondary} />
            </View>
          </Pressable>
          <RadarPill radiusKm={radiusKm} onChange={setRadiusKm} />
        </View>

        {/* Dropdown de universos */}
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
                  style={[
                    styles.dropdownItem,
                    isActive && { backgroundColor: theme.glass },
                  ]}>
                  <ItemIcon size={20} strokeWidth={1.5} color={itemAccent} />
                  <ThemedText type="label" style={styles.dropdownName}>
                    {t.name}
                  </ThemedText>
                  {isActive && <Check size={18} color={accent} />}
                </Pressable>
              );
            })}
          </View>
        )}
      </SafeAreaView>

      {/* Celebração de match (vira o overlay "Sinergia." na tela 4) */}
      {celebration && (
        <View style={styles.matchOverlay}>
          <ThemedView type="backgroundElement" style={styles.matchCard}>
            <ThemedText style={styles.matchEmoji}>⚽️</ThemedText>
            <ThemedText type="display" style={{ color: accent }}>
              Deu match!
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.matchText}>
              {celebration.matchReason
                ? `${celebration.matchReason}. Vocês têm as repetidas um do outro — troca na conta!`
                : `@${celebration.owner.username} também quer figurinhas do seu álbum.`}
            </ThemedText>
            <PrimaryButton
              title="Propor troca"
              onPress={() => {
                dismissCelebration();
                router.push('/trades');
              }}
              style={styles.matchCta}
            />
            <Pressable onPress={dismissCelebration} style={styles.matchDismiss}>
              <ThemedText type="smallBold" themeColor="textSecondary">
                Continuar deslizando
              </ThemedText>
            </Pressable>
          </ThemedView>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  deckArea: {
    position: 'absolute',
    top: 108,
    left: Spacing.three,
    right: Spacing.three,
    bottom: 132,
  },
  header: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    gap: Spacing.three,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  universePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 44,
    paddingHorizontal: 20,
    borderRadius: 999,
    borderWidth: 1,
    overflow: 'hidden',
  },
  pillDark: {
    backgroundColor: 'rgba(0,0,0,0.40)',
    borderColor: 'rgba(255,255,255,0.10)',
  },
  pillLight: {
    backgroundColor: 'rgba(255,255,255,0.60)',
    borderColor: 'rgba(0,0,0,0.05)',
  },
  universeName: {
    fontSize: 14,
  },
  chevronOpen: {
    transform: [{ rotate: '180deg' }],
  },
  dropdown: {
    position: 'absolute',
    top: 64,
    left: Spacing.four,
    right: Spacing.four,
    borderRadius: 24,
    borderWidth: 1,
    padding: 12,
    overflow: 'hidden',
    zIndex: 10,
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  emptyTitle: {
    marginTop: Spacing.two,
  },
  emptyHint: {
    textAlign: 'center',
  },
  emptyCta: {
    alignSelf: 'stretch',
    marginTop: Spacing.four,
  },
  matchOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
    zIndex: 20,
  },
  matchCard: {
    alignSelf: 'stretch',
    borderRadius: 28,
    padding: Spacing.five,
    alignItems: 'center',
    gap: Spacing.two,
  },
  matchEmoji: {
    fontSize: 40,
    lineHeight: 46,
  },
  matchText: {
    textAlign: 'center',
  },
  matchCta: {
    alignSelf: 'stretch',
    marginTop: Spacing.two,
  },
  matchDismiss: {
    paddingVertical: Spacing.one,
  },
});
