import { BlurView } from 'expo-blur';
import { Heart, X } from 'lucide-react-native';
import { Ref, useImperativeHandle, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DeckListing, SwipeDirection } from '@/domain/entities/listing';
import { DeckCard } from '@/presentation/components/deck/deck-card';
import { useAccent } from '@/presentation/theme/accent-context';

const SWIPE_THRESHOLD = 110;
const FLING_VELOCITY = 900;
const EXIT_X = 520;

interface SwipeableCardHandle {
  /** Dispara o swipe programaticamente (botões X / ♥). */
  fling: (direction: SwipeDirection) => void;
}

function SwipeableCard({
  listing,
  onSwipe,
  ref,
}: {
  listing: DeckListing;
  onSwipe: (direction: SwipeDirection) => void;
  ref?: Ref<SwipeableCardHandle>;
}) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);

  const fling = (direction: SwipeDirection) => {
    const sign = direction === 'want' ? 1 : -1;
    tx.value = withTiming(sign * EXIT_X, { duration: 180 }, () => {
      scheduleOnRN(onSwipe, direction);
    });
    ty.value = withTiming(ty.value + 32, { duration: 180 });
  };

  useImperativeHandle(ref, () => ({ fling }));

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      tx.value = e.translationX;
      ty.value = e.translationY * 0.35;
    })
    .onEnd((e) => {
      const shouldFling =
        Math.abs(tx.value) > SWIPE_THRESHOLD || Math.abs(e.velocityX) > FLING_VELOCITY;
      if (shouldFling) {
        const sign = Math.sign(tx.value || e.velocityX);
        const direction: SwipeDirection = sign > 0 ? 'want' : 'pass';
        tx.value = withTiming(sign * EXIT_X, { duration: 180 }, () => {
          scheduleOnRN(onSwipe, direction);
        });
        ty.value = withTiming(ty.value + 32, { duration: 180 });
      } else {
        tx.value = withSpring(0);
        ty.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { rotate: `${interpolate(tx.value, [-220, 220], [-11, 11])}deg` },
    ],
  }));

  const wantStyle = useAnimatedStyle(() => ({
    opacity: interpolate(tx.value, [16, SWIPE_THRESHOLD], [0, 1], Extrapolation.CLAMP),
  }));

  const passStyle = useAnimatedStyle(() => ({
    opacity: interpolate(tx.value, [-SWIPE_THRESHOLD, -16], [1, 0], Extrapolation.CLAMP),
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[StyleSheet.absoluteFill, cardStyle]}>
        <DeckCard listing={listing} />
        <Animated.View style={[styles.stamp, styles.wantStamp, wantStyle]}>
          <ThemedText type="smallBold" style={[styles.stampText, { color: '#16A34A' }]}>
            QUERO
          </ThemedText>
        </Animated.View>
        <Animated.View style={[styles.stamp, styles.passStamp, passStyle]}>
          <ThemedText type="smallBold" style={[styles.stampText, { color: '#DC2626' }]}>
            PASSO
          </ThemedText>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

export function SwipeDeck({
  cards,
  onSwipe,
  showActions = false,
}: {
  cards: DeckListing[];
  onSwipe: (direction: SwipeDirection) => void;
  /**
   * Renderiza os botões X / ♥ do protótipo sobrepostos à base do deck.
   * Desligado por padrão até a Fase 3 (a tela atual tem os próprios botões).
   */
  showActions?: boolean;
}) {
  const dark = useColorScheme() !== 'light';
  const { accent, accentSoft } = useAccent();
  const topCard = useRef<SwipeableCardHandle>(null);

  // Pilha do protótipo: só 2 cards visíveis; o de trás em scale 0.95 / y+20.
  const visible = cards.slice(0, 2);

  return (
    <View style={styles.stack}>
      {visible
        .map((listing, index) =>
          index === 0 ? (
            // key = id remonta o cartão do topo com os gestos zerados.
            <SwipeableCard key={listing.id} ref={topCard} listing={listing} onSwipe={onSwipe} />
          ) : (
            <View
              key={listing.id}
              style={[styles.backCard, StyleSheet.absoluteFill]}
              pointerEvents="none">
              <DeckCard listing={listing} />
            </View>
          ),
        )
        .reverse()}

      {showActions && visible.length > 0 && (
        <View style={styles.actions} pointerEvents="box-none">
          <Pressable
            onPress={() => topCard.current?.fling('pass')}
            style={({ pressed }) => [
              styles.passButton,
              dark ? styles.passButtonDark : styles.passButtonLight,
              pressed && styles.actionPressed,
            ]}>
            <BlurView
              intensity={40}
              tint={dark ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />
            {/* View ao redor do svg: sem ela o ícone pinta atrás do blur no web */}
            <View>
              <X size={24} strokeWidth={2} color={dark ? '#A3A3A3' : '#737373'} />
            </View>
          </Pressable>
          <Pressable
            onPress={() => topCard.current?.fling('want')}
            style={({ pressed }) => [
              styles.wantButton,
              { backgroundColor: accent, shadowColor: accentSoft },
              pressed && styles.actionPressed,
            ]}>
            <Heart size={32} color="#FFFFFF" fill="#FFFFFF" />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    flex: 1,
  },
  backCard: {
    transform: [{ scale: 0.95 }, { translateY: 20 }],
  },
  stamp: {
    position: 'absolute',
    top: Spacing.four,
    borderWidth: 2.5,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.two + 2,
    paddingVertical: Spacing.one,
    transform: [{ rotate: '-12deg' }],
  },
  wantStamp: {
    left: Spacing.four,
    borderColor: '#22C55E',
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
  },
  passStamp: {
    right: Spacing.four,
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    transform: [{ rotate: '12deg' }],
  },
  stampText: {
    fontFamily: Fonts.display,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 2,
  },
  actions: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -28, // metade para fora do deck, como no protótipo
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  passButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    overflow: 'hidden',
  },
  passButtonDark: {
    backgroundColor: 'rgba(0,0,0,0.50)',
    borderColor: 'rgba(255,255,255,0.10)',
  },
  passButtonLight: {
    backgroundColor: 'rgba(255,255,255,0.50)',
    borderColor: 'rgba(0,0,0,0.05)',
  },
  wantButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  actionPressed: {
    transform: [{ scale: 0.9 }],
  },
});
