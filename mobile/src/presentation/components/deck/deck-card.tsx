import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { CategoryGradients, SpecialStickerGradient } from '@/constants/theme';
import { CATEGORY_LABELS, CONDITION_LABELS, ItemCondition } from '@/domain/entities/item';
import { DeckListing, formatPriceBRL } from '@/domain/entities/listing';

const CONDITION_DOT: Record<ItemCondition, string> = {
  mint: '#4ADE80',
  near_mint: '#A3E635',
  good: '#FACC15',
  played: '#FB923C',
  damaged: '#F87171',
};

const PHOTO_COUNT = 3;

function monogram(franchise: string): string {
  return franchise
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}

export function DeckCard({ listing }: { listing: DeckListing }) {
  const { owner, item } = listing;
  const isSticker = item.category === 'sticker';
  const [c1, c2] = item.isSpecial ? SpecialStickerGradient : CategoryGradients[item.category];
  const matchPct = listing.matchScore != null ? Math.round(listing.matchScore * 100) : null;
  // Figurinha mostra o número da camisa como herói; senão, monograma da franquia.
  const hero = isSticker ? `#${item.stickerNumber ?? '?'}` : monogram(item.franchise);

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={[c1, c2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['rgba(255,255,255,0.35)', 'transparent']}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.2, y: 0.7 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={[c1, 'transparent']}
        start={{ x: 0.3, y: 0.2 }}
        end={{ x: 0.9, y: 0.9 }}
        style={styles.blob}
      />

      <ThemedText style={styles.hero}>{hero}</ThemedText>

      <View style={styles.photoDots}>
        {Array.from({ length: PHOTO_COUNT }).map((_, i) => (
          <View key={i} style={[styles.photoDot, i === 0 && styles.photoDotActive]} />
        ))}
      </View>

      <View style={styles.topRow}>
        {item.isSpecial && (
          <View style={styles.specialChip}>
            <Ionicons name="star" size={12} color="#7A4E00" />
            <ThemedText type="smallBold" style={styles.specialChipText}>
              ESPECIAL
            </ThemedText>
          </View>
        )}
        {listing.modes.includes('trade') && (
          <View style={styles.glassChip}>
            <Ionicons name="swap-horizontal" size={13} color="#FFF" />
            <ThemedText type="smallBold" style={styles.glassChipText}>
              Troca
            </ThemedText>
          </View>
        )}
        {listing.modes.includes('sale') && listing.priceBRL != null && (
          <View style={styles.glassChip}>
            <ThemedText type="smallBold" style={styles.glassChipText}>
              {formatPriceBRL(listing.priceBRL)}
            </ThemedText>
          </View>
        )}
        <View style={styles.spacer} />
        <View style={styles.categoryTag}>
          <ThemedText type="small" style={styles.categoryTagText}>
            {CATEGORY_LABELS[item.category].toUpperCase()}
          </ThemedText>
        </View>
      </View>

      <LinearGradient
        colors={['transparent', 'rgba(6,4,16,0.2)', 'rgba(6,4,16,0.9)']}
        locations={[0, 0.5, 1]}
        style={styles.scrim}
      />

      <View style={styles.info}>
        {listing.matchReason ? (
          <View style={styles.matchPill}>
            <Ionicons name="repeat" size={13} color="#FFF" />
            <ThemedText type="smallBold" style={styles.matchPillText} numberOfLines={1}>
              {listing.matchReason}
            </ThemedText>
          </View>
        ) : (
          matchPct != null && (
            <View style={styles.matchPill}>
              <Ionicons name="sparkles" size={12} color="#FFF" />
              <ThemedText type="smallBold" style={styles.matchPillText}>
                {matchPct}% match
              </ThemedText>
            </View>
          )
        )}
        <ThemedText style={styles.itemName} numberOfLines={2}>
          {item.name}
        </ThemedText>
        <View style={styles.metaRow}>
          <View style={[styles.condDot, { backgroundColor: CONDITION_DOT[item.condition] }]} />
          <ThemedText style={styles.itemMeta}>
            {isSticker && item.country
              ? `${item.country} · ${item.franchise}`
              : `${item.franchise} · ${CONDITION_LABELS[item.condition]}`}
          </ThemedText>
        </View>
        <View style={styles.ownerRow}>
          <ThemedText style={styles.ownerText} numberOfLines={1}>
            @{owner.username}
          </ThemedText>
          <Ionicons name="checkmark-circle" size={14} color="#60A5FA" />
          <ThemedText style={styles.ownerRep}>★ {owner.reputation.toFixed(1)}</ThemedText>
          {owner.city && <ThemedText style={styles.ownerCity}>· {owner.city}</ThemedText>}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: '#1a1030',
  },
  blob: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    top: -80,
    left: -60,
    opacity: 0.55,
  },
  hero: {
    position: 'absolute',
    top: '24%',
    alignSelf: 'center',
    fontSize: 120,
    lineHeight: 132,
    fontWeight: '800',
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.22)',
  },
  photoDots: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  photoDot: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  photoDotActive: {
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingTop: 12,
  },
  spacer: {
    flex: 1,
  },
  specialChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFD65A',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  specialChipText: {
    color: '#7A4E00',
    fontSize: 11,
    letterSpacing: 1,
  },
  glassChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.24)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  glassChipText: {
    color: '#FFFFFF',
    fontSize: 13,
  },
  categoryTag: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryTagText: {
    color: '#FFFFFF',
    letterSpacing: 2,
    fontSize: 11,
  },
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '58%',
  },
  info: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 22,
    gap: 5,
  },
  matchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    maxWidth: '100%',
    backgroundColor: 'rgba(18,129,63,0.92)',
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 5,
    marginBottom: 4,
  },
  matchPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    flexShrink: 1,
  },
  itemName: {
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  condDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  itemMeta: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
    fontWeight: '500',
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
  },
  ownerText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  ownerRep: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 2,
  },
  ownerCity: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 13,
    flexShrink: 1,
  },
});
