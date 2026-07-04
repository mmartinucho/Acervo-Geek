import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { AlbumProgress } from '@/presentation/components/deck/album-progress';
import { SwipeDeck } from '@/presentation/components/deck/swipe-deck';
import { DeckFilter, useDeck } from '@/presentation/hooks/use-deck';

const FILTERS: { key: DeckFilter; label: string }[] = [
  { key: 'all', label: 'Tudo' },
  { key: 'trade', label: 'Troca' },
  { key: 'sale', label: 'Venda' },
];

export default function DiscoverScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { cards, progress, filter, setFilter, swipe, celebration, dismissCelebration, refresh } =
    useDeck();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Descobrir</ThemedText>
          <Pressable
            style={[
              styles.iconButton,
              { backgroundColor: theme.backgroundElement, borderColor: theme.border },
            ]}
            accessibilityLabel="Notificações">
            <Ionicons name="notifications-outline" size={20} color={theme.text} />
            <View style={[styles.notifDot, { backgroundColor: theme.tint }]} />
          </Pressable>
        </View>

        {progress && <AlbumProgress progress={progress} />}

        <View style={[styles.segment, { backgroundColor: theme.backgroundSelected }]}>
          {FILTERS.map((f) => {
            const selected = filter === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => setFilter(f.key)}
                style={[
                  styles.segmentItem,
                  selected && { backgroundColor: theme.backgroundElement },
                  selected && styles.segmentItemSelected,
                ]}>
                <ThemedText
                  type="smallBold"
                  style={{ color: selected ? theme.text : theme.textSecondary }}>
                  {f.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.deckArea}>
          {cards.length === 0 ? (
            <View style={styles.emptyState}>
              <ThemedText style={styles.emptyTitle}>Você viu tudo por aqui</ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.emptyHint}>
                Volte mais tarde ou recomece o deck.
              </ThemedText>
              <Pressable
                onPress={refresh}
                style={[styles.restartButton, { backgroundColor: theme.text }]}>
                <ThemedText type="smallBold" style={{ color: theme.background }}>
                  Recomeçar
                </ThemedText>
              </Pressable>
            </View>
          ) : (
            <SwipeDeck cards={cards} onSwipe={swipe} />
          )}
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={() => swipe('pass')}
            disabled={cards.length === 0}
            style={[
              styles.actionButton,
              styles.passButton,
              { backgroundColor: theme.backgroundElement, borderColor: theme.border },
            ]}
            accessibilityLabel="Passo">
            <Ionicons name="close" size={28} color="#F43F5E" />
          </Pressable>
          <Pressable
            onPress={() => router.push('/scan')}
            style={[
              styles.scanButton,
              { backgroundColor: theme.backgroundElement, borderColor: theme.border },
            ]}
            accessibilityLabel="Escanear item">
            <Ionicons name="scan-outline" size={22} color={theme.tint} />
          </Pressable>
          <Pressable
            onPress={() => swipe('want')}
            disabled={cards.length === 0}
            style={[styles.actionButton, styles.wantButton, { backgroundColor: theme.tint }]}
            accessibilityLabel="Quero">
            <Ionicons name="heart" size={28} color={theme.onTint} />
          </Pressable>
        </View>
      </SafeAreaView>

      {celebration && (
        <View style={styles.matchOverlay}>
          <ThemedView type="backgroundElement" style={styles.matchCard}>
            <ThemedText style={styles.matchEmoji}>⚽️</ThemedText>
            <ThemedText style={[styles.matchTitle, { color: theme.tint }]}>
              Deu match!
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.matchText}>
              {celebration.matchReason
                ? `${celebration.matchReason}. Vocês têm as repetidas um do outro — troca na conta!`
                : `@${celebration.owner.username} também quer figurinhas do seu álbum.`}
            </ThemedText>
            <Pressable
              onPress={() => {
                dismissCelebration();
                router.push('/trades');
              }}
              style={[styles.matchCta, { backgroundColor: theme.tint }]}>
              <ThemedText type="smallBold" style={{ color: theme.onTint }}>
                Propor troca
              </ThemedText>
            </Pressable>
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
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  segment: {
    flexDirection: 'row',
    borderRadius: 999,
    padding: 4,
    gap: 4,
  },
  segmentItem: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 999,
    paddingVertical: Spacing.two,
  },
  segmentItemSelected: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  deckArea: {
    flex: 1,
    marginTop: Spacing.one,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.four,
    paddingBottom: Spacing.two,
  },
  actionButton: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passButton: {
    borderWidth: 1,
  },
  scanButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wantButton: {
    shadowColor: '#6D4AFF',
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  emptyHint: {
    textAlign: 'center',
  },
  restartButton: {
    marginTop: Spacing.two,
    borderRadius: 999,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  matchOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(10, 8, 20, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
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
  matchTitle: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '800',
  },
  matchText: {
    textAlign: 'center',
  },
  matchCta: {
    alignSelf: 'stretch',
    alignItems: 'center',
    borderRadius: 999,
    paddingVertical: Spacing.two + 2,
    marginTop: Spacing.two,
  },
  matchDismiss: {
    paddingVertical: Spacing.one,
  },
});
