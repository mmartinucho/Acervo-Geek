import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BrandGradient, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/presentation/auth/auth-context';

type Mode = 'signIn' | 'signUp';

export default function SignInScreen() {
  const theme = useTheme();
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState<Mode>('signIn');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isSignUp = mode === 'signUp';

  const submit = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError('Preencha e-mail e senha.');
      return;
    }
    if (isSignUp && username.trim().length < 3) {
      setError('Escolha um nome de usuário (mínimo 3 caracteres).');
      return;
    }
    setBusy(true);
    try {
      if (isSignUp) await signUp(email.trim(), password, username.trim());
      else await signIn(email.trim(), password);
      // O guard de rota redireciona ao autenticar; nada a fazer aqui.
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível continuar.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <LinearGradient colors={BrandGradient} style={styles.banner} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.brand}>
            <View style={styles.logoBadge}>
              <Ionicons name="albums" size={28} color="#FFF" />
            </View>
            <ThemedText type="display" style={styles.brandName}>
              Acervo Geek
            </ThemedText>
            <ThemedText type="small" style={styles.brandTagline}>
              Troque e venda figurinhas da Copa por perto
            </ThemedText>
          </View>

          <View style={styles.cardWrap}>
          <ThemedView type="backgroundElement" style={[styles.card, { borderColor: theme.border }]}>
            <ThemedText type="title" style={styles.cardTitle}>
              {isSignUp ? 'Criar conta' : 'Entrar'}
            </ThemedText>

            {isSignUp && (
              <Field
                icon="at"
                placeholder="Nome de usuário"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            )}
            <Field
              icon="mail-outline"
              placeholder="E-mail"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <Field
              icon="lock-closed-outline"
              placeholder="Senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {error && (
              <ThemedText type="small" style={styles.error}>
                {error}
              </ThemedText>
            )}

            <Pressable
              onPress={submit}
              disabled={busy}
              style={[styles.submit, { backgroundColor: theme.tint, opacity: busy ? 0.7 : 1 }]}>
              {busy ? (
                <ActivityIndicator color={theme.onTint} />
              ) : (
                <ThemedText type="smallBold" style={{ color: theme.onTint }}>
                  {isSignUp ? 'Criar conta' : 'Entrar'}
                </ThemedText>
              )}
            </Pressable>

            <Pressable
              onPress={() => {
                setMode(isSignUp ? 'signIn' : 'signUp');
                setError(null);
              }}
              style={styles.toggle}>
              <ThemedText type="small" themeColor="textSecondary">
                {isSignUp ? 'Já tem conta? ' : 'Novo por aqui? '}
                <ThemedText type="smallBold" themeColor="tint">
                  {isSignUp ? 'Entrar' : 'Criar conta'}
                </ThemedText>
              </ThemedText>
            </Pressable>
          </ThemedView>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

function Field({
  icon,
  ...props
}: { icon: keyof typeof Ionicons.glyphMap } & React.ComponentProps<typeof TextInput>) {
  const theme = useTheme();
  return (
    <View
      style={[styles.field, { backgroundColor: theme.background, borderColor: theme.border }]}>
      <Ionicons name={icon} size={18} color={theme.textSecondary} />
      <TextInput
        style={[styles.input, { color: theme.text }]}
        placeholderTextColor={theme.textSecondary}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  banner: { position: 'absolute', top: 0, left: 0, right: 0, height: 300 },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five,
  },
  cardWrap: { flex: 1, justifyContent: 'center' },
  brand: { alignItems: 'center', gap: Spacing.two, marginTop: Spacing.three },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 32,
    lineHeight: 38,
    color: '#FFFFFF',
  },
  brandTagline: { color: 'rgba(255,255,255,0.9)' },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  cardTitle: {},
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
  },
  input: { flex: 1, paddingVertical: Spacing.three, fontSize: 16 },
  error: { color: '#EF4444' },
  submit: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    paddingVertical: Spacing.three,
    minHeight: 50,
  },
  toggle: { alignItems: 'center', paddingVertical: Spacing.one },
});
