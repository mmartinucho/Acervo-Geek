import { BlurView } from 'expo-blur';
import { ArrowLeft } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Spacing } from '@/constants/theme';
import { useAuth } from '@/presentation/auth/auth-context';
import { BrandLogo } from '@/presentation/components/brand-logo';

type Mode = 'landing' | 'signIn' | 'signUp';

// Blob desfocado ao fundo (radial via svg). A animação fica na Animated.View pai.
function Blob({ id, color }: { id: string; color: string }) {
  return (
    <Svg style={StyleSheet.absoluteFill}>
      <Defs>
        <RadialGradient id={id} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={color} stopOpacity={0.7} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}

// Campo de e-mail/senha em vidro escuro.
function Field(props: React.ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.field}>
      <TextInput
        style={styles.fieldInput}
        placeholderTextColor="rgba(255,255,255,0.4)"
        {...props}
      />
    </View>
  );
}

export default function SignInScreen() {
  const { signIn, signUp, requiresAuth } = useAuth();

  const [mode, setMode] = useState<Mode>('landing');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isSignUp = mode === 'signUp';

  // Animação lenta dos blobs (scale/opacity em loop yoyo).
  const p1 = useSharedValue(0);
  const p2 = useSharedValue(0);
  useEffect(() => {
    p1.value = withRepeat(withTiming(1, { duration: 9000, easing: Easing.inOut(Easing.ease) }), -1, true);
    p2.value = withRepeat(withTiming(1, { duration: 12000, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [p1, p2]);

  const purple = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + p1.value * 0.2 }],
    opacity: 0.55 + p1.value * 0.25,
  }));
  const emerald = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + p2.value * 0.3 }],
    opacity: 0.45 + p2.value * 0.25,
  }));

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
    <View style={styles.container}>
      {/* Fundo com blobs animados */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Animated.View style={[styles.blobPurple, purple]}>
          <Blob id="blobPurple" color="#7C3AED" />
        </Animated.View>
        <Animated.View style={[styles.blobEmerald, emerald]}>
          <Blob id="blobEmerald" color="#059669" />
        </Animated.View>
        <View style={styles.overlay} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <SafeAreaView style={styles.content} edges={['top', 'bottom']}>
          <View style={styles.brand}>
            <BrandLogo size={64} color="#FFFFFF" />
            <ThemedText style={styles.title}>
              Acervo<ThemedText style={styles.dot}>.</ThemedText>
            </ThemedText>
            <ThemedText style={styles.tagline}>Collect • Trade • Discover</ThemedText>
          </View>

          {mode === 'landing' ? (
            <View style={styles.actions}>
              <GlassAuthButton
                label="Continuar com Apple"
                emphasis="strong"
                disabled={requiresAuth}
                onPress={() => {
                  if (!requiresAuth) signIn('demo@acervogeek.app', 'demo');
                }}
              />
              <GlassAuthButton
                label="Continuar com Google"
                emphasis="subtle"
                disabled={requiresAuth}
                onPress={() => {
                  if (!requiresAuth) signIn('demo@acervogeek.app', 'demo');
                }}
              />
              {requiresAuth && (
                <ThemedText style={styles.soonNote}>Login social em breve</ThemedText>
              )}

              <Pressable onPress={() => setMode('signIn')} style={styles.emailLink}>
                <ThemedText style={styles.emailLinkText}>Acessar com E-mail</ThemedText>
              </Pressable>
            </View>
          ) : (
            <View style={styles.form}>
              <Pressable
                onPress={() => {
                  setMode('landing');
                  setError(null);
                }}
                style={styles.back}>
                <ArrowLeft size={18} color="rgba(255,255,255,0.7)" />
                <ThemedText style={styles.backText}>Voltar</ThemedText>
              </Pressable>

              {isSignUp && (
                <Field
                  placeholder="Nome de usuário"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              )}
              <Field
                placeholder="E-mail"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <Field
                placeholder="Senha"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              {error && <ThemedText style={styles.error}>{error}</ThemedText>}

              <Pressable
                onPress={submit}
                disabled={busy}
                style={[styles.submit, busy && { opacity: 0.7 }]}>
                {busy ? (
                  <ActivityIndicator color="#000000" />
                ) : (
                  <ThemedText style={styles.submitText}>
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
                <ThemedText style={styles.toggleText}>
                  {isSignUp ? 'Já tem conta? Entrar' : 'Novo por aqui? Criar conta'}
                </ThemedText>
              </Pressable>
            </View>
          )}
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

function GlassAuthButton({
  label,
  emphasis,
  onPress,
  disabled,
}: {
  label: string;
  emphasis: 'strong' | 'subtle';
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.glassBtn,
        emphasis === 'strong' ? styles.glassStrong : styles.glassSubtle,
        disabled && styles.glassDisabled,
        pressed && styles.pressed,
      ]}>
      <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
      <ThemedText style={styles.glassBtnText}>{label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505' },
  flex: { flex: 1 },
  blobPurple: {
    position: 'absolute',
    top: '-20%',
    left: '-20%',
    width: '140%',
    height: '60%',
  },
  blobEmerald: {
    position: 'absolute',
    top: '30%',
    right: '-30%',
    width: '120%',
    height: '70%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.30)',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.five,
    paddingBottom: Spacing.six,
  },
  brand: {
    marginBottom: Spacing.six,
  },
  title: {
    fontFamily: Fonts.medium,
    fontSize: 60,
    lineHeight: 56,
    letterSpacing: -3,
    color: '#FFFFFF',
    marginTop: Spacing.four,
  },
  dot: {
    fontFamily: Fonts.medium,
    fontSize: 60,
    lineHeight: 56,
    color: 'rgba(129,140,248,0.6)',
  },
  tagline: {
    fontFamily: Fonts.semibold,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.5)',
    marginTop: Spacing.three,
  },
  actions: {
    gap: Spacing.two,
  },
  glassBtn: {
    height: 56,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  glassStrong: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderColor: 'rgba(255,255,255,0.20)',
  },
  glassSubtle: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.10)',
  },
  glassDisabled: {
    opacity: 0.5,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  glassBtnText: {
    fontFamily: Fonts.medium,
    fontSize: 15,
    color: '#FFFFFF',
  },
  soonNote: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    marginTop: Spacing.one,
  },
  emailLink: {
    alignItems: 'center',
    marginTop: Spacing.four,
    paddingVertical: Spacing.two,
  },
  emailLinkText: {
    fontFamily: Fonts.semibold,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.4)',
  },
  form: {
    gap: Spacing.three,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    alignSelf: 'flex-start',
    paddingVertical: Spacing.one,
  },
  backText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  field: {
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  fieldInput: {
    fontFamily: Fonts.medium,
    fontSize: 15,
    color: '#FFFFFF',
  },
  error: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: '#FB7185',
  },
  submit: {
    height: 56,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.one,
  },
  submitText: {
    fontFamily: Fonts.medium,
    fontSize: 15,
    color: '#000000',
  },
  toggle: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  toggleText: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
});
