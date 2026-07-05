import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Camera, Check, Sparkles, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Spacing } from '@/constants/theme';
import { useScan } from '@/presentation/hooks/use-scan';

// Modal do scanner (protótipo): câmera full-screen, moldura de foco com scanline
// animada, header e card do item. "Registrar Item" captura a foto e sobe pro S3
// (via presigned URL). Sempre escuro (câmera), independente do tema.
export default function ScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [frameH, setFrameH] = useState(0);
  const { state, recognized, error, scan, reset } = useScan();

  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: 2400, easing: Easing.linear }), -1, true);
  }, [progress]);
  const lineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: progress.value * Math.max(0, frameH - 2) }],
  }));

  // Captura a foto, sobe pro S3 e reconhece por IA.
  const handleScan = async () => {
    let uri: string | null = null;
    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.7 });
      uri = photo?.uri ?? null;
    } catch {
      // Câmera indisponível (ex.: web sem permissão) — segue com placeholder.
    }
    await scan(uri ?? 'https://picsum.photos/seed/scancapture/800/1200', 'jpg');
  };

  // "Registrar Item" (após reconhecer) — o INSERT no inventário entra depois.
  const handleRegister = () => router.back();

  // Enquanto a permissão carrega.
  if (!permission) return <View style={styles.container} />;

  // Sem permissão → pede acesso à câmera.
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <SafeAreaView edges={['top']} style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.closeBtn}>
            <X size={20} strokeWidth={2} color="#FFFFFF" />
          </Pressable>
        </SafeAreaView>
        <View style={styles.permCenter}>
          <View style={styles.permIcon}>
            <Camera size={28} color="#FFFFFF" />
          </View>
          <ThemedText style={styles.permTitle}>Escanear itens</ThemedText>
          <ThemedText style={styles.permText}>
            Precisamos da câmera para reconhecer e registrar seus itens.
          </ThemedText>
          <Pressable onPress={requestPermission} style={styles.permBtn}>
            <ThemedText style={styles.permBtnText}>Permitir câmera</ThemedText>
          </Pressable>
        </View>
      </View>
    );
  }

  const busy = state === 'uploading' || state === 'recognizing';
  const done = state === 'done';
  const busyLabel = state === 'recognizing' ? 'Reconhecendo…' : 'Enviando…';
  const codeParts = recognized
    ? [recognized.cardNumber, recognized.rarity].filter(Boolean)
    : [];

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />
      <View style={styles.dim} />

      {/* Moldura de foco + scanline */}
      <View style={styles.frame} onLayout={(e) => setFrameH(e.nativeEvent.layout.height)}>
        <Animated.View style={[styles.scanline, lineStyle]} />
      </View>

      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <View>
            <X size={20} strokeWidth={2} color="#FFFFFF" />
          </View>
        </Pressable>
        <View style={styles.aiBadge}>
          <View>
            <Sparkles size={14} color="#FFFFFF" />
          </View>
          <ThemedText style={styles.aiText}>Scanner IA</ThemedText>
        </View>
      </SafeAreaView>

      {/* Card do item */}
      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <View style={styles.detectCard}>
          <ThemedText style={styles.detectName}>
            {done && recognized
              ? recognized.name
              : done
                ? 'Item não reconhecido'
                : 'Aponte para o item'}
          </ThemedText>
          <ThemedText style={styles.detectCode}>
            {done && recognized
              ? [recognized.franchise, ...codeParts].join(' • ')
              : 'Scanner com IA'}
          </ThemedText>
          {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}

          {done ? (
            <View style={styles.doneRow}>
              <Pressable onPress={reset} style={styles.secondaryBtn}>
                <ThemedText style={styles.secondaryText}>De novo</ThemedText>
              </Pressable>
              <Pressable onPress={handleRegister} style={[styles.registerBtn, styles.registerFlex]}>
                <View style={styles.registerDone}>
                  <Check size={18} strokeWidth={3} color="#000000" />
                  <ThemedText style={styles.registerText}>Registrar Item</ThemedText>
                </View>
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={state === 'error' ? reset : handleScan}
              disabled={busy}
              style={[styles.registerBtn, busy && styles.registerBtnBusy]}>
              {busy ? (
                <View style={styles.registerDone}>
                  <ActivityIndicator color="#000000" />
                  <ThemedText style={styles.registerText}>{busyLabel}</ThemedText>
                </View>
              ) : (
                <ThemedText style={styles.registerText}>
                  {state === 'error' ? 'Tentar de novo' : 'Escanear'}
                </ThemedText>
              )}
            </Pressable>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },
  dim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.40)',
  },
  frame: {
    position: 'absolute',
    top: 40,
    left: 40,
    right: 40,
    bottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
    borderRadius: 40,
    overflow: 'hidden',
  },
  scanline: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(0,0,0,0.40)',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: 20,
    height: 44,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(0,0,0,0.40)',
  },
  aiText: {
    fontFamily: Fonts.semibold,
    color: '#FFFFFF',
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.five,
  },
  detectCard: {
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(0,0,0,0.60)',
    padding: Spacing.five,
    alignItems: 'center',
  },
  detectName: {
    fontFamily: Fonts.medium,
    color: '#FFFFFF',
    fontSize: 24,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  detectCode: {
    fontFamily: Fonts.semibold,
    color: 'rgba(255,255,255,0.50)',
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: Spacing.two,
    marginBottom: Spacing.five,
  },
  errorText: {
    fontFamily: Fonts.medium,
    color: '#FB7185',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: Spacing.three,
  },
  registerBtn: {
    alignSelf: 'stretch',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  registerBtnBusy: {
    opacity: 0.85,
  },
  registerFlex: {
    flex: 1,
  },
  doneRow: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    gap: Spacing.two,
  },
  secondaryBtn: {
    borderRadius: 999,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
  },
  secondaryText: {
    fontFamily: Fonts.medium,
    color: '#FFFFFF',
    fontSize: 14,
  },
  registerDone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  registerText: {
    fontFamily: Fonts.medium,
    color: '#000000',
    fontSize: 15,
  },
  permCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.five,
    gap: Spacing.two,
  },
  permIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  permTitle: {
    fontFamily: Fonts.medium,
    color: '#FFFFFF',
    fontSize: 24,
    letterSpacing: -0.5,
  },
  permText: {
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: Spacing.four,
  },
  permBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  permBtnText: {
    fontFamily: Fonts.medium,
    color: '#000000',
    fontSize: 15,
  },
});
