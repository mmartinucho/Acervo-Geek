import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Repeat, Sparkles, Star } from 'lucide-react-native';
// Star: usado no meta do dono. Repeat/Sparkles/MapPin: badge, match, distância.
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { CategoryGradients, Fonts, SpecialStickerGradient } from '@/constants/theme';
import { CONDITION_LABELS } from '@/domain/entities/item';
import { DeckListing, formatDistance, formatPriceBRL } from '@/domain/entities/listing';
import { AvatarInitials } from '@/presentation/components/avatar-initials';
import { useAccent } from '@/presentation/theme/accent-context';

function monogram(franchise: string): string {
  return franchise
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}

// Card do deck no layout do protótipo: fundo full-bleed (gradiente da categoria
// no lugar da foto), scrim preto embaixo, badge de modo em vidro no topo,
// "match hint" na cor de acento, título grande e card de vidro do dono.
export function DeckCard({ listing }: { listing: DeckListing }) {
  const { owner, item } = listing;
  const { accent, accentSoft } = useAccent();
  const isSticker = item.category === 'sticker';
  // Badge único: prioriza Troca; senão mostra o preço da venda.
  const isTrade = listing.modes.includes('trade');
  const [c1, c2] = item.isSpecial ? SpecialStickerGradient : CategoryGradients[item.category];
  const matchPct = listing.matchScore != null ? Math.round(listing.matchScore * 100) : null;
  const matchHint =
    listing.matchReason ?? (matchPct != null ? `${matchPct}% de match` : null);
  // Figurinha mostra o número da camisa como herói; senão, monograma da franquia.
  const hero = isSticker ? `#${item.stickerNumber ?? '?'}` : monogram(item.franchise);
  const subtitle = isSticker
    ? `${item.country ?? item.franchise} • ${CONDITION_LABELS[item.condition]}`
    : `${item.franchise} • ${CONDITION_LABELS[item.condition]}`;

  return (
    <View style={styles.card}>
      {/* Fundo full-bleed: foto do item; sem foto, base escura com um brilho
          sutil da cor da categoria (como os blobs desfocados do protótipo). */}
      {item.imageUrl ? (
        <>
          <Image
            source={{ uri: item.imageUrl }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={200}
          />
          <View style={styles.imageTint} />
        </>
      ) : (
        <>
          <View style={[styles.glowBlob, { backgroundColor: c1 }]} />
          <View style={[styles.glowBlobSmall, { backgroundColor: c2 }]} />
          <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
          <ThemedText style={styles.hero}>{hero}</ThemedText>
        </>
      )}

      {/* Scrim: transparente → preto/90 na base */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.20)', 'rgba(0,0,0,0.90)']}
        locations={[0, 0.45, 1]}
        style={styles.scrim}
      />

      {/* Badge único do topo (vidro): Troca ou preço, como no protótipo */}
      <View style={styles.topRow}>
        <View style={styles.glassBadge}>
          <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          {isTrade ? (
            <>
              {/* View ao redor do svg: sem ela o ícone pinta atrás do blur no web */}
              <View>
                <Repeat size={12} color="#FFFFFF" strokeWidth={2.5} />
              </View>
              <ThemedText type="overline" style={styles.glassBadgeText}>
                Troca
              </ThemedText>
            </>
          ) : (
            <ThemedText type="overline" style={styles.glassBadgeText}>
              {listing.priceBRL != null ? formatPriceBRL(listing.priceBRL) : 'Venda'}
            </ThemedText>
          )}
        </View>
      </View>

      {/* Conteúdo inferior */}
      <View style={styles.info}>
        {matchHint && (
          <View
            style={[styles.matchPill, { backgroundColor: accent, shadowColor: accentSoft }]}>
            <Sparkles size={12} color="#FFFFFF" />
            <ThemedText type="overline" style={styles.matchPillText} numberOfLines={1}>
              {matchHint}
            </ThemedText>
          </View>
        )}

        <ThemedText style={styles.itemName} numberOfLines={2}>
          {item.name}
        </ThemedText>
        <ThemedText style={styles.itemMeta}>{subtitle}</ThemedText>

        {/* Card de vidro do dono */}
        <View style={styles.ownerCard}>
          <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          <AvatarInitials username={owner.username} size={48} />
          <View style={styles.ownerInfo}>
            <ThemedText style={styles.ownerName} numberOfLines={1}>
              @{owner.username}
            </ThemedText>
            <View style={styles.ownerMetaRow}>
              <Star size={10} color="rgba(255,255,255,0.6)" fill="rgba(255,255,255,0.6)" />
              <ThemedText style={styles.ownerMeta}>{owner.reputation.toFixed(1)}</ThemedText>
              {owner.distanceKm != null && (
                <>
                  <ThemedText style={styles.ownerMeta}>•</ThemedText>
                  <MapPin size={10} color="rgba(255,255,255,0.6)" />
                  <ThemedText style={styles.ownerMeta} numberOfLines={1}>
                    {formatDistance(owner.distanceKm)}
                  </ThemedText>
                </>
              )}
              {owner.distanceKm == null && owner.city && (
                <>
                  <ThemedText style={styles.ownerMeta}>•</ThemedText>
                  <ThemedText style={styles.ownerMeta} numberOfLines={1}>
                    {owner.city}
                  </ThemedText>
                </>
              )}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 40,
    overflow: 'hidden',
    backgroundColor: '#111111',
  },
  imageTint: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.10)',
  },
  glowBlob: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    top: -100,
    left: -80,
    opacity: 0.30,
  },
  glowBlobSmall: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    bottom: '30%',
    right: -100,
    opacity: 0.20,
  },
  hero: {
    position: 'absolute',
    top: '22%',
    alignSelf: 'center',
    fontFamily: Fonts.display,
    fontSize: 88,
    lineHeight: 96,
    letterSpacing: -2.5,
    color: 'rgba(255,255,255,0.10)',
  },
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '65%',
  },
  topRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  glassBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
    backgroundColor: 'rgba(255,255,255,0.10)',
    overflow: 'hidden',
  },
  glassBadgeText: {
    fontSize: 10,
    letterSpacing: 1.5,
    color: '#FFFFFF',
  },
  info: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 24,
    gap: 8,
  },
  matchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    maxWidth: '100%',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 8,
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  matchPillText: {
    fontSize: 10,
    letterSpacing: 1.5,
    color: '#FFFFFF',
    flexShrink: 1,
  },
  itemName: {
    fontFamily: Fonts.display,
    color: '#FFFFFF',
    fontSize: 36, // text-4xl
    lineHeight: 36, // leading-none
    letterSpacing: -1.8, // tracking-tighter
  },
  itemMeta: {
    fontFamily: Fonts.medium,
    color: 'rgba(255,255,255,0.70)',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.2,
    marginBottom: 16,
  },
  ownerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
    backgroundColor: 'rgba(255,255,255,0.10)',
    overflow: 'hidden',
  },
  ownerInfo: {
    flex: 1,
    gap: 4,
  },
  ownerName: {
    fontFamily: Fonts.medium,
    color: '#FFFFFF',
    fontSize: 16,
    letterSpacing: -0.3,
  },
  ownerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  ownerMeta: {
    fontFamily: Fonts.semibold,
    color: 'rgba(255,255,255,0.60)',
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
