import { useRouter } from 'expo-router';
import { ChevronRight, LogOut, Moon, Plus, Settings, Star, Sun } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Fonts, Spacing, UniverseAccents } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/presentation/auth/auth-context';
import { AvatarInitials } from '@/presentation/components/avatar-initials';
import { PrimaryButton } from '@/presentation/components/primary-button';
import { useAccent } from '@/presentation/theme/accent-context';
import { useThemeMode } from '@/presentation/theme/theme-mode-context';
import { universeIcon } from '@/presentation/theme/universe-icons';

// Glow suave da cor de acento no topo-direito do banner (blur-[100px] do Figma).
// Envolto em View pointerEvents="none" para nunca capturar toques do conteúdo.
function AccentGlow({ color }: { color: string }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="accentGlow" cx="82%" cy="6%" r="55%">
            <Stop offset="0" stopColor={color} stopOpacity={0.35} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#accentGlow)" />
      </Svg>
    </View>
  );
}

function IconButton({
  onPress,
  children,
  emphasis = 'subtle',
}: {
  onPress?: () => void;
  children: React.ReactNode;
  emphasis?: 'subtle' | 'strong';
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.iconBtn,
        { backgroundColor: emphasis === 'strong' ? theme.backgroundSelected : theme.glass },
      ]}>
      {children}
    </Pressable>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View>
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      <ThemedText type="overline" themeColor="textSecondary" style={styles.statLabel}>
        {label}
      </ThemedText>
    </View>
  );
}

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const dark = useColorScheme() !== 'light';
  const { accent, themes } = useAccent();
  const { toggle } = useThemeMode();
  const { user, requiresAuth, signOut } = useAuth();

  const username = user?.username ?? user?.email?.split('@')[0] ?? 'colecionador';
  const displayName =
    username.split(/[._\s-]+/)[0]!.replace(/^./, (c) => c.toUpperCase()) + '.';

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Banner com glow de acento */}
        <View style={styles.banner}>
          <AccentGlow color={accent} />

          <SafeAreaView edges={['top']}>
            <View style={styles.topActions}>
              <IconButton onPress={toggle} emphasis="strong">
                {dark ? (
                  <Sun size={18} color={theme.text} />
                ) : (
                  <Moon size={18} color={theme.text} />
                )}
              </IconButton>
              <IconButton>
                <Settings size={20} color={theme.textSecondary} />
              </IconButton>
            </View>

            <View style={styles.identity}>
              <AvatarInitials username={username} size={112} />
              <ThemedText type="display" style={styles.name}>
                {displayName}
              </ThemedText>
              <ThemedText type="overline" themeColor="textSecondary" style={styles.handle}>
                @{username}
              </ThemedText>

              <View style={styles.stats}>
                <Stat value="4.9" label="Rating" />
                <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
                <Stat value="142" label="Trades" />
              </View>
            </View>
          </SafeAreaView>
        </View>

        {/* Ações */}
        <View style={styles.body}>
          <PrimaryButton
            title="Adicionar ao Acervo"
            onPress={() => router.push('/scan')}
            icon={<Plus size={18} strokeWidth={2.5} color={theme.onTint} />}
            style={styles.addButton}
          />

          <ThemedText type="overline" themeColor="textSecondary" style={styles.sectionTitle}>
            Universos Ativos
          </ThemedText>
          <View style={styles.universeList}>
            {themes.map((t) => {
              const Icon = universeIcon(t.slug);
              const color = t.accent ?? UniverseAccents[t.slug] ?? accent;
              return (
                <View
                  key={t.id}
                  style={[
                    styles.universeRow,
                    { backgroundColor: theme.glass, borderColor: theme.glassBorder },
                  ]}>
                  <View
                    style={[styles.universeIcon, { backgroundColor: dark ? '#111111' : '#F5F5F5' }]}>
                    <Icon size={20} strokeWidth={1.5} color={color} />
                  </View>
                  <View style={styles.universeText}>
                    <ThemedText type="subtitle">{t.name}</ThemedText>
                    <ThemedText type="overline" themeColor="textSecondary" style={styles.universeMeta}>
                      128 itens
                    </ThemedText>
                  </View>
                  <ChevronRight size={18} color={theme.textSecondary} />
                </View>
              );
            })}
          </View>

          {requiresAuth && (
            <Pressable onPress={signOut} style={styles.signOut}>
              <LogOut size={16} color={theme.textSecondary} />
              <ThemedText type="label" themeColor="textSecondary">
                Sair
              </ThemedText>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: BottomTabInset + 80 },
  banner: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.five,
    overflow: 'hidden',
  },
  topActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
    paddingTop: Spacing.two,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identity: {
    marginTop: Spacing.three,
  },
  name: {
    marginTop: Spacing.four,
  },
  handle: {
    marginTop: Spacing.one,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
    marginTop: Spacing.four,
  },
  statValue: {
    fontFamily: Fonts.medium, // text-2xl font-medium — peso via família
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: -0.4,
  },
  statLabel: {
    fontSize: 9,
    letterSpacing: 1.5,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
  },
  body: {
    paddingHorizontal: Spacing.four,
  },
  addButton: {
    marginTop: Spacing.five,
    marginBottom: Spacing.five,
  },
  sectionTitle: {
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: Spacing.three,
  },
  universeList: {
    gap: Spacing.two,
  },
  universeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: 28,
    borderWidth: 1,
  },
  universeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  universeText: {
    flex: 1,
    gap: 2,
  },
  universeMeta: {
    fontSize: 10,
    letterSpacing: 2,
  },
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    marginTop: Spacing.five,
    paddingVertical: Spacing.two,
  },
});
