import { BlurView } from 'expo-blur';
import { LucideIcon, Scan } from 'lucide-react-native';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { useAccent } from '@/presentation/theme/accent-context';

// Barra de navegação flutuante do protótipo: pílula de vidro com os itens de
// aba e um FAB central de Scan na cor de acento do universo ativo.
// Na Fase 3 vira o tabBar custom do (tabs)/_layout.tsx — por ora só o visual.

export interface BottomNavTab {
  key: string;
  icon: LucideIcon;
}

export function NavItem({
  icon: Icon,
  active = false,
  onPress,
}: {
  icon: LucideIcon;
  active?: boolean;
  onPress?: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[styles.navItem, active && { backgroundColor: theme.backgroundSelected }]}>
      <Icon size={18} strokeWidth={2} color={active ? theme.text : theme.textSecondary} />
    </Pressable>
  );
}

export function FloatingBottomNav({
  tabs,
  activeKey,
  onTabPress,
  onScanPress,
  style,
}: {
  tabs: BottomNavTab[];
  activeKey: string;
  onTabPress: (key: string) => void;
  onScanPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();
  const dark = useColorScheme() !== 'light';
  const { accent } = useAccent();

  // FAB central: metade das abas de cada lado (3+2 no layout do protótipo).
  const splitIndex = Math.ceil(tabs.length / 2);
  const renderTab = (tab: BottomNavTab) => (
    <NavItem
      key={tab.key}
      icon={tab.icon}
      active={tab.key === activeKey}
      onPress={() => onTabPress(tab.key)}
    />
  );

  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: theme.glass, borderColor: theme.glassBorder },
        dark ? styles.shadowDark : styles.shadowLight,
        style,
      ]}>
      <BlurView intensity={50} tint={dark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
      {tabs.slice(0, splitIndex).map(renderTab)}
      <Pressable
        onPress={onScanPress}
        style={({ pressed }) => [
          styles.fab,
          { backgroundColor: accent, shadowColor: accent },
          pressed && styles.fabPressed,
        ]}>
        <Scan size={20} strokeWidth={2.5} color="#FFFFFF" />
      </Pressable>
      {tabs.slice(splitIndex).map(renderTab)}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 4,
    paddingHorizontal: 12, // px-3 py-2.5 do protótipo
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    overflow: 'hidden',
  },
  shadowDark: {
    shadowColor: '#000000',
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  shadowLight: {
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  navItem: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    shadowOpacity: 0.55,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  fabPressed: {
    transform: [{ scale: 0.95 }],
  },
});
