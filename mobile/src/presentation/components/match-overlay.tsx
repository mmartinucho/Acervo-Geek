import { BlurView } from 'expo-blur';
import { Heart, Repeat } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Spacing } from '@/constants/theme';
import { DeckListing } from '@/domain/entities/listing';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/presentation/auth/auth-context';
import { AvatarInitials } from '@/presentation/components/avatar-initials';
import { PrimaryButton } from '@/presentation/components/primary-button';

// Esmeralda fixa do protótipo — cor de "sinergia/sucesso", não o acento do universo.
const EMERALD = '#10B981';

// Overlay "Sinergia." do protótipo: círculo esmeralda com ♥, dois avatares com
// Repeat no meio, "Iniciar Contato" + "Voltar pro Radar".
export function MatchOverlay({
  listing,
  onClose,
  onContact,
}: {
  listing: DeckListing;
  onClose: () => void;
  onContact: () => void;
}) {
  const theme = useTheme();
  const dark = useColorScheme() !== 'light';
  const { user } = useAuth();
  const me = user?.username ?? user?.email?.split('@')[0] ?? 'você';

  return (
    <View style={styles.overlay}>
      {/* Fundo desfocado — toque fecha */}
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
        <BlurView intensity={60} tint={dark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: dark ? 'rgba(0,0,0,0.60)' : 'rgba(255,255,255,0.60)' },
          ]}
        />
      </Pressable>

      <View style={styles.content}>
        <View style={styles.heartCircle}>
          <Heart size={32} color="#FFFFFF" fill="#FFFFFF" />
        </View>

        <ThemedText style={styles.title}>Sinergia.</ThemedText>
        <ThemedText type="bodyMedium" themeColor="textSecondary" style={styles.subtitle}>
          Você e @{listing.owner.username} possuem itens de interesse mútuo no radar.
        </ThemedText>

        <View style={styles.avatars}>
          <AvatarInitials username={me} size={96} />
          <View style={[styles.repeatCircle, { backgroundColor: theme.backgroundSelected }]}>
            <View>
              <Repeat size={20} color={theme.text} />
            </View>
          </View>
          <AvatarInitials username={listing.owner.username} size={96} />
        </View>

        <PrimaryButton title="Iniciar Contato" onPress={onContact} style={styles.cta} />
        <Pressable onPress={onClose} style={styles.dismiss}>
          <ThemedText type="label" themeColor="textSecondary">
            Voltar pro Radar
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    zIndex: 50,
  },
  content: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  heartCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: EMERALD,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.five,
    shadowColor: EMERALD,
    shadowOpacity: 0.4,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: 48, // text-5xl
    lineHeight: 50,
    letterSpacing: -2.4, // tracking-tighter
    marginBottom: Spacing.three,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: Spacing.six,
  },
  avatars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
    marginBottom: Spacing.six,
  },
  repeatCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cta: {
    alignSelf: 'stretch',
    marginBottom: Spacing.two,
  },
  dismiss: {
    paddingVertical: Spacing.two,
  },
});
