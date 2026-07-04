import { Tabs, useRouter } from 'expo-router';
import { Briefcase, Layers, LucideIcon, Search, Sparkles, User } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FloatingBottomNav } from '@/presentation/components/bottom-nav';

// Ordem e ícones das abas (nome da rota → glifo lucide do protótipo).
// O FAB de scan fica no meio: 3 abas à esquerda, 2 à direita.
const TAB_ICONS: { key: string; icon: LucideIcon }[] = [
  { key: 'index', icon: Sparkles },
  { key: 'collection', icon: Layers },
  { key: 'search', icon: Search },
  { key: 'trades', icon: Briefcase },
  { key: 'profile', icon: User },
];

// Shape mínimo dos props que o react-navigation passa ao tabBar custom
// (o pacote bottom-tabs é vendorado pelo expo-router e não expõe os tipos).
interface TabBarProps {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: { navigate: (name: string) => void };
}

// Nav flutuante do protótipo no lugar do tab bar padrão; o FAB central abre o scanner.
function FloatingTabBar({ state, navigation }: TabBarProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const activeKey = state.routes[state.index]?.name ?? 'index';

  return (
    <View style={[styles.wrap, { bottom: 24 + insets.bottom }]} pointerEvents="box-none">
      <FloatingBottomNav
        tabs={TAB_ICONS}
        activeKey={activeKey}
        onTabPress={(key) => navigation.navigate(key)}
        onScanPress={() => router.push('/scan')}
      />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="collection" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="trades" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
