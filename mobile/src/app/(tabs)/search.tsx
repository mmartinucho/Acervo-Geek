import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Filter, Search } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Fonts, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { Chip } from '@/presentation/components/chip';
import { useAccent } from '@/presentation/theme/accent-context';

const CATEGORIES = ['Cards', 'Figurinhas', 'Action Figures', 'Funko', 'HQs', 'Games'];

// Destaques de demonstração (sem catálogo real ainda) — imagem, título e preço.
const HIGHLIGHTS = [
  { id: 'h1', name: 'Booster Raro', price: 'R$ 45,00', img: 'https://picsum.photos/seed/booster/400/500' },
  { id: 'h2', name: 'Elite Trainer Box', price: 'R$ 289,00', img: 'https://picsum.photos/seed/etb/400/500' },
  { id: 'h3', name: 'Alt Art Umbreon', price: 'R$ 190,00', img: 'https://picsum.photos/seed/umbreon/400/500' },
  { id: 'h4', name: 'Deck Estrutural', price: 'R$ 59,90', img: 'https://picsum.photos/seed/deck/400/500' },
];

export default function SearchScreen() {
  const theme = useTheme();
  const dark = useColorScheme() !== 'light';
  const { activeTheme } = useAccent();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <ThemedText type="display" style={styles.title}>
            Explorar.
          </ThemedText>

          {/* Campo de busca */}
          <View style={[styles.searchBar, { backgroundColor: theme.glass }]}>
            <Search size={20} strokeWidth={2} color={theme.textSecondary} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Busque itens, usuários..."
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { color: theme.text }]}
            />
            <Pressable style={[styles.filterBtn, { backgroundColor: theme.backgroundSelected }]}>
              <Filter size={16} strokeWidth={2} color={theme.textSecondary} />
            </Pressable>
          </View>

          {/* Chips de categoria */}
          <View style={styles.chips}>
            {CATEGORIES.map((cat) => (
              <Chip
                key={cat}
                label={cat}
                selected={category === cat}
                onPress={() => setCategory(cat)}
              />
            ))}
          </View>

          {/* Destaques */}
          <ThemedText type="overline" themeColor="textSecondary" style={styles.sectionTitle}>
            Destaques{activeTheme ? ` (${activeTheme.name})` : ''}
          </ThemedText>
          <View style={styles.grid}>
            {HIGHLIGHTS.map((h) => (
              <Pressable key={h.id} style={styles.cardWrap}>
                <View style={[styles.card, { backgroundColor: theme.glass }]}>
                  <Image source={{ uri: h.img }} style={StyleSheet.absoluteFill} contentFit="cover" />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.60)']}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={styles.cardInfo}>
                    <ThemedText style={styles.cardName} numberOfLines={1}>
                      {h.name}
                    </ThemedText>
                    <ThemedText style={styles.cardPrice}>{h.price}</ThemedText>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: Spacing.four, paddingTop: Spacing.two },
  scroll: { paddingBottom: BottomTabInset + 80 },
  title: { marginBottom: Spacing.four },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: 999,
    paddingLeft: Spacing.four,
    paddingRight: Spacing.one,
    height: 56,
    marginBottom: Spacing.four,
  },
  input: {
    flex: 1,
    fontFamily: Fonts.medium,
    fontSize: 15,
    height: '100%',
  },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginBottom: Spacing.five,
  },
  sectionTitle: {
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: Spacing.three,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: Spacing.four,
  },
  cardWrap: {
    width: '48%',
  },
  card: {
    height: 180,
    borderRadius: 24,
    overflow: 'hidden',
  },
  cardInfo: {
    position: 'absolute',
    left: 12,
    bottom: 12,
  },
  cardName: {
    fontFamily: Fonts.bold,
    color: '#FFFFFF',
    fontSize: 14,
    letterSpacing: -0.2,
  },
  cardPrice: {
    fontFamily: Fonts.bold,
    color: 'rgba(255,255,255,0.85)',
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 2,
  },
});
