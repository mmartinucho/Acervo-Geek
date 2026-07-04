import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const CATEGORIES = [
  { key: 'card', label: 'Cards' },
  { key: 'figure', label: 'Figures' },
  { key: 'comic', label: 'HQs' },
  { key: 'game', label: 'Games' },
];

export default function SearchScreen() {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ThemedText style={styles.title}>Buscar</ThemedText>
        <View
          style={[
            styles.inputWrap,
            { backgroundColor: theme.backgroundElement, borderColor: theme.border },
          ]}>
          <Ionicons name="search" size={18} color={theme.textSecondary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Nome do item, franquia ou set…"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { color: theme.text }]}
          />
        </View>
        <View style={styles.chips}>
          {CATEGORIES.map((c) => {
            const selected = category === c.key;
            return (
              <Pressable
                key={c.key}
                onPress={() => setCategory(selected ? null : c.key)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selected ? theme.tint : theme.backgroundElement,
                    borderColor: selected ? theme.tint : theme.border,
                  },
                ]}>
                <ThemedText
                  type="smallBold"
                  style={selected ? { color: theme.onTint } : undefined}>
                  {c.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.placeholder}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.placeholderText}>
            {query
              ? 'A busca no catálogo entra quando o Supabase for conectado.'
              : 'Busque no catálogo ou explore inventários disponíveis para troca.'}
          </ThemedText>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    gap: Spacing.three,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.three,
    fontSize: 16,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + 3,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  placeholderText: {
    textAlign: 'center',
  },
});
