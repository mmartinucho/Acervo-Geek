import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { CategoryGradients } from '@/constants/theme';
import { CATEGORY_LABELS, CONDITION_LABELS } from '@/domain/entities/item';
import { DeckListing, formatPriceBRL } from '@/domain/entities/listing';

function monogram(franchise: string): string {
  return franchise
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}

export function DeckCard({ listing }: { listing: DeckListing }) {
  const gradient = CategoryGradients[listing.item.category];
  const { owner } = listing;

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Marca d'água do monograma, grande e discreta */}
      <ThemedText style={styles.watermark}>{monogram(listing.item.franchise)}</ThemedText>

      {/* Chips de modo/preço no topo, estilo vidro */}
      <View style={styles.topRow}>
        {listing.modes.includes('trade') && (
          <View style={styles.glassChip}>
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
            {CATEGORY_LABELS[listing.item.category].toUpperCase()}
          </ThemedText>
        </View>
      </View>

      {/* Scrim escuro para o texto respirar sobre o gradiente */}
      <LinearGradient
        colors={['transparent', 'rgba(8,6,20,0.15)', 'rgba(8,6,20,0.82)']}
        locations={[0, 0.55, 1]}
        style={styles.scrim}
      />

      <View style={styles.info}>
        <ThemedText style={styles.itemName} numberOfLines={2}>
          {listing.item.name}
        </ThemedText>
        <ThemedText style={styles.itemMeta}>
          {listing.item.franchise} · {CONDITION_LABELS[listing.item.condition]}
        </ThemedText>
        <View style={styles.ownerRow}>
          <View style={styles.ownerDot} />
          <ThemedText style={styles.ownerText} numberOfLines={1}>
            @{owner.username}
          </ThemedText>
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
  watermark: {
    position: 'absolute',
    top: '26%',
    alignSelf: 'center',
    fontSize: 150,
    lineHeight: 160,
    fontWeight: '800',
    letterSpacing: 4,
    color: 'rgba(255,255,255,0.16)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 18,
  },
  spacer: {
    flex: 1,
  },
  glassChip: {
    backgroundColor: 'rgba(255,255,255,0.22)',
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
    borderColor: 'rgba(255,255,255,0.5)',
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
    height: '55%',
  },
  info: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 22,
    gap: 4,
  },
  itemName: {
    color: '#FFFFFF',
    fontSize: 27,
    lineHeight: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  itemMeta: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 15,
    fontWeight: '500',
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  ownerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ADE80',
  },
  ownerText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  ownerRep: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '600',
  },
  ownerCity: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    flexShrink: 1,
  },
});
