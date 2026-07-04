import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { CategoryGradients } from '@/constants/theme';
import { CATEGORY_LABELS, CONDITION_LABELS, ItemCondition } from '@/domain/entities/item';
import { DeckListing, formatPriceBRL } from '@/domain/entities/listing';

// Ponto colorido por condição — leitura instantânea de qualidade.
const CONDITION_DOT: Record<ItemCondition, string> = {
  mint: '#4ADE80',
  near_mint: '#A3E635',
  good: '#FACC15',
  played: '#FB923C',
  damaged: '#F87171',
};

// Simula uma galeria de fotos: N segmentos no topo (o real virá do S3).
const PHOTO_COUNT = 3;

export function DeckCard({ listing }: { listing: DeckListing }) {
  const [c1, c2] = CategoryGradients[listing.item.category];
  const { owner, item } = listing;
  const matchPct = listing.matchScore != null ? Math.round(listing.matchScore * 100) : null;

  return (
    <View style={styles.card}>
      {/* Fundo aurora: gradiente base + gradiente cruzado + blob de luz */}
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

      {/* Indicador de fotos (galeria) */}
      <View style={styles.photoDots}>
        {Array.from({ length: PHOTO_COUNT }).map((_, i) => (
          <View key={i} style={[styles.photoDot, i === 0 && styles.photoDotActive]} />
        ))}
      </View>

      {/* Topo: modo/preço à esquerda, categoria à direita */}
      <View style={styles.topRow}>
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

      {/* Scrim escuro para o texto */}
      <LinearGradient
        colors={['transparent', 'rgba(6,4,16,0.2)', 'rgba(6,4,16,0.88)']}
        locations={[0, 0.5, 1]}
        style={styles.scrim}
      />

      <View style={styles.info}>
        {matchPct != null && (
          <View style={styles.matchPill}>
            <Ionicons name="sparkles" size={12} color="#FFF" />
            <ThemedText type="smallBold" style={styles.matchPillText}>
              {matchPct}% match
            </ThemedText>
          </View>
        )}
        <ThemedText style={styles.itemName} numberOfLines={2}>
          {item.name}
        </ThemedText>
        <View style={styles.metaRow}>
          <View style={[styles.condDot, { backgroundColor: CONDITION_DOT[item.condition] }]} />
          <ThemedText style={styles.itemMeta}>
            {item.franchise} · {CONDITION_LABELS[item.condition]}
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
    opacity: 0.5,
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
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(109,74,255,0.9)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 4,
  },
  matchPillText: {
    color: '#FFFFFF',
    fontSize: 12,
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
